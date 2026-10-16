
package com.enclave.invitation.controller;

import com.enclave.invitation.dto.CreateInvitationRequest;
import com.enclave.invitation.dto.CreateInvitationResponse;
import com.enclave.invitation.dto.InvitationResponse;
import com.enclave.invitation.service.InvitationService;
import com.enclave.rbac.security.RequirePermission;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping
    @RequirePermission("VIEW_MEMBERS")
    public ResponseEntity<List<InvitationResponse>> getOrganizationInvitations(
            @PathVariable UUID organizationId
    ) {
        return ResponseEntity.ok(
                invitationService.getOrganizationInvitations(organizationId)
        );
    }

    @GetMapping("/pending")
    @RequirePermission("VIEW_MEMBERS")
    public ResponseEntity<List<InvitationResponse>> getPendingInvitations(
            @PathVariable UUID organizationId
    ) {
        return ResponseEntity.ok(
                invitationService.getPendingInvitations(organizationId)
        );
    }

    @PostMapping
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<CreateInvitationResponse> createInvitation(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateInvitationRequest request
    ) {
        return ResponseEntity.ok(
                invitationService.createInvitation(organizationId, request)
        );
    }

    @GetMapping("/verify")
    public ResponseEntity<InvitationResponse> verifyInvitation(
            @RequestParam String token
    ) {
        return ResponseEntity.ok(
                invitationService.verifyInvitation(token)
        );
    }

    /**
     * Returns the real token for a pending invitation.
     * Access is restricted to users with MANAGE_MEMBERS permission.
     */
    @GetMapping("/{invitationId}/link")
    @RequirePermission("MANAGE_MEMBERS")
    public ResponseEntity<String> getInvitationLink(
            @PathVariable UUID organizationId,
            @PathVariable UUID invitationId
    ) {
        return ResponseEntity.ok(
                invitationService.getInvitationLink(
                        organizationId,
                        invitationId
                )
        );
    }
}
