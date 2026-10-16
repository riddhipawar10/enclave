
package com.enclave.auth.service;

import com.enclave.auth.dto.AuthResponse;
import com.enclave.auth.dto.LoginRequest;
import com.enclave.auth.dto.RegisterRequest;
import com.enclave.auth.dto.UserResponse;
import com.enclave.auth.entity.RefreshToken;
import com.enclave.auth.entity.User;
import com.enclave.auth.repository.RefreshTokenRepository;
import com.enclave.auth.repository.UserRepository;
import com.enclave.auth.security.JwtUtil;
import com.enclave.organization.entity.Organization;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.role.entity.Role;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private static final long REFRESH_TOKEN_VALID_DAYS = 7;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            OrganizationMemberRepository organizationMemberRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail =
                request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (isEmailTaken(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .passwordHash(
                        passwordEncoder.encode(request.getPassword())
                )
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    /**
     * Registers a user from a verified organization invitation.
     * The invitation service supplies the invitation's email,
     * organization, and assigned role.
     */
    @Transactional
    public AuthResponse registerInvitedUser(
            String firstName,
            String lastName,
            String email,
            String password,
            Organization organization,
            Role role
    ) {
        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email is already registered. Please log in instead."
            );
        }

        User user = User.builder()
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .isActive(true)
                .build();

        user = userRepository.save(user);

        OrganizationMember membership = new OrganizationMember();
        membership.setOrganization(organization);
        membership.setUser(user);
        membership.setRole(role);
        membership.setActive(true);

        organizationMemberRepository.save(membership);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail =
                request.getEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        if (!user.isActive()) {
            throw new IllegalStateException(
                    "This account has been deactivated"
            );
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Refresh token is required"
            );
        }

        String tokenHash = hash(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid refresh token"
                        ));

        if (storedToken.getRevokedAt() != null) {
            throw new IllegalStateException(
                    "Refresh token has been revoked, please log in again"
            );
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "Refresh token has expired, please log in again"
            );
        }

        User user = storedToken.getUser();

        if (!user.isActive()) {
            throw new IllegalStateException(
                    "This account has been deactivated"
            );
        }

        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        String tokenHash = hash(rawRefreshToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(storedToken -> {
                    if (storedToken.getRevokedAt() == null) {
                        storedToken.setRevokedAt(LocalDateTime.now());
                        refreshTokenRepository.save(storedToken);
                    }
                });
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(
                email.trim().toLowerCase(Locale.ROOT)
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail()
        );

        String rawRefreshToken = generateRawRefreshToken();

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawRefreshToken))
                .expiresAt(
                        LocalDateTime.now()
                                .plusDays(REFRESH_TOKEN_VALID_DAYS)
                )
                .build();

        refreshTokenRepository.save(refreshTokenEntity);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();

        List<String> roles = organizationMemberRepository
                .findActiveMembershipsByUserId(user.getId())
                .stream()
                .map(OrganizationMember::getRole)
                .filter(role -> role != null)
                .map(Role::getName)
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .toList();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .roles(roles)
                .build();
    }

    private String generateRawRefreshToken() {
        return UUID.randomUUID().toString()
                + UUID.randomUUID().toString();
    }

    private String hash(String value) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashBytes = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getEncoder().encodeToString(hashBytes);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}
