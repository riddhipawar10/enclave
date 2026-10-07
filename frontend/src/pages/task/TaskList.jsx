import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTasks } from "../../services/taskService";

const STATUS_NAMES = {
  "ef25e678-91e9-4eb8-b8a1-fce9accd840f": "TODO",
  "cf8e322b-86ed-4597-8d4c-dd17dc917273": "IN PROGRESS",
  "4e33e701-a87f-439b-801c-083c4d36d87c": "REVIEW",
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35": "DONE",
};

const PRIORITY_NAMES = {
  "81f9c1a3-2793-4e4f-8a0c-51f5f79bf45a": "LOW",
  "ff8a5fd3-a10d-4bee-a79e-3f579ce2e76b": "MEDIUM",
  "ccb1a560-2cfe-4b5f-9fe3-d8af19196e55": "HIGH",
  "17153d97-f8bc-4fc6-8b41-abf279b98152": "URGENT",
};

function TaskList({
  organizationId,
  projectId,
}) {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError("");

        const data = await getTasks(
          organizationId,
          projectId
        );

        setTasks(data);
      } catch (err) {
        console.error(
          "Failed to load tasks:",
          err
        );

        setError(
          "Failed to load tasks."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId && projectId) {
      fetchTasks();
    }
  }, [organizationId, projectId]);

  const handleTaskClick = (taskId) => {
    navigate(
      `/tasks/${projectId}/${taskId}/edit`
    );
  };

  if (isLoading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="task-list-item"
        >
          <div className="task-list-main">
            <h3
              className="task-list-title"
              onClick={() =>
                handleTaskClick(task.id)
              }
            >
              {task.title}
            </h3>

            <p>
              {task.description ||
                "No description available."}
            </p>
          </div>

          <div className="task-list-meta">
            <span>
              Status:{" "}
              {STATUS_NAMES[
                task.statusId
              ] || "Unknown"}
            </span>

            <span>
              Priority:{" "}
              {PRIORITY_NAMES[
                task.priorityId
              ] || "Unknown"}
            </span>

            <span>
              Assigned to:{" "}
              {task.assignedTo ||
                "Unassigned"}
            </span>

            <span>
              Due:{" "}
              {task.dueDate || "Not set"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;