
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";

import { createProject } from "../../services/projectService";

import "./CreateAdminProject.css";

function CreateAdminProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialOrganizationId =
    searchParams.get("organizationId") || "";

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] =
    useState(initialOrganizationId);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadOrganizations() {
      try {
        const data = await getAllOrganizationsForPlatformAdmin();
        const list = Array.isArray(data) ? data : [];

        if (!mounted) return;

        setOrganizations(list);

        const requestedId = searchParams.get("organizationId");

        const matchingOrganization = list.find(
          (organization) =>
            String(
              organization.id ?? organization.organizationId
            ) === requestedId
        );

        const firstOrganization = list[0];
        const selectedOrganization =
          matchingOrganization ?? firstOrganization;

        if (selectedOrganization) {
          setOrganizationId(
            String(
              selectedOrganization.id ??
              selectedOrganization.organizationId
            )
          );
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view organizations."
              : "Failed to load organizations."
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadOrganizations();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!organizationId) {
      setError("Please select an organization.");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    try {
      setIsSaving(true);

      await createProject(organizationId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      });

      navigate(
        `/admin/projects?organizationId=${encodeURIComponent(
          organizationId
        )}`,
        {
          replace: true,
          state: { successMessage: "Project created successfully." },
        }
      );
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to create projects for this organization."
          : err?.response?.data?.message ||
            "Failed to create project. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="create-admin-project">
        <p>Loading organizations...</p>
      </div>
    );
  }

  return (
    <div className="create-admin-project">
      <header className="create-admin-project__header">
        <div>
          <p className="create-admin-project__eyebrow">
            ADMINISTRATION
          </p>
          <h2>Create Project</h2>
          <p>Enter the details for your new project.</p>
        </div>
      </header>

      {error && (
        <div className="create-admin-project__error">
          {error}
        </div>
      )}

      <section className="create-admin-project__card">
        <form onSubmit={handleSubmit}>
          <div className="create-admin-project__field">
            <label htmlFor="organizationId">Organization *</label>
            <select
              id="organizationId"
              value={organizationId}
              onChange={(event) =>
                setOrganizationId(event.target.value)
              }
              required
            >
              <option value="">Select organization</option>
              {organizations.map((organization) => {
                const id =
                  organization.id ?? organization.organizationId;

                return (
                  <option key={id} value={String(id)}>
                    {organization.name ??
                      organization.organizationName ??
                      "Unnamed organization"}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="create-admin-project__field">
            <label htmlFor="name">Project name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              maxLength={150}
              required
            />
          </div>

          <div className="create-admin-project__field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project"
              rows={4}
            />
          </div>

          <div className="create-admin-project__date-row">
            <div className="create-admin-project__field">
              <label htmlFor="startDate">Start date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="create-admin-project__field">
              <label htmlFor="endDate">End date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={formData.startDate || undefined}
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="create-admin-project__actions">
            <button
              type="button"
              className="create-admin-project__cancel"
              onClick={() =>
                navigate(
                  `/admin/projects?organizationId=${encodeURIComponent(
                    organizationId
                  )}`
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-admin-project__submit"
              disabled={isSaving || organizations.length === 0}
            >
              {isSaving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateAdminProject;
