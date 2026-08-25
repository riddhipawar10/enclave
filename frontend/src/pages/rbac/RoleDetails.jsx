import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useRBAC from "../../context/useRBAC";
import {
  getRoleById,
  deleteRole,
  getPermissionsForRole,
} from "../../services/rbacService";
import "./RoleDetails.css";

/**
 * RoleDetails
 *
 * Shows a single role's info, its assigned permissions, and actions
 * (Edit/Delete/Manage Permissions) gated by MANAGE_ROLES permission.
 *
 * NOTE on permissions section: GET /api/roles/{id}/permissions does not
 * exist on the backend yet (RolePermissionRepository has the query
 * logic, but no controller endpoint exposes it). This section is wired
 * to call it and will start working automatically once that endpoint
 * is added - until then it shows a clear "not available yet" state
 * instead of crashing.
 *
 * NOTE on members section: roles are global (not scoped to one
 * organization - see schema.sql), so there is no backend endpoint for
 * "all users across the system with this role." Showing members would
 * require picking a specific organization first. This section is
 * intentionally left as a placeholder rather than guessing an endpoint.
 */
function RoleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const canManageRoles = hasPermission("MANAGE_ROLES");

  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [permissions, setPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsUnavailable, setPermissionsUnavailable] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await getRoleById(id);
        setRole(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError("Failed to load role details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPermissions = async () => {
      try {
        const data = await getPermissionsForRole(id);
        setPermissions(data);
      } catch {
        // Backend endpoint not implemented yet - show placeholder,
        // not an error, since this is expected for now.
        setPermissionsUnavailable(true);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchRole();
    fetchPermissions();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${role.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteRole(id);
      navigate("/roles");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete role. Please try again."
      );
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading role..." />;
  }

  if (notFound) {
    return (
      <div className="role-details-page">
        <p>Role not found.</p>
        <button onClick={() => navigate("/roles")}>Back to Roles</button>
      </div>
    );
  }

  if (error && !role) {
    return (
      <div className="role-details-page">
        <ErrorMessage message={error} />
        <button onClick={() => navigate("/roles")}>Back to Roles</button>
      </div>
    );
  }

  return (
    <div className="role-details-page">
      <button className="role-details-back-button" onClick={() => navigate("/roles")}>
        &larr; Back to Roles
      </button>

      {error && <ErrorMessage message={error} />}

      <div className="role-details-header">
        <div>
          <h2>{role.name}</h2>
          <p className="role-details-description">
            {role.description || "No description provided."}
          </p>
        </div>

        {canManageRoles && (
          <div className="role-details-actions">
            <button onClick={() => navigate(`/roles/${id}/edit`)}>Edit</button>
            <button onClick={() => navigate(`/roles/${id}/permissions`)}>
              Manage Permissions
            </button>
            <button
              className="role-details-delete-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <h3>Assigned Permissions</h3>
      {permissionsLoading && <LoadingSpinner message="Loading permissions..." />}
      {!permissionsLoading && permissionsUnavailable && (
        <p className="role-details-empty-state">
          Permission details are not available yet for this role.
        </p>
      )}
      {!permissionsLoading && !permissionsUnavailable && permissions.length === 0 && (
        <p className="role-details-empty-state">No permissions assigned to this role.</p>
      )}
      {!permissionsLoading && !permissionsUnavailable && permissions.length > 0 && (
        <div className="role-details-permission-tags">
          {permissions.map((permission) => (
            <span key={permission.id} className="role-details-permission-tag">
              {permission.name}
            </span>
          ))}
        </div>
      )}

      <h3>Members with this Role</h3>
      <p className="role-details-empty-state">
        Member information is available per-organization. Visit an organization's
        &quot;Manage Members&quot; page to see who holds this role there.
      </p>
    </div>
  );
}

export default RoleDetails;