import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoleForm from "../../components/rbac/RoleForm";
import { getRoleById, updateRole } from "../../services/rbacService";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * EditRole
 *
 * Wraps RoleForm for editing an existing role. Mirrors CreateRole.jsx's
 * pattern exactly, plus a fetch-on-mount to load the role's current
 * name/description into the form via RoleForm's `initialData` prop.
 *
 * Route: /roles/:id/edit
 */
function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await getRoleById(id);
        setRole(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError("Failed to load role. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitError("");
      await updateRole(id, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/roles/${id}`);
      }, 800);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || "Failed to update role. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading role..." />;
  }

  if (notFound) {
    return (
      <div className="create-role-page">
        <p>Role not found.</p>
        <button onClick={() => navigate("/roles")}>Back to Roles</button>
      </div>
    );
  }

  if (loadError && !role) {
    return (
      <div className="create-role-page">
        <ErrorMessage message={loadError} />
        <button onClick={() => navigate("/roles")}>Back to Roles</button>
      </div>
    );
  }

  return (
    <div className="create-role-page">
      <h2>Edit Role</h2>
      <ErrorMessage message={submitError} />
      {success && <p className="create-role-success">Role updated successfully.</p>}
      <RoleForm initialData={role} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}

export default EditRole;
