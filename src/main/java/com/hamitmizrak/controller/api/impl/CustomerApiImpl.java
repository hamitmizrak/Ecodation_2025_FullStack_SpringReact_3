package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.CustomerDto;
import com.hamitmizrak.business.services.interfaces.ICustomerService;
import com.hamitmizrak.controller.api.interfaces.ICustomerApi;
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

// LOMBOK
@RequiredArgsConstructor
@Log4j2

@RestController
@RequestMapping("/api/customer/v1.0.0")
@CrossOrigin(origins = {FrontEnd.REACT_URL, FrontEnd.ANGULAR_URL})
public class CustomerApiImpl implements ICustomerApi<CustomerDto> {

    // Injection
    private final ICustomerService iCustomerService;
    private final MessageSource messageSource;

    // ApiResult Instance
    private ApiResult apiResult;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // CRUD

    // CREATE
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody CustomerDto customerDto) {
        try {
            CustomerDto created = (CustomerDto) iCustomerService.objectServiceCreate(customerDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/customer/create"));
        }
    }

    // LIST
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<CustomerDto>>> objectApiList() {
        try {
            List<CustomerDto> list = iCustomerService.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/customer/list"));
        }
    }

    // FIND BY ID
    @GetMapping({"/find/", "/find/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name="id", required=false) Long id) {
        try {
            if (id == null) {
                return ResponseEntity.ok(ApiResult.notFound("Id değeri boş", "/api/customer/find"));
            } else if (id == 0) {
                throw new _400_BadRequestException("Bad Request Exception: Kötü istek");
            } else if (id < 0) {
                String message = messageSource.getMessage("error.unauthorized", null, LocaleContextHolder.getLocale());
                return ResponseEntity.ok(ApiResult.unauthorized(message, "/api/customer/find"));
            }

            CustomerDto found = (CustomerDto) iCustomerService.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));
        } catch (_400_BadRequestException ex) {
            return ResponseEntity.ok(ApiResult.error("badRequest", ex.getMessage(), "/api/customer/find"));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/customer/find"));
        }
    }

    // UPDATE
    @PutMapping({"/update/", "/update/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(
            @PathVariable(name="id", required=false) Long id,
            @Valid @RequestBody CustomerDto customerDto) {
        try {
            CustomerDto updated = (CustomerDto) iCustomerService.objectServiceUpdate(id, customerDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/customer/update"));
        }
    }

    // DELETE
    @DeleteMapping({"/delete/", "/delete/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name="id", required=false) Long id) {
        try {
            String deleted = iCustomerService.objectServiceDelete(id).toString();
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/customer/delete"));
        }
    }

} //end CustomerApiImpl
