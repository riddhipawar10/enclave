package com.enclave.rbac.security;

import com.enclave.rbac.service.AuthorizationService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
public class PermissionAspect {

    private final AuthorizationService authorizationService;

    public PermissionAspect(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @Before("@annotation(requirePermission)")
    public void checkPermission(JoinPoint joinPoint, RequirePermission requirePermission) {
        UUID currentRoleId = resolveCurrentRoleId();

        boolean allowed = authorizationService.hasPermission(currentRoleId, requirePermission.value());

        if (!allowed) {
            throw new SecurityException("Access denied: missing permission '" + requirePermission.value() + "'");
        }
    }

    /**
     * TODO: This method is NOT implemented.
     *
     * Resolving the current authenticated user's roleId requires:
     *   1. A User entity (owned by the Authentication module - not yet created)
     *   2. A populated Spring Security SecurityContext / Authentication object
     *      (depends on the login mechanism - not yet implemented)
     *   3. An OrganizationMember mapping (user -> role) (owned by the
     *      Organization module - not yet created)
     *
     * Until those dependencies exist and are integrated, this method
     * intentionally throws to make the gap explicit rather than silently
     * returning a fake or hardcoded roleId.
     */
    private UUID resolveCurrentRoleId() {
        throw new UnsupportedOperationException(
            "resolveCurrentRoleId() is not implemented. Requires integration with the " +
            "Authentication module's User/SecurityContext and the Organization module's " +
            "OrganizationMember mapping."
        );
    }
}