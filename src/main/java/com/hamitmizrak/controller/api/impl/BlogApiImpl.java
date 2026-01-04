package com.hamitmizrak.controller.api.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.business.services.interfaces.IBlogServices;
import com.hamitmizrak.controller.api.interfaces.IBlogApi;
import com.hamitmizrak.data.entity.BlogEntity;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.file_upload.ImageService;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API
@RestController
@RequestMapping("/blog/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
public class BlogApiImpl implements IBlogApi<BlogDto> {

    // Injection
    private final IBlogServices<BlogDto, BlogEntity> iBlogServices;
    private final ImageService imageService;
    private final ObjectMapper objectMapper;


    /// ALL SPEED- DELETE //////////////////////////////////////////////////////////////
    // http://localhost:4444/blog/api/v1.0.0/speed-data/12
    @Override
    @PostMapping("/speed-data/{count}")
    public ResponseEntity<String> blogApiSpeedData(@PathVariable("count") Integer data) {
        return ResponseEntity.ok(iBlogServices.blogSpeedData(data == null ? 0 : data));
    }


    // http://localhost:4444/blog/api/v1.0.0/delete/all
    @Override
    @DeleteMapping("/delete/all")
    public ResponseEntity<String> blogApiAllDetelete() {
        return ResponseEntity.ok(iBlogServices.blogDeleteAll());
    }


    /// CRUD //////////////////////////////////////////////////////////////////////
    /// CREATE (JSON RESIMSIZ)
    //  http://localhost:4444/blog/api/v1.0.0/create
    @Override
    @PostMapping(value = "/create",consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreate(blogDto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }


    /// CREATE (RESIMLI)
    //  http://localhost:4444/blog/api/v1.0.0/create
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreateMultipart(String json, MultipartFile file) {
        return null;
    }
    /// /////////////////////////////////////////////////////////////////////////////////

    // LIST
    //  http://localhost:4444/blog/api/v1.0.0/list
    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<BlogDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceList()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/api/v1.0.0/list"));
        }
    }

    // FIND
    //  http://localhost:4444/blog/api/v1.0.0/find/1
    @Override
    @GetMapping("/find/{id}")
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceFindById(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/api/v1.0.0/find/" + id));
        }
    }


    /// /////////////////////////////////////////////////////////////////////////////////
    // UPDATE
    //  http://localhost:4444/blog/api/v1.0.0/update/1
    @Override
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable("id") Long id, @Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceUpdate(id, blogDto)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/api/v1.0.0/update/" + id));
        }
    }


    /// UPDATE (RESIMLI)
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdateMultipart(Long id, BlogDto blogDto, MultipartFile file) {
        return null;
    }


    // DELETE FIND BY ID
    //  http://localhost:4444/blog/api/v1.0.0/delete/1
    @Override
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceDelete(id)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/blog/api/v1.0.0/delete/" + id));
        }
    }
} //end BlogCategoryApiImpl
