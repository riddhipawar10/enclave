package com.enclave.auth.controller;

import com.enclave.auth.dto.UpdateProfileRequest;
import com.enclave.auth.dto.UserResponse;
import com.enclave.auth.entity.User;
import com.enclave.auth.service.UserService;
import com.enclave.auth.dto.ChangePasswordRequest;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication
    ) {

        User currentUser =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                userService.getCurrentUser(currentUser)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        User currentUser =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                userService.updateCurrentUser(
                        currentUser,
                        request
                )
        );
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        User currentUser =
                (User) authentication.getPrincipal();

        userService.changePassword(
                currentUser,
                request
        );

        return ResponseEntity.noContent().build();
    }
}