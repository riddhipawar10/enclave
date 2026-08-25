/*import React from "react";*/
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useRBAC from "../../context/useRBAC";

/**
 * ProtectedRoute
 *
 * Guards authenticated-only routes, with optional RBAC checks layered
 * on top. Authentication logic is unchanged from the original version
 * (still driven entirely by useAuth()) - RBAC checks are additive and
 * only run when requiredRole/requiredPermission props are provided.
 *
 * Usage (React Router v6 Outlet pattern):
 *
 *   // Auth-only, exactly as before:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Auth + role required:
 *   <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 *
 *   // Auth + permission required:
 *   <Route element={<ProtectedRoute requiredPermission="MANAGE_ROLES" />}>
 *     <Route path="/roles/create" element={<CreateRole />} />
 *   </Route>
 *
 * Props:
 * - requiredRole (string, optional) - if provided, user must have this
 *   role (checked via RBACContext's hasRole).
 * - requiredPermission (string, optional) - if provided, user must have
 *   this permission (checked via RBACContext's hasPermission).
 *   Both props can be combined; both checks must pass if both are given.
 *
 * Behavior:
 * - While auth state is still being determined, show a loading state
 *   (unchanged from original).
 * - If not authenticated, redirect to /login (unchanged from original).
 * - If authenticated but a requiredRole/requiredPermission check fails,
 *   redirect to /access-denied (new).
 * - Otherwise render the nested route via <Outlet /> (unchanged).
 */
function ProtectedRoute({ requiredRole, requiredPermission }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasPermission } = useRBAC();

  if (isLoading) {
    return (
      <div className="protected-route__loading">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;