package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.controller.api.interfaces.IBlogCategoryApi;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API
@RestController
@RequestMapping("/blog/category/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
public class BlogCategoryApiImpl implements IBlogCategoryApi<BlogCategoryDto> {

    // Injection
    private final IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> iBlogCategoryServices;


    /// ALL SPEED- DELETE//////////////////////////////////////////////////////////////
    // http://localhost:4444/blog/category/api/v1.0.0/speed-data/12
    @Override
    @PostMapping("/speed-data/{count}")
    public ResponseEntity<String> categoryApiSpeedData(@PathVariable("count") Integer data) {
        return ResponseEntity.ok(iBlogCategoryServices.categorySpeedData(data == null ? 0 : data));
    }


    // http://localhost:4444/blog/category/api/v1.0.0/delete/all
    @Override
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> categoryApiAllDetelete() {
        return ResponseEntity.ok(iBlogCategoryServices.categoryDeleteAll());
    }

    /// CRUD //////////////////////////////////////////////////////////////////////
    /// CREATE
    //  http://localhost:4444/blog/category/api/v1.0.0/create
    @Override
    @PostMapping("/create")
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceCreate(blogCategoryDto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/category/api/v1.0.0/create"));
        }
    }

    // LIST
    //  http://localhost:4444/blog/category/api/v1.0.0/list
    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceList()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/category/api/v1.0.0/list"));
        }
    }

    // FIND
    //  http://localhost:4444/blog/category/api/v1.0.0/find/1
    @Override
    @GetMapping("/find/{id}")
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceFindById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/category/api/v1.0.0/find/" + id));
        }
    }


    // UPDATE
    //  http://localhost:4444/blog/category/api/v1.0.0/update/1
    @Override
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable("id") Long id, @Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceUpdate(id, blogCategoryDto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/category/api/v1.0.0/update/" + id));
        }
    }


    // DELETE FIND BY ID
    //  http://localhost:4444/blog/category/api/v1.0.0/delete/1
    @Override
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceDelete(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/category/api/v1.0.0/delete/" + id));
        }
    }
} //end BlogCategoryApiImpl
