package com.enclave.rbac.service;

import com.enclave.rbac.repository.RolePermissionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationService {

    private final RolePermissionRepository rolePermissionRepository;

    public AuthorizationService(RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    /**
     * Checks whether the given role has the given permission.
     *
     * NOTE: Resolving "current authenticated user" to a roleId is not
     * implemented here — it depends on the Authentication module's User
     * entity/security context and the OrganizationMember mapping, neither
     * of which exist in this module yet. Callers must supply roleId
     * directly until that integration point is available.
     */
    public boolean hasPermission(UUID roleId, String permissionName) {
        return rolePermissionRepository.existsByRole_IdAndPermission_Name(roleId, permissionName);
    }
}