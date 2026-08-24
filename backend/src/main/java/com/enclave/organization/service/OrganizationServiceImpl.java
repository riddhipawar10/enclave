package com.enclave.organization.service;

import com.enclave.organization.dto.AddMemberRequest;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.dto.OrganizationRequest;
import com.enclave.organization.dto.OrganizationResponse;
import com.enclave.organization.entity.Organization;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.exception.MemberNotFoundException;
import com.enclave.organization.exception.OrganizationNotFoundException;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.organization.repository.OrganizationRepository;
import com.enclave.role.entity.Role;
import com.enclave.user.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of OrganizationService.
 *
 * NOTE: UserRepository and RoleRepository do not exist yet in this project.
 * User/Role existence is therefore enforced at the database level via
 * foreign key constraints (fk_org_members_user, fk_org_members_role),
 * not pre-checked in this service. Once those repositories exist, add
 * existsById() checks where marked with TODO for cleaner error handling.
 */
@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public OrganizationServiceImpl(
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    @Override
    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request) {
        if (organizationRepository.existsBySlug(request.getSlug())) {
            throw new IllegalStateException("Organization slug already in use: " + request.getSlug());
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Organization saved = organizationRepository.save(organization);
        return toOrganizationResponse(saved);
    }

    @Override
    public OrganizationResponse getOrganization(UUID organizationId) {
        Organization organization = findOrganizationOrThrow(organizationId);
        return toOrganizationResponse(organization);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(UUID organizationId, OrganizationRequest request) {
        Organization organization = findOrganizationOrThrow(organizationId);

        if (!organization.getSlug().equals(request.getSlug())
                && organizationRepository.existsBySlug(request.getSlug())) {
            throw new IllegalStateException("Organization slug already in use: " + request.getSlug());
        }

        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        if (request.getIsActive() != null) {
            organization.setActive(request.getIsActive());
        }

        Organization saved = organizationRepository.save(organization);
        return toOrganizationResponse(saved);
    }

    @Override
    @Transactional
    public void deactivateOrganization(UUID organizationId) {
        Organization organization = findOrganizationOrThrow(organizationId);
        organization.setActive(false);
        organizationRepository.save(organization);
    }

    @Override
    public List<OrganizationMemberResponse> listOrganizationMembers(UUID organizationId) {
        findOrganizationOrThrow(organizationId);

        return organizationMemberRepository.findByOrganization_Id(organizationId)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrganizationMemberResponse addMember(UUID organizationId, AddMemberRequest request) {
        Organization organization = findOrganizationOrThrow(organizationId);

        if (organizationMemberRepository.existsByOrganization_IdAndUser_Id(organizationId, request.getUserId())) {
            throw new IllegalStateException("User is already a member of this organization");
        }

        // TODO: once UserRepository exists, replace with:
        // User user = userRepository.findById(request.getUserId())
        //         .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User userReference = User.builder().id(request.getUserId()).build();

        // TODO: once RoleRepository exists, replace with:
        // Role role = roleRepository.findById(request.getRoleId())
        //         .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        Role roleReference = Role.builder().id(request.getRoleId()).build();

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(userReference)
                .role(roleReference)
                .isActive(true)
                .build();

        OrganizationMember saved = organizationMemberRepository.save(member);
        return toMemberResponse(saved);
    }

    @Override
    @Transactional
    public void removeMember(UUID organizationId, UUID userId) {
        findOrganizationOrThrow(organizationId);

        organizationMemberRepository.findByOrganization_IdAndUser_Id(organizationId, userId)
                .orElseThrow(() -> new MemberNotFoundException(organizationId, userId));

        organizationMemberRepository.deleteByOrganization_IdAndUser_Id(organizationId, userId);
    }

    @Override
    @Transactional
    public OrganizationMemberResponse updateMemberRole(UUID organizationId, UUID userId, UUID newRoleId) {
        findOrganizationOrThrow(organizationId);

        OrganizationMember member = organizationMemberRepository
                .findByOrganization_IdAndUser_Id(organizationId, userId)
                .orElseThrow(() -> new MemberNotFoundException(organizationId, userId));

        // TODO: once RoleRepository exists, replace with:
        // Role role = roleRepository.findById(newRoleId)
        //         .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        Role roleReference = Role.builder().id(newRoleId).build();

        member.setRole(roleReference);
        OrganizationMember saved = organizationMemberRepository.save(member);
        return toMemberResponse(saved);
    }

    // ---------- Private helpers ----------

    private Organization findOrganizationOrThrow(UUID organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(organizationId));
    }

    private OrganizationResponse toOrganizationResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .isActive(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }

    private OrganizationMemberResponse toMemberResponse(OrganizationMember member) {
        return OrganizationMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .firstName(member.getUser().getFirstName())
                .lastName(member.getUser().getLastName())
                .email(member.getUser().getEmail())
                .roleId(member.getRole().getId())
                .roleName(member.getRole().getName())
                .joinedAt(member.getJoinedAt())
                .isActive(member.isActive())
                .build();
    }
}