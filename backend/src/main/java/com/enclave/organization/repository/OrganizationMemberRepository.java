package com.enclave.organization.repository;

import com.enclave.organization.entity.OrganizationMember;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the OrganizationMember entity, mapped to the existing
 * "organization_members" table.
 */
@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {

    List<OrganizationMember> findByOrganization_Id(UUID organizationId);

    boolean existsByOrganization_IdAndUser_Id(UUID organizationId, UUID userId);

    Optional<OrganizationMember> findByOrganization_IdAndUser_Id(UUID organizationId, UUID userId);

    void deleteByOrganization_IdAndUser_Id(UUID organizationId, UUID userId);
}