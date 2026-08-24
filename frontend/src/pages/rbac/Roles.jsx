import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoles, deleteRole } from "../../services/rbacService";
import useRBAC from "../../context/useRBAC";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Roles.css";

/**
 * Roles
 *
 * Displays all roles in the system. Roles are global, not scoped per
 * organization (see schema.sql - roles table has no organization_id
 * column), so this lists every role, same as GET /api/roles returns.
 *
 * Create/Edit/Delete actions are shown only when the current user has
 * the MANAGE_ROLES permission (checked via RBACContext).
 */
function Roles() {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const canManageRoles = hasPermission("MANAGE_ROLES");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data);
      } catch {
        setError("Failed to load roles. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleDelete = async (roleId, roleName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${roleName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(roleId);
    try {
      await deleteRole(roleId);
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
    } catch {
      setError("Failed to delete role. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="roles-page">
      <div className="roles-page-header">
        <h2>Roles</h2>
        {canManageRoles && (
          <button
            className="roles-page-create-button"
            onClick={() => navigate("/roles/create")}
          >
            + Create Role
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner message="Loading roles..." />}

      {!isLoading && error && <ErrorMessage message={error} />}

      {!isLoading && !error && roles.length === 0 && (
        <p className="roles-page-status">No roles found.</p>
      )}

      {!isLoading && !error && roles.length > 0 && (
        <div className="roles-table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="roles-table-name">{role.name}</td>
                  <td>{role.description || "—"}</td>
                  <td className="roles-table-actions">
                    <button
                      className="roles-action-button roles-action-view"
                      onClick={() => navigate(`/roles/${role.id}`)}
                    >
                      View
                    </button>

                    {canManageRoles && (
                      <button
                        className="roles-action-button roles-action-edit"
                        onClick={() => navigate(`/roles/${role.id}/edit`)}
                      >
                        Edit
                      </button>
                    )}

                    {canManageRoles && (
                      <button
                        className="roles-action-button roles-action-delete"
                        onClick={() => handleDelete(role.id, role.name)}
                        disabled={deletingId === role.id}
                      >
                        {deletingId === role.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Roles;