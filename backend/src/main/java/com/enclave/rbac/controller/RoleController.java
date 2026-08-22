package com.enclave.rbac.controller;

import com.enclave.rbac.dto.CreateRoleRequest;
import com.enclave.rbac.dto.RoleResponse;
import com.enclave.rbac.dto.UpdateRoleRequest;
import com.enclave.rbac.entity.Role;
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

    @GetMapping
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable UUID id) {
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(toResponse(role));
    }

    @PostMapping
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<RoleResponse> createRole(@RequestBody CreateRoleRequest request) {
        Role created = roleService.createRole(request.getName(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<RoleResponse> updateRole(@PathVariable UUID id, @RequestBody UpdateRoleRequest request) {
        Role updated = roleService.updateRole(id, request.getName(), request.getDescription());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @RequirePermission("MANAGE_ROLES")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName(), role.getDescription(), role.getCreatedAt());
    }
}