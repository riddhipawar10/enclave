package com.enclave.rbac.dto;

import java.util.List;
import java.util.UUID;

public class AssignPermissionsRequest {

    private List<UUID> permissionIds;

    public AssignPermissionsRequest() {
    }

    public List<UUID> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(List<UUID> permissionIds) {
        this.permissionIds = permissionIds;
    }
}