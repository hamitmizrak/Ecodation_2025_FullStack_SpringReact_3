package com.hamitmizrak.error;

import lombok.RequiredArgsConstructor; // Lombok: Constructor injection için
import lombok.extern.log4j.Log4j2;      // Lombok: Loglama için
import org.springframework.boot.web.error.ErrorAttributeOptions; // Hata attribute seçenekleri
import org.springframework.boot.web.servlet.error.ErrorAttributes; // Spring'in error attribute'ları
import org.springframework.boot.web.servlet.error.ErrorController; // ErrorController interface
import org.springframework.validation.FieldError; // Validation hataları için
import org.springframework.web.bind.annotation.CrossOrigin; // CORS
import org.springframework.web.bind.annotation.GetMapping; // GET endpoint mapping
import org.springframework.web.bind.annotation.RequestMapping; // Generic endpoint mapping
import org.springframework.web.bind.annotation.RestController; // RestController
import org.springframework.web.context.request.WebRequest; // HTTP request abstraction

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Log4j2 // Loglama için Lombok annotation
@RequiredArgsConstructor // Final field'ları constructor ile inject eder
@RestController // Bu sınıf bir REST API controller'ıdır
@CrossOrigin // CORS izinleri verir (farklı origin'den gelen requestler)
public class CustomErrorHandleWebRequest implements ErrorController {

    /*
        ErrorAttributes kullanımı için 3 yöntem:

        1. Field Injection (Autowired ile) --> önerilmez
        //@Autowired
        //private ErrorAttributes errorAttributes;

        2. Constructor Injection (manuel) --> kullanılabilir
        //private ErrorAttributes errorAttributes;
        /*
        @Autowired
        public CustomErrorHandleWebRequest(ErrorAttributes errorAttributes) {
            this.errorAttributes = errorAttributes;
        }
       3. Lombok Injection (Recommended) --> final field + @RequiredArgsConstructor
    */
    private final ErrorAttributes errorAttributes;

    /**
     * Hata endpoint'i
     * Spring Boot'un default /error endpoint'i için handle method
     * Tüm global hataları merkezi olarak ApiResult formatında döndürür
     *
     * @param webRequest WebRequest: HTTP request abstraction
     * @return ApiResult<Object>: Hata response'u
     */
    @RequestMapping("/error")
    public ApiResult<Object> handleErrorMethod(WebRequest webRequest) {

        // Spring Boot'un ErrorAttributes'ından tüm hata detaylarını al
        Map<String, Object> attributes = errorAttributes.getErrorAttributes(
                webRequest,
                ErrorAttributeOptions.of(
                        ErrorAttributeOptions.Include.MESSAGE,       // Hata mesajını al
                        ErrorAttributeOptions.Include.BINDING_ERRORS // Validation hatalarını al
                )
        );

        // Status kodunu integer olarak al, null ise 0
        int status = attributes.get("status") == null ? 0 : Integer.parseInt(attributes.get("status").toString());

        // Hata mesajını ve request path'ini al
        String message = (String) attributes.get("message");
        String path = (String) attributes.get("path");

        // Validation hataları
        Map<String, Object> validationErrors = null;

        if (attributes.containsKey("errors")) {
            // FieldError listesi olarak cast et
            List<FieldError> fieldErrors = (List<FieldError>) attributes.get("errors");
            validationErrors = new HashMap<>();
            for (FieldError fieldError : fieldErrors) {
                // Field ve message'ı map içine ekle
                validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
            }
        }

        // ApiResult instance
        ApiResult<Object> apiResult;

        // HTTP status koduna göre ApiResult.Status enum'ını belirle
        ApiResult.Status apiStatus;
        switch (status) {
            case 200 -> apiStatus = ApiResult.Status.SUCCESS;
            case 400 -> apiStatus = ApiResult.Status.UNPROCESSABLE;
            case 401 -> apiStatus = ApiResult.Status.UNAUTHORIZED;
            case 403 -> apiStatus = ApiResult.Status.FORBIDDEN;
            case 404 -> apiStatus = ApiResult.Status.NOT_FOUND;
            case 500 -> apiStatus = ApiResult.Status.SERVER_ERROR;
            default -> apiStatus = ApiResult.Status.ERROR;
        }

        // ApiResult'u build et
        apiResult = ApiResult.<Object>builder()
                .status(apiStatus)
                .message(message)
                .path(path)
                .errors(validationErrors) // Validation hataları varsa ekle
                .build();

        return apiResult; // Response olarak döndür
    }

    /**
     * Test endpoint
     * http://localhost:4444/test/apiresult
     * Bu endpoint isteğe bağlı olarak hata üretmek için kullanılabilir
     */
    @GetMapping("/test/apiresult")
    public String errorTest() {
        throw new RuntimeException("İsteyerek Hata Gönder");
    }
}
