package com.hamitmizrak.controller.api.interfaces;

import com.hamitmizrak.controller.api.ICrudApi;
import org.springframework.http.ResponseEntity;

public interface IBlogCategoryApi<D> extends ICrudApi<D> {

    // SPEED DATA
    public ResponseEntity<String> blogCategoryApiSpeedData(Integer data);

    // ALL DELETE
    public ResponseEntity<String> blogCategoryApiAllDetelete();

}
