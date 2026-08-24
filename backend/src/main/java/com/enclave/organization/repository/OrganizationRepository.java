package com.enclave.organization.repository;

import com.enclave.organization.entity.Organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for the Organization entity, mapped to the existing
 * "organizations" table.
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Organization> findByIsActiveTrue();
}