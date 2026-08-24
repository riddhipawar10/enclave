package com.enclave.organization.dto;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Request payload to add an existing user to an existing organization
 * with a specific role. Does not create a new User.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddMemberRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Role ID is required")
    private UUID roleId;
}