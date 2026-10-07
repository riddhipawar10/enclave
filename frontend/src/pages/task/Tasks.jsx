import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import {
  getTasks,
  markTaskAsCompleted,
  deleteTask,
} from "../../services/taskService";

import "./Tasks.css";

const STATUS_NAMES = {
  "ef25e678-91e9-4eb8-b8a1-fce9accd840f": "TODO",
  "cf8e322b-86ed-4597-8d4c-dd17dc917273":
    "IN PROGRESS",
  "4e33e701-a87f-439b-801c-083c4d36d87c":
    "REVIEW",
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35":
    "DONE",
};

const PRIORITY_NAMES = {
  "81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a":
    "LOW",
  "ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b":
    "MEDIUM",
  "ccb1a560-2cfe-4b5f-9fe3-d8af19196e55":
    "HIGH",
  "17153d97-f8bc-4fc6-8b41-abf279b98152":
    "URGENT",
};

const DONE_STATUS_ID =
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35";

function Tasks() {
  const navigate = useNavigate();

  const [projectGroups, setProjectGroups] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingTaskId, setDeletingTaskId] =
    useState("");

  const [completingTaskId, setCompletingTaskId] =
    useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError("");

        const organizations =
          await getMyOrganizations();

        const groups = [];

        for (const organization of organizations) {
          const projects = await getProjects(
            organization.id
          );

          for (const project of projects) {
            const tasks = await getTasks(
              organization.id,
              project.id
            );

            groups.push({
              organizationId:
                organization.id,
              projectId: project.id,
              projectName: project.name,
              tasks,
            });
          }
        }

        setProjectGroups(groups);
      } catch (err) {
        console.error(
          "Failed to load tasks:",
          err
        );

        setError("Failed to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = (projectId) => {
    navigate(`/tasks/create/${projectId}`);
  };

  const handleEditTask = (
    projectId,
    taskId
  ) => {
    navigate(
      `/tasks/${projectId}/${taskId}/edit`
    );
  };

  const handleCompleteTask = async (
    organizationId,
    projectId,
    task
  ) => {
    if (task.statusId === DONE_STATUS_ID) {
      return;
    }

    setCompletingTaskId(task.id);
    setError("");

    try {
      const updatedTask =
        await markTaskAsCompleted(
          organizationId,
          projectId,
          task
        );

      setProjectGroups(
        (currentGroups) =>
          currentGroups.map((group) => {
            if (
              group.projectId !== projectId
            ) {
              return group;
            }

            return {
              ...group,
              tasks: group.tasks.map(
                (currentTask) =>
                  currentTask.id === task.id
                    ? {
                        ...currentTask,
                        ...updatedTask,
                        statusId:
                          DONE_STATUS_ID,
                      }
                    : currentTask
              ),
            };
          })
      );
    } catch (err) {
      console.error(
        "Failed to complete task:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to complete this task."
        );
      } else if (
        err.response?.status === 404
      ) {
        setError("Task was not found.");
      } else {
        setError(
          "Failed to mark task as completed."
        );
      }
    } finally {
      setCompletingTaskId("");
    }
  };

  const handleDeleteTask = async (
    organizationId,
    projectId,
    taskId,
    taskTitle
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${taskTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(taskId);
    setError("");

    try {
      await deleteTask(
        organizationId,
        projectId,
        taskId
      );

      setProjectGroups(
        (currentGroups) =>
          currentGroups.map((group) => {
            if (
              group.projectId !== projectId
            ) {
              return group;
            }

            return {
              ...group,
              tasks: group.tasks.filter(
                (task) =>
                  task.id !== taskId
              ),
            };
          })
      );
    } catch (err) {
      console.error(
        "Failed to delete task:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to delete this task."
        );
      } else if (
        err.response?.status === 404
      ) {
        setError("Task was not found.");
      } else {
        setError(
          "Failed to delete task."
        );
      }
    } finally {
      setDeletingTaskId("");
    }
  };

  const totalTasks =
    projectGroups.reduce(
      (total, group) =>
        total + group.tasks.length,
      0
    );

  if (isLoading) {
    return (
      <div className="tasks-page">
        <div className="tasks-loading">
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>

          <p>
            Manage tasks across your
            projects.
          </p>
        </div>

        <div className="tasks-summary">
          {totalTasks}{" "}
          {totalTasks === 1
            ? "task"
            : "tasks"}
        </div>
      </div>

      {error && (
        <div className="tasks-error">
          {error}
        </div>
      )}

      {!error &&
        projectGroups.length === 0 && (
          <div className="tasks-empty">
            <h2>No projects found</h2>

            <p>
              Create a project to start
              managing tasks.
            </p>
          </div>
        )}

      <div className="tasks-projects">
        {projectGroups.map((group) => (
          <section
            key={group.projectId}
            className="tasks-project-section"
          >
            <div className="tasks-project-header">
              <div>
                <h2>
                  {group.projectName ||
                    "Unnamed Project"}
                </h2>

                <span>
                  {group.tasks.length}{" "}
                  {group.tasks.length === 1
                    ? "task"
                    : "tasks"}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCreateTask(
                    group.projectId
                  )
                }
              >
                + New Task
              </button>
            </div>

            {group.tasks.length === 0 ? (
              <div className="tasks-project-empty">
                <p>
                  No tasks in this
                  project.
                </p>
              </div>
            ) : (
              <div className="task-list">
                {group.tasks.map((task) => {
                  const isCompleted =
                    task.statusId ===
                    DONE_STATUS_ID;

                  const isCompleting =
                    completingTaskId ===
                    task.id;

                  const isDeleting =
                    deletingTaskId ===
                    task.id;

                  const isBusy =
                    isCompleting ||
                    isDeleting;

                  return (
                    <article
                      key={task.id}
                      className="task-card"
                    >
                      <div className="task-card-main">
                        <h3>
                          {task.title}
                        </h3>

                        <p>
                          {task.description ||
                            "No description available."}
                        </p>
                      </div>

                      <div className="task-card-info">
                        <span className="task-status">
                          {STATUS_NAMES[
                            task.statusId
                          ] || "Unknown"}
                        </span>

                        <span className="task-priority">
                          {PRIORITY_NAMES[
                            task.priorityId
                          ] || "Unknown"}
                        </span>

                        <span className="task-due-date">
                          Due:{" "}
                          {task.dueDate ||
                            "Not set"}
                        </span>
                      </div>

                      <div className="task-card-actions">
                        <button
                          type="button"
                          className="task-complete-button"
                          onClick={() =>
                            handleCompleteTask(
                              group.organizationId,
                              group.projectId,
                              task
                            )
                          }
                          disabled={
                            isBusy ||
                            isCompleted
                          }
                        >
                          {isCompleting
                            ? "Completing..."
                            : isCompleted
                            ? "✓ Completed"
                            : "Mark as Completed"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditTask(
                              group.projectId,
                              task.id
                            )
                          }
                          disabled={isBusy}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="task-delete-button"
                          onClick={() =>
                            handleDeleteTask(
                              group.organizationId,
                              group.projectId,
                              task.id,
                              task.title
                            )
                          }
                          disabled={isBusy}
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default Tasks;