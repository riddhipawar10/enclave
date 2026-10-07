package com.enclave.organization.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMemberResponse {

    private UUID id;

    private UUID organizationId;

    private UUID userId;

    private String firstName;

    private String lastName;

    private String email;

    private UUID roleId;

    private String roleName;

    private LocalDateTime joinedAt;

    @JsonProperty("isActive")
    private boolean isActive;
}