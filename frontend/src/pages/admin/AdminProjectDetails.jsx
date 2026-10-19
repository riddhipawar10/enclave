
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getProjectById,
  archiveProject,
  restoreProject,
} from "../../services/projectService";

import { getAllOrganizationsForPlatformAdmin } from "../../services/organizationService";

import "./AdminProjectDetails.css";

function AdminProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  const [project, setProject] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProjectDetails() {
      if (!organizationId || !projectId) {
        setError("Organization or project information is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [projectData, organizations] = await Promise.all([
          getProjectById(organizationId, projectId),
          getAllOrganizationsForPlatformAdmin(),
        ]);

        if (!isMounted) return;

        setProject(projectData);

        const organizationList = Array.isArray(organizations)
          ? organizations
          : [];

        const organization = organizationList.find(
          (item) =>
            String(item.id ?? item.organizationId) ===
            String(organizationId)
        );

        setOrganizationName(
          organization?.name ??
            organization?.organizationName ??
            "Organization"
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view this project."
              : err?.response?.status === 404
                ? "Project not found."
                : "Failed to load project details. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjectDetails();

    return () => {
      isMounted = false;
    };
  }, [organizationId, projectId]);

  const goBack = () => {
    navigate(
      organizationId
        ? `/admin/projects?organizationId=${encodeURIComponent(
            organizationId
          )}`
        : "/admin/projects"
    );
  };

  const goToEditProject = () => {
    navigate(
      `/admin/projects/${project.id}/edit?organizationId=${encodeURIComponent(
        organizationId
      )}`
    );
  };

  const handleArchiveProject = async () => {
    if (!organizationId || !project?.id || isArchiving) {
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
      setIsArchiving(true);
      setError("");
      setMessage("");

      const archivedProject = await archiveProject(
        organizationId,
        project.id
      );

      setProject(archivedProject);
      setMessage("Project archived successfully.");
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to archive this project."
          : err?.response?.status === 404
            ? "Project not found."
            : err?.response?.data?.message ||
              "Failed to archive the project. Please try again."
      );
    } finally {
      setIsArchiving(false);
    }
  };

  // Restore an archived project.
  const handleRestoreProject = async () => {
    if (!organizationId || !project?.id || isRestoring) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to restore "${project.name}"?\n\n` +
        "The project will become active again."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRestoring(true);
      setError("");
      setMessage("");

      const restoredProject = await restoreProject(
        organizationId,
        project.id
      );

      setProject(restoredProject);
      setMessage("Project restored successfully.");
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to restore this project."
          : err?.response?.status === 404
            ? "Project not found."
            : err?.response?.data?.message ||
              "Failed to restore the project. Please try again."
      );
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-project-details">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="admin-project-details">
        <button
          type="button"
          className="admin-project-details__back"
          onClick={goBack}
        >
          ← Back to Projects
        </button>

        <div className="admin-project-details__error" role="alert">
          {error || "Project details are unavailable."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-project-details">
      <button
        type="button"
        className="admin-project-details__back"
        onClick={goBack}
      >
        ← Back to Projects
      </button>

      <header className="admin-project-details__header">
        <div>
          <p className="admin-project-details__eyebrow">
            ADMINISTRATION / PROJECTS
          </p>

          <h2>{project.name}</h2>

          <p className="admin-project-details__subtitle">
            Detailed information about this project.
          </p>
        </div>

        <div className="admin-project-details__header-actions">
          <span
            className={`admin-project-details__status ${
              project.archived
                ? "admin-project-details__status--archived"
                : "admin-project-details__status--active"
            }`}
          >
            {project.archived ? "Archived" : "Active"}
          </span>

          {!project.archived && (
            <>
              <button
                type="button"
                className="admin-project-details__edit"
                onClick={goToEditProject}
              >
                Edit Project
              </button>

              <button
                type="button"
                className="admin-project-details__archive"
                onClick={handleArchiveProject}
                disabled={isArchiving}
              >
                {isArchiving ? "Archiving..." : "Archive Project"}
              </button>
            </>
          )}

          {project.archived && (
            <button
              type="button"
              className="admin-project-details__restore"
              onClick={handleRestoreProject}
              disabled={isRestoring}
            >
              {isRestoring ? "Restoring..." : "Restore Project"}
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="admin-project-details__success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-project-details__error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-project-details__card">
        <h3>Project Information</h3>

        <div className="admin-project-details__grid">
          <div className="admin-project-details__field">
            <span>Project name</span>
            <strong>{project.name || "—"}</strong>
          </div>

          <div className="admin-project-details__field">
            <span>Organization</span>
            <strong>{organizationName}</strong>
          </div>

          <div className="admin-project-details__field admin-project-details__field--full">
            <span>Description</span>
            <p>{project.description || "No description provided."}</p>
          </div>

          <div className="admin-project-details__field">
            <span>Start date</span>
            <strong>{project.startDate || "Not set"}</strong>
          </div>

          <div className="admin-project-details__field">
            <span>End date</span>
            <strong>{project.endDate || "Not set"}</strong>
          </div>

          <div className="admin-project-details__field">
            <span>Project ID</span>
            <strong className="admin-project-details__id">
              {project.id || "—"}
            </strong>
          </div>

          <div className="admin-project-details__field">
            <span>Created by (User ID)</span>
            <strong className="admin-project-details__id">
              {project.createdBy || "—"}
            </strong>
          </div>

          <div className="admin-project-details__field">
            <span>Created at</span>
            <strong>{project.createdAt || "—"}</strong>
          </div>

          <div className="admin-project-details__field">
            <span>Last updated</span>
            <strong>{project.updatedAt || "—"}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminProjectDetails;
