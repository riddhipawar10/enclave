
package com.enclave.invitation.controller;

import com.enclave.auth.dto.AuthResponse;
import com.enclave.invitation.dto.AcceptInvitationRequest;
import com.enclave.invitation.dto.InvitationResponse;
import com.enclave.invitation.service.InvitationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
public class PublicInvitationController {

    private final InvitationService invitationService;

    public PublicInvitationController(
            InvitationService invitationService
    ) {
        this.invitationService = invitationService;
    }

    @GetMapping("/verify")
    public ResponseEntity<InvitationResponse> verifyInvitation(
            @RequestParam String token
    ) {
        return ResponseEntity.ok(
                invitationService.verifyInvitation(token)
        );
    }

    @PostMapping("/accept")
    public ResponseEntity<AuthResponse> acceptInvitation(
            @RequestParam String token,
            @Valid @RequestBody AcceptInvitationRequest request
    ) {
        AuthResponse response =
                invitationService.acceptInvitation(token, request);

        return ResponseEntity.ok(response);
    }
}
