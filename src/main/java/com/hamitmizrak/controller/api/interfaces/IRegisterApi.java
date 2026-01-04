package com.hamitmizrak.controller.api.interfaces;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.hamitmizrak.business.dto.RegisterDto;
import com.hamitmizrak.controller.api.ICrudApi;
import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

// API INTERFACE (IRegisterApi)
// D: Dto
public interface IRegisterApi<D> extends ICrudApi<D> {
    // Register SpeedData
    public ResponseEntity<ApiResult<?>>  registerApiSpeedData(Long data);

    // Register User All Delete
    public ResponseEntity<ApiResult<?>> registerApiUserAllDelete();

    // CREATE Register(Api)
    public ResponseEntity<ApiResult<?>>  objectApiCreate(Long rolesId, RegisterDto registerDto);

    // CREATE Register(Api) =>
    public ResponseEntity<ApiResult<?>> objectApiCreate(Long rolesId, String registerJson, MultipartFile file) throws JsonProcessingException;

    // Update
    public ResponseEntity<ApiResult<?>> objectApiUpdate(Long rolesId, RegisterDto registerDto, MultipartFile file);


    /////////////////////////////////////////////////////////
    // Email adresinden kullanıcı rolünü bulmak

} //end Registerapi interface
