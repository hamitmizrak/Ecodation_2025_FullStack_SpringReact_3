package com.hamitmizrak.controller.api.interfaces;

import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.controller.api.ICrudApi;
import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface IBlogApi<D> extends ICrudApi<D> {

    // SPEED DATA
    public ResponseEntity<String> blogApiSpeedData(Integer data);

    // ALL DELETE
    public ResponseEntity<String> blogApiAllDetelete();

    // RESIMLI CREATE
    public ResponseEntity<ApiResult<?>> objectApiCreateMultipart(String json, MultipartFile file);

    // RESIMLI UPDATE
    public ResponseEntity<ApiResult<?>> objectApiUpdateMultipart(Long id, BlogDto blogDto, MultipartFile file);

}
