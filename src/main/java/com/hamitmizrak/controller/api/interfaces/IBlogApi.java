package com.hamitmizrak.controller.api.interfaces;

import com.hamitmizrak.controller.api.ICrudApi;
import org.springframework.http.ResponseEntity;

public interface IBlogApi<D> extends ICrudApi<D> {

    // SPEED DATA
    public ResponseEntity<String> blogApiSpeedData(Integer data);

    // ALL DELETE
    public ResponseEntity<String> blogApiAllDetelete();

}
