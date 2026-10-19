
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";

import {
  getProjects,
  archiveProject,
} from "../../services/projectService";

import "./AdminProjects.css";

function AdminProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState([]);

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState(searchParams.get("organizationId") || "");

  const [projects, setProjects] = useState([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);

  const [isLoadingProjects, setIsLoadingProjects] =
    useState(false);

  const [archivingProjectId, setArchivingProjectId] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(
    location.state?.successMessage || ""
  );

  // Load organizations for the Admin.
  useEffect(() => {
    let isMounted = true;

    async function fetchOrganizations() {
      try {
        setError("");

        const data = await getAllOrganizationsForPlatformAdmin();

        const organizationList = Array.isArray(data)
          ? data
          : [];

        if (isMounted) {
          setOrganizations(organizationList);

          const requestedOrganizationId =
            searchParams.get("organizationId");

          const matchingOrganization = organizationList.find(
            (organization) =>
              String(
                organization.id ?? organization.organizationId
              ) === requestedOrganizationId
          );

          const organizationToSelect =
            matchingOrganization ?? organizationList[0];

          const organizationId =
            organizationToSelect?.id ??
            organizationToSelect?.organizationId;

          if (organizationId) {
            setSelectedOrganizationId(String(organizationId));
          } else {
            setSelectedOrganizationId("");
          }
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
          setIsLoadingOrganizations(false);
        }
      }
    }

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Keep the selected organization in the URL.
  useEffect(() => {
    if (!selectedOrganizationId) return;

    const currentOrganizationId =
      searchParams.get("organizationId");

    if (currentOrganizationId !== selectedOrganizationId) {
      navigate(
        `/admin/projects?organizationId=${encodeURIComponent(
          selectedOrganizationId
        )}`,
        {
          replace: true,
          state: location.state,
        }
      );
    }
  }, [
    selectedOrganizationId,
    searchParams,
    navigate,
    location.state,
  ]);

  // Load projects for the selected organization.
  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      if (!selectedOrganizationId) {
        setProjects([]);
        setIsLoadingProjects(false);
        return;
      }

      try {
        setIsLoadingProjects(true);
        setError("");

        const data = await getProjects(
          selectedOrganizationId
        );

        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setProjects([]);

          setError(
            err?.response?.status === 403
              ? "You don't have permission to view projects for this organization."
              : "Failed to load projects. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganizationId]);

  // Find the selected organization.
  const selectedOrganization = organizations.find(
    (organization) =>
      String(
        organization.id ?? organization.organizationId
      ) === selectedOrganizationId
  );

  // Count active projects only.
  const activeProjects = projects.filter(
    (project) => !project.archived
  );

  // Handle organization selection.
  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setSelectedOrganizationId(organizationId);
    setError("");
    setSuccess("");

    navigate(
      organizationId
        ? `/admin/projects?organizationId=${encodeURIComponent(
            organizationId
          )}`
        : "/admin/projects",
      { replace: true }
    );
  };

  // Navigate to Create Project.
  const handleCreateProject = () => {
    if (!selectedOrganizationId) {
      setError("Please select an organization first.");
      return;
    }

    navigate(
      `/admin/projects/create?organizationId=${encodeURIComponent(
        selectedOrganizationId
      )}`
    );
  };

  // Archive a project from the main Projects list.
  const handleArchiveProject = async (project) => {
    if (
      !selectedOrganizationId ||
      !project?.id ||
      archivingProjectId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to archive "${project.name}"?\n\n` +
        "It will no longer appear in the active projects list."
    );

    if (!confirmed) {
      return;
    }

    try {
      setArchivingProjectId(project.id);
      setError("");
      setSuccess("");

      await archiveProject(
        selectedOrganizationId,
        project.id
      );

      // Remove the archived project from the current list.
      setProjects((currentProjects) =>
        currentProjects.filter(
          (item) => String(item.id) !== String(project.id)
        )
      );

      setSuccess(
        `"${project.name}" was archived successfully.`
      );
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to archive this project."
          : err?.response?.status === 404
            ? "Project not found. Please refresh the project list."
            : err?.response?.data?.message ||
              "Failed to archive the project. Please try again."
      );
    } finally {
      setArchivingProjectId(null);
    }
  };

  // Navigate to Archived Projects.
  const handleViewArchivedProjects = () => {
    navigate(
      selectedOrganizationId
        ? `/admin/projects/archived?organizationId=${encodeURIComponent(
            selectedOrganizationId
          )}`
        : "/admin/projects/archived"
    );
  };

  return (
    <div className="admin-projects">
      {/* Page header */}
      <header className="admin-projects__header">
        <div className="admin-projects__header-content">
          <p className="admin-projects__eyebrow">
            ADMINISTRATION
          </p>

          <h2>Project Overview</h2>

          <p>
            View projects and create new projects across your
            organizations.
          </p>
        </div>

        {/* Header action buttons */}
        <div className="admin-projects__header-actions">
          <button
            type="button"
            className="admin-projects__archived-button"
            onClick={handleViewArchivedProjects}
            disabled={isLoadingOrganizations}
          >
            Archived Projects
          </button>

          <button
            type="button"
            className="admin-projects__primary-button"
            onClick={handleCreateProject}
            disabled={
              isLoadingOrganizations ||
              !selectedOrganizationId
            }
          >
            + Create Project
          </button>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div
          className="admin-projects__message admin-projects__message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div
          className="admin-projects__message admin-projects__message--success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* Organization selector */}
      <section className="admin-projects__organization">
        <label htmlFor="admin-project-organization">
          Select organization
        </label>

        {isLoadingOrganizations ? (
          <p>Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p>No organizations are available.</p>
        ) : (
          <select
            id="admin-project-organization"
            value={selectedOrganizationId}
            onChange={handleOrganizationChange}
          >
            {organizations.map((organization) => {
              const organizationId =
                organization.id ??
                organization.organizationId;

              return (
                <option
                  key={organizationId}
                  value={String(organizationId)}
                >
                  {organization.name ??
                    organization.organizationName ??
                    "Unnamed organization"}
                </option>
              );
            })}
          </select>
        )}

        {selectedOrganization && (
          <p className="admin-projects__organization-name">
            Showing projects for{" "}
            <strong>
              {selectedOrganization.name ??
                selectedOrganization.organizationName ??
                "Selected organization"}
            </strong>
          </p>
        )}
      </section>

      {/* Active project summary */}
      {!isLoadingOrganizations &&
        organizations.length > 0 &&
        !isLoadingProjects && (
          <section
            className="admin-projects__summary"
            aria-label="Project summary"
          >
            <article className="admin-projects__summary-card">
              <span>Total active projects</span>
              <strong>{activeProjects.length}</strong>
            </article>
          </section>
        )}

      {/* Projects list */}
      <section className="admin-projects__list-section">
        <div className="admin-projects__list-header">
          <div>
            <h3>All projects</h3>

            <p>
              Projects belonging to the selected organization.
            </p>
          </div>

          <span className="admin-projects__count">
            {projects.length} project(s)
          </span>
        </div>

        {isLoadingOrganizations ? (
          <div className="admin-projects__empty">
            Loading organizations...
          </div>
        ) : error && !selectedOrganizationId ? (
          <div className="admin-projects__empty">
            Select an organization to view its projects.
          </div>
        ) : isLoadingProjects ? (
          <div className="admin-projects__empty">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-projects__empty">
            No projects found for this organization.
          </div>
        ) : (
          <div className="admin-projects__table-wrapper">
            <table className="admin-projects__table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Description</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.name}</strong>
                    </td>

                    <td>
                      {project.description || "—"}
                    </td>

                    <td>{project.startDate || "—"}</td>

                    <td>{project.endDate || "—"}</td>

                    <td>
                      <span
                        className={`admin-projects__status ${
                          project.archived
                            ? "admin-projects__status--archived"
                            : "admin-projects__status--active"
                        }`}
                      >
                        {project.archived
                          ? "Archived"
                          : "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-projects__row-actions">
                        <button
                          type="button"
                          className="admin-projects__primary-button"
                          onClick={() =>
                            navigate(
                              `/admin/projects/${project.id}?organizationId=${encodeURIComponent(
                                selectedOrganizationId
                              )}`
                            )
                          }
                        >
                          View Details
                        </button>

                        {!project.archived && (
                          <button
                            type="button"
                            className="admin-projects__archived-button"
                            onClick={() =>
                              handleArchiveProject(project)
                            }
                            disabled={
                              archivingProjectId !== null
                            }
                          >
                            {String(archivingProjectId) ===
                            String(project.id)
                              ? "Archiving..."
                              : "Archive"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminProjects;
