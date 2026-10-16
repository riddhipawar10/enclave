
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OrganizationList from "../../components/organization/OrganizationList";
import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";

import "./AdminOrganizations.css";

function AdminOrganizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrganizations = async () => {
      try {
        setError("");

        const data =
          await getAllOrganizationsForPlatformAdmin();

        if (isMounted) {
          setOrganizations(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view all organizations."
              : "Failed to load organizations. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = organizations.filter(
    (organization) => organization.isActive
  ).length;

  const inactiveCount =
    organizations.length - activeCount;

  const handleViewDetails = (organizationId) => {
    navigate(`/organizations/${organizationId}`);
  };

  return (
    <div className="admin-organizations">
      <header className="admin-organizations__header">
        <div>
          <p className="admin-organizations__eyebrow">
            ADMINISTRATION
          </p>

          <h2>Organization Overview</h2>

          <p>
            View organizations across Enclave and review
            their current status.
          </p>
        </div>
      </header>

      {!isLoading && !error && (
        <section
          className="admin-organizations__summary"
          aria-label="Organization summary"
        >
          <article className="admin-organizations__summary-card">
            <span>Total organizations</span>
            <strong>{organizations.length}</strong>
          </article>

          <article className="admin-organizations__summary-card">
            <span>Active organizations</span>
            <strong>{activeCount}</strong>
          </article>

          <article className="admin-organizations__summary-card">
            <span>Inactive organizations</span>
            <strong>{inactiveCount}</strong>
          </article>
        </section>
      )}

      <section className="admin-organizations__list-section">
        <div className="admin-organizations__list-header">
          <h3>All organizations</h3>

          <p>
            Review organizations across the platform.
          </p>
        </div>

        <OrganizationList
          organizations={organizations}
          isLoading={isLoading}
          error={error}
          onViewDetails={handleViewDetails}
          emptyMessage="No organizations have been created yet."
        />
      </section>
    </div>
  );
}

export default AdminOrganizations;