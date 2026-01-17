package com.hamitmizrak.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm; // (0.11.x için)
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;

import lombok.extern.log4j.Log4j2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

// HEADER
// PAYLOAD
// SIGNATURE

/**
 * JWT üretimi, doğrulaması ve çözümlemesi.
 * app.jwt.secret ve app.jwt.expire (Duration: 1h, 15m, 3600s, 3600000ms) property’lerinden beslenir.
 *
 * Not:
 *  - JJWT 0.11.x kullanıyorsanız bu sürüm doğrudan çalışır.
 *  - JJWT 0.12.x’e geçerseniz:
 *      signWith(key, Jwts.SIG.HS256)  ve
 *      Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
 *    yapısına güncelleyin. Aşağıda gerekli yerlerde yorum bırakıldı.
 */
@Log4j2
@Component
public class JwtTokenProvider {

    private static final String AUTH_HEADER     = "Authorization";
    private static final String BEARER_PREFIX   = "Bearer ";
    private static final String ROLES_CLAIM_KEY = "roles";

    private final JwtProps props;
    private final Key key;
    private final long expireMillis;

    private SecretKey secretKey; // 0.11.x’te Key de kullanılabilir
    private long expireMs;

    public JwtTokenProvider(JwtProps props) {
        this.props = props;
        byte[] secretBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(secretBytes);
        // props.expire() NULL olursa NPE alırsın -> app.jwt.expire mutlaka tanımlı olacak!
        this.expireMillis = props.expire().toMillis();
    }


    @PostConstruct
    void init() {
        // --- Secret kontrolü
        String secret = props.secret();
        if (secret == null || secret.trim().length() < 64) {
            throw new IllegalStateException("app.jwt.secret en az 64+ karakter olmalı (güvenlik için).");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        // --- Expire (Duration) -> ms
        Duration d = props.expire();
        if (d == null) {
            // property bağlanmamışsa güvenli varsayılan: 1 saat
            d = Duration.ofHours(1);
            log.warn("app.jwt.expire tanımlı değil. Varsayılan 1 saat kullanılacak.");
        }
        this.expireMs = d.toMillis();

        log.info("JWT init: expire={} ms, secret_len={}", this.expireMs, secret.length());
    }

    // --------------------------------------------------------------------------------------------
    // TOKEN ÜRETİMİ
    // --------------------------------------------------------------------------------------------

    /**
     * UserDetails’ten token üretir (subject = username, roles -> claim).
     */
    public String generateToken(UserDetails userDetails) {
        Collection<? extends GrantedAuthority> auths = userDetails.getAuthorities();
        return generateToken(userDetails.getUsername(), auths);
    }

    /**
     * Özelleştirilmiş subject ve roller ile token üretir.
     */
    public String generateToken(String subject, Collection<? extends GrantedAuthority> authorities) {
        Map<String, Object> claims = new HashMap<>();
        List<String> roles = (authorities == null) ? Collections.emptyList()
                : authorities.stream().map(GrantedAuthority::getAuthority).distinct().collect(Collectors.toList());
        claims.put(ROLES_CLAIM_KEY, roles);

        Date now = new Date();
        Date exp = new Date(now.getTime() + expireMs);

        // JJWT 0.11.x
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();

        /*
        // JJWT 0.12.x kullanıyorsanız:
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(exp)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
        */
    }

    // --------------------------------------------------------------------------------------------
    // TOKEN ÇÖZÜMLEME / OKUMA
    // --------------------------------------------------------------------------------------------

    /**
     * Token’dan kullanıcı adını (subject) okur.
     */
    public String getUsername(String token) {
        return getAllClaims(token).getSubject();
    }

    /**
     * Token’daki roller claim’ini okur.
     */
    public List<String> getRoles(String token) {
        Claims claims = getAllClaims(token);
        Object raw = claims.get(ROLES_CLAIM_KEY);
        if (raw instanceof List<?> list) {
            return list.stream().map(String::valueOf).collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    /**
     * Token geçerli mi?
     */
    public boolean validateToken(String token) {
        try {
            // parseClaimsJws hatasız dönerse imza ve süre valid demektir.
            getAllClaims(token);
            return true;
        } catch (SignatureException e) {
            log.warn("JWT imza hatası: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT biçim hatası: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT süresi dolmuş: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT desteklenmiyor: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT boş/illegal: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("JWT doğrulama genel hata: {}", e.getMessage());
        }
        return false;
    }

    /**
     * HTTP isteğinden Authorization: Bearer ... token’ı çeker.
     */
    public String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }
        return null;
    }

    // --------------------------------------------------------------------------------------------
    // İÇ YARDIMCI
    // --------------------------------------------------------------------------------------------

    private Claims getAllClaims(String token) {
        // JJWT 0.11.x
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        /*
        // JJWT 0.12.x:
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        */
    }

    // İsteğe bağlı: token kalan süre, sona erme zamanı vb. yardımcılar ekleyebilirsin.
    public Date getExpiration(String token) {
        return getAllClaims(token).getExpiration();
    }

    public long getExpireMs() {
        return expireMs;
    }

    public Key getSecretKey() {
        return secretKey;
    }
}
