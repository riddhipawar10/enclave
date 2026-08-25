import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizationList from "../../components/organization/OrganizationList";
import { getMyOrganizations } from "../../services/organizationService";
import "./OrganizationDashboard.css";

function OrganizationDashboard() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await getMyOrganizations();
        setOrganizations(data);
      } catch  {
        setError("Failed to load organizations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleViewDetails = (organizationId) => {
    navigate(`/organizations/${organizationId}`);
  };

  return (
    <div className="organization-dashboard">
      <div className="organization-dashboard-header">
        <h2>Organizations</h2>
        <button
          className="organization-dashboard-create-button"
          onClick={() => navigate("/organizations/create")}
        >
          + New Organization
        </button>
      </div>

      <OrganizationList
        organizations={organizations}
        isLoading={isLoading}
        error={error}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}

export default OrganizationDashboard;