
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./OrganizationSettingsDetails.css";

import {
  getOrganizationById,
  getOrganizationMembers,
  updateOrganization,
} from "../../services/organizationService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

function OrganizationSettingsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setError("");

        const [orgData, memberData] = await Promise.all([
          getOrganizationById(id),
          getOrganizationMembers(id),
        ]);

        setOrganization(orgData);
        setMembers(memberData || []);

        setName(orgData.name || "");
        setSlug(orgData.slug || "");
        setIsActive(Boolean(orgData.isActive));
      } catch (err) {
        console.error("Failed to load organization settings:", err);
        setError(
          err.response?.status === 403
            ? "You don't have permission to view this organization's settings."
            : "Failed to load organization settings."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrganization();
    }
  }, [id]);

  const currentMembership = members.find(
    (member) => member.userId === user?.id
  );

  const canEdit =
    currentMembership?.roleName === "ADMIN";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !slug.trim()) {
      setError("Organization name and slug are required.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      setError(
        "Slug must use lowercase letters, numbers, and single hyphens between words."
      );
      return;
    }

    try {
      setIsSaving(true);

      const updated = await updateOrganization(id, {
        name: name.trim(),
        slug: slug.trim(),
        isActive,
      });

      setOrganization(updated);
      setName(updated.name || "");
      setSlug(updated.slug || "");
      setIsActive(Boolean(updated.isActive));
      setSuccess("Organization settings saved successfully.");
    } catch (err) {
      console.error("Failed to save organization settings:", err);
      setError(
        err.response?.status === 403
          ? "You don't have permission to update this organization."
          : err.response?.status === 409
            ? "That organization slug is already in use."
            : "Failed to save organization settings."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading organization settings..." />;
  }

  if (error && !organization) {
    return (
      <div className="organization-settings-details-page">
        <ErrorMessage message={error} />
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  if (!organization) {
    return <p>Organization could not be found.</p>;
  }

  return (
    <div className="organization-settings-details-page">
      <button
            type="button"
            onClick={() => navigate("/admin/organizations/settings")}
        >
            &larr; Back to Organization Settings
      </button>

      <h2>Organization Settings</h2>
      <p>Manage settings for {organization.name}.</p>

      {error && <ErrorMessage message={error} />}
      {success && <p role="status">{success}</p>}

      {!canEdit ? (
        <p>
          You can view this organization's settings, but only an
          organization admin can edit them.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="organization-name">Organization name</label>
            <input
              id="organization-name"
              type="text"
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="organization-slug">Organization slug</label>
            <input
              id="organization-slug"
              type="text"
              maxLength={150}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
            />
            <small>
              Use lowercase letters, numbers, and hyphens.
            </small>
          </div>

          <div>
            <label htmlFor="organization-active">
              <input
                id="organization-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Organization is active
            </label>
          </div>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}

export default OrganizationSettingsDetails;
