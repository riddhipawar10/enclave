
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getAllOrganizationsForPlatformAdmin } from "../../services/organizationService";
import {
  getArchivedProjects,
  restoreProject,
} from "../../services/projectService";

import "./AdminArchivedProjects.css";

function AdminArchivedProjects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState(
    searchParams.get("organizationId") || ""
  );
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrganizations() {
      try {
        const data = await getAllOrganizationsForPlatformAdmin();
        const list = Array.isArray(data) ? data : [];

        if (!isMounted) return;

        setOrganizations(list);

        const requestedId = searchParams.get("organizationId");
        const matchingOrganization = list.find(
          (item) =>
            String(item.id ?? item.organizationId) === requestedId
        );

        const selected = matchingOrganization ?? list[0];
        const selectedId = selected?.id ?? selected?.organizationId;

        setOrganizationId(selectedId ? String(selectedId) : "");
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view organizations."
              : "Failed to load organizations."
          );
        }
      }
    }

    loadOrganizations();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadArchivedProjects() {
      if (!organizationId) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await getArchivedProjects(organizationId);

        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setProjects([]);
          setError(
            err?.response?.status === 403
              ? "You don't have permission to view archived projects."
              : "Failed to load archived projects."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArchivedProjects();

    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleOrganizationChange = (event) => {
    const nextId = event.target.value;
    setOrganizationId(nextId);
    setError("");
    setMessage("");

    navigate(
      nextId
        ? `/admin/projects/archived?organizationId=${encodeURIComponent(nextId)}`
        : "/admin/projects/archived",
      { replace: true }
    );
  };

  const handleRestore = async (project) => {
    if (!organizationId || restoringId) return;

    const confirmed = window.confirm(
      `Restore "${project.name}"?\n\nIt will appear in the active projects list again.`
    );

    if (!confirmed) return;

    try {
      setRestoringId(String(project.id));
      setError("");
      setMessage("");

      await restoreProject(organizationId, project.id);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );
      setMessage(`"${project.name}" was restored successfully.`);
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to restore this project."
          : err?.response?.data?.message ||
            "Failed to restore the project. Please try again."
      );
    } finally {
      setRestoringId("");
    }
  };

  return (
    <div className="admin-archived-projects">
      <header className="admin-archived-projects__header">
        <div>
          <p className="admin-archived-projects__eyebrow">
            ADMINISTRATION / PROJECTS
          </p>
          <h2>Archived Projects</h2>
          <p>View archived projects and restore them when needed.</p>
        </div>

        <button
          type="button"
          className="admin-archived-projects__back"
          onClick={() =>
            navigate(
              organizationId
                ? `/admin/projects?organizationId=${encodeURIComponent(organizationId)}`
                : "/admin/projects"
            )
          }
        >
          Back to Projects
        </button>
      </header>

      {error && (
        <div className="admin-archived-projects__message admin-archived-projects__message--error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-archived-projects__message admin-archived-projects__message--success" role="status">
          {message}
        </div>
      )}

      <section className="admin-archived-projects__panel">
        <label htmlFor="archived-organization">
          Select organization
        </label>

        <select
          id="archived-organization"
          value={organizationId}
          onChange={handleOrganizationChange}
          disabled={organizations.length === 0}
        >
          {organizations.length === 0 && (
            <option value="">No organizations available</option>
          )}

          {organizations.map((organization) => {
            const id = organization.id ?? organization.organizationId;

            return (
              <option key={id} value={String(id)}>
                {organization.name ?? organization.organizationName ?? "Unnamed organization"}
              </option>
            );
          })}
        </select>
      </section>

      <section className="admin-archived-projects__panel">
        <div className="admin-archived-projects__list-header">
          <div>
            <h3>Archived projects</h3>
            <p>Restoring a project returns it to the active Projects list.</p>
          </div>
          <span>{projects.length} project(s)</span>
        </div>

        {isLoading ? (
          <p className="admin-archived-projects__empty">Loading archived projects...</p>
        ) : projects.length === 0 ? (
          <p className="admin-archived-projects__empty">
            No archived projects found for this organization.
          </p>
        ) : (
          <div className="admin-archived-projects__table-wrapper">
            <table className="admin-archived-projects__table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Description</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td><strong>{project.name}</strong></td>
                    <td>{project.description || "—"}</td>
                    <td>{project.startDate || "—"}</td>
                    <td>{project.endDate || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-archived-projects__restore"
                        onClick={() => handleRestore(project)}
                        disabled={Boolean(restoringId)}
                      >
                        {restoringId === String(project.id)
                          ? "Restoring..."
                          : "Restore"}
                      </button>
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

export default AdminArchivedProjects;
