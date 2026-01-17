package com.hamitmizrak.controller.api.interfaces;

import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.controller.api.ICrudApi;
import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;

public interface IBlogCategoryApi<D> extends ICrudApi<D> {

    // ALL DELETE
    public ResponseEntity<String> categoryApiAllDelete();

    // SPEED DATA
    public ResponseEntity<String> categoryApiSpeedData(Integer data);
}
