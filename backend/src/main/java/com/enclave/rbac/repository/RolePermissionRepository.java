package com.enclave.rbac.repository;

import com.enclave.rbac.entity.RolePermission;
import com.enclave.rbac.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    boolean existsByRole_IdAndPermission_Name(UUID roleId, String permissionName);

    List<RolePermission> findByRole_Id(UUID roleId);
}