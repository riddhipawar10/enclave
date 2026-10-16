import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import useRBAC from "../../context/useRBAC";

/**
 * ProtectedRoute
 *
 * Guards authenticated-only routes, with optional RBAC checks layered
 * on top.
 *
 * Authentication comes from AuthContext.
 * Role checks use the roles returned by the backend during login.
 * Permission checks continue to use the existing RBAC context.
 */
function ProtectedRoute({ requiredRole, requiredPermission }) {
  const {
    isAuthenticated,
    isLoading,
    roles,
  } = useAuth();

  const { hasPermission } = useRBAC();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="protected-route__loading">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath =
      location.state?.logoutLoginPath || "/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={null}
      />
    );
  }

  /*
   * Role protection is only applied when a route explicitly
   * provides requiredRole.
   *
   * Existing Manager routes do not provide requiredRole,
   * so their current behavior remains unchanged.
   */
  if (
    requiredRole &&
    !roles.includes(requiredRole)
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  /*
   * Existing permission protection remains unchanged.
   */
  if (
    requiredPermission &&
    !hasPermission(requiredPermission)
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;