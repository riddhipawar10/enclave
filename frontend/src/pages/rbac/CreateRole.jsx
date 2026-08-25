import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleForm from "../../components/rbac/RoleForm";
import { createRole } from "../../services/rbacService";
import ErrorMessage from "../../components/common/ErrorMessage";

function CreateRole() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setSubmitError("");
      await createRole(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/roles");
      }, 800);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || "Failed to create role. Please try again.");
    }
  };

  return (
    <div className="create-role-page">
      <h2>Create Role</h2>
      <ErrorMessage message={submitError} />
      {success && <p className="create-role-success">Role created successfully.</p>}
      <RoleForm onSubmit={handleSubmit} submitLabel="Create Role" />
    </div>
  );
}

export default CreateRole;