package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.controller.api.interfaces.IBlogCategoryApi;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.utily.FrontEnd;
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

    // http://localhost:4444//blog/category/api/v1.0.0/speed-data/12
    @Override
    @PostMapping("/speed-data/{count}")
    public ResponseEntity<String> categoryApiSpeedData(@PathVariable("count") Integer data) {
        return ResponseEntity.ok(iBlogCategoryServices.categorySpeedData(data==null ? 0 :data));
    }


    // http://localhost:4444//blog/category/api/v1.0.0/delete/all
    @Override
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> categoryApiAllDetelete() {
        return ResponseEntity.ok(iBlogCategoryServices.categoryDeleteAll());
    }

    /// CRUD //////////////////////////////////////////////////////////////////////
    /// CREATE
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(BlogCategoryDto blogCategoryDto) {
        return null;
    }

    // LIST
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        return null;
    }

    // FIND
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(Long id) {
        return null;
    }


    // UPDATE
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(Long id, BlogCategoryDto blogCategoryDto) {
        return null;
    }


    // DELETE FIND BY ID
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(Long id) {
        return null;
    }
} //end BlogCategoryApiImpl
