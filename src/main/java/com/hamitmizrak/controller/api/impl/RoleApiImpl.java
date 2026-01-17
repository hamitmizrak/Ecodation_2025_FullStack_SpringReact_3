package com.hamitmizrak.controller.api.impl;

import com.hamitmizrak.business.dto.RoleDto;
import com.hamitmizrak.business.services.interfaces.IRoleService;
import com.hamitmizrak.controller.api.interfaces.IRoleApi;
import com.hamitmizrak.error.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role/api/v1.0.0")
@CrossOrigin
@RequiredArgsConstructor
@Log4j2
// @CrossOrigin //CORS: Hatası
//@CrossOrigin(origins = ProjectUrl.REACT_FRONTEND_PORT_URL)
//@CrossOrigin(origins = "localhost:3000")
public class RoleApiImpl implements IRoleApi<RoleDto> {

    // Injection
    private final IRoleService iRoleService;

    // Sadece ADMIN yeni rol oluşturabilsin
    // http://localhost:4444/role/api/v1.0.0/create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody RoleDto roleDtoData) {
        try {
            RoleDto created = (RoleDto) iRoleService.objectServiceCreate(roleDtoData);
            if (created == null) {
                return ResponseEntity.ok(ApiResult.notFound("Role eklenemedi", "/role/api/v1.0.0/create"));
            }
            return ResponseEntity.ok(ApiResult.success(created));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/role/api/v1.0.0/create"));
        }
    }

    // Listeyi herkes görebilir
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<RoleDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iRoleService.objectServiceList()));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/role/api/v1.0.0/list"));
        }
    }

    // Detay için ADMIN veya MODERATOR
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    @GetMapping({"/find", "/find/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id", required = false) Long id) {
        try {
            RoleDto found = (RoleDto) iRoleService.objectServiceFindById(id);
            if (found == null) return ResponseEntity.ok(ApiResult.notFound("Role bulunamadı", "/role/api/v1.0.0/find"));
            return ResponseEntity.ok(ApiResult.success(found));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/role/api/v1.0.0/find"));
        }
    }

    // Güncelle sadece ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/update", "/update/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name="id", required = false) Long id,
                                                        @Valid @RequestBody RoleDto roleDto) {
        try {
            RoleDto updated = (RoleDto) iRoleService.objectServiceUpdate(id, roleDto);
            if (updated == null) return ResponseEntity.ok(ApiResult.notFound("Role güncellenemedi", "/role/api/v1.0.0/update"));
            return ResponseEntity.ok(ApiResult.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/role/api/v1.0.0/update"));
        }
    }

    // Sil sadece ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping({"/delete", "/delete/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name="id", required = false) Long id) {
        try {
            RoleDto deleted = (RoleDto) iRoleService.objectServiceDelete(id);
            return ResponseEntity.ok(ApiResult.success(deleted));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/role/api/v1.0.0/delete"));
        }
    }
}
