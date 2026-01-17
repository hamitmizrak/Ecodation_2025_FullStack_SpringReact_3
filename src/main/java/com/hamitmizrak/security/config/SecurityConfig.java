package com.hamitmizrak.security.config;

import com.hamitmizrak.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService uds, PasswordEncoder pe) {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(pe);
        return p;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationFilter jwtFilter,
                                           DaoAuthenticationProvider daoProvider) throws Exception {

        http.authenticationProvider(daoProvider);

        // H2 console matcher
        AntPathRequestMatcher H2 = new AntPathRequestMatcher("/h2-console/**");

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        // H2 console CSRF ignore
                        .ignoringRequestMatchers(H2)
                        .disable()
                )
                // H2 console iframe için
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(reg -> reg
                        // Serbest erişim (ROOT + H2 + Swagger)
                        .requestMatchers(
                                new AntPathRequestMatcher("/**"),
                                H2,
                                new AntPathRequestMatcher("/swagger-ui/**"),
                                new AntPathRequestMatcher("/swagger-ui.html"),
                                new AntPathRequestMatcher("/v3/api-docs/**")
                        ).permitAll()
                        // Diğer serbest uçlarınız varsa buraya ekleyin (ör. /auth/**, /register/**)
                        .requestMatchers(
                                new AntPathRequestMatcher("/auth/**"),
                                new AntPathRequestMatcher("/register/**")
                        ).permitAll()
                        .requestMatchers("/", "/favicon.ico", "/error", "/actuator/**").permitAll()

                        // ABOUT uçları: (istersen GET'i de role bağlayabilirsin)
                        .requestMatchers(HttpMethod.GET, "/about/api/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/about/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/about/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/about/api/**").hasRole("ADMIN")
                        // Geri kalan her şey auth ister
                        .anyRequest().authenticated()
                );

        // JWT filtresini UsernamePasswordAuthenticationFilter'dan önce ekle
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder(); // default: bcrypt
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
