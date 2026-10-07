import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { createProject } from "../../services/projectService";

import "./CreateProject.css";

function CreateProject() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] =
    useState("");

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");

  const [
    isLoadingOrganizations,
    setIsLoadingOrganizations,
  ] = useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchOrganizations =
      async () => {
        try {
          const data =
            await getMyOrganizations();

          setOrganizations(data);

          if (data.length === 1) {
            setOrganizationId(
              data[0].id
            );
          }
        } catch (err) {
          console.error(
            "Failed to load organizations:",
            err
          );

          setError(
            "Failed to load your organizations."
          );
        } finally {
          setIsLoadingOrganizations(
            false
          );
        }
      };

    fetchOrganizations();
  }, []);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!organizationId) {
      setError(
        "Please select an organization."
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Project name is required."
      );
      return;
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    setIsSaving(true);

    try {
      await createProject(
        organizationId,
        {
          name: name.trim(),
          description:
            description.trim(),
          startDate:
            startDate || null,
          endDate:
            endDate || null,
        }
      );

      navigate("/projects");
    } catch (err) {
      console.error(
        "Failed to create project:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to create projects in this organization."
        );
      } else {
        setError(
          "Failed to create project."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-project-page">
      <button
        type="button"
        className="create-project-back"
        onClick={() =>
          navigate("/projects")
        }
      >
        &larr; Back to Projects
      </button>

      <div className="create-project-header">
        <h1>Create Project</h1>

        <p>
          Create a new project for your
          organization.
        </p>
      </div>

      {error && (
        <p className="create-project-error">
          {error}
        </p>
      )}

      <div className="create-project-card">
        <form
          className="create-project-form"
          onSubmit={handleSubmit}
        >
          <div className="create-project-field">
            <label htmlFor="project-organization">
              Organization
            </label>

            {isLoadingOrganizations ? (
              <p className="create-project-loading">
                Loading organizations...
              </p>
            ) : (
              <select
                id="project-organization"
                value={organizationId}
                onChange={(event) =>
                  setOrganizationId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select an organization
                </option>

                {organizations.map(
                  (organization) => (
                    <option
                      key={
                        organization.id
                      }
                      value={
                        organization.id
                      }
                    >
                      {organization.name}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          <div className="create-project-field">
            <label htmlFor="project-name">
              Project Name
            </label>

            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter project name"
            />
          </div>

          <div className="create-project-field">
            <label htmlFor="project-description">
              Description
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Enter project description"
            />
          </div>

          <div className="create-project-date-row">
            <div className="create-project-field">
              <label htmlFor="project-start-date">
                Start Date
              </label>

              <input
                id="project-start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="create-project-field">
              <label htmlFor="project-end-date">
                End Date
              </label>

              <input
                id="project-end-date"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="create-project-actions">
            <button
              type="button"
              className="create-project-cancel"
              onClick={() =>
                navigate("/projects")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-project-submit"
              disabled={
                isSaving ||
                isLoadingOrganizations
              }
            >
              {isSaving
                ? "Creating..."
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;