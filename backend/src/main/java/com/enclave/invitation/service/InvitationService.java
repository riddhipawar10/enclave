
package com.enclave.invitation.service;

import com.enclave.auth.dto.AuthResponse;
import com.enclave.invitation.dto.AcceptInvitationRequest;
import com.enclave.invitation.dto.CreateInvitationRequest;
import com.enclave.invitation.dto.CreateInvitationResponse;
import com.enclave.invitation.dto.InvitationResponse;

import java.util.List;
import java.util.UUID;

public interface InvitationService {

    List<InvitationResponse> getOrganizationInvitations(
            UUID organizationId
    );

    List<InvitationResponse> getPendingInvitations(
            UUID organizationId
    );

    CreateInvitationResponse createInvitation(
            UUID organizationId,
            CreateInvitationRequest request
    );

    InvitationResponse verifyInvitation(String token);

    AuthResponse acceptInvitation(
            String token,
            AcceptInvitationRequest request
    );

    /**
     * Returns an invitation link for an invitation
     * after checking the caller's organization access.
     */
    String getInvitationLink(
            UUID organizationId,
            UUID invitationId
    );
}
