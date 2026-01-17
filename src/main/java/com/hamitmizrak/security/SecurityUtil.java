package com.hamitmizrak.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {}

    public static UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        return null;
    }

    public static Long getCurrentUserId() {
        UserPrincipal up = getCurrentUser();
        return (up != null) ? up.getId() : null;
    }

    public static String getCurrentUserEmail() {
        UserPrincipal up = getCurrentUser();
        return (up != null) ? up.getUsername() : null;
    }
}
