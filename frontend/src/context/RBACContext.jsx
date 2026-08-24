import { createContext } from "react";

const RBACContext = createContext(undefined);

export default RBACContext;





// src/context/RBACContext.jsx
//
// Manages the currently logged-in user's roles and permissions on the
// client side, for UI-level authorization checks (hiding/disabling
// actions, showing/hiding pages). This is a UI convenience layer only -
// it does NOT replace real backend authorization. The backend's
// @RequirePermission / PermissionAspect remains the actual source of
// truth; this context just lets the frontend avoid showing controls
// the user can't use anyway.
//
// This context is intentionally standalone and does NOT read from or
// depend on AuthContext.jsx. Whatever code determines the user's roles
// and permissions (e.g. after login, or after loading organization
// membership) is responsible for calling setRoles()/setPermissions()
// here - that wiring is not done in this file.
//
// Does NOT store passwords, tokens, or any other sensitive auth data -
// only role names and permission names for UI checks.

// import { createContext, useContext, useState, useCallback } from "react";

// const RBACContext = createContext(undefined);

// export const RBACProvider = ({ children }) => {
//   // roles: array of role name strings, e.g. ["ADMIN"]
//   const [roles, setRolesState] = useState([]);

//   // permissions: array of permission name strings, e.g. ["CREATE_TASK", "VIEW_PROJECT"]
//   const [permissions, setPermissionsState] = useState([]);

//   // loading: true while roles/permissions are being fetched/resolved.
//   // Calling code should set this via setLoading before/after fetching.
//   const [loading, setLoading] = useState(false);

//   const setRoles = useCallback((newRoles) => {
//     setRolesState(Array.isArray(newRoles) ? newRoles : []);
//   }, []);

//   const setPermissions = useCallback((newPermissions) => {
//     setPermissionsState(Array.isArray(newPermissions) ? newPermissions : []);
//   }, []);

//   const clearRBAC = useCallback(() => {
//     setRolesState([]);
//     setPermissionsState([]);
//     setLoading(false);
//   }, []);

//   const hasRole = useCallback(
//     (roleName) => {
//       if (!roleName) return false;
//       return roles.includes(roleName);
//     },
//     [roles]
//   );

//   const hasPermission = useCallback(
//     (permissionName) => {
//       if (!permissionName) return false;
//       return permissions.includes(permissionName);
//     },
//     [permissions]
//   );

//   const value = {
//     roles,
//     permissions,
//     loading,
//     setLoading,
//     setRoles,
//     setPermissions,
//     clearRBAC,
//     hasRole,
//     hasPermission,
//   };

//   return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
// };

// // Custom hook for consuming this context. Throws a clear error if used
// // outside the provider, same pattern as most AuthContext implementations,
// // so mistakes are caught early instead of silently returning undefined.
// export const useRBAC = () => {
//   const context = useContext(RBACContext);
//   if (context === undefined) {
//     throw new Error("useRBAC must be used within an RBACProvider");
//   }
//   return context;
// };

// export default RBACContext;