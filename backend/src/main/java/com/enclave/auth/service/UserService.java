package com.enclave.auth.service;

import com.enclave.auth.dto.UpdateProfileRequest;
import com.enclave.auth.dto.UserResponse;
import com.enclave.auth.entity.User;
import com.enclave.auth.repository.UserRepository;
import com.enclave.auth.dto.ChangePasswordRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(
	        UserRepository userRepository,
	        PasswordEncoder passwordEncoder
	) {
	    this.userRepository = userRepository;
	    this.passwordEncoder = passwordEncoder;
	}

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(User user) {

        return toResponse(user);
    }

    @Transactional
    public UserResponse updateCurrentUser(
            User currentUser,
            UpdateProfileRequest request
    ) {

        String normalizedEmail =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        /*
         * Check whether another account already
         * uses this email.
         */
        userRepository.findByEmail(normalizedEmail)
                .ifPresent(existingUser -> {

                    if (!existingUser.getId()
                            .equals(currentUser.getId())) {

                        throw new IllegalArgumentException(
                                "Email is already registered"
                        );
                    }
                });

        currentUser.setFirstName(
                request.getFirstName().trim()
        );

        currentUser.setLastName(
                request.getLastName().trim()
        );

        currentUser.setEmail(
                normalizedEmail
        );

        User savedUser =
                userRepository.save(currentUser);

        return toResponse(savedUser);
    }

    private UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
    
    
    @Transactional
    public void changePassword(
            User currentUser,
            ChangePasswordRequest request
    ) {

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                currentUser.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                currentUser.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "New password must be different from your current password"
            );
        }

        currentUser.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(currentUser);
    }
}

