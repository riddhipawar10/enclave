package com.enclave.invitation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateInvitationResponse {

    private UUID id;
    private UUID organizationId;
    private String email;
    private UUID roleId;
    private String status;
    private LocalDateTime expiresAt;
    private String invitationToken;
}