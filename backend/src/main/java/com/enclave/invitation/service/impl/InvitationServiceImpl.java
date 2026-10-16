
package com.enclave.invitation.service.impl;

import com.enclave.auth.dto.AuthResponse;
import com.enclave.auth.entity.User;
import com.enclave.auth.repository.UserRepository;
import com.enclave.auth.service.AuthService;
import com.enclave.invitation.dto.AcceptInvitationRequest;
import com.enclave.invitation.dto.CreateInvitationRequest;
import com.enclave.invitation.dto.CreateInvitationResponse;
import com.enclave.invitation.dto.InvitationResponse;
import com.enclave.invitation.entity.Invitation;
import com.enclave.invitation.repository.InvitationRepository;
import com.enclave.invitation.service.InvitationService;
import com.enclave.organization.entity.Organization;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.organization.repository.OrganizationRepository;
import com.enclave.rbac.repository.RoleRepository;
import com.enclave.role.entity.Role;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InvitationServiceImpl implements InvitationService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("ADMIN", "MANAGER", "TEAM_MEMBER");

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthService authService;

    public InvitationServiceImpl(
            InvitationRepository invitationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuthService authService
    ) {
        this.invitationRepository = invitationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.authService = authService;
    }

    @Override
    public List<InvitationResponse> getOrganizationInvitations(
            UUID organizationId
    ) {
        verifyOrganizationAccess(organizationId);

        return invitationRepository.findByOrganizationId(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<InvitationResponse> getPendingInvitations(
            UUID organizationId
    ) {
        verifyOrganizationAccess(organizationId);

        LocalDateTime now = LocalDateTime.now();

        return invitationRepository
                .findByOrganizationIdAndStatus(organizationId, "PENDING")
                .stream()
                .filter(invitation ->
                        invitation.getExpiresAt() != null
                                && invitation.getExpiresAt().isAfter(now))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CreateInvitationResponse createInvitation(
            UUID organizationId,
            CreateInvitationRequest request
    ) {
        User currentUser = getCurrentUser();
        verifyOrganizationAccess(organizationId);

        Organization organization = organizationRepository
                .findById(organizationId)
                .filter(Organization::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active organization not found"
                ));

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected role does not exist"
                ));

        String roleName = role.getName().toUpperCase(Locale.ROOT);

        if (!ALLOWED_ROLES.contains(roleName)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ADMIN, MANAGER, and TEAM_MEMBER roles can be invited"
            );
        }

        if (!currentUser.isPlatformAdmin()) {
            var membership = organizationMemberRepository
                    .findByOrganization_IdAndUser_Id(
                            organizationId, currentUser.getId())
                    .filter(member -> member.isActive())
                    .orElseThrow(() -> new AccessDeniedException(
                            "Active organization membership is required"));

            String currentRole = membership.getRole().getName()
                    .toUpperCase(Locale.ROOT);

            if ("MANAGER".equals(currentRole)
                    && "ADMIN".equals(roleName)) {
                throw new AccessDeniedException(
                        "Managers cannot invite members as ADMIN");
            }

            if (!"ADMIN".equals(currentRole)
                    && !"MANAGER".equals(currentRole)) {
                throw new AccessDeniedException(
                        "You do not have permission to invite members");
            }
        }

        // Do not invite an already active member.
        userRepository.findByEmailAndIsActiveTrue(email)
                .ifPresent(existingUser -> {
                    boolean alreadyMember = organizationMemberRepository
                            .findByOrganization_IdAndUser_Id(
                                    organization.getId(),
                                    existingUser.getId())
                            .filter(member -> member.isActive())
                            .isPresent();

                    if (alreadyMember) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "This user is already an active organization member"
                        );
                    }
                });

        // Expired pending invitations no longer block a new invitation.
        LocalDateTime now = LocalDateTime.now();

        invitationRepository
                .findByOrganizationIdAndStatus(organizationId, "PENDING")
                .stream()
                .filter(invitation ->
                        invitation.getEmail().equalsIgnoreCase(email))
                .filter(invitation ->
                        invitation.getExpiresAt() != null
                                && invitation.getExpiresAt().isAfter(now))
                .findFirst()
                .ifPresent(invitation -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "A pending invitation already exists for this email"
                    );
                });

        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);

        Invitation invitation = new Invitation();
        invitation.setOrganizationId(organizationId);
        invitation.setEmail(email);
        invitation.setRoleId(role.getId());
        invitation.setToken(token);
        invitation.setStatus("PENDING");
        invitation.setInvitedBy(currentUser.getId());
        invitation.setExpiresAt(now.plusDays(7));

        Invitation saved = invitationRepository.save(invitation);

        return new CreateInvitationResponse(
                saved.getId(),
                saved.getOrganizationId(),
                saved.getEmail(),
                saved.getRoleId(),
                saved.getStatus(),
                saved.getExpiresAt(),
                saved.getToken()
        );
    }

    @Override
    @Transactional
    public AuthResponse acceptInvitation(
            String token,
            AcceptInvitationRequest request
    ) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required"
            );
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration details are required"
            );
        }

        Invitation invitation = invitationRepository
                .findByToken(token.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation is no longer pending"
            );
        }

        if (invitation.getExpiresAt() == null
                || !invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired"
            );
        }

        Organization organization = organizationRepository
                .findById(invitation.getOrganizationId())
                .filter(Organization::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "The invited organization is no longer active"
                ));

        Role role = roleRepository.findById(invitation.getRoleId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The invited role no longer exists"
                ));

        String roleName = role.getName().toUpperCase(Locale.ROOT);

        if (!ALLOWED_ROLES.contains(roleName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The invitation has an invalid role"
            );
        }

        String email = invitation.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        // This flow requires invited users to create a new account.
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email is already registered. Please log in instead."
            );
        }

        AuthResponse response = authService.registerInvitedUser(
                request.getFirstName(),
                request.getLastName(),
                email,
                request.getPassword(),
                organization,
                role
        );

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        return response;
    }

    @Override
    public InvitationResponse verifyInvitation(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required"
            );
        }

        Invitation invitation = invitationRepository.findByToken(token.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This invitation is no longer pending"
            );
        }

        if (invitation.getExpiresAt() == null
                || !invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired"
            );
        }

        return toResponse(invitation);
    }

    /**
     * Retrieves the token for an invitation belonging to the
     * specified organization, after verifying organization access.
     *
     * The controller exposing this method must require authentication.
     */
    @Override
    public String getInvitationLink(
            UUID organizationId,
            UUID invitationId
    ) {
        verifyOrganizationAccess(organizationId);

        Invitation invitation = invitationRepository
                .findById(invitationId)
                .filter(item ->
                        item.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found in this organization"
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending invitations can be opened"
            );
        }

        if (invitation.getExpiresAt() == null
                || !invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired"
            );
        }

        return invitation.getToken();
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new AccessDeniedException(
                    "An authenticated user is required");
        }

        return currentUser;
    }

    private void verifyOrganizationAccess(UUID organizationId) {
        User currentUser = getCurrentUser();

        if (currentUser.isPlatformAdmin()) {
            return;
        }

        boolean isMember = organizationMemberRepository
                .findByOrganization_IdAndUser_Id(
                        organizationId, currentUser.getId())
                .filter(member -> member.isActive())
                .isPresent();

        if (!isMember) {
            throw new AccessDeniedException(
                    "You do not have access to this organization's invitations");
        }
    }

    private InvitationResponse toResponse(Invitation invitation) {
        String status = invitation.getStatus();

        if ("PENDING".equals(status)
                && invitation.getExpiresAt() != null
                && !invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
            status = "EXPIRED";
        }

        return new InvitationResponse(
                invitation.getId(),
                invitation.getOrganizationId(),
                invitation.getEmail(),
                invitation.getRoleId(),
                status,
                invitation.getInvitedBy(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }
}
