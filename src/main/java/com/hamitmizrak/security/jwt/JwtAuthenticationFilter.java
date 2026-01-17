package com.hamitmizrak.security.jwt;

import com.hamitmizrak.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Her request’te 1 kez çalışan JWT filtresi.
 * - Authorization: Bearer <token> başlığını okur.
 * - Token geçerliyse kullanıcıyı SecurityContext’e yerleştirir.
 * - Beyaz listedeki endpoint’leri (login, refresh, swagger, actuator vs.) atlar.
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    private static final String BEARER_PREFIX = "Bearer ";
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    // Bu yollar authentication gerektirmez (gerekirse genişlet)
    private static final Set<String> WHITELIST = Set.of(
            "/auth/api/v1/login",
            "/auth/api/v1/refresh",
            "/register/api/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/**",
            "/error"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        final String path = request.getServletPath();
        // OPTIONS preflight isteklerini atla
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // Beyaz listedekileri atla
        for (String pattern : WHITELIST) {
            if (PATH_MATCHER.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Context'te zaten auth varsa tekrar kurma
            Authentication existing = SecurityContextHolder.getContext().getAuthentication();
            if (existing == null) {
                String header = request.getHeader(HttpHeaders.AUTHORIZATION);
                String token = resolveToken(header);

                if (token != null && jwtTokenProvider.validateToken(token)) {
                    // Token'dan username ve roller
                    String username = jwtTokenProvider.getUsername(token);
                    List<String> roles = jwtTokenProvider.getRoles(token);

                    // Tercih 1) DB'den güncel kullanıcıyı çek (account locked/disabled kontrolü dahil)
                    var userDetails = userDetailsService.loadUserByUsername(username);

                    // Tercih 2) Sadece token claim’lerinden Authentication kur (DB'ye gitmeden)
                    // List<SimpleGrantedAuthority> authorities = roles.stream()
                    //        .map(SimpleGrantedAuthority::new).collect(Collectors.toList());
                    // var userDetails = new org.springframework.security.core.userdetails.User(username, "", authorities);

                    // UserPrincipal ise id gibi ek bilgilerden yararlanıyoruz
                    List<SimpleGrantedAuthority> authorities = userDetails.getAuthorities()
                            .stream().map(a -> new SimpleGrantedAuthority(a.getAuthority()))
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    if (userDetails instanceof UserPrincipal up) {
                        log.debug("JWT doğrulandı -> userId={}, username={}, roles={}", up.getId(), up.getUsername(), roles);
                    } else {
                        log.debug("JWT doğrulandı -> username={}, roles={}", username, roles);
                    }
                }
            }
        } catch (Exception ex) {
            // Token hatalarında 401 dönmek yerine zincire devam etmeyi seçiyoruz;
            // Controller/EntryPoint 401/403 yönetir. Loglamak yeterli.
            log.warn("JWT filtre hatası: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /** "Authorization: Bearer x.y.z" başlığından token'ı ayıklar. */
    private String resolveToken(String authorizationHeader) {
        if (authorizationHeader == null) return null;
        String header = authorizationHeader.trim();
        if (!header.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) return null;
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
