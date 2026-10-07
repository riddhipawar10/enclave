import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTasks,
  updateTask,
} from "../../services/taskService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import { getProjects } from "../../services/projectService";

import { getSprints } from "../../services/sprintService";

import {
  getComments,
  createComment,
  deleteComment,
} from "../../services/commentService";

import "./EditTask.css";

const CURRENT_USER_ID =
  "ce6f779f-4be7-4d2a-b72f-9ad95635b0c4";

function EditTask() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState("");
  const [task, setTask] = useState(null);
  const [projectName, setProjectName] = useState("");

  const [sprints, setSprints] = useState([]);
  const [sprintId, setSprintId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [position, setPosition] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentError, setCommentError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setError("");

        const organizations = await getMyOrganizations();

        for (const organization of organizations) {
          const projects = await getProjects(organization.id);

          const project = projects.find(
            (item) => item.id === projectId
          );

          if (!project) {
            continue;
          }

          const [tasks, projectSprints] = await Promise.all([
            getTasks(organization.id, projectId),
            getSprints(organization.id, projectId),
          ]);

          const foundTask = tasks.find(
            (item) => item.id === taskId
          );

          if (!foundTask) {
            continue;
          }

          setOrganizationId(organization.id);
          setProjectName(project.name || "Project");

          setTask(foundTask);
          setSprints(projectSprints || []);

          setTitle(foundTask.title || "");
          setDescription(foundTask.description || "");
          setStatusId(foundTask.statusId || "");
          setPriorityId(foundTask.priorityId || "");
          setAssignedTo(foundTask.assignedTo || "");
          setDueDate(foundTask.dueDate || "");
          setPosition(foundTask.position || 0);

          setSprintId(foundTask.sprintId || "");

          return;
        }

        setError("Task not found.");
      } catch (err) {
        console.error("Failed to load task:", err);

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage || "Failed to load task."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [projectId, taskId]);

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        setCommentError("");

        const data = await getComments(taskId);

        setComments(data || []);
      } catch (err) {
        console.error(
          "Failed to load comments:",
          err
        );

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setCommentError(
          backendMessage ||
            "Failed to load comments."
        );
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [taskId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!statusId) {
      setError("Please select a status.");
      return;
    }

    if (!priorityId) {
      setError("Please select a priority.");
      return;
    }

    setIsSaving(true);

    try {
      await updateTask(
        organizationId,
        projectId,
        taskId,
        {
          title: title.trim(),
          description: description.trim(),
          statusId,
          priorityId,
          assignedTo: assignedTo || null,
          dueDate: dueDate || null,
          position,
          sprintId: sprintId || null,
        }
      );

      navigate("/tasks");
    } catch (err) {
      console.error(
        "Failed to update task:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to update this task."
        );
      } else {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
            "Failed to update task. Please try again."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      setCommentError(
        "Please enter a comment before adding it."
      );
      return;
    }

    setIsAddingComment(true);
    setCommentError("");

    try {
      const newComment = await createComment(
        taskId,
        CURRENT_USER_ID,
        trimmedComment
      );

      setComments((current) => [
        ...current,
        newComment,
      ]);

      setCommentText("");
    } catch (err) {
      console.error(
        "Failed to add comment:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setCommentError(
        backendMessage ||
          "Failed to add comment. Please try again."
      );
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (
    commentId
  ) => {
    setDeletingCommentId(commentId);
    setCommentError("");

    try {
      await deleteComment(
        taskId,
        commentId,
        CURRENT_USER_ID
      );

      setComments((current) =>
        current.filter(
          (comment) => comment.id !== commentId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete comment:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setCommentError(
        backendMessage ||
          "Failed to delete comment."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatCommentTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const date = new Date(createdAt);

    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="project-details">
        <p>Loading task...</p>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="project-details">
        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="project-details edit-task-page">
      <button
        type="button"
        onClick={() => navigate("/tasks")}
      >
        &larr; Back to Tasks
      </button>

      <div className="project-details-header">
        <div>
          <h1>Edit Task</h1>

          <p>
            Update task in{" "}
            <strong>{projectName}</strong>.
          </p>
        </div>
      </div>

      {error && <p>{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="edit-task-form"
      >
        <div>
          <label htmlFor="edit-task-title">
            Title
          </label>

          <input
            id="edit-task-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="edit-task-description">
            Description
          </label>

          <textarea
            id="edit-task-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="edit-task-sprint">
            Sprint
          </label>

          <select
            id="edit-task-sprint"
            value={sprintId}
            onChange={(event) =>
              setSprintId(event.target.value)
            }
            disabled={isSaving}
          >
            <option value="">
              No Sprint
            </option>

            {sprints.map((sprint) => (
              <option
                key={sprint.id}
                value={sprint.id}
              >
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-task-status">
            Status
          </label>

          <select
            id="edit-task-status"
            value={statusId}
            onChange={(event) =>
              setStatusId(event.target.value)
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

        <div>
          <label htmlFor="edit-task-priority">
            Priority
          </label>

          <select
            id="edit-task-priority"
            value={priorityId}
            onChange={(event) =>
              setPriorityId(event.target.value)
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

        <div>
          <label htmlFor="edit-task-assigned-to">
            Assigned To
          </label>

          <input
            id="edit-task-assigned-to"
            type="text"
            value={assignedTo}
            onChange={(event) =>
              setAssignedTo(event.target.value)
            }
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor="edit-task-due-date">
            Due Date
          </label>

          <input
            id="edit-task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
            disabled={isSaving}
          />
        </div>

        <div className="edit-task-form-actions">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>

      <section className="task-comments-section">
        <div className="task-comments-header">
          <div>
            <h2>Comments</h2>
            <p>
              Discuss this task with your team.
            </p>
          </div>

          <span className="task-comments-count">
            {comments.length}
          </span>
        </div>

        {commentError && (
          <div className="task-comments-error">
            {commentError}
          </div>
        )}

        <div className="task-comment-composer">
          <textarea
            value={commentText}
            onChange={(event) =>
              setCommentText(event.target.value)
            }
            placeholder="Write a comment..."
            maxLength={1000}
            disabled={isAddingComment}
          />

          <div className="task-comment-composer-footer">
            <span>
              {commentText.length}/1000
            </span>

            <button
              type="button"
              onClick={handleAddComment}
              disabled={
                isAddingComment ||
                !commentText.trim()
              }
            >
              {isAddingComment
                ? "Adding..."
                : "Add Comment"}
            </button>
          </div>
        </div>

        {isLoadingComments ? (
          <div className="task-comments-state">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="task-comments-empty">
            <div className="task-comments-empty-icon">
              💬
            </div>

            <h3>No comments yet</h3>

            <p>
              Start the conversation about this task.
            </p>
          </div>
        ) : (
          <div className="task-comments-list">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="task-comment"
              >
                <div className="task-comment-avatar">
                  {comment.userId === CURRENT_USER_ID
                    ? "You"
                    : "U"}
                </div>

                <div className="task-comment-body">
                  <div className="task-comment-top">
                    <div>
                      <strong>
                        {comment.userId ===
                        CURRENT_USER_ID
                          ? "You"
                          : "Team Member"}
                      </strong>

                      <span>
                        {formatCommentTime(
                          comment.createdAt
                        )}
                      </span>
                    </div>

                    {comment.userId ===
                      CURRENT_USER_ID && (
                      <button
                        type="button"
                        className="task-comment-delete"
                        onClick={() =>
                          handleDeleteComment(
                            comment.id
                          )
                        }
                        disabled={
                          deletingCommentId ===
                          comment.id
                        }
                      >
                        {deletingCommentId ===
                        comment.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>

                  <p>{comment.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default EditTask;