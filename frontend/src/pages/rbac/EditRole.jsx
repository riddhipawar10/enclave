
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoleForm from "../../components/rbac/RoleForm";
import { getRoleById, updateRole } from "../../services/rbacService";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./EditRole.css";

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
        navigate(`/admin/roles/${id}`);
      }, 800);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(
        backendMessage || "Failed to update role. Please try again."
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading role..." />;
  }

  if (notFound || (loadError && !role)) {
    return (
      <div className="edit-role-page">
        <button
          type="button"
          className="edit-role-back-button"
          onClick={() => navigate("/admin/roles")}
        >
          ← Back to Role Management
        </button>

        {notFound ? (
          <ErrorMessage message="Role not found." />
        ) : (
          <ErrorMessage message={loadError} />
        )}
      </div>
    );
  }

  return (
    <div className="edit-role-page">
      <button
        type="button"
        className="edit-role-back-button"
        onClick={() => navigate("/admin/roles")}
      >
        ← Back to Role Management
      </button>

      <div className="edit-role-header">
        <div>
          <h1>Edit Role</h1>
          <p>Update the role name and description for your organization.</p>
        </div>
      </div>

      <div className="edit-role-content">
        <ErrorMessage message={submitError} />

        {success && (
          <p className="edit-role-success">
            Role updated successfully. Redirecting...
          </p>
        )}

        <RoleForm
          initialData={role}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}

export default EditRole;
