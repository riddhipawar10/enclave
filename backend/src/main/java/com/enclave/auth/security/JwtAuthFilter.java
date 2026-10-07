package com.enclave.auth.security;

import com.enclave.auth.entity.User;
import com.enclave.auth.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(
            JwtUtil jwtUtil,
            UserRepository userRepository
    ) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        /*
         * No Authorization header.
         * Let Spring Security handle the request later.
         */
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        /*
         * Empty token.
         */
        if (token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Invalid or expired JWT.
         */
        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Don't replace an authentication that has already
         * been established.
         */
        if (SecurityContextHolder
                .getContext()
                .getAuthentication() != null) {

            filterChain.doFilter(request, response);
            return;
        }

        try {
            UUID userId = jwtUtil.extractUserId(token);

            Optional<User> userOptional =
                    userRepository.findById(userId);

            if (userOptional.isPresent()) {

                User user = userOptional.get();

                /*
                 * Only active users can authenticate.
                 */
                if (user.isActive()) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    Collections.emptyList()
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception ignored) {
            /*
             * If the token cannot be converted to a user,
             * continue without authentication.
             *
             * Spring Security will then reject protected
             * endpoints with 401/403 as appropriate.
             */
        }

        filterChain.doFilter(request, response);
    }
}