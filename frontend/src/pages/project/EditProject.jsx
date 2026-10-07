import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getProjects,
  updateProject,
} from "../../services/projectService";

import { getMyOrganizations } from "../../services/organizationService";

import "./EditProject.css";

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [organizationId, setOrganizationId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setError("");

        const organizations = await getMyOrganizations();

        let foundProject = null;
        let foundOrganizationId = "";

        for (const organization of organizations) {
          const projects = await getProjects(organization.id);

          foundProject = projects.find(
            (item) => item.id === projectId
          );

          if (foundProject) {
            foundOrganizationId = organization.id;
            break;
          }
        }

        if (!foundProject) {
          setError("Project not found.");
          return;
        }

        setProject(foundProject);
        setOrganizationId(foundOrganizationId);

        setName(foundProject.name || "");
        setDescription(foundProject.description || "");
        setStartDate(foundProject.startDate || "");
        setEndDate(foundProject.endDate || "");
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Failed to load project.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProject(
        organizationId,
        projectId,
        {
          name: name.trim(),
          description: description.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
        }
      );

      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Failed to update project:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to update this project."
        );
      } else {
        setError("Failed to update project.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-project-page">
        <p>Loading project...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="edit-project-page">
        <div className="edit-project-error-page">
          <p>{error}</p>

          <button
            type="button"
            className="edit-project-back-button"
            onClick={() => navigate("/projects")}
          >
            &larr; Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-project-page">
      <button
        type="button"
        className="edit-project-back-button"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        &larr; Back to Project
      </button>

      <div className="edit-project-card">
        <div className="edit-project-header">
          <div>
            <h1>Edit Project</h1>
            <p>Update your project information.</p>
          </div>
        </div>

        {error && (
          <div className="edit-project-error">
            {error}
          </div>
        )}

        <form
          className="edit-project-form"
          onSubmit={handleSave}
        >
          <div className="edit-project-field">
            <label htmlFor="edit-project-name">
              Project Name
            </label>

            <input
              id="edit-project-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={isSaving}
              required
            />
          </div>

          <div className="edit-project-field">
            <label htmlFor="edit-project-description">
              Description
            </label>

            <textarea
              id="edit-project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={isSaving}
              rows={5}
            />
          </div>

          <div className="edit-project-date-grid">
            <div className="edit-project-field">
              <label htmlFor="edit-project-start-date">
                Start Date
              </label>

              <input
                id="edit-project-start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                disabled={isSaving}
              />
            </div>

            <div className="edit-project-field">
              <label htmlFor="edit-project-end-date">
                End Date
              </label>

              <input
                id="edit-project-end-date"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="edit-project-actions">
            <button
              type="button"
              className="edit-project-cancel-button"
              onClick={() =>
                navigate(`/projects/${projectId}`)
              }
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-project-save-button"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProject;