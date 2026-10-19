package com.enclave.rbac.service;

import com.enclave.role.entity.Role;
import com.enclave.rbac.dto.PermissionResponse;
import com.enclave.rbac.entity.Permission;
import com.enclave.rbac.entity.RolePermission;
import com.enclave.rbac.exception.ResourceNotFoundException;
import com.enclave.rbac.repository.PermissionRepository;
import com.enclave.rbac.repository.RolePermissionRepository;
import com.enclave.rbac.repository.RoleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public RoleService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found with id: " + id));
    }

    public Role createRole(String name, String description) {
        Role role = new Role(name, description);
        return roleRepository.save(role);
    }

    public Role updateRole(UUID id, String name, String description) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found with id: " + id));

        role.setName(name);
        role.setDescription(description);

        return roleRepository.save(role);
    }

    public void deleteRole(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Role not found with id: " + id);
        }

        roleRepository.deleteById(id);
    }

    // Get permissions currently assigned to a role.
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForRole(UUID roleId) {
        getRoleById(roleId);

        List<RolePermission> assignments =
                rolePermissionRepository.findByRole_Id(roleId);

        List<Permission> permissions = new ArrayList<>();

        for (RolePermission assignment : assignments) {
            permissions.add(assignment.getPermission());
        }

        return permissions;
    }

    // Replace all permissions assigned to a role.
    @Transactional
    public List<Permission> assignPermissionsToRole(
            UUID roleId,
            List<UUID> permissionIds) {

        Role role = getRoleById(roleId);

        if (permissionIds == null) {
            throw new IllegalArgumentException(
                    "Permission IDs must not be null.");
        }

        Set<UUID> uniquePermissionIds =
                new LinkedHashSet<>(permissionIds);

        List<Permission> permissions =
                permissionRepository.findAllById(uniquePermissionIds);

        if (permissions.size() != uniquePermissionIds.size()) {
            throw new ResourceNotFoundException(
                    "One or more permission IDs do not exist.");
        }

        // Validate everything before changing existing assignments.
        rolePermissionRepository.deleteAllByRole_Id(roleId);

        List<RolePermission> assignments = new ArrayList<>();

        for (Permission permission : permissions) {
            assignments.add(new RolePermission(role, permission));
        }

        rolePermissionRepository.saveAll(assignments);

        return permissions;
    }
}