import { useState, useCallback } from "react";
import RBACContext from "./RBACContext";

export const RBACProvider = ({ children }) => {
  const [roles, setRolesState] = useState([]);
  const [permissions, setPermissionsState] = useState([]);
  const [loading, setLoading] = useState(false);

  const setRoles = useCallback((newRoles) => {
    setRolesState(Array.isArray(newRoles) ? newRoles : []);
  }, []);

  const setPermissions = useCallback((newPermissions) => {
    setPermissionsState(
      Array.isArray(newPermissions) ? newPermissions : []
    );
  }, []);

  const clearRBAC = useCallback(() => {
    setRolesState([]);
    setPermissionsState([]);
    setLoading(false);
  }, []);

  const hasRole = useCallback(
    (roleName) => {
      if (!roleName) return false;
      return roles.includes(roleName);
    },
    [roles]
  );

  const hasPermission = useCallback(
    (permissionName) => {
      if (!permissionName) return false;
      return permissions.includes(permissionName);
    },
    [permissions]
  );

  const value = {
    roles,
    permissions,
    loading,
    setLoading,
    setRoles,
    setPermissions,
    clearRBAC,
    hasRole,
    hasPermission,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export default RBACProvider;