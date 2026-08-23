/*import React from "react";*/
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Guards authenticated-only routes. This component ONLY checks
 * whether the user is authenticated — it does NOT implement
 * Organization Management or RBAC/permissions logic. Those checks
 * belong in separate, more specific guards (to be added later by
 * Madhura and Riddhi) that can wrap around or nest inside this one.
 *
 * Usage (React Router v6 Outlet pattern):
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/profile" element={<Profile />} />
 *   </Route>
 *
 * Behavior:
 * - While auth state is still being determined (e.g. restoring
 *   a session via token refresh on page load), show a loading state.
 * - If authenticated, render the nested route via <Outlet />.
 * - If not authenticated, redirect to /login.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return <Outlet />;
}

export default ProtectedRoute;