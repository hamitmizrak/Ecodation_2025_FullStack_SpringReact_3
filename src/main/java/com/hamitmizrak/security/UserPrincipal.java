package com.hamitmizrak.security;

import com.hamitmizrak.data.embeddable.EmbeddableUserDetails;
import com.hamitmizrak.data.entity.RegisterEntity;
import com.hamitmizrak.data.entity.RoleEntity;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Spring Security'nin Authentication içinde taşıdığı kullanıcı nesnesi.
 * - Roller SimpleGrantedAuthority'ye çevrilir (ROLE_ prefix'i yoksa eklenir).
 * - Hesap durum bayrakları RegisterEntity.embeddableUserDetails içinden okunur.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;

    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final boolean enabled;

    private final Collection<? extends GrantedAuthority> authorities;

    private UserPrincipal(Long id,
                          String email,
                          String password,
                          boolean accountNonExpired,
                          boolean accountNonLocked,
                          boolean credentialsNonExpired,
                          boolean enabled,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    /**
     * RegisterEntity --> UserPrincipal dönüştürücüsü.
     * CustomUserDetailsService.loadUserByUsername() içinde çağrılır.
     */
    public static UserPrincipal from(RegisterEntity user) {
        Objects.requireNonNull(user, "user is null");

        // Embeddable bayraklar (isimler boolean/Boolean tipine göre Lombok getter'larıyla gelir)
        EmbeddableUserDetails details = user.getEmbeddableUserDetails();
        boolean accNonExpired = details != null && Boolean.TRUE.equals(details.getIsAccountNonExpired());
        boolean accNonLocked = details != null && Boolean.FALSE.equals(details.getIsAccountNonLocked()) ? false
                : details != null ? Boolean.TRUE.equals(details.getIsAccountNonLocked()) : true;
        boolean credNonExpired = details != null && Boolean.TRUE.equals(details.getIsCredentialsNonExpired());
        boolean isEnabled     = details != null && Boolean.TRUE.equals(details.getIsEnable());

        // Roller -> GrantedAuthority
        Set<RoleEntity> roles = user.getRoles();
        Collection<SimpleGrantedAuthority> auths = roles == null ? Set.<SimpleGrantedAuthority>of() :
                roles.stream()
                        .map(RoleEntity::getRoleName)                 // örn: "ADMIN" veya "ROLE_ADMIN"
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(rn -> rn.startsWith("ROLE_") ? rn : "ROLE_" + rn)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet());

        return new UserPrincipal(
                user.getRegisterId(),
                user.getRegisterEmail(),
                user.getRegisterPassword(),
                accNonExpired,
                accNonLocked,
                credNonExpired,
                isEnabled,
                auths
        );
    }

    // ----- UserDetails zorunlu metotlar -----

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /** Spring, username olarak e-posta kullanacak */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    /** Hesap süresi dolmamış mı? */
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    /** Hesap kilitli değil mi? */
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    /** Kimlik bilgisi (şifre) süresi dolmamış mı? */
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    /** Kullanıcı etkin mi? (e-posta onayı vb.) */
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
