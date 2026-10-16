import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import "./OrganizationSettings.css";

function OrganizationSettings() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrganizations = async () => {
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
        console.error(
          "Failed to load organizations for settings:",
          err
        );

        if (isMounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to manage organization settings."
              : "Failed to load organizations. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrganizations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManageSettings = (organizationId) => {
    navigate(`/organizations/${organizationId}/settings`);
  };

  return (
    <div className="organization-settings">
      <header className="organization-settings__header">
        <div>
          <h2>Organization Settings</h2>
          <p>
            Choose an organization to manage its settings.
          </p>
        </div>
      </header>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : organizations.length === 0 ? (
        <div className="organization-settings__empty">
          <p>No organizations found.</p>
        </div>
      ) : (
        <div className="organization-settings__list">
          {organizations.map((organization) => (
            <article
              className="organization-settings__card"
              key={organization.id}
            >
              <div className="organization-settings__card-info">
                <h3>{organization.name}</h3>

                <p>
                  @{organization.slug}
                </p>

                <span
                  className={`organization-settings__status ${
                    organization.isActive
                      ? "organization-settings__status--active"
                      : "organization-settings__status--inactive"
                  }`}
                >
                  {organization.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <button
                type="button"
                className="organization-settings__manage-button"
                onClick={() =>
                  handleManageSettings(organization.id)
                }
              >
                Manage Settings
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrganizationSettings;