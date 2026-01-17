package com.hamitmizrak.controller.api.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hamitmizrak.business.dto.RegisterDto;
import com.hamitmizrak.business.services.impl.RegisterServicesImpl;
import com.hamitmizrak.business.services.interfaces.IRegisterServices;
import com.hamitmizrak.controller.api.interfaces.IRegisterApi;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.exception._400_BadRequestException;
import com.hamitmizrak.file_upload.FileProps;
import com.hamitmizrak.file_upload.ImageService;
import com.hamitmizrak.token_mail.entity.ForRegisterTokenEmailConfirmationEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Optional;

// Lombok
@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/register/api/v1.0.0")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200"}) // Frontend portları
public class RegisterApiImpl implements IRegisterApi<RegisterDto> {

    // Injection
    private final IRegisterServices iRegisterServices;
    private final RegisterServicesImpl registerServicesImpl;

    // Resim
    private final ImageService imageService;
    private final FileProps fileProps;
    private final ObjectMapper objectMapper; // String json => Jva Objesi haline geliyor


    /////////////////////////////////////////////////////////////
    // SPEED DATA
    @GetMapping("/speed/data")
    @Override
    public ResponseEntity<ApiResult<?>> registerApiSpeedData(Long key) {
        return ResponseEntity.ok(ApiResult.success(iRegisterServices.registerSpeedData(key))  );
    }

    // USER ALL DELETE
    @GetMapping("/all/delete")
    @Override
    public ResponseEntity<ApiResult<?>>registerApiUserAllDelete() {
        return ResponseEntity.ok(ApiResult.success(iRegisterServices.registerAllUSerDelete()));
    }

    /////////////////////////////////////////////////////////////
    // REGISTER CRUD
    // İster resimli ister resimsiz yani opsiyonel
    // CREATE Register(Api) - Role
    // http://localhost:4444/register/api/v1.0.0/create/1
    @PostMapping("/create/{roles_id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(
            @PathVariable(name = "roles_id", required = false) Long rolesId,
            @Valid @RequestBody RegisterDto registerDto) {
        try {
            RegisterDto created = iRegisterServices.objectServiceCreate(rolesId, registerDto);
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/create"));
        }
    }

    // CREATE Register(Api)
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(RegisterDto registerDto) {
        return null;
    }

    // Image
    // http://localhost:4444/register/api/v1.0.0/create/1
    @Override
    @PostMapping(value = "/create/{roles_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(
            @PathVariable("roles_id") Long rolesId,
            @RequestPart("register") String registerJson,                      // <-- JSON string
            @RequestPart(value = "file", required = false) MultipartFile file  // <-- dosya parçası (adı "file")
    ) throws JsonProcessingException {

        // JSON string'i DTO'ya çevir
        RegisterDto registerDto = objectMapper.readValue(registerJson, RegisterDto.class);

        // Dosya geldiyse diske kaydet ve sadece URL'i DTO'ya yaz
        if (file != null && !file.isEmpty()) {
            String relative = imageService.saveRegisterImage(file); // /upload/register/...
            registerDto.setImageUrl(relative);
        }

        RegisterDto created = iRegisterServices.objectServiceCreate(rolesId, registerDto);
        return ResponseEntity.ok(ApiResult.success(created));
    }

    // LIST Register(Api)
    // http://localhost:4444/register/api/v1.0.0/list
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<RegisterDto>>> objectApiList() {
        try {
            List<RegisterDto> list = iRegisterServices.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(list));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/list"));
        }
    }

    // FIND Register(Api)
    // http://localhost:4444/register/api/v1.0.0/find
    // http://localhost:4444/register/api/v1.0.0/find/0
    // http://localhost:4444/register/api/v1.0.0/find/1
    @GetMapping({"/find","/find/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name="id",required = false) Long id) {
        try {
            if (id == null) throw new NullPointerException("Null pointer exception: Null değer");
            if (id == 0) throw new _400_BadRequestException("Bad Request Exception: Kötü istek");
            if (id < 0) {
                return ResponseEntity.ok(ApiResult.unauthorized("Yetkisiz giriş", "/register/api/v1.0.0/find"));
            }

            RegisterDto found = (RegisterDto) iRegisterServices.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(found));
        } catch (_400_BadRequestException ex) {
            return ResponseEntity.ok(ApiResult.error("badRequest", ex.getMessage(), "/register/api/v1.0.0/find"));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/find"));
        }
    }

    // UPDATE Register(Api)
    // http://localhost:4444/register/api/v1.0.0/update
    // http://localhost:4444/register/api/v1.0.0/update/0
    // http://localhost:4444/register/api/v1.0.0/update/1
    @PutMapping({"/update","/update/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(
            @PathVariable(name="id",required = false) Long id,
            @Valid @RequestBody RegisterDto registerDto) {
        try {
            RegisterDto updated = (RegisterDto) iRegisterServices.objectServiceUpdate(id, registerDto);
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/update"));
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
            @PathVariable(name = "id", required = false) Long id,
            @Valid @RequestPart("register") RegisterDto registerDto,
            @RequestPart(name = "file", required = false) MultipartFile file
    ) {
        try {
            // mevcut kaydı al (eski imageUrl’i öğrenmek için)
            RegisterDto current = (RegisterDto) iRegisterServices.objectServiceFindById(id);
            String oldUrl = current != null ? current.getImageUrl() : null;

            if (file != null && !file.isEmpty()) {
                // yeni dosyayı diske yaz
                String relative = imageService.saveRegisterImage(file);
                registerDto.setImageUrl(relative);
            } else {
                // dosya gelmediyse eski url’i koru (DTO null gönderildiyse üzerine yazılmasın)
                if (registerDto.getImageUrl() == null) {
                    registerDto.setImageUrl(oldUrl);
                }
            }

            RegisterDto updated = (RegisterDto) iRegisterServices.objectServiceUpdate(id, registerDto);

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
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/update"));
        }
    }


    // DELETE Register(Api)
    // http://localhost:4444/register/api/v1.0.0/delete
    // http://localhost:4444/register/api/v1.0.0/delete/0
    // http://localhost:4444/register/api/v1.0.0/delete/1
    @DeleteMapping({"/delete","/delete/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name="id", required = false) Long id) {
        try {
            RegisterDto current = (RegisterDto) iRegisterServices.objectServiceFindById(id);
            String oldUrl = current != null ? current.getImageUrl() : null;

            String deleted = iRegisterServices.objectServiceDelete(id).toString();

            if (oldUrl != null && !oldUrl.isBlank()) {
                imageService.deleteByUrl(oldUrl);
            }

            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/register/api/v1.0.0/delete"));
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EMAIL CONFIRMATION
    //http://localhost:4444/register/api/v1/confirm?token=ca478481-5f7a-406b-aaa4-2012ebe1afb4
    @GetMapping("/confirm")
    public ResponseEntity<String> emailTokenConfirmation(@RequestParam("token") String token) {
        Optional<ForRegisterTokenEmailConfirmationEntity> tokenConfirmationEntity = registerServicesImpl.findTokenConfirmation(token);
        tokenConfirmationEntity.ifPresent(registerServicesImpl::emailTokenConfirmation);
        String html="<!doctype html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <title>Register</title>\n" +
                "  <meta charset=\"utf-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n" +
                "  <style>\n" +
                "    body{ background-color: black; color:white; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <p style='padding:4rem;'>Üyeliğiniz Aktif olunmuştur.  <a href='http://localhost:3000'>Ana sayfa için tıklayınız </a></p>\n" +
                "</body>\n" +
                "</html>";
        return ResponseEntity.ok(html);
    }

} // end RegisterApiImpl
