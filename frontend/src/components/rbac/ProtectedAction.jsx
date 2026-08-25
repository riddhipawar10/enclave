// src/components/rbac/ProtectedAction.jsx
//
// Declarative wrapper for hiding/disabling UI based on the current
// user's permissions (and/or roles). Replaces repeating
// `hasPermission(...) && (...)` inline in every page - pages should
// prefer this over calling useRBAC() directly just to guard a button
// or section.
//
// This is a UI convenience layer only, same caveat as RBACContext:
// it does NOT replace real backend authorization checks.

import usePermissions from "../../hooks/usePermissions";

/**
 * ProtectedAction
 *
 * Usage:
 *
 *   // Single permission - hides children if user lacks MANAGE_ROLES
 *   <ProtectedAction permission="MANAGE_ROLES">
 *     <button onClick={handleEdit}>Edit</button>
 *   </ProtectedAction>
 *
 *   // Any of several permissions
 *   <ProtectedAction anyOf={["MANAGE_ROLES", "MANAGE_MEMBERS"]}>
 *     <AdminPanel />
 *   </ProtectedAction>
 *
 *   // All of several permissions
 *   <ProtectedAction allOf={["MANAGE_ROLES", "MANAGE_MEMBERS"]}>
 *     <SuperAdminPanel />
 *   </ProtectedAction>
 *
 *   // Role-based instead of permission-based
 *   <ProtectedAction role="ADMIN">
 *     <DangerZone />
 *   </ProtectedAction>
 *
 *   // Optional fallback shown instead of nothing when access is denied
 *   <ProtectedAction permission="MANAGE_ROLES" fallback={<p>Read-only</p>}>
 *     <button onClick={handleEdit}>Edit</button>
 *   </ProtectedAction>
 *
 * Props (all optional; combine at most one check type per usage):
 * - permission (string)   require a single permission
 * - anyOf (string[])      require at least one of these permissions
 * - allOf (string[])      require all of these permissions
 * - role (string)         require a single role
 * - fallback (ReactNode)  rendered instead of children when access is
 *                         denied (default: null, renders nothing)
 * - children (ReactNode)  the protected content
 */
function ProtectedAction({ permission, anyOf, allOf, role, fallback = null, children }) {
  const { can, canAny, canAll, isRole } = usePermissions();

  let allowed = true;
  let checkProvided = false;

  if (permission) {
    checkProvided = true;
    allowed = allowed && can(permission);
  }

  if (anyOf) {
    checkProvided = true;
    allowed = allowed && canAny(anyOf);
  }

  if (allOf) {
    checkProvided = true;
    allowed = allowed && canAll(allOf);
  }

  if (role) {
    checkProvided = true;
    allowed = allowed && isRole(role);
  }

  // No check props provided - fail safe by hiding content rather than
  // silently showing it, since that's almost certainly a bug at the
  // call site (forgot to pass a prop) rather than intentional.
  if (!checkProvided) {
    return fallback;
  }

  return allowed ? children : fallback;
}

export default ProtectedAction;
