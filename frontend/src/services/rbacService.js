// src/services/rbacService.js
//
// RBAC & Authorization API calls (Roles and Permissions only). Uses the
// shared `api` axios instance from api.js (token attachment handled
// there) and endpoint paths from config/apiEndpoints.js, matching the
// exact pattern organizationService.js and authService.js already use.
//
// NOTE: User-role assignment (assigning/removing a role FROM a user
// within an organization) is NOT duplicated here. That functionality
// already exists in organizationService.js:
//   - updateMemberRole(organizationId, userId, roleId)  -> assigns a role
//   - getOrganizationMembers(organizationId)             -> members + their roles
//   - removeMember(organizationId, userId)               -> removes member (and thus their role)
// Import those from organizationService.js directly where needed,
// instead of re-implementing them here, to avoid two sources of truth
// for the same backend endpoints.

import api from "./api";
import { ROLE_ENDPOINTS, PERMISSION_ENDPOINTS } from "../config/apiEndpoints";

// ---------- Roles ----------

export const getAllRoles = async () => {
  const response = await api.get(ROLE_ENDPOINTS.LIST_ALL);
  return response.data;
};

export const getRoleById = async (roleId) => {
  const response = await api.get(ROLE_ENDPOINTS.BY_ID(roleId));
  return response.data;
};

// Matches CreateRoleRequest exactly: { name, description }.
export const createRole = async ({ name, description }) => {
  const response = await api.post(ROLE_ENDPOINTS.CREATE, { name, description });
  return response.data;
};

// Matches UpdateRoleRequest exactly: { name, description }.
export const updateRole = async (roleId, { name, description }) => {
  const response = await api.put(ROLE_ENDPOINTS.BY_ID(roleId), { name, description });
  return response.data;
};

export const deleteRole = async (roleId) => {
  await api.delete(ROLE_ENDPOINTS.BY_ID(roleId));
};

// ---------- Permissions ----------

export const getAllPermissions = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.LIST_ALL);
  return response.data;
};

export const getPermissionById = async (permissionId) => {
  const response = await api.get(PERMISSION_ENDPOINTS.BY_ID(permissionId));
  return response.data;
};

// ---------- Role-Permission Assignment ----------
// TODO: NOT usable yet - backend endpoint does not exist.
// RoleController needs: GET /api/roles/{roleId}/permissions
//                        PUT /api/roles/{roleId}/permissions
// The query logic already exists in RolePermissionRepository
// (existsByRole_IdAndPermission_Name, findByRole_Id) but no controller
// method exposes it yet. Add the backend endpoint before wiring up
// the Role-Permission Assignment UI.

export const getPermissionsForRole = async (roleId) => {
  const response = await api.get(ROLE_ENDPOINTS.ROLE_PERMISSIONS(roleId));
  return response.data;
};

export const assignPermissionsToRole = async (roleId, permissionIds) => {
  const response = await api.put(ROLE_ENDPOINTS.ROLE_PERMISSIONS(roleId), {
    permissionIds,
  });
  return response.data;
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getPermissionById,
  getPermissionsForRole,
  assignPermissionsToRole,
};