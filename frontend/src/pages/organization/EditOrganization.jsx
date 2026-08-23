import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizationForm from "../../components/organization/OrganizationForm";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getOrganizationById, updateOrganization } from "../../services/organizationService";

function EditOrganization() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const data = await getOrganizationById(id);
        setOrganization(data);
      } catch  {
        setLoadError("Failed to load organization. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitError("");
      await updateOrganization(id, formData);
      navigate(`/organizations/${id}`);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setSubmitError(backendMessage || "Failed to update organization. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading organization..." />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  if (!organization) {
    return <p>Organization not found.</p>;
  }

  return (
    <div className="edit-organization-page">
      <h2>Edit Organization</h2>
      <ErrorMessage message={submitError} />
      <OrganizationForm
        initialData={organization}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isEditMode={true}
      />
    </div>
  );
}

export default EditOrganization;