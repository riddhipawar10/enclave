package com.enclave.organization.controller;

import com.enclave.organization.dto.AddMemberRequest;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.dto.OrganizationRequest;
import com.enclave.organization.dto.OrganizationResponse;
import com.enclave.organization.service.OrganizationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Organization Management.
 * Delegates all business logic to OrganizationService.
 * Authentication/authorization is handled by the Spring Security/RBAC layer,
 * not implemented here.
 */
@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody OrganizationRequest request
    ) {
        OrganizationResponse response = organizationService.createOrganization(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @PathVariable UUID organizationId
    ) {
        OrganizationResponse response = organizationService.getOrganization(organizationId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{organizationId}")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable UUID organizationId,
            @Valid @RequestBody OrganizationRequest request
    ) {
        OrganizationResponse response = organizationService.updateOrganization(organizationId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{organizationId}")
    public ResponseEntity<Void> deactivateOrganization(
            @PathVariable UUID organizationId
    ) {
        organizationService.deactivateOrganization(organizationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{organizationId}/members")
    public ResponseEntity<List<OrganizationMemberResponse>> listOrganizationMembers(
            @PathVariable UUID organizationId
    ) {
        List<OrganizationMemberResponse> members = organizationService.listOrganizationMembers(organizationId);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{organizationId}/members")
    public ResponseEntity<OrganizationMemberResponse> addMember(
            @PathVariable UUID organizationId,
            @Valid @RequestBody AddMemberRequest request
    ) {
        OrganizationMemberResponse response = organizationService.addMember(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{organizationId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId
    ) {
        organizationService.removeMember(organizationId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{organizationId}/members/{userId}/role")
    public ResponseEntity<OrganizationMemberResponse> updateMemberRole(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request
    ) {
        OrganizationMemberResponse response = organizationService.updateMemberRole(
                organizationId, userId, request.getRoleId()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Minimal inline request body for the role-update endpoint, kept local to
     * this controller since it is a single-field wrapper and not a shared DTO.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class UpdateMemberRoleRequest {

        @NotNull(message = "Role ID is required")
        private UUID roleId;
    }
}