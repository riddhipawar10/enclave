
import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import { getOrganizationTasks } from "../../services/taskService";
import CreateTask from "../task/CreateTask.jsx";

import "./AdminTasks.css";

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

function getStatus(task) {
  return STATUS_NAMES[task.statusId] || task.status || "UNKNOWN";
}

function getPriority(task) {
  return (
    PRIORITY_NAMES[task.priorityId] ||
    task.priority ||
    "UNKNOWN"
  );
}

function getAssignee(task) {
  return (
    task.assigneeName ||
    task.assignedUserName ||
    task.assignedToName ||
    task.assignedTo ||
    "Unassigned"
  );
}

function isOverdue(task) {
  if (!task.dueDate || getStatus(task) === "DONE") {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
}

function getOrganizationId(organization) {
  return String(
    organization?.id ?? organization?.organizationId ?? ""
  );
}

function getOrganizationName(organization) {
  return (
    organization?.name ??
    organization?.organizationName ??
    "Unnamed organization"
  );
}

function AdminTasks() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState(searchParams.get("organizationId") || "");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [refreshTasks, setRefreshTasks] = useState(0);

  // Load only organizations where the current user is an ADMIN.
  useEffect(() => {
    let isMounted = true;

    async function fetchOrganizations() {
      try {
        setError("");

        const data = await getMyOrganizations();

        const adminOrganizations = (
          Array.isArray(data) ? data : []
        ).filter((organization) => {
          return (
            organization.roleName === "ADMIN" &&
            getOrganizationId(organization)
          );
        });

        if (!isMounted) {
          return;
        }

        setOrganizations(adminOrganizations);

        const requestedId = searchParams.get("organizationId");

        const matchingOrganization = adminOrganizations.find(
          (organization) =>
            getOrganizationId(organization) === requestedId
        );

        const selectedOrganization =
          matchingOrganization ?? adminOrganizations[0];

        const organizationId = getOrganizationId(
          selectedOrganization
        );

        setSelectedOrganizationId(organizationId);

        if (!organizationId) {
          setTasks([]);
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to load Admin organizations:", err);

        if (isMounted) {
          setOrganizations([]);
          setSelectedOrganizationId("");
          setTasks([]);
          setProjects([]);

          setError(
            err?.response?.status === 403
              ? "You don't have permission to view your organizations."
              : "Failed to load organizations. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Keep the selected Admin organization in the URL.
  useEffect(() => {
    const currentOrganizationId =
      searchParams.get("organizationId") || "";

    if (currentOrganizationId === selectedOrganizationId) {
      return;
    }

    const url = selectedOrganizationId
      ? `/admin/tasks?organizationId=${encodeURIComponent(
          selectedOrganizationId
        )}`
      : "/admin/tasks";

    navigate(url, {
      replace: true,
      state: location.state,
    });
  }, [
    selectedOrganizationId,
    searchParams,
    navigate,
    location.state,
  ]);

  // Load tasks and projects for the selected organization.
  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      if (!selectedOrganizationId) {
        setTasks([]);
        setProjects([]);
        setIsLoadingTasks(false);
        return;
      }

      try {
        setIsLoadingTasks(true);
        setError("");

        const [taskData, projectData] = await Promise.all([
          getOrganizationTasks(selectedOrganizationId),
          getProjects(selectedOrganizationId),
        ]);

        if (isMounted) {
          setTasks(Array.isArray(taskData) ? taskData : []);
          setProjects(Array.isArray(projectData) ? projectData : []);
        }
      } catch (err) {
        console.error("Failed to load organization tasks:", err);

        if (isMounted) {
          setTasks([]);
          setProjects([]);

          setError(
            err?.response?.status === 403
              ? "You don't have permission to view tasks for this organization."
              : "Failed to load organization tasks. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganizationId, refreshTasks]);

  const selectedOrganization = organizations.find(
    (organization) =>
      getOrganizationId(organization) === selectedOrganizationId
  );

  const projectNames = useMemo(() => {
    const map = {};

    projects.forEach((project) => {
      map[project.id] = project.name;
    });

    return map;
  }, [projects]);

  const summary = useMemo(() => {
    const completed = tasks.filter(
      (task) => getStatus(task) === "DONE"
    ).length;

    const inProgress = tasks.filter(
      (task) => getStatus(task) === "IN PROGRESS"
    ).length;

    const overdue = tasks.filter(isOverdue).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      overdue,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return tasks.filter((task) => {
      const title = String(task.title || "").toLowerCase();

      const projectName = String(
        projectNames[task.projectId] || task.projectId || ""
      ).toLowerCase();

      const assignee = String(getAssignee(task)).toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        projectName.includes(search) ||
        assignee.includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        getStatus(task) === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        getPriority(task) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [
    tasks,
    searchText,
    statusFilter,
    priorityFilter,
    projectNames,
  ]);

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;

    setSelectedOrganizationId(organizationId);
    setError("");
    setShowCreateForm(false);
    setSelectedProjectId("");

    const url = organizationId
      ? `/admin/tasks?organizationId=${encodeURIComponent(
          organizationId
        )}`
      : "/admin/tasks";

    navigate(url, {
      replace: true,
    });
  };

  const handleTaskFormClose = (task) => {
    // The existing CreateTask form calls onCreated(task)
    // after saving, and onCreated() when Cancel is clicked.
    if (task) {
      setRefreshTasks((current) => current + 1);
    }

    setShowCreateForm(false);
    setSelectedProjectId("");
  };

  return (
    <div className="admin-tasks">
      <header className="admin-tasks__header">
        <div>
          <p className="admin-tasks__eyebrow">ADMINISTRATION</p>
          <h2>Organization Tasks</h2>
          <p>
            Monitor tasks across the selected organization.
          </p>
        </div>
      </header>

      {error && (
        <div
          className="admin-tasks__message admin-tasks__message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="admin-tasks__organization">
        <label htmlFor="admin-task-organization">
          Select organization
        </label>

        {isLoadingOrganizations ? (
          <p>Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p>
            No organizations are available where you have the ADMIN role.
          </p>
        ) : (
          <select
            id="admin-task-organization"
            value={selectedOrganizationId}
            onChange={handleOrganizationChange}
          >
            {organizations.map((organization) => {
              const id = getOrganizationId(organization);

              return (
                <option key={id} value={id}>
                  {getOrganizationName(organization)}
                </option>
              );
            })}
          </select>
        )}

        {selectedOrganization && (
          <p>
            Showing tasks for{" "}
            <strong>
              {getOrganizationName(selectedOrganization)}
            </strong>
          </p>
        )}
      </section>

      <section
        className="admin-tasks__summary"
        aria-label="Task summary"
      >
        <article className="admin-tasks__summary-card">
          <span>Total tasks</span>
          <strong>{summary.total}</strong>
        </article>

        <article className="admin-tasks__summary-card">
          <span>In progress</span>
          <strong>{summary.inProgress}</strong>
        </article>

        <article className="admin-tasks__summary-card">
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </article>

        <article className="admin-tasks__summary-card admin-tasks__summary-card--overdue">
          <span>Overdue</span>
          <strong>{summary.overdue}</strong>
        </article>
      </section>

      <section className="admin-tasks__list-section">
        <div className="admin-tasks__list-header">
          <div>
            <h3>All tasks</h3>
            <p>
              Search and filter tasks for this organization.
            </p>
          </div>

          <div className="admin-tasks__list-actions">
            <span className="admin-tasks__count">
              {filteredTasks.length} task(s)
            </span>

            <button
              type="button"
              className="admin-tasks__create-button"
              onClick={() => {
                setSelectedProjectId("");
                setShowCreateForm(true);
              }}
              disabled={
                !selectedOrganizationId ||
                projects.length === 0 ||
                isLoadingTasks
              }
              title={
                projects.length === 0
                  ? "Create a project before creating a task."
                  : "Create a task"
              }
            >
              + Create Task
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="admin-tasks__create-panel">
            <h3>Create a task</h3>

            <label htmlFor="admin-task-project">
              Select project
            </label>

            <select
              id="admin-task-project"
              value={selectedProjectId}
              onChange={(event) =>
                setSelectedProjectId(event.target.value)
              }
            >
              <option value="">Choose a project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name || "Unnamed project"}
                </option>
              ))}
            </select>

            {projects.length === 0 ? (
              <p>
                This organization has no projects. Create a project
                first, then you can create tasks.
              </p>
            ) : selectedProjectId ? (
              <CreateTask
                organizationId={selectedOrganizationId}
                projectId={selectedProjectId}
                onCreated={handleTaskFormClose}
              />
            ) : (
              <p>
                Select a project to open the task creation form.
              </p>
            )}

            <button
              type="button"
              className="admin-tasks__cancel-create-button"
              onClick={() => {
                setShowCreateForm(false);
                setSelectedProjectId("");
              }}
            >
              Close
            </button>
          </div>
        )}

        <div className="admin-tasks__filters">
          <input
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search title, project, or assignee..."
            aria-label="Search tasks"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">To do</option>
            <option value="IN PROGRESS">In progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {isLoadingOrganizations ? (
          <div className="admin-tasks__empty">
            Loading organizations...
          </div>
        ) : isLoadingTasks ? (
          <div className="admin-tasks__empty">
            Loading organization tasks...
          </div>
        ) : !selectedOrganizationId ? (
          <div className="admin-tasks__empty">
            Select an Admin organization to view its tasks.
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="admin-tasks__empty">
            No tasks match your search or filters.
          </div>
        ) : (
          <div className="admin-tasks__table-wrapper">
            <table className="admin-tasks__table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due date</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const status = getStatus(task);
                  const priority = getPriority(task);
                  const overdue = isOverdue(task);

                  return (
                    <tr key={task.id}>
                      <td>
                        <strong>
                          {task.title || "Untitled task"}
                        </strong>

                        {task.description && (
                          <p className="admin-tasks__description">
                            {task.description}
                          </p>
                        )}
                      </td>

                      <td>
                        {projectNames[task.projectId] ||
                          (task.projectId
                            ? `Project ID: ${task.projectId}`
                            : "—")}
                      </td>

                      <td>{getAssignee(task)}</td>

                      <td>
                        <span
                          className={`admin-tasks__priority admin-tasks__priority--${priority.toLowerCase()}`}
                        >
                          {priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-tasks__status admin-tasks__status--${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            overdue
                              ? "admin-tasks__due-date--overdue"
                              : ""
                          }
                        >
                          {formatDate(task.dueDate)}
                        </span>

                        {overdue && (
                          <span className="admin-tasks__overdue-label">
                            Overdue
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminTasks;
