package com.hamitmizrak.security.dto;

import java.util.Date;
import java.util.Set;

public record JwtResponse(
        String type,
        String accessToken,
        Date   expiresAt,
        Long   userId,
        String email,
        Set<String> roles
) {}
