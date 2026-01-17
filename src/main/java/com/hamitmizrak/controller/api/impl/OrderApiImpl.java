package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.controller.api.interfaces.IOrderApi;
import com.hamitmizrak.business.dto.OrderDto;
import com.hamitmizrak.business.services.interfaces.IOrderService;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.exception._400_BadRequestException;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/api/order/v1.0.0")
@CrossOrigin(origins = {FrontEnd.REACT_URL, FrontEnd.ANGULAR_URL})
public class OrderApiImpl implements IOrderApi<OrderDto> {

    private final IOrderService iOrderService;
    private final MessageSource messageSource;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // CRUD

    // CREATE
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody OrderDto orderDto) {
        try {
            OrderDto created = (OrderDto) iOrderService.objectServiceCreate(orderDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/order/create"));
        }
    }

    // LIST
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<OrderDto>>> objectApiList() {
        try {
            List<OrderDto> list = iOrderService.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/order/list"));
        }
    }

    // FIND BY ID
    @GetMapping({"/find/","/find/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name="id",required = false) Long id) {
        try {
            if (id == null)
                throw new NullPointerException("Null Pointer Exception: Null değer");
            if (id == 0)
                throw new _400_BadRequestException("Bad Request Exception: Kötü istek");
            if (id < 0) {
                String message = messageSource.getMessage("error.unauthorized", null, LocaleContextHolder.getLocale());
                return ResponseEntity.ok(ApiResult.unauthorized(message, "/api/order/find"));
            }

            OrderDto found = (OrderDto) iOrderService.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));

        } catch (_400_BadRequestException ex) {
            return ResponseEntity.ok(ApiResult.error("badRequest", ex.getMessage(), "/api/order/find"));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/order/find"));
        }
    }

    // UPDATE
    @PutMapping({"/update/","/update/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id",required = false) Long id,
                                                        @Valid @RequestBody OrderDto orderDto) {
        try {
            OrderDto updated = (OrderDto) iOrderService.objectServiceUpdate(id, orderDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/order/update"));
        }
    }

    // DELETE
    @DeleteMapping({"/delete/","/delete/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id",required = false) Long id) {
        try {
            String deleted = iOrderService.objectServiceDelete(id).toString();
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/order/delete"));
        }
    }

} // end OrderApiImpl
