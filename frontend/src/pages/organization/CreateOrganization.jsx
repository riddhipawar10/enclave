import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizationForm from "../../components/organization/OrganizationForm";
import { createOrganization } from "../../services/organizationService";
import ErrorMessage from "../../components/common/ErrorMessage";

function CreateOrganization() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setSubmitError("");
      const newOrganization = await createOrganization(formData);
      navigate(`/organizations/${newOrganization.id}`);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || "Failed to create organization. Please try again.");
    }
  };

  return (
    <div className="create-organization-page">
      <h2>Create Organization</h2>
      <ErrorMessage message={submitError} />
      <OrganizationForm onSubmit={handleSubmit} submitLabel="Create Organization" />
    </div>
  );
}

export default CreateOrganization;