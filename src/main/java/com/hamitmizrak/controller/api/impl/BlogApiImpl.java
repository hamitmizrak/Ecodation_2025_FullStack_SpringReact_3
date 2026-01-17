package com.hamitmizrak.controller.api.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hamitmizrak.business.dto.BlogDto;
import com.hamitmizrak.business.services.interfaces.IBlogServices;
import com.hamitmizrak.controller.api.interfaces.IBlogApi;
import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.file_upload.ImageService;
import com.hamitmizrak.utily.FrontEnd;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/blog/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
public class BlogApiImpl implements IBlogApi<BlogDto> {

    private final IBlogServices<BlogDto, ?> blogService;
    private final ImageService imageService;
    private final ObjectMapper objectMapper;

    // -------------------- CREATE --------------------

    /** JSON (resimsiz) */
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogDto dto) {
        try {
            return ResponseEntity.ok(ApiResult.success(blogService.objectServiceCreate(dto)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    /**
     * Multipart (resimli) — About’taki desenin aynısı:
     * POST /blog/api/v1.0.0/create
     * Content-Type: multipart/form-data
     * form-data:
     *   - blog:   Text (JSON)  -> ör: {"header":"H1","title":"T1","content":"...","blogCategoryDto":{"categoryId":1}}
     *   - file:   File (opsiyonel)
     */
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreateMultipart(
            @RequestPart("blog") String json,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        try {
            BlogDto dto = objectMapper.readValue(json, BlogDto.class);
            if (file != null && !file.isEmpty()) {
                String relative = imageService.saveBlogImage(file); // /upload/blog/...
                dto.setImage(relative);
            }
            return ResponseEntity.ok(ApiResult.success(blogService.objectServiceCreate(dto)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create[multipart]"));
        }
    }

    // -------------------- LIST / FIND --------------------

    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<BlogDto>>> objectApiList() {
        try {
            List<BlogDto> data = blogService.objectServiceList();
            return ResponseEntity.ok(ApiResult.success(data));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/list"));
        }
    }

    @GetMapping("/find/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable Long id) {
        try {
            BlogDto data = blogService.objectServiceFindById(id);
            return ResponseEntity.ok(ApiResult.success(data));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/find/"+id));
        }
    }

    // -------------------- UPDATE --------------------

    /** JSON (resimsiz) */
    @PutMapping(value = "/update/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable Long id,
                                                        @Valid @RequestBody BlogDto dto) {
        try {
            return ResponseEntity.ok(ApiResult.success(blogService.objectServiceUpdate(id, dto)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update/"+id));
        }
    }

    /**
     * Multipart (resimli)
     * PUT /blog/api/v1.0.0/update/{id}
     * form-data:
     *  - blog: Text (JSON) -> BlogDto formatında
     *  - file: File (opsiyonel)
     * Mantık: yeni dosya gelirse önce kaydet, DTO.image güncellenir; update sonrası eski görsel güvenle silinir.
     */
    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiUpdateMultipart(
            @PathVariable Long id,
            @Valid @RequestPart("blog") BlogDto dto,
            @RequestPart(name = "file", required = false) MultipartFile file
    ) {
        try {
            // Mevcut kaydı çek (eski image’i öğrenmek için)
            BlogDto current = blogService.objectServiceFindById(id);
            String oldUrl = current != null ? current.getImage() : null;

            if (file != null && !file.isEmpty()) {
                String relative = imageService.saveBlogImage(file);
                dto.setImage(relative);
            }

            BlogDto updated = blogService.objectServiceUpdate(id, dto);

            // Eğer yeni resim yüklendiyse ve eski /upload/... ise ve farklıysa eskiyi sil
            if (file != null && !file.isEmpty() && oldUrl != null
                    && oldUrl.startsWith("/upload/") && !oldUrl.equals(updated.getImage())) {
                try { imageService.deleteByUrl(oldUrl); } catch (Exception ignored) { /* loglanabilir */ }
            }

            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update[multipart]/"+id));
        }
    }

    // -------------------- DELETE --------------------

    @DeleteMapping("/delete/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable Long id) {
        try {
            BlogDto deleted = blogService.objectServiceDelete(id);
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/delete/"+id));
        }
    }

    // -------------------- EXTRAS --------------------

    @PostMapping("/speed-data/{count}")
    @Override
    public ResponseEntity<String> blogApiSpeedData(@PathVariable("count") Long count) {
        return ResponseEntity.ok(blogService.blogSpeedData(count == null ? 0 : count));
    }

    @DeleteMapping("/all-delete")
    @Override
    public ResponseEntity<String> blogApiAllDelete() {
        return ResponseEntity.ok(blogService.blogAllDelete());
    }


}
