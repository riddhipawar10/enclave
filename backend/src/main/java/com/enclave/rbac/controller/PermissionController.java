package com.enclave.rbac.controller;

import com.enclave.rbac.dto.PermissionResponse;
import com.enclave.rbac.entity.Permission;
import com.enclave.rbac.security.RequirePermission;
import com.enclave.rbac.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        List<PermissionResponse> permissions = permissionService.getAllPermissions().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/{id}")
    @RequirePermission("VIEW_ROLES")
    public ResponseEntity<PermissionResponse> getPermissionById(@PathVariable UUID id) {
        Permission permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(toResponse(permission));
    }

    private PermissionResponse toResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getName(),
                permission.getDescription(),
                permission.getCreatedAt()
        );
    }
}