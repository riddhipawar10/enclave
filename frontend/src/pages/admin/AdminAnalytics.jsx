
import { useEffect, useMemo, useState } from "react";
import {
  getAllOrganizationsForPlatformAdmin,
} from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import { getOrganizationTasks } from "../../services/taskService";
import "./AdminAnalytics.css";

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

const STATUS_ORDER = ["TODO", "IN PROGRESS", "REVIEW", "DONE"];
const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function getOrganizationId(organization) {
  return organization?.id ?? organization?.organizationId ?? "";
}

function getOrganizationName(organization) {
  return (
    organization?.name ??
    organization?.organizationName ??
    "Unnamed organization"
  );
}

function getStatus(task) {
  return STATUS_NAMES[task.statusId] || task.status || "UNKNOWN";
}

function getPriority(task) {
  return PRIORITY_NAMES[task.priorityId] || task.priority || "UNKNOWN";
}

function isCompleted(task) {
  return getStatus(task) === "DONE" || Boolean(task.completedAt);
}

function isOverdue(task) {
  if (isCompleted(task) || !task.dueDate) {
    return false;
  }

  const due = new Date(`${task.dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(due.getTime()) && due < today;
}

function Bar({ label, count, total, className = "" }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="admin-analytics__bar-row">
      <div className="admin-analytics__bar-label">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>

      <div
        className="admin-analytics__bar-track"
        role="progressbar"
        aria-label={`${label} tasks`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={count}
      >
        <div
          className={`admin-analytics__bar-fill ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  // Load all organizations available to the platform administrator.
  useEffect(() => {
    let active = true;

    async function loadOrganizations() {
      try {
        const response = await getAllOrganizationsForPlatformAdmin();

        const allOrganizations = (
          Array.isArray(response) ? response : []
        ).filter((organization) => getOrganizationId(organization));

        if (!active) {
          return;
        }

        setOrganizations(allOrganizations);

        const firstOrganization = allOrganizations[0];
        setOrganizationId(
          firstOrganization ? getOrganizationId(firstOrganization) : ""
        );

        if (allOrganizations.length === 0) {
          setError("No organizations were found.");
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Unable to load organizations. Check your platform-admin access."
          );
        }
      } finally {
        if (active) {
          setLoadingOrganizations(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      active = false;
    };
  }, []);

  // Load analytics whenever a different organization is selected.
  useEffect(() => {
    let active = true;

    if (!organizationId) {
      setProjects([]);
      setTasks([]);
      setLoadingData(false);

      return () => {
        active = false;
      };
    }

    async function loadAnalyticsData() {
      setLoadingData(true);
      setError("");
      setProjects([]);
      setTasks([]);

      try {
        const [taskData, projectData] = await Promise.all([
          getOrganizationTasks(organizationId),
          getProjects(organizationId),
        ]);

        if (!active) {
          return;
        }

        setTasks(Array.isArray(taskData) ? taskData : []);
        setProjects(Array.isArray(projectData) ? projectData : []);
      } catch (err) {
        if (active) {
          setTasks([]);
          setProjects([]);
          setError(
            err?.response?.data?.message ||
              "Unable to load analytics for this organization."
          );
        }
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    }

    loadAnalyticsData();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const analytics = useMemo(() => {
    const completed = tasks.filter(isCompleted).length;
    const overdue = tasks.filter(isOverdue).length;

    const statusCounts = STATUS_ORDER.map((status) => ({
      label: status,
      count: tasks.filter((task) => getStatus(task) === status).length,
    }));

    const priorityCounts = PRIORITY_ORDER.map((priority) => ({
      label: priority,
      count: tasks.filter((task) => getPriority(task) === priority).length,
    }));

    const unassigned = tasks.filter((task) => !task.assignedTo).length;

    return {
      total: tasks.length,
      completed,
      overdue,
      unassigned,
      completionRate:
        tasks.length > 0
          ? ((completed / tasks.length) * 100).toFixed(1)
          : "0.0",
      statusCounts,
      priorityCounts,
    };
  }, [tasks]);

  if (loadingOrganizations) {
    return (
      <main className="admin-analytics">
        <p role="status">Loading organizations...</p>
      </main>
    );
  }

  return (
    <main className="admin-analytics">
      <header className="admin-analytics__header">
        <div>
          <p className="admin-analytics__eyebrow">ADMINISTRATION</p>
          <h1>Organization Analytics</h1>
          <p>Understand task progress and project workload.</p>
        </div>

        {organizations.length > 0 && (
          <div className="admin-analytics__selector">
            <label htmlFor="analytics-organization">Organization</label>

            <select
              id="analytics-organization"
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
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
          </div>
        )}
      </header>

      {error && (
        <div className="admin-analytics__error" role="alert">
          {error}
        </div>
      )}

      {loadingData ? (
        <p role="status">Loading analytics...</p>
      ) : organizationId && !error ? (
        <>
          <section className="admin-analytics__summary">
            <article className="admin-analytics__card">
              <span>Total tasks</span>
              <strong>{analytics.total}</strong>
            </article>

            <article className="admin-analytics__card">
              <span>Completed tasks</span>
              <strong>{analytics.completed}</strong>
            </article>

            <article className="admin-analytics__card">
              <span>Completion rate</span>
              <strong>{analytics.completionRate}%</strong>
            </article>

            <article className="admin-analytics__card">
              <span>Overdue tasks</span>
              <strong>{analytics.overdue}</strong>
            </article>

            <article className="admin-analytics__card">
              <span>Active projects</span>
              <strong>{projects.length}</strong>
            </article>

            <article className="admin-analytics__card">
              <span>Unassigned tasks</span>
              <strong>{analytics.unassigned}</strong>
            </article>
          </section>

          <section className="admin-analytics__charts">
            <article className="admin-analytics__panel">
              <h2>Tasks by status</h2>

              {analytics.statusCounts.map((item) => (
                <Bar
                  key={item.label}
                  label={item.label}
                  count={item.count}
                  total={analytics.total}
                  className={`status-${item.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                />
              ))}
            </article>

            <article className="admin-analytics__panel">
              <h2>Tasks by priority</h2>

              {analytics.priorityCounts.map((item) => (
                <Bar
                  key={item.label}
                  label={item.label}
                  count={item.count}
                  total={analytics.total}
                  className={`priority-${item.label.toLowerCase()}`}
                />
              ))}
            </article>
          </section>

          <section className="admin-analytics__panel admin-analytics__project-panel">
            <h2>Project overview</h2>

            {projects.length === 0 ? (
              <p>No active projects found for this organization.</p>
            ) : (
              <div className="admin-analytics__project-list">
                {projects.map((project) => {
                  const projectId = project.id ?? project.projectId;

                  const projectTasks = tasks.filter(
                    (task) => task.projectId === projectId
                  );

                  const done = projectTasks.filter(isCompleted).length;

                  const progress =
                    projectTasks.length > 0
                      ? (done / projectTasks.length) * 100
                      : 0;

                  return (
                    <div
                      className="admin-analytics__project-row"
                      key={projectId}
                    >
                      <div>
                        <strong>{project.name || "Untitled project"}</strong>
                        <span>
                          {done} of {projectTasks.length} tasks completed
                        </span>
                      </div>

                      <div className="admin-analytics__project-progress">
                        <div className="admin-analytics__bar-track">
                          <div
                            className="admin-analytics__bar-fill status-done"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : !error && organizations.length === 0 ? (
        <p>No organizations are available to display.</p>
      ) : null}
    </main>
  );
}

export default AdminAnalytics;
