package com.hamitmizrak.security.api;

import com.hamitmizrak.error.ApiResult;
import com.hamitmizrak.security.jwt.JwtTokenProvider;
import com.hamitmizrak.security.UserPrincipal;
import com.hamitmizrak.utily.FrontEnd;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/*
Status Code (Bilgi)
- Login: 200 OK (başarılı giriş), 401 (hatalı kimlik)
- Me:    200 OK (oturum bilgisi)
- Refresh: 200 OK (yeni token)
*/

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API (REST)
@RestController
@RequestMapping("/auth/api/v1.0.0")
@CrossOrigin(origins = {FrontEnd.REACT_URL, FrontEnd.ANGULAR_URL})
public class AuthApiImpl {

    // Injection
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // AUTH

    // LOGIN
    // POST: http://localhost:4444/auth/api/v1/login
    @PostMapping("/login")
    public ResponseEntity<ApiResult<AuthResponse>> login(@RequestBody LoginRequest request) {
        try {
            // Kimlik doğrulama
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(request.email(), request.password());
            Authentication authentication = authenticationManager.authenticate(authToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Principal ve roller
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            List<String> roles = principal.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // JWT üret
            String token = jwtTokenProvider.generateToken(principal);

            // PAYLOAD (Cevap)
            AuthResponse payload = new AuthResponse(
                    token,
                    "Bearer",
                    jwtTokenProvider.getExpireMs(),
                    principal.getUsername(),
                    principal.getId(),
                    roles
            );
            return ResponseEntity.ok(ApiResult.success(payload));

        } catch (BadCredentialsException e) {
            log.warn("Login başarısız: {}", e.getMessage());
            return ResponseEntity.ok(ApiResult.error(
                    "badCredentials",
                    "E-posta veya şifre hatalı.",
                    "/auth/api/v1/login"
            ));
        } catch (Exception e) {
            log.error("Login genel hata: {}", e.getMessage());
            return ResponseEntity.ok(ApiResult.error(
                    "serverError",
                    e.getMessage(),
                    "/auth/api/v1/login"
            ));
        }
    }

    // ME (oturum sahibi)
    // GET: http://localhost:4444/auth/api/v1/me
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<ApiResult<UserMe>> me() {
        // Sistemde kullanıcı var mı ?
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            return ResponseEntity.ok(ApiResult.unauthorized("Oturum bulunamadı.", "/auth/api/v1/me"));
        }

        List<String> roles = up.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        UserMe me = new UserMe(up.getId(), up.getUsername(), roles, up.isEnabled());
        return ResponseEntity.ok(ApiResult.success(me));
    }

    // REFRESH (Header: Authorization: Bearer <token>)
    // POST: http://localhost:4444/auth/api/v1/refresh
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResult<AuthResponse>> refresh(@RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // Header’dan token al
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring("Bearer ".length()).trim();
            }
            if (token == null || token.isBlank()) {
                return ResponseEntity.ok(ApiResult.error("badRequest", "Authorization header bulunamadı.", "/auth/api/v1/refresh"));
            }

            // Eski token’ı doğrula, subject’i çek
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.ok(ApiResult.unauthorized("Token geçersiz veya süresi dolmuş.", "/auth/api/v1/refresh"));
            }
            String username = jwtTokenProvider.getUsername(token);
            List<String> oldRoles = jwtTokenProvider.getRoles(token);

            // Yeni token üret (roller claim’i ile)
            // Not: Burada UserDetails yükleyebilir ya da oldRoles ile devam edebilirsin.
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String newToken;
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
                newToken = jwtTokenProvider.generateToken(up);
            } else {
                // principal yoksa, sadece username ve rollerden üret
                newToken = jwtTokenProvider.generateToken(
                        username,
                        oldRoles.stream().map(r -> (GrantedAuthority) () -> r).collect(Collectors.toList())
                );
            }

            AuthResponse payload = new AuthResponse(
                    newToken,
                    "Bearer",
                    jwtTokenProvider.getExpireMs(),
                    username,
                    null, // userId’yi auth’tan alamadıysak null geçiyoruz.
                    oldRoles
            );
            return ResponseEntity.ok(ApiResult.success(payload));

        } catch (Exception e) {
            log.error("Refresh genel hata: {}", e.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", e.getMessage(), "/auth/api/v1/refresh"));
        }
    }

    // ROLE-BASED ÖRNEK (ADMIN)
    // GET: http://localhost:4444/auth/api/v1/admin/ping
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/ping")
    public ResponseEntity<ApiResult<String>> adminPing() {
        return ResponseEntity.ok(ApiResult.success("ADMIN endpoint ok"));
    }

    // ROLE-BASED ÖRNEK (USER veya ADMIN)
    // GET: http://localhost:4444/auth/api/v1/user/ping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user/ping")
    public ResponseEntity<ApiResult<String>> userPing() {
        return ResponseEntity.ok(ApiResult.success("USER/ADMIN endpoint ok"));
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // DTO’lar (Controller içinde sade DTO/record; projende ayrı dosya olarak tutmak istersen taşıyabilirsin)
    public static record LoginRequest(
            @Email(message = "Geçerli bir e-posta girin")
            @NotBlank(message = "E-posta zorunludur")
            String email,

            @NotBlank(message = "Şifre zorunludur")
            String password
    ) {}

    public static record AuthResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            String username,
            Long userId,
            List<String> roles
    ) {}

    public static record UserMe(
            Long userId,
            String username,
            List<String> roles,
            boolean enabled
    ) {}
}
