package com.hamitmizrak.security.error;


import com.hamitmizrak.error.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResult<?>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.ok(ApiResult.error("badCredentials", "Email veya Şifre hatalı", "/auth/login"));
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResult<?>> handleDisabled(DisabledException ex) {
        return ResponseEntity.ok(ApiResult.error("disabled", "Hesap pasif", "/auth/login"));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResult<?>> handleNotFound(UsernameNotFoundException ex) {
        return ResponseEntity.ok(ApiResult.notFound("Kullanıcı bulunamadı", "/auth/login"));
    }
}
