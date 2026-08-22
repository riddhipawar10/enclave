package com.enclave.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response payload representing an Organization returned to the frontend.
 * Contains only fields present on the "organizations" table.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponse {

    private UUID id;

    private String name;

    private String slug;

    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}