import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoles, getAllPermissions } from "../../services/rbacService";
import useRBAC from "../../context/useRBAC";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./RBACDashboard.css";

/**
 * RBACDashboard
 *
 * Item 5 from the original spec: a clean, presentation-ready summary
 * of the RBAC module - total roles, total permissions, and a quick
 * list of each role with its description. Deliberately read-only and
 * free of table/action clutter so it screenshots well.
 *
 * Only calls endpoints that are confirmed to exist on the backend
 * (GET /api/roles, GET /api/permissions) - does NOT call
 * getPermissionsForRole, since that endpoint doesn't exist yet. Per-role
 * permission counts are therefore intentionally left off this page;
 * see RoleDetails.jsx for where that will surface once the backend
 * endpoint is added.
 *
 * Route: /rbac-dashboard (suggested - wire into App.jsx)
 */
function RBACDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const canManageRoles = hasPermission("MANAGE_ROLES");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          getAllRoles(),
          getAllPermissions(),
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch {
        setError("Failed to load RBAC summary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading RBAC summary..." />;
  }

  return (
    <div className="rbac-dashboard-page">
      <div className="rbac-dashboard-header">
        <h2>Role &amp; Permission Overview</h2>
        {canManageRoles && (
          <button
            className="rbac-dashboard-create-button"
            onClick={() => navigate("/roles/create")}
          >
            + Create Role
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rbac-dashboard-stats">
        <div className="rbac-dashboard-stat-card">
          <span className="rbac-dashboard-stat-value">{roles.length}</span>
          <span className="rbac-dashboard-stat-label">Total Roles</span>
        </div>
        <div className="rbac-dashboard-stat-card">
          <span className="rbac-dashboard-stat-value">{permissions.length}</span>
          <span className="rbac-dashboard-stat-label">Total Permissions</span>
        </div>
      </div>

      <h3 className="rbac-dashboard-section-title">Roles</h3>
      {roles.length === 0 && (
        <p className="rbac-dashboard-empty-state">No roles found.</p>
      )}
      {roles.length > 0 && (
        <div className="rbac-dashboard-role-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rbac-dashboard-role-card"
              onClick={() => navigate(`/roles/${role.id}`)}
            >
              <h4>{role.name}</h4>
              <p>{role.description || "No description provided."}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="rbac-dashboard-section-title">Permissions</h3>
      {permissions.length === 0 && (
        <p className="rbac-dashboard-empty-state">No permissions found.</p>
      )}
      {permissions.length > 0 && (
        <div className="rbac-dashboard-permission-tags">
          {permissions.map((permission) => (
            <span key={permission.id} className="rbac-dashboard-permission-tag">
              {permission.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default RBACDashboard;
