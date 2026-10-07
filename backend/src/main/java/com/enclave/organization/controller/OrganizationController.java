package com.enclave.organization.controller;

import com.enclave.organization.dto.AddMemberRequest;
import com.enclave.organization.dto.MyOrganizationResponse;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.dto.OrganizationRequest;
import com.enclave.organization.dto.OrganizationResponse;
import com.enclave.organization.service.OrganizationService;
import com.enclave.rbac.dto.RoleResponse;
import com.enclave.rbac.security.RequirePermission;
import com.enclave.organization.dto.MemberCandidateResponse;

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
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(
            OrganizationService organizationService
    ) {
        this.organizationService = organizationService;
    }

    // =====================================================
    // MY ORGANIZATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<MyOrganizationResponse>> getMyOrganizations() {

        List<MyOrganizationResponse> organizations =
                organizationService.getMyOrganizations();

        return ResponseEntity.ok(organizations);
    }

    // =====================================================
    // ORGANIZATION
    // =====================================================

    @PostMapping
    @RequirePermission("CREATE_ORGANIZATION")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody OrganizationRequest request
    ) {

        OrganizationResponse response =
                organizationService.createOrganization(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{organizationId}")
    @RequirePermission("VIEW_ORGANIZATION")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @PathVariable("organizationId") UUID organizationId
    ) {

        OrganizationResponse response =
                organizationService.getOrganization(
                        organizationId
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{organizationId}")
    @RequirePermission("UPDATE_ORGANIZATION")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable("organizationId") UUID organizationId,
            @Valid @RequestBody OrganizationRequest request
    ) {

        OrganizationResponse response =
                organizationService.updateOrganization(
                        organizationId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{organizationId}")
    @RequirePermission("DELETE_ORGANIZATION")
    public ResponseEntity<Void> deactivateOrganization(
            @PathVariable("organizationId") UUID organizationId
    ) {

        organizationService.deactivateOrganization(
                organizationId
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // MY TEAM - LIST MEMBERS
    // =====================================================

    @GetMapping("/{organizationId}/members")
    @RequirePermission("VIEW_MEMBERS")
    public ResponseEntity<List<OrganizationMemberResponse>>
    listOrganizationMembers(
            @PathVariable("organizationId") UUID organizationId
    ) {

        List<OrganizationMemberResponse> members =
                organizationService.listOrganizationMembers(
                        organizationId
                );

        return ResponseEntity.ok(members);
    }
    
    @GetMapping("/{organizationId}/member-candidates")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<MemberCandidateResponse> findMemberCandidate(
            @PathVariable("organizationId") UUID organizationId,
            @RequestParam("email") String email
    ) {
        return ResponseEntity.ok(
                organizationService.findMemberCandidate(
                        organizationId,
                        email
                )
        );
    }

    // =====================================================
    // MY TEAM - ASSIGNABLE ROLES
    // =====================================================

    @GetMapping("/{organizationId}/assignable-roles")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<List<RoleResponse>> getAssignableRoles(
            @PathVariable("organizationId") UUID organizationId
    ) {

        List<RoleResponse> roles =
                organizationService.getAssignableRoles(
                        organizationId
                );

        return ResponseEntity.ok(roles);
    }

    // =====================================================
    // MY TEAM - ADD MEMBER
    // =====================================================

    @PostMapping("/{organizationId}/members")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<OrganizationMemberResponse> addMember(
            @PathVariable("organizationId") UUID organizationId,
            @Valid @RequestBody AddMemberRequest request
    ) {

        OrganizationMemberResponse response =
                organizationService.addMember(
                        organizationId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =====================================================
    // MY TEAM - REMOVE MEMBER
    // =====================================================

    @DeleteMapping("/{organizationId}/members/{userId}")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<Void> removeMember(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("userId") UUID userId
    ) {

        organizationService.removeMember(
                organizationId,
                userId
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // MY TEAM - UPDATE MEMBER ROLE
    // =====================================================

    @PatchMapping("/{organizationId}/members/{userId}/role")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<OrganizationMemberResponse>
    updateMemberRole(
            @PathVariable("organizationId") UUID organizationId,
            @PathVariable("userId") UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request
    ) {

        OrganizationMemberResponse response =
                organizationService.updateMemberRole(
                        organizationId,
                        userId,
                        request.getRoleId()
                );

        return ResponseEntity.ok(response);
    }

    
    // =====================================================
    // REQUEST DTO
    // =====================================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class UpdateMemberRoleRequest {

        @NotNull(message = "Role ID is required")
        private UUID roleId;
    }
}