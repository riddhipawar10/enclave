package com.enclave.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response payload representing an Organization member returned to the frontend.
 * Exposes only fields required by the UI — never the password hash or full
 * User/Role entities.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMemberResponse {

    private UUID id;

    private UUID userId;

    private String firstName;

    private String lastName;

    private String email;

    private UUID roleId;

    private String roleName;

    private LocalDateTime joinedAt;

    private boolean isActive;
}