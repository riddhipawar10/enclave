import { useEffect, useState } from "react";
import {
  useLocation,
} from "react-router-dom";

import { createTask } from "../../services/taskService";
import { getSprints } from "../../services/sprintService";

import "./CreateTask.css";

function CreateTask({
  organizationId,
  projectId,
  onCreated,
}) {
  const location = useLocation();

  /*
   * Values passed from Calendar.
   *
   * Example:
   * {
   *   dueDate: "2026-11-10",
   *   sprintId: "some-sprint-id"
   * }
   */
  const calendarDueDate =
    location.state?.dueDate || "";

  const calendarSprintId =
    location.state?.sprintId || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [statusId, setStatusId] =
    useState("");
  const [priorityId, setPriorityId] =
    useState("");
  const [assignedTo, setAssignedTo] =
    useState("");

  /*
   * Use the date supplied by Calendar
   * when available.
   */
  const [dueDate, setDueDate] =
    useState(calendarDueDate);

  /*
   * Use the sprint supplied by Calendar
   * when available.
   */
  const [sprintId, setSprintId] =
    useState(calendarSprintId);

  const [sprints, setSprints] =
    useState([]);

  const [
    isLoadingSprints,
    setIsLoadingSprints,
  ] = useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Load project sprints.
   */
  useEffect(() => {
    const loadSprints = async () => {
      try {
        setIsLoadingSprints(true);

        const data = await getSprints(
          organizationId,
          projectId
        );

        const loadedSprints =
          data || [];

        setSprints(loadedSprints);

        /*
         * If Calendar supplied a sprint,
         * keep that sprint selected.
         *
         * Otherwise don't automatically
         * select anything.
         */
        if (calendarSprintId) {
          const sprintExists =
            loadedSprints.some(
              (sprint) =>
                sprint.id ===
                calendarSprintId
            );

          if (sprintExists) {
            setSprintId(
              calendarSprintId
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load sprints:",
          err
        );

        setError(
          "Failed to load sprints."
        );
      } finally {
        setIsLoadingSprints(false);
      }
    };

    if (
      organizationId &&
      projectId
    ) {
      loadSprints();
    }
  }, [
    organizationId,
    projectId,
    calendarSprintId,
  ]);

  /*
   * Create task.
   */
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    if (!statusId) {
      setError(
        "Please select a status."
      );
      return;
    }

    if (!priorityId) {
      setError(
        "Please select a priority."
      );
      return;
    }

    setIsSaving(true);

    try {
      const task =
        await createTask(
          organizationId,
          projectId,
          {
            title: title.trim(),
            description:
              description.trim(),
            statusId,
            priorityId,
            assignedTo:
              assignedTo || null,
            dueDate:
              dueDate || null,
            sprintId:
              sprintId || null,
          }
        );

      /*
       * Reset form after
       * successful creation.
       */
      setTitle("");
      setDescription("");
      setStatusId("");
      setPriorityId("");
      setAssignedTo("");
      setDueDate("");
      setSprintId("");

      if (onCreated) {
        onCreated(task);
      }
    } catch (err) {
      console.error(
        "Failed to create task:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "Failed to create task."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="create-task-form"
      onSubmit={handleSubmit}
    >
      <h2>Create Task</h2>

      {error && (
        <div className="create-task-error">
          {error}
        </div>
      )}

      {/* =========================
          TITLE
         ========================= */}

      <div className="create-task-field">
        <label htmlFor="task-title">
          Title
        </label>

        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Enter task title"
          disabled={isSaving}
        />
      </div>

      {/* =========================
          DESCRIPTION
         ========================= */}

      <div className="create-task-field">
        <label htmlFor="task-description">
          Description
        </label>

        <textarea
          id="task-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Describe the task"
          rows={5}
          disabled={isSaving}
        />
      </div>

      {/* =========================
          STATUS + PRIORITY
         ========================= */}

      <div className="create-task-grid">
        <div className="create-task-field">
          <label htmlFor="task-status">
            Status
          </label>

          <select
            id="task-status"
            value={statusId}
            onChange={(event) =>
              setStatusId(
                event.target.value
              )
            }
            disabled={isSaving}
          >
            <option value="">
              Select status
            </option>

            <option value="ef25e678-91e9-4eb8-b8a1-fce9accd840f">
              TODO
            </option>

            <option value="cf8e322b-86ed-4597-8d4c-dd17dc917273">
              IN PROGRESS
            </option>

            <option value="4e33e701-a87f-439b-801c-083c4d36d87c">
              REVIEW
            </option>

            <option value="ceceaeed-5a8f-494f-9005-8c7330eb4e35">
              DONE
            </option>
          </select>
        </div>

        <div className="create-task-field">
          <label htmlFor="task-priority">
            Priority
          </label>

          <select
            id="task-priority"
            value={priorityId}
            onChange={(event) =>
              setPriorityId(
                event.target.value
              )
            }
            disabled={isSaving}
          >
            <option value="">
              Select priority
            </option>

            <option value="81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a">
              LOW
            </option>

            <option value="ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b">
              MEDIUM
            </option>

            <option value="ccb1a560-2cfe-4b5f-9fe3-d8af19196e55">
              HIGH
            </option>

            <option value="17153d97-f8bc-4fc6-8b41-abf279b98152">
              URGENT
            </option>
          </select>
        </div>
      </div>

      {/* =========================
          SPRINT
         ========================= */}

      <div className="create-task-field">
        <label htmlFor="task-sprint">
          Sprint
        </label>

        <select
          id="task-sprint"
          value={sprintId}
          onChange={(event) =>
            setSprintId(
              event.target.value
            )
          }
          disabled={
            isSaving ||
            isLoadingSprints
          }
        >
          <option value="">
            No Sprint
          </option>

          {sprints.map(
            (sprint) => (
              <option
                key={sprint.id}
                value={sprint.id}
              >
                {sprint.name}
                {sprint.status ===
                "ACTIVE"
                  ? " (Active)"
                  : ""}
              </option>
            )
          )}
        </select>

        {isLoadingSprints && (
          <small>
            Loading sprints...
          </small>
        )}

        {!isLoadingSprints &&
          sprints.length === 0 && (
            <small>
              No sprints have been
              created for this project
              yet.
            </small>
          )}
      </div>

      {/* =========================
          ASSIGNEE + DUE DATE
         ========================= */}

      <div className="create-task-grid">
        <div className="create-task-field">
          <label htmlFor="task-assigned-to">
            Assigned To
          </label>

          <input
            id="task-assigned-to"
            type="text"
            value={assignedTo}
            onChange={(event) =>
              setAssignedTo(
                event.target.value
              )
            }
            placeholder="User ID (optional)"
            disabled={isSaving}
          />
        </div>

        <div className="create-task-field">
          <label htmlFor="task-due-date">
            Due Date
          </label>

          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value
              )
            }
            disabled={isSaving}
          />

          {calendarDueDate && (
            <small>
              Date selected from
              Calendar.
            </small>
          )}
        </div>
      </div>

      {/* =========================
          ACTIONS
         ========================= */}

      <div className="create-task-actions">
        <button
          type="button"
          className="create-task-cancel-button"
          onClick={() =>
            onCreated?.()
          }
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="create-task-submit-button"
          disabled={isSaving}
        >
          {isSaving
            ? "Creating..."
            : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export default CreateTask;