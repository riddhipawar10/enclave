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

/**
 * Permissions
 *
 * Manage permission assignment for a single role (route: /roles/:id/permissions).
 *
 * NOTE: GET/PUT /api/roles/{id}/permissions do not exist on the backend
 * yet (RolePermissionRepository has the query logic, but no controller
 * endpoint exposes it). This page is fully built against that expected
 * API shape and will work as soon as the endpoint is added - until
 * then it shows a clear error instead of crashing.
 *
 * Grouping is derived from each permission's name (ACTION_RESOURCE
 * pattern, e.g. CREATE_ORGANIZATION -> group "ORGANIZATION"), not
 * hardcoded, so it stays correct if seed data changes.
 */
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
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [roleData, permissionsData] = await Promise.all([
          getRoleById(id),
          getAllPermissions(),
        ]);
        setRole(roleData);
        setAllPermissions(permissionsData);
      } catch {
        setError("Failed to load role or permissions.");
        setIsLoading(false);
        return;
      }

      try {
        const assigned = await getPermissionsForRole(id);
        setSelectedIds(new Set(assigned.map((p) => p.id)));
      } catch {
        // Backend endpoint not implemented yet - not a hard error,
        // just means we can't show current assignment state.
        setAssignedUnavailable(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const togglePermission = (permissionId) => {
    if (!canManagePermissions) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await assignPermissionsToRole(id, Array.from(selectedIds));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "Failed to save permission changes. This feature may not be available yet."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Groups permissions by the resource portion of their name:
  // "CREATE_ORGANIZATION" -> group "ORGANIZATION"
  // "VIEW_AUDIT_LOG" -> group "AUDIT_LOG"
  const groupPermissions = (permissions) => {
    const groups = {};
    permissions.forEach((permission) => {
      const parts = permission.name.split("_");
      const groupKey = parts.length > 1 ? parts.slice(1).join("_") : "OTHER";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(permission);
    });
    return groups;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading permissions..." />;
  }

  if (error) {
    return (
      <div className="permissions-page">
        <ErrorMessage message={error} />
        <button onClick={() => navigate(`/roles/${id}`)}>Back to Role</button>
      </div>
    );
  }

  const groupedPermissions = groupPermissions(allPermissions);

  return (
    <div className="permissions-page">
      <button
        className="permissions-back-button"
        onClick={() => navigate(`/roles/${id}`)}
      >
        &larr; Back to Role
      </button>

      <div className="permissions-header">
        <div>
          <h2>Manage Permissions</h2>
          <p className="permissions-role-name">Role: {role?.name}</p>
        </div>
        {canManagePermissions && (
          <button
            className="permissions-save-button"
            onClick={handleSave}
            disabled={isSaving || assignedUnavailable}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {!canManagePermissions && (
        <p className="permissions-readonly-notice">
          You do not have permission to modify role permissions. Viewing only.
        </p>
      )}

      {assignedUnavailable && (
        <p className="permissions-readonly-notice">
          Current permission assignments are not available yet. Changes cannot be
          saved until this feature is supported by the backend.
        </p>
      )}

      {saveError && <ErrorMessage message={saveError} />}
      {saveSuccess && (
        <p className="permissions-save-success">Permissions updated successfully.</p>
      )}

      {allPermissions.length === 0 && (
        <p className="permissions-empty-state">No permissions found in the system.</p>
      )}

      {allPermissions.length > 0 && (
        <div className="permissions-groups">
          {Object.entries(groupedPermissions).map(([groupName, permissions]) => (
            <div key={groupName} className="permissions-group">
              <h3>{groupName.replace(/_/g, " ")}</h3>
              <div className="permissions-group-list">
                {permissions.map((permission) => (
                  <label key={permission.id} className="permissions-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      disabled={!canManagePermissions || assignedUnavailable}
                    />
                    <span className="permissions-checkbox-label">
                      <strong>{permission.name}</strong>
                      {permission.description && (
                        <span className="permissions-checkbox-description">
                          {permission.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Permissions;