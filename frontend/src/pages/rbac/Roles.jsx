
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoles, deleteRole } from "../../services/rbacService";
import useRBAC from "../../context/useRBAC";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Roles.css";

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
        setRoles(Array.isArray(data) ? data : []);
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
    setError("");

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
        <div className="roles-page-heading">
          <span className="roles-page-eyebrow">ACCESS CONTROL</span>
          <h1>Role Management</h1>
          <p>
            Manage roles and control access to Enclave resources.
          </p>
        </div>

        {canManageRoles && (
          <button
            type="button"
            className="roles-page-create-button"
            onClick={() => navigate("/admin/roles/create")}
          >
            <span aria-hidden="true">+</span> Create Role
          </button>
        )}
      </div>

      {!isLoading && !error && (
        <div className="roles-summary-grid">
          <div className="roles-summary-card">
            <div className="roles-summary-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div>
              <p className="roles-summary-label">Total Roles</p>
              <h2>{roles.length}</h2>
              <span className="roles-summary-caption">
                Roles configured in the system
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner message="Loading roles..." />}

      {!isLoading && error && (
        <div className="roles-page-error">
          <ErrorMessage message={error} />
        </div>
      )}

      {!isLoading && !error && roles.length === 0 && (
        <div className="roles-empty-state">
          <div className="roles-empty-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </div>
          <h3>No roles found</h3>
          <p>Roles will appear here once they are available.</p>

          {canManageRoles && (
            <button
              type="button"
              className="roles-page-create-button"
              onClick={() => navigate("/admin/roles/create")}
            >
              + Create First Role
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && roles.length > 0 && (
        <section className="roles-list-section">
          <div className="roles-list-header">
            <div>
              <h2>All Roles</h2>
              <p>Review role details and available actions.</p>
            </div>

            <span className="roles-count-badge">
              {roles.length} {roles.length === 1 ? "role" : "roles"}
            </span>
          </div>

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
                    <td className="roles-table-name">
                      <span className="roles-name-indicator" />
                      <span>{role.name}</span>
                    </td>

                    <td className="roles-table-description">
                      {role.description || "No description provided"}
                    </td>

                    <td className="roles-table-actions">
                      <button
                        type="button"
                        className="roles-action-button roles-action-view"
                        onClick={() =>
                          navigate(`/admin/roles/${role.id}`)
                        }
                      >
                        View
                      </button>

                      {canManageRoles && (
                        <button
                          type="button"
                          className="roles-action-button roles-action-edit"
                          onClick={() =>
                            navigate(`/admin/roles/${role.id}/edit`)
                          }
                        >
                          Edit
                        </button>
                      )}

                      {canManageRoles && (
                        <button
                          type="button"
                          className="roles-action-button roles-action-delete"
                          onClick={() => handleDelete(role.id, role.name)}
                          disabled={deletingId === role.id}
                        >
                          {deletingId === role.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Roles;
