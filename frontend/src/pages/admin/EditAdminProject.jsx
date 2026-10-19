
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";

import {
  getProjectById,
  updateProject,
} from "../../services/projectService";

import "./EditAdminProject.css";

function EditAdminProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();
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

    async function loadData() {
      try {
        setError("");

        const organizationsData =
          await getAllOrganizationsForPlatformAdmin();

        const list = Array.isArray(organizationsData)
          ? organizationsData
          : [];

        if (!mounted) return;

        setOrganizations(list);

        const requestedOrganizationId =
          searchParams.get("organizationId") || "";

        const matchingOrganization = list.find(
          (organization) =>
            String(
              organization.id ?? organization.organizationId
            ) === requestedOrganizationId
        );

        if (!matchingOrganization) {
          setError(
            "The selected organization could not be found. Please return to Admin Projects and select the organization again."
          );
          return;
        }

        const selectedOrganizationId = String(
          matchingOrganization.id ??
          matchingOrganization.organizationId
        );

        setOrganizationId(selectedOrganizationId);

        const project = await getProjectById(
          selectedOrganizationId,
          projectId
        );

        if (!mounted) return;

        setFormData({
          name: project.name || "",
          description: project.description || "",
          startDate: project.startDate
            ? String(project.startDate).slice(0, 10)
            : "",
          endDate: project.endDate
            ? String(project.endDate).slice(0, 10)
            : "",
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.status === 403
            ? "You don't have permission to view or edit this project."
            : err?.response?.data?.message ||
              "Failed to load project details."
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [projectId, searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const goBack = () => {
    navigate(
      `/admin/projects?organizationId=${encodeURIComponent(
        organizationId
      )}`
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!organizationId) {
      setError("Please select an organization.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Project name is required.");
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

      await updateProject(organizationId, projectId, {
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
          state: {
            successMessage: "Project updated successfully.",
          },
        }
      );
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to update this project."
          : err?.response?.data?.message ||
            "Failed to update project. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-admin-project">
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="edit-admin-project">
      <header className="edit-admin-project__header">
        <div>
          <p className="edit-admin-project__eyebrow">
            ADMINISTRATION
          </p>
          <h2>Edit Project</h2>
          <p>Update the details of your existing project.</p>
        </div>
      </header>

      {error && (
        <div className="edit-admin-project__error" role="alert">
          {error}
        </div>
      )}

      <section className="edit-admin-project__card">
        <form onSubmit={handleSubmit}>
          <div className="edit-admin-project__field">
            <label htmlFor="organizationId">Organization</label>
            <select
              id="organizationId"
              value={organizationId}
              disabled
            >
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
            <small>
              The organization cannot be changed while editing a project.
            </small>
          </div>

          <div className="edit-admin-project__field">
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

          <div className="edit-admin-project__field">
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

          <div className="edit-admin-project__date-row">
            <div className="edit-admin-project__field">
              <label htmlFor="startDate">Start date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="edit-admin-project__field">
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

          <div className="edit-admin-project__actions">
            <button
              type="button"
              className="edit-admin-project__cancel"
              onClick={goBack}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-admin-project__submit"
              disabled={isSaving || !organizationId}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditAdminProject;
