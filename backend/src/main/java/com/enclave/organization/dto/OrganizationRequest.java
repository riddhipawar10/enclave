package com.enclave.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for creating or updating an Organization.
 * Does not include server-generated fields (id, createdAt, updatedAt).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 150, message = "Organization name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Organization slug is required")
    @Size(max = 150, message = "Organization slug must not exceed 150 characters")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens (e.g. 'my-org')"
    )
    private String slug;

    private Boolean isActive;
}