import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import {
  getTasks,
  updateTask,
} from "../../services/taskService";

import { getSprints } from "../../services/sprintService";

import "./Board.css";

const STATUS_COLUMNS = [
  {
    id: "ef25e678-91e9-4eb8-b8a1-fce9accd840f",
    name: "TODO",
  },
  {
    id: "cf8e322b-86ed-4597-8d4c-dd17dc917273",
    name: "IN PROGRESS",
  },
  {
    id: "4e33e701-a87f-439b-801c-083c4d36d87c",
    name: "REVIEW",
  },
  {
    id: "ceceaeed-5a8f-494f-9005-8c7330eb4e35",
    name: "DONE",
  },
];

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

function Board() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] =
    useState("");

  /*
   * Empty string means:
   * "All Tasks"
   */
  const [sprintId, setSprintId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] =
    useState(false);
  const [isLoadingSprints, setIsLoadingSprints] =
    useState(false);

  const [error, setError] = useState("");

  const [draggedTaskId, setDraggedTaskId] =
    useState(null);

  const [isUpdatingTask, setIsUpdatingTask] =
    useState(false);

  /*
   * Load all organizations and projects.
   */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError("");

        const organizations =
          await getMyOrganizations();

        const allProjects = [];

        for (const organization of organizations) {
          const organizationProjects =
            await getProjects(organization.id);

          organizationProjects.forEach(
            (project) => {
              allProjects.push({
                ...project,
                organizationId:
                  organization.id,
              });
            }
          );
        }

        if (allProjects.length === 0) {
          setError("No projects found.");
          return;
        }

        setProjects(allProjects);

        const firstProject =
          allProjects[0];

        setProjectId(firstProject.id);

        setOrganizationId(
          firstProject.organizationId
        );
      } catch (err) {
        console.error(
          "Failed to load projects:",
          err
        );

        setError(
          "Failed to load projects."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  /*
   * Load sprints whenever the selected
   * project changes.
   */
  useEffect(() => {
    const fetchSprints = async () => {
      if (
        !organizationId ||
        !projectId
      ) {
        setSprints([]);
        setSprintId("");
        return;
      }

      try {
        setIsLoadingSprints(true);
        setError("");

        const projectSprints =
          await getSprints(
            organizationId,
            projectId
          );

        setSprints(
          projectSprints || []
        );

        /*
         * IMPORTANT:
         *
         * Start with "All Tasks" selected.
         *
         * This means when the user opens
         * the Board, all project tasks are
         * visible instead of automatically
         * filtering to the first sprint.
         */
        setSprintId("");
      } catch (err) {
        console.error(
          "Failed to load project sprints:",
          err
        );

        setSprints([]);
        setSprintId("");

        setError(
          "Failed to load project sprints."
        );
      } finally {
        setIsLoadingSprints(false);
      }
    };

    fetchSprints();
  }, [organizationId, projectId]);

  /*
   * Load tasks whenever the selected
   * project changes.
   */
  useEffect(() => {
    const fetchTasks = async () => {
      if (
        !organizationId ||
        !projectId
      ) {
        setTasks([]);
        return;
      }

      try {
        setIsLoadingTasks(true);
        setError("");

        const projectTasks =
          await getTasks(
            organizationId,
            projectId
          );

        setTasks(projectTasks || []);
      } catch (err) {
        console.error(
          "Failed to load project tasks:",
          err
        );

        setError(
          "Failed to load project tasks."
        );

        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [organizationId, projectId]);

  /*
   * Project selection.
   */
  const handleProjectChange = (event) => {
    const selectedProjectId =
      event.target.value;

    const selectedProject =
      projects.find(
        (project) =>
          project.id ===
          selectedProjectId
      );

    if (!selectedProject) {
      return;
    }

    setProjectId(
      selectedProject.id
    );

    setOrganizationId(
      selectedProject.organizationId
    );

    /*
     * Reset to All Tasks whenever
     * the project changes.
     */
    setSprintId("");

    setDraggedTaskId(null);
    setError("");
  };

  /*
   * Sprint selection.
   *
   * Empty string = All Tasks.
   */
  const handleSprintChange = (
    event
  ) => {
    setSprintId(
      event.target.value
    );

    setDraggedTaskId(null);
    setError("");
  };

  /*
   * Open Edit Task page.
   */
  const handleTaskClick = (
    taskId
  ) => {
    navigate(
      `/tasks/${projectId}/${taskId}/edit`
    );
  };

  /*
   * Create a new task.
   */
  const handleCreateTask = () => {
    if (!projectId) {
      return;
    }

    navigate(
      `/tasks/create/${projectId}`
    );
  };

  /*
   * Drag start.
   */
  const handleDragStart = (
    event,
    taskId
  ) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      taskId
    );
  };

  /*
   * Drag end.
   */
  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  /*
   * Allow dropping.
   */
  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";
  };

  /*
   * Handle task drop into a status column.
   */
  const handleDrop = async (
    event,
    newStatusId
  ) => {
    event.preventDefault();

    const taskId =
      event.dataTransfer.getData(
        "text/plain"
      ) || draggedTaskId;

    if (!taskId) {
      return;
    }

    const task = tasks.find(
      (item) =>
        item.id === taskId
    );

    if (!task) {
      setDraggedTaskId(null);
      return;
    }

    if (
      task.statusId ===
      newStatusId
    ) {
      setDraggedTaskId(null);
      return;
    }

    const oldStatusId =
      task.statusId;

    setError("");
    setIsUpdatingTask(true);

    /*
     * Optimistic update.
     */
    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (item) =>
            item.id === taskId
              ? {
                  ...item,
                  statusId:
                    newStatusId,
                }
              : item
        )
    );

    try {
      const updatedTask =
        await updateTask(
          organizationId,
          projectId,
          taskId,
          {
            title: task.title,

            description:
              task.description ||
              null,

            statusId:
              newStatusId,

            priorityId:
              task.priorityId,

            assignedTo:
              task.assignedTo ||
              null,

            dueDate:
              task.dueDate ||
              null,

            position:
              task.position ?? 0,

            /*
             * Preserve the task's
             * existing sprint.
             */
            sprintId:
              task.sprintId ||
              null,
          }
        );

      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (item) =>
              item.id === taskId
                ? updatedTask
                : item
          )
      );
    } catch (err) {
      console.error(
        "Failed to update task status:",
        err
      );

      /*
       * Restore previous status.
       */
      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (item) =>
              item.id === taskId
                ? {
                    ...item,
                    statusId:
                      oldStatusId,
                  }
                : item
          )
      );

      if (
        err.response?.status ===
        403
      ) {
        setError(
          "You do not have permission to update this task."
        );
      } else if (
        err.response?.status ===
        404
      ) {
        setError(
          "Task was not found."
        );
      } else {
        setError(
          "Failed to update task status."
        );
      }
    } finally {
      setDraggedTaskId(null);
      setIsUpdatingTask(false);
    }
  };

  /*
   * Filter tasks based on the selected
   * sprint.
   *
   * sprintId === ""
   *     => ALL TASKS
   *
   * sprintId !== ""
   *     => ONLY TASKS FROM THAT SPRINT
   */
  const visibleTasks =
    sprintId === ""
      ? tasks
      : tasks.filter(
          (task) =>
            task.sprintId ===
            sprintId
        );

  /*
   * Find selected sprint.
   *
   * There is no selected sprint when
   * "All Tasks" is selected.
   */
  const selectedSprint =
    sprints.find(
      (sprint) =>
        sprint.id === sprintId
    );

  if (isLoading) {
    return (
      <div className="board-page">
        <p>
          Loading board...
        </p>
      </div>
    );
  }

  if (
    error &&
    projects.length === 0
  ) {
    return (
      <div className="board-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="board-header">
        <div>
          <h1>Board</h1>

          <p>
            Manage your project tasks.
          </p>

          {/* ============================
              PROJECT SELECTOR
          ============================ */}

          <div className="board-project-selector">
            <label htmlFor="board-project">
              Project
            </label>

            <select
              id="board-project"
              value={projectId}
              onChange={
                handleProjectChange
              }
            >
              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name ||
                      "Unnamed Project"}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ============================
              SPRINT SELECTOR
          ============================ */}

          <div className="board-project-selector">
            <label htmlFor="board-sprint">
              Sprint
            </label>

            <select
              id="board-sprint"
              value={sprintId}
              onChange={
                handleSprintChange
              }
              disabled={
                isLoadingSprints
              }
            >
              {/* 
               * NEW:
               * All Tasks option.
               */}
              <option value="">
                All Tasks
              </option>

              {sprints.map(
                (sprint) => (
                  <option
                    key={sprint.id}
                    value={sprint.id}
                  >
                    {sprint.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleCreateTask
          }
          disabled={!projectId}
        >
          + New Task
        </button>
      </div>

      {/* ================================
          SELECTED SPRINT INFORMATION
      ================================= */}

      {selectedSprint && (
        <div className="board-sprint-info">
          <strong>
            {selectedSprint.name}
          </strong>

          {selectedSprint.goal && (
            <span>
              {selectedSprint.goal}
            </span>
          )}
        </div>
      )}

      {/* 
       * When All Tasks is selected,
       * show a small information message.
       */}
      {!selectedSprint &&
        sprintId === "" &&
        !isLoadingSprints && (
          <div className="board-sprint-info">
            <strong>
              All Tasks
            </strong>

            <span>
              Showing all tasks for this
              project.
            </span>
          </div>
        )}

      {error && (
        <p className="board-error">
          {error}
        </p>
      )}

      {isUpdatingTask && (
        <p className="board-saving">
          Updating task...
        </p>
      )}

      {/* ================================
          BOARD CONTENT
      ================================= */}

      {isLoadingTasks ||
      isLoadingSprints ? (
        <div className="board-empty">
          Loading board...
        </div>
      ) : !projectId ? (
        <div className="board-empty">
          <h3>
            No Project Selected
          </h3>

          <p>
            Select a project to view
            its tasks.
          </p>
        </div>
      ) : (
        <div className="board-columns">
          {STATUS_COLUMNS.map(
            (column) => {
              const columnTasks =
                visibleTasks.filter(
                  (task) =>
                    task.statusId ===
                    column.id
                );

              return (
                <div
                  key={column.id}
                  className="board-column"
                  onDragOver={
                    handleDragOver
                  }
                  onDrop={(event) =>
                    handleDrop(
                      event,
                      column.id
                    )
                  }
                >
                  <div className="board-column-header">
                    <h2>
                      {column.name}
                    </h2>

                    <span>
                      {
                        columnTasks.length
                      }
                    </span>
                  </div>

                  <div className="board-column-content">
                    {columnTasks.length ===
                    0 ? (
                      <div className="board-empty">
                        Drop tasks here
                      </div>
                    ) : (
                      columnTasks.map(
                        (task) => (
                          <div
                            key={task.id}
                            className={`board-task-card ${
                              draggedTaskId ===
                              task.id
                                ? "board-task-card-dragging"
                                : ""
                            }`}
                            draggable
                            onDragStart={(
                              event
                            ) =>
                              handleDragStart(
                                event,
                                task.id
                              )
                            }
                            onDragEnd={
                              handleDragEnd
                            }
                            onClick={() =>
                              handleTaskClick(
                                task.id
                              )
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                handleTaskClick(
                                  task.id
                                );
                              }
                            }}
                          >
                            <h3>
                              {task.title}
                            </h3>

                            <p>
                              {task.description ||
                                "No description available."}
                            </p>

                            <div className="board-task-meta">
                              <span>
                                {PRIORITY_NAMES[
                                  task.priorityId
                                ] ||
                                  "Unknown"}
                              </span>

                              <span>
                                Due:{" "}
                                {task.dueDate ||
                                  "Not set"}
                              </span>
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default Board;