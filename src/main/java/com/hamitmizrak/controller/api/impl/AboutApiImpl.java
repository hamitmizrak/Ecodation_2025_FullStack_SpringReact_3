package com.hamitmizrak.controller.api.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hamitmizrak.business.dto.AboutDto;
import com.hamitmizrak.business.dto.RegisterDto;
import com.hamitmizrak.business.services.interfaces.IAboutServices;
import com.hamitmizrak.controller.api.interfaces.IAboutApi;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.file_upload.FileProps;
import com.hamitmizrak.file_upload.ImageService;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API
@RestController
@CrossOrigin(origins = FrontEnd.REACT_URL) // http://localhost:3000
@RequestMapping("/about/api/v1.0.0")
public class AboutApiImpl implements IAboutApi<AboutDto> {

    // Injection
    private final IAboutServices iAboutServices;

    // Resim
    private final ImageService imageService;
    private final FileProps fileProps;
    private final ObjectMapper objectMapper; // String json => Java Objesi haline geliyor

    @Value("${file.upload-dir}")
    private String uploadDir; // ör: upload

    //////////////////////////////////////////////////////////////////////////////////////////
    // CREATE
    // İster resimli ister resimsiz yani opsiyonel (Şimdiki resimsiz)
    // http://localhost:4444/about/api/v1.0.0/create
    @Override
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody AboutDto aboutDto) {
        try {
            AboutDto created = (AboutDto) iAboutServices.objectServiceCreate(aboutDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/create"));
        }
    }


    // İster resimli ister resimsiz yani opsiyonel (Şimdiki resimsiz)
    // http://localhost:4444/about/api/v1.0.0/create
    /**
     * CREATE (Multipart) — Opsiyonel dosya ile
     * POST http://localhost:4444/about/api/v1.0.0/create
     * Content-Type: multipart/form-data
     * form-data alanları:
     *  - dto  (Text)   -> geçerli JSON metni
     *  - file (File)   -> opsiyonel (görsel vb.)
     */
    @Override
    @PostMapping(value="/create",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(
            // Burası about postmanda objede kullanacağımız yerdir.
            @RequestPart("about") String json, // <-- JSON string
            @RequestPart(value = "file", required = false) MultipartFile file) // <-- dosya parçası (adı "file")
            throws JsonProcessingException {

        // JSON string'i DTO'ya çevir
        AboutDto aboutDto = objectMapper.readValue(json, AboutDto.class);

        // Dosya geldiyse diske kaydet ve sadece URL'i DTO'ya yaz
        if (file != null && !file.isEmpty()) {
            String relative = imageService.saveRegisterImage(file); // /upload/register/...
            aboutDto.setImageUrl(relative);
        }

        AboutDto created = (AboutDto) iAboutServices.objectServiceCreate(aboutDto);
        return ResponseEntity.ok(ApiResult.success(created));
    }

    // LIST
    // http://localhost:4444/about/api/v1.0.0/list
    @Override
    @GetMapping(value="/list")
    public ResponseEntity<ApiResult<List<AboutDto>>> objectApiList() {
        try {
            List<AboutDto> list = iAboutServices.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/list"));
        }
    }

    // FIND
    // http://localhost:4444/about/api/v1.0.0/find/1
    @Override
    @GetMapping(value="/find/{id}")
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            if (id == null) {
                return ResponseEntity.ok(ApiResult.notFound("Id değeri boş", "/about/api/v1.0.0/find"));
            }
            AboutDto found = (AboutDto) iAboutServices.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/find"));
        }
    }

    // UPDATE
    // http://localhost:4444/about/api/v1.0.0/update/1
    @Override
    @PutMapping(value="/update/{id}")
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody AboutDto aboutDto) {
        try {
            AboutDto updated = (AboutDto) iAboutServices.objectServiceUpdate(id, aboutDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/update"));
        }
    }


    // Image
    // http://localhost:4444/register/api/v1.0.0/update/1
    @PutMapping(
            value = {"/update", "/update/{id}"},
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(
            @PathVariable(name = "id") Long id,
            @Valid @RequestPart("about") AboutDto aboutDto,
            @RequestPart(name = "file", required = false) MultipartFile file) {

        try {
            // mevcut kaydı al (eski imageUrl’i öğrenmek için)
            AboutDto current = (AboutDto) iAboutServices.objectServiceFindById(id);
            String oldUrl = current != null ? current.getImageUrl() : null;

            if (file != null && !file.isEmpty()) {
                // yeni dosyayı diske yaz
                String relative = imageService.saveRegisterImage(file);
                aboutDto.setImageUrl(relative);
            } else {
                // dosya gelmediyse eski url’i koru (DTO null gönderildiyse üzerine yazılmasın)
                if (aboutDto.getImageUrl() == null) {
                    aboutDto.setImageUrl(oldUrl);
                }
            }

            RegisterDto updated = (RegisterDto) iAboutServices.objectServiceUpdate(id,aboutDto);

            // yeni dosya yüklendiyse, update başarılı olduktan sonra eskiyi sil
            if (file != null && !file.isEmpty() && oldUrl != null && !oldUrl.isBlank()) {
                imageService.deleteByUrl(oldUrl);
            }

            if (updated.getImageUrl() != null) {
                String full = UriComponentsBuilder.fromHttpUrl(fileProps.getBaseUrl())
                        .path(updated.getImageUrl())
                        .toUriString();
                updated.setFullImageUrl(full);
            }
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/update"));
        }
    }

    // DELETE BY ID
    // http://localhost:4444/about/api/v1.0.0/delete/1
    @Override
    @DeleteMapping(value="/delete/{id}")
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            String deleted = iAboutServices.objectServiceDelete(id).toString();

            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/about/api/v1.0.0/delete"));
        }
    }

} //end class