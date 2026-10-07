package com.enclave.rbac.security;

import com.enclave.auth.entity.User;
import com.enclave.organization.entity.OrganizationMember;
import com.enclave.organization.repository.OrganizationMemberRepository;
import com.enclave.rbac.service.AuthorizationService;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;
import java.util.UUID;

@Aspect
@Component
public class PermissionAspect {

    private final AuthorizationService authorizationService;
    private final OrganizationMemberRepository organizationMemberRepository;

    public PermissionAspect(
            AuthorizationService authorizationService,
            OrganizationMemberRepository organizationMemberRepository
    ) {
        this.authorizationService = authorizationService;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    @Before("@annotation(requirePermission)")
    public void checkPermission(
            JoinPoint joinPoint,
            RequirePermission requirePermission
    ) {

        User currentUser = getCurrentUser();

        String requiredPermission =
                requirePermission.value();

        UUID organizationId =
                extractOrganizationId(joinPoint);

        /*
         * CREATE_ORGANIZATION is a special case.
         *
         * The organization does not exist yet, so the user cannot
         * already have a membership in that organization.
         *
         * For organization creation, permission is checked against
         * any active organization membership.
         *
         * For all existing organization operations, permission is
         * checked against the specific target organization.
         */
        if ("CREATE_ORGANIZATION".equals(requiredPermission)) {

            checkPermissionInAnyOrganization(
                    currentUser.getId(),
                    requiredPermission
            );

            return;
        }

        /*
         * All other organization-specific operations must contain
         * an organizationId.
         */
        if (organizationId == null) {

            throw new AccessDeniedException(
                    "Access denied: organization ID is required"
            );
        }

        checkPermissionInOrganization(
                currentUser.getId(),
                organizationId,
                requiredPermission
        );
    }

    private void checkPermissionInOrganization(
            UUID userId,
            UUID organizationId,
            String requiredPermission
    ) {

        List<OrganizationMember> memberships =
                organizationMemberRepository
                        .findActiveMembershipsByUserId(userId);

        boolean allowed =
                hasPermissionInOrganization(
                        memberships,
                        organizationId,
                        requiredPermission
                );

        if (!allowed) {

            throw new AccessDeniedException(
                    "Access denied: missing permission '"
                            + requiredPermission
                            + "' for organization '"
                            + organizationId
                            + "'"
            );
        }
    }

    private void checkPermissionInAnyOrganization(
            UUID userId,
            String requiredPermission
    ) {

        List<OrganizationMember> memberships =
                organizationMemberRepository
                        .findActiveMembershipsByUserId(userId);

        boolean allowed =
                hasPermissionInAnyOrganization(
                        memberships,
                        requiredPermission
                );

        if (!allowed) {

            throw new AccessDeniedException(
                    "Access denied: missing permission '"
                            + requiredPermission
                            + "'"
            );
        }
    }

    private boolean hasPermissionInOrganization(
            List<OrganizationMember> memberships,
            UUID organizationId,
            String requiredPermission
    ) {

        return memberships.stream()
                .filter(OrganizationMember::isActive)
                .filter(membership ->
                        membership.getOrganization() != null
                                && membership.getOrganization().getId() != null
                                && membership.getOrganization()
                                        .getId()
                                        .equals(organizationId)
                )
                .map(OrganizationMember::getRole)
                .filter(role ->
                        role != null &&
                        role.getId() != null
                )
                .anyMatch(role ->
                        authorizationService.hasPermission(
                                role.getId(),
                                requiredPermission
                        )
                );
    }

    private boolean hasPermissionInAnyOrganization(
            List<OrganizationMember> memberships,
            String requiredPermission
    ) {

        return memberships.stream()
                .filter(OrganizationMember::isActive)
                .map(OrganizationMember::getRole)
                .filter(role ->
                        role != null &&
                        role.getId() != null
                )
                .anyMatch(role ->
                        authorizationService.hasPermission(
                                role.getId(),
                                requiredPermission
                        )
                );
    }

    private UUID extractOrganizationId(
            JoinPoint joinPoint
    ) {

        Method method = getMethod(joinPoint);

        Parameter[] parameters =
                method.getParameters();

        Object[] arguments =
                joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {

            PathVariable pathVariable =
                    parameters[i].getAnnotation(PathVariable.class);

            if (pathVariable == null) {
                continue;
            }

            String name = pathVariable.name();

            if (name == null || name.isBlank()) {
                name = pathVariable.value();
            }

            if (!"organizationId".equals(name)) {
                continue;
            }

            Object argument = arguments[i];

            if (argument instanceof UUID) {
                return (UUID) argument;
            }
        }

        return null;
    }

    private Method getMethod(
            JoinPoint joinPoint
    ) {

        MethodSignature methodSignature =
                (MethodSignature) joinPoint.getSignature();

        return methodSignature.getMethod();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User)) {

            throw new AccessDeniedException(
                    "Authenticated user could not be resolved"
            );
        }

        User user = (User) principal;

        if (user.getId() == null) {

            throw new AccessDeniedException(
                    "Authenticated user has no ID"
            );
        }

        if (!user.isActive()) {

            throw new AccessDeniedException(
                    "User account is inactive"
            );
        }

        return user;
    }
}