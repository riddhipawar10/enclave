package com.enclave.organization.repository;

import com.enclave.organization.entity.OrganizationMember;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository
        extends JpaRepository<OrganizationMember, UUID> {

    List<OrganizationMember> findByOrganization_Id(
            UUID organizationId
    );

    boolean existsByOrganization_IdAndUser_Id(
            UUID organizationId,
            UUID userId
    );

    Optional<OrganizationMember> findByOrganization_IdAndUser_Id(
            UUID organizationId,
            UUID userId
    );

    void deleteByOrganization_IdAndUser_Id(
            UUID organizationId,
            UUID userId
    );

    @Query("""
        SELECT om
        FROM OrganizationMember om
        WHERE om.user.id = :userId
          AND om.isActive = true
    """)
    List<OrganizationMember> findActiveMembershipsByUserId(
            @Param("userId") UUID userId
    );
}