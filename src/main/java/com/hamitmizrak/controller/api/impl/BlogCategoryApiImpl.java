package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.controller.api.interfaces.IBlogCategoryApi;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/blog/category/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
public class BlogCategoryApiImpl implements IBlogCategoryApi<BlogCategoryDto> {

    private final IBlogCategoryServices<BlogCategoryDto, ?> iCategoryServices;

    // CREATE
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogCategoryDto d) {
        try {
            return ResponseEntity.ok(ApiResult.success(iCategoryServices.objectServiceCreate(d)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/create"));
        }
    }

    // LIST
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        try {
            List<BlogCategoryDto> data = iCategoryServices.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(data));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/list"));
        }
    }

    // FIND
    @GetMapping("/find/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iCategoryServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/find/"+id));
        }
    }

    // UPDATE
    @PutMapping("/update/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable Long id,
                                                        @Valid @RequestBody BlogCategoryDto d) {
        try {
            return ResponseEntity.ok(ApiResult.success(iCategoryServices.objectServiceUpdate(id, d)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/update/"+id));
        }
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iCategoryServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/delete/"+id));
        }
    }

    // SPEED DATA  (React tarafında kullanmasan da faydalı)
    @PostMapping("/speed-data/{count}")
    @Override
    public ResponseEntity<String> categoryApiSpeedData(@PathVariable("count") Integer count) {
        return ResponseEntity.ok(iCategoryServices.categorySpeedData(count == null ? 0 : count));
    }

    // ALL DELETE
    @DeleteMapping("/all-delete")
    @Override
    public ResponseEntity<String> categoryApiAllDelete() {
        return ResponseEntity.ok(iCategoryServices.categoryDeleteAll());
    }
}
