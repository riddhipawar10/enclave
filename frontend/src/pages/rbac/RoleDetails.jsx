
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
    let cancelled = false;

    const fetchRole = async () => {
      try {
        const data = await getRoleById(id);
        if (!cancelled) setRole(data);
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError("Failed to load role details.");
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const fetchPermissions = async () => {
      try {
        const data = await getPermissionsForRole(id);
        if (!cancelled) {
          setPermissions(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setPermissionsUnavailable(true);
      } finally {
        if (!cancelled) setPermissionsLoading(false);
      }
    };

    fetchRole();
    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!role || deleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${role.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteRole(id);
      navigate("/admin/roles");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete role. Please try again."
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
        <button
          className="role-details-back-button"
          onClick={() => navigate("/admin/roles")}
        >
          &larr; Back to Role Management
        </button>
        <div className="role-details-message">
          <h2>Role not found</h2>
          <p>This role may have been deleted or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (error && !role) {
    return (
      <div className="role-details-page">
        <button
          className="role-details-back-button"
          onClick={() => navigate("/admin/roles")}
        >
          &larr; Back to Role Management
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="role-details-page">
      <button
        type="button"
        className="role-details-back-button"
        onClick={() => navigate("/admin/roles")}
      >
        &larr; Back to Role Management
      </button>

      {error && <ErrorMessage message={error} />}

      <div className="role-details-header">
        <div className="role-details-heading">
          <span className="role-details-eyebrow">ROLE DETAILS</span>
          <h1>{role.name}</h1>
          <p className="role-details-description">
            {role.description || "No description provided."}
          </p>
        </div>

        {canManageRoles && (
          <div className="role-details-actions">
            <button
              type="button"
              className="role-details-edit-button"
              onClick={() => navigate(`/admin/roles/${id}/edit`)}
            >
              Edit Role
            </button>

            <button
              type="button"
              className="role-details-manage-button"
              onClick={() => navigate(`/admin/roles/${id}/permissions`)}
            >
              Manage Permissions
            </button>

            <button
              type="button"
              className="role-details-delete-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Role"}
            </button>
          </div>
        )}
      </div>

      <section className="role-details-section">
        <div className="role-details-section-header">
          <div>
            <h2>Assigned Permissions</h2>
            <p>Permissions currently assigned to this role.</p>
          </div>

          {!permissionsLoading && !permissionsUnavailable && (
            <span className="role-details-count">
              {permissions.length}{" "}
              {permissions.length === 1 ? "permission" : "permissions"}
            </span>
          )}
        </div>

        {permissionsLoading && (
          <LoadingSpinner message="Loading permissions..." />
        )}

        {!permissionsLoading && permissionsUnavailable && (
          <p className="role-details-empty-state">
            Permission details could not be loaded. Please try again later.
          </p>
        )}

        {!permissionsLoading &&
          !permissionsUnavailable &&
          permissions.length === 0 && (
            <p className="role-details-empty-state">
              No permissions are assigned to this role.
            </p>
          )}

        {!permissionsLoading &&
          !permissionsUnavailable &&
          permissions.length > 0 && (
            <div className="role-details-permission-tags">
              {permissions.map((permission) => (
                <span
                  key={permission.id}
                  className="role-details-permission-tag"
                >
                  <span aria-hidden="true">✓</span>
                  {permission.name}
                </span>
              ))}
            </div>
          )}
      </section>

      <section className="role-details-section role-details-members-section">
        <div className="role-details-section-header">
          <div>
            <h2>Members with this Role</h2>
            <p>View role assignments within an organization.</p>
          </div>
        </div>

        <p className="role-details-empty-state">
          Member information is available per organization. Visit the
          organization's Manage Members page to see who holds this role.
        </p>
      </section>
    </div>
  );
}

export default RoleDetails;
