
package com.enclave.invitation.repository;

import com.enclave.invitation.entity.Invitation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository
        extends JpaRepository<Invitation, UUID> {

    List<Invitation> findByOrganizationId(UUID organizationId);

    List<Invitation> findByOrganizationIdAndStatus(
            UUID organizationId,
            String status
    );

    Optional<Invitation> findByToken(String token);

    boolean existsByOrganizationIdAndEmailAndStatus(
            UUID organizationId,
            String email,
            String status
    );
}
