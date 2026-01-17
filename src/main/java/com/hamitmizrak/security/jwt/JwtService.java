package com.hamitmizrak.security.jwt;

import com.hamitmizrak.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class JwtService {

    private final JwtTokenProvider tokenProvider;

    public String createAccessToken(UserPrincipal up) {
        // UserPrincipal zaten Collection<? extends GrantedAuthority> döndürür
        return tokenProvider.generateToken(up.getUsername(), up.getAuthorities());
    }

    public String createAccessToken(String username, List<String> roles) {
        // 🔧 Kritik satır: elemanı GrantedAuthority olarak üret
        List<GrantedAuthority> authorities = (roles == null ? List.<String>of() : roles).stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority(r))
                .collect(Collectors.toList());

        return tokenProvider.generateToken(username, authorities);
    }

    public boolean validate(String token) {
        return tokenProvider.validateToken(token);
    }

    public String getUsername(String token) {
        return tokenProvider.getUsername(token);
    }

    public List<String> getRoles(String token) {
        return tokenProvider.getRoles(token);
    }

    public String stripBearer(String authorizationHeader) {
        if (authorizationHeader == null) return null;
        String prefix = "Bearer ";
        return authorizationHeader.regionMatches(true, 0, prefix, 0, prefix.length())
                ? authorizationHeader.substring(prefix.length()).trim()
                : null;
    }
}
