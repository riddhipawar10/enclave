// src/hooks/usePermissions.js
//
// Thin convenience hook over RBACContext, matching the original file
// structure spec. useRBAC() already exposes hasPermission/hasRole, so
// this hook does not duplicate that logic - it just re-shapes it into
// a slightly more ergonomic API for components that only care about
// permission checks (not the rest of the RBAC context, like loading
// state or setRoles/setPermissions).
//
// Also wires in the pure helpers from utils/permissionUtils.js for the
// "any of" / "all of" cases, so components don't need to import both
// useRBAC and permissionUtils separately.

import { useMemo } from "react";
import useRBAC from "../../context/useRBAC";
import {
  hasAnyPermission as hasAnyPermissionUtil,
  hasAllPermissions as hasAllPermissionsUtil,
} from "../utils/permissionUtils";

/**
 * usePermissions
 *
 * @returns {{
 *   permissions: string[],
 *   roles: string[],
 *   loading: boolean,
 *   can: (permissionName: string) => boolean,
 *   canAny: (permissionNames: string[]) => boolean,
 *   canAll: (permissionNames: string[]) => boolean,
 *   isRole: (roleName: string) => boolean,
 * }}
 */
function usePermissions() {
  const { permissions, roles, loading, hasPermission, hasRole } = useRBAC();

  const canAny = useMemo(
    () => (permissionNames) => hasAnyPermissionUtil(permissions, permissionNames),
    [permissions]
  );

  const canAll = useMemo(
    () => (permissionNames) => hasAllPermissionsUtil(permissions, permissionNames),
    [permissions]
  );

  return {
    permissions,
    roles,
    loading,
    can: hasPermission,
    canAny,
    canAll,
    isRole: hasRole,
  };
}

export default usePermissions;
