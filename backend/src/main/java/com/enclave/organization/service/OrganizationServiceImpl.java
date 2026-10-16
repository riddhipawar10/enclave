package com.enclave.organization.service;

import com.enclave.auth.entity.User;
import com.enclave.auth.repository.UserRepository;
import com.enclave.organization.dto.AddMemberRequest;
import com.enclave.organization.dto.MemberCandidateResponse;
import com.enclave.organization.dto.MyOrganizationResponse;
import com.enclave.organization.dto.OrganizationMemberResponse;
import com.enclave.organization.dto.OrganizationRequest;
import com.enclave.organization.dto.OrganizationResponse;
import com.enclave.organization.entity.Organization;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.exception.MemberAlreadyExistsException;
import com.enclave.organization.exception.MemberNotFoundException;
import com.enclave.organization.exception.OrganizationNotFoundException;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.organization.repository.OrganizationRepository;
import com.enclave.rbac.dto.RoleResponse;
import com.enclave.rbac.repository.RoleRepository;
import com.enclave.role.entity.Role;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public OrganizationServiceImpl(
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // =====================================================
    // ORGANIZATION
    // =====================================================

    @Override
    @Transactional
    public OrganizationResponse createOrganization(
            OrganizationRequest request
    ) {
        if (organizationRepository.existsBySlug(request.getSlug())) {
            throw new IllegalStateException(
                    "Organization slug already in use: " + request.getSlug()
            );
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .isActive(
                        request.getIsActive() != null
                                ? request.getIsActive()
                                : true
                )
                .build();

        Organization saved = organizationRepository.save(organization);

        User currentUser = getAuthenticatedUser();

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() ->
                        new IllegalStateException("ADMIN role not found")
                );

        OrganizationMember owner = OrganizationMember.builder()
                .organization(saved)
                .user(currentUser)
                .role(adminRole)
                .isActive(true)
                .build();

        organizationMemberRepository.save(owner);

        return toOrganizationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID organizationId) {
        Organization organization = findOrganizationOrThrow(organizationId);
        return toOrganizationResponse(organization);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(
            UUID organizationId,
            OrganizationRequest request
    ) {
        Organization organization = findOrganizationOrThrow(organizationId);

        if (!organization.getSlug().equals(request.getSlug())
                && organizationRepository.existsBySlug(request.getSlug())) {
            throw new IllegalStateException(
                    "Organization slug already in use: " + request.getSlug()
            );
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

    // =====================================================
    // MY TEAM
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationMemberResponse> listOrganizationMembers(
            UUID organizationId
    ) {
        findOrganizationOrThrow(organizationId);

        return organizationMemberRepository
                .findByOrganization_Id(organizationId)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // ASSIGNABLE ROLES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAssignableRoles(UUID organizationId) {
        findOrganizationOrThrow(organizationId);

        OrganizationMember currentMember =
                getCurrentOrganizationMember(organizationId);

        String currentRoleName = currentMember.getRole().getName();

        List<Role> assignableRoles;

        if ("ADMIN".equals(currentRoleName)) {
            assignableRoles = roleRepository.findAllByOrderByNameAsc();
        } else if ("MANAGER".equals(currentRoleName)) {
            assignableRoles = roleRepository.findAllByOrderByNameAsc()
                    .stream()
                    .filter(role ->
                            "MANAGER".equals(role.getName())
                                    || "TEAM_MEMBER".equals(role.getName())
                    )
                    .collect(Collectors.toList());
        } else {
            throw new AccessDeniedException(
                    "You do not have permission to assign organization roles"
            );
        }

        return assignableRoles.stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // FIND MEMBER CANDIDATE
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public MemberCandidateResponse findMemberCandidate(
            UUID organizationId,
            String email
    ) {
        findOrganizationOrThrow(organizationId);

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository
                .findByEmailAndIsActiveTrue(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No active user found with that email"
                        )
                );

        if (organizationMemberRepository.existsByOrganization_IdAndUser_Id(
                organizationId, user.getId())) {
            throw new MemberAlreadyExistsException(
                    organizationId, user.getId()
            );
        }

        return MemberCandidateResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }

    // =====================================================
    // ADD MEMBER
    // =====================================================

    @Override
    @Transactional
    public OrganizationMemberResponse addMember(
            UUID organizationId,
            AddMemberRequest request
    ) {
        Organization organization = findOrganizationOrThrow(organizationId);
        OrganizationMember currentMember =
                getCurrentOrganizationMember(organizationId);

        if (organizationMemberRepository.existsByOrganization_IdAndUser_Id(
                organizationId, request.getUserId())) {
            throw new IllegalStateException(
                    "User is already a member of this organization"
            );
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found: " + request.getUserId()
                        )
                );

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Role not found: " + request.getRoleId()
                        )
                );

        validateRoleAssignment(currentMember, role);

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(user)
                .role(role)
                .isActive(true)
                .build();

        return toMemberResponse(organizationMemberRepository.save(member));
    }

    // =====================================================
    // REMOVE MEMBER
    // =====================================================

    @Override
    @Transactional
    public void removeMember(UUID organizationId, UUID userId) {
        findOrganizationOrThrow(organizationId);

        organizationMemberRepository
                .findByOrganization_IdAndUser_Id(organizationId, userId)
                .orElseThrow(() ->
                        new MemberNotFoundException(organizationId, userId)
                );

        organizationMemberRepository
                .deleteByOrganization_IdAndUser_Id(organizationId, userId);
    }

    // =====================================================
    // UPDATE MEMBER ROLE
    // =====================================================

    @Override
    @Transactional
    public OrganizationMemberResponse updateMemberRole(
            UUID organizationId,
            UUID userId,
            UUID newRoleId
    ) {
        findOrganizationOrThrow(organizationId);

        OrganizationMember currentMember =
                getCurrentOrganizationMember(organizationId);

        OrganizationMember member = organizationMemberRepository
                .findByOrganization_IdAndUser_Id(organizationId, userId)
                .orElseThrow(() ->
                        new MemberNotFoundException(organizationId, userId)
                );

        Role role = roleRepository.findById(newRoleId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Role not found: " + newRoleId
                        )
                );

        validateRoleAssignment(currentMember, role);
        member.setRole(role);

        return toMemberResponse(organizationMemberRepository.save(member));
    }

    // =====================================================
    // MY ORGANIZATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<MyOrganizationResponse> getMyOrganizations() {
        User currentUser = getAuthenticatedUser();

        return organizationMemberRepository
                .findActiveMembershipsByUserId(currentUser.getId())
                .stream()
                .map(this::toMyOrganizationResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // ALL ORGANIZATIONS — PLATFORM ADMIN ONLY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizationsForPlatformAdmin() {
        User currentUser = getAuthenticatedUser();

        if (!currentUser.isPlatformAdmin()) {
            throw new AccessDeniedException(
                    "Platform Admin access is required to view all organizations"
            );
        }

        return organizationRepository.findAll()
                .stream()
                .map(this::toOrganizationResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // PRIVATE SECURITY HELPERS
    // =====================================================

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (!(principal instanceof User currentUser)) {
            throw new AccessDeniedException(
                    "Authenticated user could not be resolved"
            );
        }

        return currentUser;
    }

    private OrganizationMember getCurrentOrganizationMember(
            UUID organizationId
    ) {
        User currentUser = getAuthenticatedUser();

        return organizationMemberRepository
                .findByOrganization_IdAndUser_Id(
                        organizationId, currentUser.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this organization"
                        )
                );
    }

    private void validateRoleAssignment(
            OrganizationMember currentMember,
            Role targetRole
    ) {
        String currentRoleName = currentMember.getRole().getName();
        String targetRoleName = targetRole.getName();

        if ("ADMIN".equals(currentRoleName)) {
            return;
        }

        if ("MANAGER".equals(currentRoleName)) {
            if ("MANAGER".equals(targetRoleName)
                    || "TEAM_MEMBER".equals(targetRoleName)) {
                return;
            }

            throw new AccessDeniedException(
                    "Managers can only assign MANAGER or TEAM_MEMBER roles"
            );
        }

        throw new AccessDeniedException(
                "You do not have permission to assign organization roles"
        );
    }

    // =====================================================
    // PRIVATE MAPPERS
    // =====================================================

    private Organization findOrganizationOrThrow(UUID organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() ->
                        new OrganizationNotFoundException(organizationId)
                );
    }

    private OrganizationResponse toOrganizationResponse(
            Organization organization
    ) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .isActive(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }

    private OrganizationMemberResponse toMemberResponse(
            OrganizationMember member
    ) {
        User user = member.getUser();
        Role role = member.getRole();
        Organization organization = member.getOrganization();

        return OrganizationMemberResponse.builder()
                .id(member.getId())
                .organizationId(organization.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roleId(role.getId())
                .roleName(role.getName())
                .joinedAt(member.getJoinedAt())
                .isActive(member.isActive())
                .build();
    }

    private MyOrganizationResponse toMyOrganizationResponse(
            OrganizationMember member
    ) {
        Organization organization = member.getOrganization();
        Role role = member.getRole();

        return MyOrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .isActive(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .roleId(role.getId())
                .roleName(role.getName())
                .build();
    }

    private RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getCreatedAt()
        );
    }

	@Override
	@Transactional(readOnly = true)
	public List<OrganizationMemberResponse> getAllMembersForPlatformAdmin() {
	    User currentUser = getAuthenticatedUser();
	
	    if (!currentUser.isPlatformAdmin()) {
	        throw new AccessDeniedException(
	                "Platform Admin access is required to view all members"
	        );
	    }
	
	    return organizationMemberRepository.findAll()
	            .stream()
	            .map(this::toMemberResponse)
	            .collect(Collectors.toList());
	}
}