
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleForm from "../../components/rbac/RoleForm";
import { createRole } from "../../services/rbacService";
import ErrorMessage from "../../components/common/ErrorMessage";
import "./EditRole.css";

function CreateRole() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setSubmitError("");
      await createRole(formData);
      navigate("/admin/roles");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(
        backendMessage || "Failed to create role. Please try again."
      );
    }
  };

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
          <h1>Create Role</h1>
          <p>Create a new role for your organization.</p>
        </div>
      </div>

      <div className="edit-role-content">
        <ErrorMessage message={submitError} />

        <RoleForm
          onSubmit={handleSubmit}
          submitLabel="Create Role"
        />
      </div>
    </div>
  );
}

export default CreateRole;
