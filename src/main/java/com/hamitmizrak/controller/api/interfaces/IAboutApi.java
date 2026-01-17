package com.hamitmizrak.controller.api.interfaces;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hamitmizrak.controller.api.ICrudApi;
import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface IAboutApi<D> extends ICrudApi<D> {

    // CREATE Register(Api)
    public ResponseEntity<ApiResult<?>> objectApiCreate(D d);

    // CREATE Register(Api) =>
    public ResponseEntity<ApiResult<?>> objectApiCreate(String json, MultipartFile file) throws JsonProcessingException;

    // Update
    public ResponseEntity<ApiResult<?>> objectApiUpdate(Long id, D d, MultipartFile file);

}
