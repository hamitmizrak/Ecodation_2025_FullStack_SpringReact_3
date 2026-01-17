package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.ProductDto;
import com.hamitmizrak.business.services.interfaces.IProductService;
import com.hamitmizrak.controller.api.interfaces.IProductApi;
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
@RequestMapping("/api/product/")
@CrossOrigin(origins = {FrontEnd.REACT_URL, FrontEnd.ANGULAR_URL})
public class ProductApiImpl implements IProductApi<ProductDto> {

    private final IProductService iProductService;
    private final MessageSource messageSource;

    private ApiResult apiResult;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // CRUD

    // CREATE
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody ProductDto productDto) {
        try {
            ProductDto created = (ProductDto) iProductService.objectServiceCreate(productDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/product/create"));
        }
    }

    // LIST
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<ProductDto>>> objectApiList() {
        try {
            List<ProductDto> list = iProductService.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/product/list"));
        }
    }

    // FIND BY ID
    @GetMapping({"/find/", "/find/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id", required = false) Long id) {
        try {
            if (id == null)
                throw new NullPointerException("Null Pointer Exception: Null değer");
            if (id == 0)
                throw new _400_BadRequestException("Bad Request Exception: Kötü istek");
            if (id < 0) {
                String message = messageSource.getMessage("error.unauthorized", null, LocaleContextHolder.getLocale());
                return ResponseEntity.ok(ApiResult.unauthorized(message, "/api/product/find"));
            }

            ProductDto found = (ProductDto) iProductService.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));

        } catch (_400_BadRequestException ex) {
            return ResponseEntity.ok(ApiResult.error("badRequest", ex.getMessage(), "/api/product/find"));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/product/find"));
        }
    }

    // UPDATE
    @PutMapping({"/update/", "/update/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id", required = false) Long id,
                                                        @Valid @RequestBody ProductDto productDto) {
        try {
            ProductDto updated = (ProductDto) iProductService.objectServiceUpdate(id, productDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/product/update"));
        }
    }

    // DELETE
    @DeleteMapping({"/delete/", "/delete/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id", required = false) Long id) {
        try {
            String deleted = iProductService.objectServiceDelete(id).toString();
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/api/product/delete"));
        }
    }

} // end ProductApiImpl
