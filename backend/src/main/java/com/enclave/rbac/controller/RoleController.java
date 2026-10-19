
package com.enclave.rbac.controller;

import com.enclave.rbac.dto.AssignPermissionsRequest;
import com.enclave.rbac.dto.CreateRoleRequest;
import com.enclave.rbac.dto.PermissionResponse;
import com.enclave.rbac.dto.RoleResponse;
import com.enclave.rbac.dto.UpdateRoleRequest;
import com.enclave.rbac.entity.Permission;
import com.enclave.role.entity.Role;
import com.enclave.rbac.security.RequirePermission;
import com.enclave.rbac.service.RoleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // Get all roles
    @GetMapping
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(roles);
    }

    // Get a role by ID
    @GetMapping("/{id}")
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<RoleResponse> getRoleById(
            @PathVariable UUID id) {

        Role role = roleService.getRoleById(id);

        return ResponseEntity.ok(toResponse(role));
    }

    // Create a role
    @PostMapping
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<RoleResponse> createRole(
            @RequestBody CreateRoleRequest request) {

        Role created = roleService.createRole(
                request.getName(),
                request.getDescription()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(created));
    }

    // Update a role
    @PutMapping("/{id}")
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable UUID id,
            @RequestBody UpdateRoleRequest request) {

        Role updated = roleService.updateRole(
                id,
                request.getName(),
                request.getDescription()
        );

        return ResponseEntity.ok(toResponse(updated));
    }

    // Delete a role
    @DeleteMapping("/{id}")
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<Void> deleteRole(
            @PathVariable UUID id) {

        roleService.deleteRole(id);

        return ResponseEntity.noContent().build();
    }

    // Get permissions assigned to a role
    @GetMapping("/{id}/permissions")
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<List<PermissionResponse>> getPermissionsForRole(
            @PathVariable UUID id) {

        List<PermissionResponse> permissions =
                roleService.getPermissionsForRole(id)
                        .stream()
                        .map(this::toPermissionResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(permissions);
    }

    // Replace permissions assigned to a role
    @PutMapping("/{id}/permissions")
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<List<PermissionResponse>> assignPermissionsToRole(
            @PathVariable UUID id,
            @RequestBody AssignPermissionsRequest request) {

        List<Permission> permissions =
                roleService.assignPermissionsToRole(
                        id,
                        request.getPermissionIds()
                );

        List<PermissionResponse> response =
                permissions.stream()
                        .map(this::toPermissionResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Convert Role entity to response DTO
    private RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getCreatedAt()
        );
    }

    // Convert Permission entity to response DTO
    private PermissionResponse toPermissionResponse(
            Permission permission) {

        return new PermissionResponse(
                permission.getId(),
                permission.getName(),
                permission.getDescription(),
                permission.getCreatedAt()
        );
    }
}
