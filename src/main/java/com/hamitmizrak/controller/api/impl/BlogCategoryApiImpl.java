package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.BlogCategoryDto;
import com.hamitmizrak.business.services.interfaces.IBlogCategoryServices;
import com.hamitmizrak.controller.api.interfaces.IBlogCategoryApi;
import com.hamitmizrak.data.entity.BlogCategoryEntity;
import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;

import java.util.List;

public class BlogCategoryApiImpl implements IBlogCategoryApi<BlogCategoryDto> {

    // Injection
    private final IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> iBlogCategoryServices;


    /// ALL DELETE-SPEED//////////////////////////////////////////////////////////////
    /// CREATE
    @Override
    public ResponseEntity<String> categoryApiAllDetelete() {
        return null;
    }

    @Override
    public ResponseEntity<String> categoryApiSpeedData(Integer data) {
        return null;
    }


    /// CRUD //////////////////////////////////////////////////////////////////////
    /// CREATE
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(BlogCategoryDto blogCategoryDto) {
        return null;
    }

    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        return null;
    }

    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(Long id) {
        return null;
    }

    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(Long id, BlogCategoryDto blogCategoryDto) {
        return null;
    }

    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(Long id) {
        return null;
    }
} //end BlogCategoryApiImpl
