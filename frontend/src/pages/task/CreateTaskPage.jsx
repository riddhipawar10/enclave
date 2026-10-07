import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CreateTask from "./CreateTask";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  getProjects,
} from "../../services/projectService";

import "./CreateTaskPage.css";

function CreateTaskPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] =
    useState("");

  const [projectName, setProjectName] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setError("");

        const organizations =
          await getMyOrganizations();

        for (const organization of organizations) {
          const projects =
            await getProjects(
              organization.id
            );

          const project =
            projects.find(
              (item) =>
                item.id === projectId
            );

          if (project) {
            setOrganizationId(
              organization.id
            );

            setProjectName(
              project.name || "Project"
            );

            return;
          }
        }

        setError(
          "Project not found."
        );
      } catch (err) {
        console.error(
          "Failed to load project:",
          err
        );

        setError(
          "Failed to load project."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchOrganization();
    } else {
      setError(
        "Project ID is missing."
      );

      setIsLoading(false);
    }
  }, [projectId]);

  const handleCreated = () => {
    navigate("/tasks");
  };

  if (isLoading) {
    return (
      <div className="create-task-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-task-page">
        <button
          type="button"
          className="create-task-back-button"
          onClick={() =>
            navigate("/tasks")
          }
        >
          &larr; Back to Tasks
        </button>

        <div className="create-task-page-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="create-task-page">
      <button
        type="button"
        className="create-task-back-button"
        onClick={() =>
          navigate("/tasks")
        }
      >
        &larr; Back to Tasks
      </button>

      <div className="create-task-page-header">
        <h1>New Task</h1>

        <p>
          Create a task for{" "}
          <strong>
            {projectName}
          </strong>
          .
        </p>
      </div>

      <CreateTask
        organizationId={organizationId}
        projectId={projectId}
        onCreated={handleCreated}
      />
    </div>
  );
}

export default CreateTaskPage;