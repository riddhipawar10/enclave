import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import {
  getSprints,
  deleteSprint,
} from "../../services/sprintService";

import "./Sprints.css";

function Sprints() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [sprints, setSprints] = useState([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);
  const [isLoadingProjects, setIsLoadingProjects] =
    useState(false);
  const [isLoadingSprints, setIsLoadingSprints] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setError("");

        const data = await getMyOrganizations();

        setOrganizations(data);

        if (data.length > 0) {
          setSelectedOrganizationId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load organizations:", err);
        setError("Failed to load organizations.");
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setProjects([]);
      setSelectedProjectId("");
      return;
    }

    const loadProjects = async () => {
      try {
        setError("");
        setIsLoadingProjects(true);

        const data = await getProjects(selectedOrganizationId);

        setProjects(data);

        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        } else {
          setSelectedProjectId("");
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Failed to load projects.");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId || !selectedProjectId) {
      setSprints([]);
      return;
    }

    const loadSprints = async () => {
      try {
        setError("");
        setIsLoadingSprints(true);

        const data = await getSprints(
          selectedOrganizationId,
          selectedProjectId
        );

        setSprints(data);
      } catch (err) {
        console.error("Failed to load sprints:", err);
        setError("Failed to load sprints.");
      } finally {
        setIsLoadingSprints(false);
      }
    };

    loadSprints();
  }, [selectedOrganizationId, selectedProjectId]);

  const handleDelete = async (sprintId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sprint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteSprint(
        selectedOrganizationId,
        selectedProjectId,
        sprintId
      );

      setSprints((currentSprints) =>
        currentSprints.filter(
          (sprint) => sprint.id !== sprintId
        )
      );
    } catch (err) {
      console.error("Failed to delete sprint:", err);
      setError("Failed to delete sprint.");
    }
  };

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  if (isLoadingOrganizations) {
    return (
      <div className="sprints-page">
        <p className="sprints-loading">
          Loading organizations...
        </p>
      </div>
    );
  }

  return (
    <div className="sprints-page">
      <div className="sprints-header">
        <div>
          <h1>Sprints</h1>
          <p>
            Plan, organize, and track work across your project
            sprints.
          </p>
        </div>

        {selectedProjectId && (
          <button
            type="button"
            className="sprints-create-button"
            onClick={() =>
              navigate(
                `/sprints/create/${selectedOrganizationId}/${selectedProjectId}`
              )
            }
          >
            + Create Sprint
          </button>
        )}
      </div>

      <div className="sprints-filters">
        <div className="sprints-filter">
          <label htmlFor="organization">
            Organization
          </label>

          <select
            id="organization"
            value={selectedOrganizationId}
            onChange={(event) =>
              setSelectedOrganizationId(event.target.value)
            }
          >
            {organizations.map((organization) => (
              <option
                key={organization.id}
                value={organization.id}
              >
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sprints-filter">
          <label htmlFor="project">
            Project
          </label>

          <select
            id="project"
            value={selectedProjectId}
            onChange={(event) =>
              setSelectedProjectId(event.target.value)
            }
            disabled={
              isLoadingProjects || projects.length === 0
            }
          >
            {projects.length === 0 ? (
              <option value="">
                No projects available
              </option>
            ) : (
              projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="sprints-error">
          {error}
        </div>
      )}

      {selectedProject && (
        <div className="sprints-project-info">
          <div>
            <span className="sprints-project-label">
              Project
            </span>

            <h2>{selectedProject.name}</h2>
          </div>

          <p>
            {selectedProject.description ||
              "No project description available."}
          </p>
        </div>
      )}

      {isLoadingProjects || isLoadingSprints ? (
        <div className="sprints-empty-state">
          <p>Loading sprints...</p>
        </div>
      ) : !selectedProjectId ? (
        <div className="sprints-empty-state">
          <h2>No project selected</h2>
          <p>
            Select a project to view its sprints.
          </p>
        </div>
      ) : sprints.length === 0 ? (
        <div className="sprints-empty-state">
          <h2>No sprints yet</h2>
          <p>
            Create your first sprint for this project.
          </p>

          <button
            type="button"
            className="sprints-empty-create-button"
            onClick={() =>
              navigate(
                `/sprints/create/${selectedOrganizationId}/${selectedProjectId}`
              )
            }
          >
            Create Sprint
          </button>
        </div>
      ) : (
        <div className="sprints-grid">
          {sprints.map((sprint) => (
            <article
              key={sprint.id}
              className="sprint-card"
            >
              <div className="sprint-card-header">
                <div>
                  <h2>{sprint.name}</h2>

                  <span
                    className={`sprint-status sprint-status-${sprint.status.toLowerCase()}`}
                  >
                    {sprint.status}
                  </span>
                </div>
              </div>

              <p className="sprint-goal">
                {sprint.goal ||
                  "No sprint goal provided."}
              </p>

              <div className="sprint-dates">
                <div>
                  <span>Start Date</span>
                  <strong>{sprint.startDate}</strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>{sprint.endDate}</strong>
                </div>
              </div>

              <div className="sprint-card-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/sprints/${selectedOrganizationId}/${selectedProjectId}/${sprint.id}/edit`
                    )
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="sprint-delete-button"
                  onClick={() =>
                    handleDelete(sprint.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sprints;