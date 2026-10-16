
package com.enclave.invitation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InvitationResponse {

    private UUID id;
    private UUID organizationId;
    private String email;
    private UUID roleId;
    private String status;
    private UUID invitedBy;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
