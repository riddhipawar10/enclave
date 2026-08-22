package com.enclave.organization.service;

import com.enclave.organization.dto.AddMemberRequest;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.dto.OrganizationRequest;
import com.enclave.organization.dto.OrganizationResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for Organization Management.
 * Controllers depend on this interface, never on entities directly.
 * No implementation logic here — see OrganizationServiceImpl.
 */
public interface OrganizationService {

    OrganizationResponse createOrganization(OrganizationRequest request);

    OrganizationResponse getOrganization(UUID organizationId);

    OrganizationResponse updateOrganization(UUID organizationId, OrganizationRequest request);

    void deactivateOrganization(UUID organizationId);

    List<OrganizationMemberResponse> listOrganizationMembers(UUID organizationId);

    OrganizationMemberResponse addMember(UUID organizationId, AddMemberRequest request);

    void removeMember(UUID organizationId, UUID userId);

    OrganizationMemberResponse updateMemberRole(UUID organizationId, UUID userId, UUID newRoleId);
}