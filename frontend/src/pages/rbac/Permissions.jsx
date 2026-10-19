
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useRBAC from "../../context/useRBAC";
import {
  getRoleById,
  getAllPermissions,
  getPermissionsForRole,
  assignPermissionsToRole,
} from "../../services/rbacService";
import "./Permissions.css";

function Permissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const canManagePermissions = hasPermission("MANAGE_ROLES");

  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedUnavailable, setAssignedUnavailable] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [roleData, permissionsData] = await Promise.all([
          getRoleById(id),
          getAllPermissions(),
        ]);

        if (cancelled) return;

        setRole(roleData);
        setAllPermissions(
          Array.isArray(permissionsData) ? permissionsData : []
        );

        try {
          const assigned = await getPermissionsForRole(id);

          if (!cancelled) {
            setSelectedIds(
              new Set(
                (Array.isArray(assigned) ? assigned : []).map(
                  (permission) => permission.id
                )
              )
            );
          }
        } catch {
          if (!cancelled) setAssignedUnavailable(true);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load role or permissions.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const togglePermission = (permissionId) => {
    if (!canManagePermissions || assignedUnavailable || isSaving) return;

    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }

      return next;
    });

    setSaveSuccess(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!canManagePermissions || assignedUnavailable || isSaving) return;

    setSaveError("");
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await assignPermissionsToRole(id, Array.from(selectedIds));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "Failed to save permission changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const groupPermissions = (permissions) => {
    return permissions.reduce((groups, permission) => {
      const parts = permission.name.split("_");
      const groupName =
        parts.length > 1 ? parts.slice(1).join("_") : "OTHER";

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(permission);

      return groups;
    }, {});
  };

  const groupedPermissions = groupPermissions(allPermissions);
  const selectedCount = selectedIds.size;

  if (isLoading) {
    return <LoadingSpinner message="Loading permissions..." />;
  }

  if (error) {
    return (
      <div className="permissions-page">
        <button
          type="button"
          className="permissions-back-button"
          onClick={() => navigate(`/admin/roles/${id}`)}
        >
          &larr; Back to Role
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="permissions-page">
      <button
        type="button"
        className="permissions-back-button"
        onClick={() => navigate(`/admin/roles/${id}`)}
      >
        &larr; Back to Role
      </button>

      <div className="permissions-header">
        <div className="permissions-heading">
          <span className="permissions-eyebrow">ACCESS CONTROL</span>
          <h1>Manage Permissions</h1>
          <p>
            Configure which actions this role can perform across Enclave.
          </p>
          <div className="permissions-role-label">
            Role: <strong>{role?.name}</strong>
          </div>
        </div>

        {canManagePermissions && (
          <button
            type="button"
            className="permissions-save-button"
            onClick={handleSave}
            disabled={isSaving || assignedUnavailable}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="permissions-summary">
        <div>
          <span className="permissions-summary-label">
            Available Permissions
          </span>
          <strong>{allPermissions.length}</strong>
        </div>
        <div>
          <span className="permissions-summary-label">
            Selected Permissions
          </span>
          <strong>{selectedCount}</strong>
        </div>
      </div>

      {!canManagePermissions && (
        <div className="permissions-notice">
          You don't have permission to modify role permissions. This page is
          read-only.
        </div>
      )}

      {assignedUnavailable && (
        <div className="permissions-notice">
          The current permission assignments could not be loaded. Editing and
          saving are disabled to prevent accidental changes.
        </div>
      )}

      {saveError && <ErrorMessage message={saveError} />}

      {saveSuccess && (
        <p className="permissions-save-success">
          Permissions updated successfully.
        </p>
      )}

      {allPermissions.length === 0 && (
        <div className="permissions-empty-state">
          <h3>No permissions found</h3>
          <p>No permissions were returned by the server.</p>
        </div>
      )}

      {allPermissions.length > 0 && (
        <div className="permissions-groups">
          {Object.entries(groupedPermissions).map(
            ([groupName, groupItems]) => {
              const groupSelectedCount = groupItems.filter((permission) =>
                selectedIds.has(permission.id)
              ).length;

              return (
                <section key={groupName} className="permissions-group">
                  <div className="permissions-group-header">
                    <div>
                      <h2>{groupName.replace(/_/g, " ")}</h2>
                      <p>
                        {groupItems.length}{" "}
                        {groupItems.length === 1
                          ? "permission"
                          : "permissions"}
                      </p>
                    </div>

                    <span className="permissions-group-count">
                      {groupSelectedCount}/{groupItems.length} selected
                    </span>
                  </div>

                  <div className="permissions-group-list">
                    {groupItems.map((permission) => (
                      <label
                        key={permission.id}
                        className={`permissions-checkbox-item ${
                          selectedIds.has(permission.id)
                            ? "is-selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          disabled={
                            !canManagePermissions ||
                            assignedUnavailable ||
                            isSaving
                          }
                        />

                        <span className="permissions-checkbox-label">
                          <strong>{permission.name}</strong>
                          <span className="permissions-checkbox-description">
                            {permission.description ||
                              "No description available."}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            }
          )}
        </div>
      )}

      {canManagePermissions && allPermissions.length > 0 && (
        <div className="permissions-footer">
          <button
            type="button"
            className="permissions-cancel-button"
            onClick={() => navigate(`/admin/roles/${id}`)}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="permissions-save-button"
            onClick={handleSave}
            disabled={isSaving || assignedUnavailable}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Permissions;
