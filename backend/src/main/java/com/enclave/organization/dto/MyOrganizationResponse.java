package com.enclave.organization.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response payload representing an organization that the authenticated user
 * belongs to, including the user's role in that organization.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyOrganizationResponse {

    private UUID id;

    private String name;

    private String slug;

    @JsonProperty("isActive")
    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private UUID roleId;

    private String roleName;
}