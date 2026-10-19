
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../../context/AuthContext";
import { getMyOrganizations } from "../../services/organizationService";
import { getAdminDashboard } from "../../services/dashboardService";
import { getOrganizationTasks } from "../../services/taskService";
import "./AdminDashboard.css";

const STATUS_NAMES = {
  "ef25e678-91e9-4eb8-b8a1-fce9accd840f": "To Do",
  "cf8e322b-86ed-4597-8d4c-dd17dc917273": "In Progress",
  "4e33e701-a87f-439b-801c-083c4d36d87c": "Review",
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35": "Done",
};

const CHART_COLORS = ["#94a3b8", "#6366f1", "#f59e0b", "#10b981", "#64748b"];

function AdminDashboard() {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [chartError, setChartError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [error, setError] = useState("");

  const displayName =
    user?.firstName || user?.email?.split("@")[0] || "Admin";

  // Load organizations where the current user has an Admin role.
  useEffect(() => {
    let isMounted = true;

    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrganizations(true);
        setError("");

        const response = await getMyOrganizations();

        const adminOrganizations = (Array.isArray(response) ? response : [])
          .filter(
            (organization) =>
              organization.roleName === "ADMIN" && organization.id
          );

        if (!isMounted) return;

        setOrganizations(adminOrganizations);

        if (adminOrganizations.length === 0) {
          setError(
            "No organization with an active Admin membership was found."
          );
          setIsLoading(false);
          return;
        }

        setSelectedOrganizationId((currentId) => {
          const stillAvailable = adminOrganizations.some(
            (organization) => organization.id === currentId
          );

          return stillAvailable ? currentId : adminOrganizations[0].id;
        });
      } catch (err) {
        console.error("Failed to load Admin organizations:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load your Admin organizations."
          );
          setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrganizations(false);
        }
      }
    };

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load dashboard statistics and task chart data for the selected organization.
  useEffect(() => {
    if (!selectedOrganizationId) return;

    let isMounted = true;

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError("");
      setChartError("");
      setDashboard(null);
      setTaskStatusData([]);

      // Load the main dashboard data without changing its existing API.
      try {
        const data = await getAdminDashboard(selectedOrganizationId);

        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Failed to load Admin Dashboard:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load Admin Dashboard data."
          );
        }

        // No need to load charts if the main dashboard request failed.
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // Load task status counts separately so chart errors do not hide the dashboard.
      try {
        const response = await getOrganizationTasks(selectedOrganizationId);

        if (!isMounted) return;

        const tasks = Array.isArray(response) ? response : [];

        const statusCounts = {
          "To Do": 0,
          "In Progress": 0,
          Review: 0,
          Done: 0,
          Other: 0,
        };

        tasks.forEach((task) => {
          const rawStatus =
            STATUS_NAMES[task.statusId] ||
            (typeof task.status === "object" && task.status !== null
              ? STATUS_NAMES[task.status.id] || task.status.name
              : null) ||
            task.statusName ||
            task.status ||
            "Other";

          const normalizedStatus = String(rawStatus).trim().toLowerCase();

          if (normalizedStatus === "todo" || normalizedStatus === "to do") {
            statusCounts["To Do"] += 1;
          } else if (
            normalizedStatus === "in progress" ||
            normalizedStatus === "in_progress"
          ) {
            statusCounts["In Progress"] += 1;
          } else if (normalizedStatus === "review") {
            statusCounts.Review += 1;
          } else if (
            normalizedStatus === "done" ||
            normalizedStatus === "completed"
          ) {
            statusCounts.Done += 1;
          } else {
            statusCounts.Other += 1;
          }
        });

        setTaskStatusData(
          Object.entries(statusCounts)
            .filter(([, count]) => count > 0)
            .map(([name, value]) => ({ name, value }))
        );
      } catch (err) {
        console.error("Failed to load task chart data:", err);

        if (isMounted) {
          setChartError(
            "Task status chart data is currently unavailable."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganizationId]);

  const formatRate = (rate) => `${Number(rate ?? 0).toFixed(1)}%`;

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );

  const stats = dashboard
    ? [
        {
          label: "Members",
          value: dashboard.totalMembers ?? 0,
          description: `${dashboard.activeMembers ?? 0} active members`,
          icon: "👥",
          tone: "blue",
        },
        {
          label: "Projects",
          value: dashboard.activeProjects ?? 0,
          description: `${dashboard.totalProjects ?? 0} total projects`,
          icon: "📁",
          tone: "purple",
        },
        {
          label: "Tasks",
          value: dashboard.totalTasks ?? 0,
          description: `${dashboard.completedTasks ?? 0} completed tasks`,
          icon: "✓",
          tone: "orange",
        },
        {
          label: "Completion Rate",
          value: formatRate(dashboard.completionRate),
          description: "Overall task completion",
          icon: "↗",
          tone: "green",
        },
      ]
    : [];

  const teamData = dashboard
    ? [
        {
          name: "Active",
          members: Number(dashboard.activeMembers ?? 0),
        },
        {
          name: "Inactive",
          members: Math.max(
            0,
            Number(dashboard.totalMembers ?? 0) -
              Number(dashboard.activeMembers ?? 0)
          ),
        },
        {
          name: "Managers",
          members: Number(dashboard.managers ?? 0),
        },
        {
          name: "Team members",
          members: Number(dashboard.teamMembers ?? 0),
        },
      ]
    : [];

  const completedTasks = Number(dashboard?.completedTasks ?? 0);
  const totalTasks = Number(dashboard?.totalTasks ?? 0);

  const completionPercentage = Math.min(
    100,
    Math.max(0, Number(dashboard?.completionRate ?? 0))
  );

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">ADMINISTRATION</p>

          <h1 className="admin-dashboard__title">
            Welcome back, {displayName} 👋
          </h1>

          <p className="admin-dashboard__subtitle">
            Here’s an overview of your organization’s activity and performance.
          </p>
        </div>

        <div className="admin-dashboard__header-badge">
          <span className="admin-dashboard__online-dot" />
          Admin workspace
        </div>
      </section>

      {!isLoadingOrganizations && organizations.length > 0 && (
        <section className="admin-dashboard__organization">
          <div>
            <span className="admin-dashboard__field-label">
              CURRENT ORGANIZATION
            </span>

            <strong>
              {selectedOrganization?.name || "Select organization"}
            </strong>
          </div>

          <select
            id="admin-organization"
            aria-label="Select organization"
            value={selectedOrganizationId}
            onChange={(event) =>
              setSelectedOrganizationId(event.target.value)
            }
            disabled={isLoadingOrganizations}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {isLoadingOrganizations ? (
        <p role="status">Loading your Admin organizations...</p>
      ) : error ? (
        <section className="admin-dashboard__panel" role="alert">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      ) : isLoading ? (
        <p role="status">Loading Admin Dashboard...</p>
      ) : dashboard ? (
        <>
          <section className="admin-dashboard__stats">
            {stats.map((stat) => (
              <article
                className="admin-dashboard__stat-card"
                key={stat.label}
              >
                <div className="admin-dashboard__stat-top">
                  <span className="admin-dashboard__stat-label">
                    {stat.label}
                  </span>

                  <span
                    className={`admin-dashboard__stat-icon admin-dashboard__stat-icon--${stat.tone}`}
                    aria-hidden="true"
                  >
                    {stat.icon}
                  </span>
                </div>

                <strong className="admin-dashboard__stat-value">
                  {stat.value}
                </strong>

                <span className="admin-dashboard__stat-description">
                  {stat.description}
                </span>
              </article>
            ))}
          </section>

          <section className="admin-dashboard__content-grid">
            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    ORGANIZATION ANALYTICS
                  </p>

                  <h2 className="admin-dashboard__panel-title">
                    Task status distribution
                  </h2>

                  <p className="admin-dashboard__panel-description">
                    Breakdown of tasks by their current status.
                  </p>
                </div>

                <span className="admin-dashboard__panel-tag">
                  {taskStatusData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}{" "}
                  tasks
                </span>
              </div>

              {chartError ? (
                <p className="admin-dashboard__chart-message" role="status">
                  {chartError}
                </p>
              ) : taskStatusData.length > 0 ? (
                <div className="admin-dashboard__chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              CHART_COLORS[index % CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="admin-dashboard__chart-message">
                  No task status data is available for this organization yet.
                </p>
              )}
            </article>

            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    TASK PROGRESS
                  </p>

                  <h2 className="admin-dashboard__panel-title">
                    Completion overview
                  </h2>

                  <p className="admin-dashboard__panel-description">
                    Overall progress across organization tasks.
                  </p>
                </div>
              </div>

              <div className="admin-dashboard__completion">
                <div
                  className="admin-dashboard__completion-ring"
                  style={{
                    "--completion": `${completionPercentage}%`,
                  }}
                  role="img"
                  aria-label={`${completionPercentage.toFixed(1)} percent task completion`}
                >
                  <div className="admin-dashboard__completion-inner">
                    <strong>{formatRate(completionPercentage)}</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="admin-dashboard__completion-details">
                  <div>
                    <span className="admin-dashboard__legend-dot admin-dashboard__legend-dot--done" />
                    <span>Completed tasks</span>
                    <strong>{completedTasks}</strong>
                  </div>

                  <div>
                    <span className="admin-dashboard__legend-dot admin-dashboard__legend-dot--remaining" />
                    <span>Remaining tasks</span>
                    <strong>{Math.max(0, totalTasks - completedTasks)}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-dashboard__content-grid">
            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    TEAM OVERVIEW
                  </p>

                  <h2 className="admin-dashboard__panel-title">
                    Organization members
                  </h2>

                  <p className="admin-dashboard__panel-description">
                    Member counts from your Admin dashboard API.
                  </p>
                </div>
              </div>

              <div className="admin-dashboard__bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamData}
                    margin={{
                      top: 12,
                      right: 12,
                      left: -16,
                      bottom: 8,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="members"
                      name="People"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">ALERTS</p>

                  <h2 className="admin-dashboard__panel-title">
                    Attention required
                  </h2>
                </div>
              </div>

              <div className="admin-dashboard__alerts">
                <div className="admin-dashboard__alert">
                  <span className="admin-dashboard__alert-icon">!</span>

                  <div>
                    <strong>Overdue tasks</strong>
                    <p>
                      {dashboard.overdueTasks ?? 0} overdue tasks need attention.
                    </p>
                  </div>
                </div>

                <div className="admin-dashboard__alert">
                  <span className="admin-dashboard__alert-icon">!</span>

                  <div>
                    <strong>Inactive members</strong>
                    <p>
                      {Math.max(
                        0,
                        Number(dashboard.totalMembers ?? 0) -
                          Number(dashboard.activeMembers ?? 0)
                      )}{" "}
                      inactive members.
                    </p>
                  </div>
                </div>

                <div className="admin-dashboard__alert">
                  <span className="admin-dashboard__alert-icon">!</span>

                  <div>
                    <strong>Sprint deadlines</strong>
                    <p>
                      Sprint deadline information is not available in this
                      dashboard API.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-dashboard__bottom-grid">
            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    ORGANIZATION SUMMARY
                  </p>

                  <h2 className="admin-dashboard__panel-title">
                    Workspace overview
                  </h2>
                </div>
              </div>

              <div className="admin-dashboard__analytics-grid">
                <div className="admin-dashboard__analytics-card">
                  <span>Managers</span>
                  <strong>{dashboard.managers ?? 0}</strong>
                </div>

                <div className="admin-dashboard__analytics-card">
                  <span>Team Members</span>
                  <strong>{dashboard.teamMembers ?? 0}</strong>
                </div>

                <div className="admin-dashboard__analytics-card">
                  <span>Completed Projects</span>
                  <strong>{dashboard.completedProjects ?? 0}</strong>
                </div>
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    ADMINISTRATION
                  </p>

                  <h2 className="admin-dashboard__panel-title">
                    Quick overview
                  </h2>
                </div>
              </div>

              <div className="admin-dashboard__quick-links">
                <div className="admin-dashboard__quick-item">
                  <span>Organization</span>
                  <span>Manage →</span>
                </div>

                <div className="admin-dashboard__quick-item">
                  <span>Members</span>
                  <span>Manage →</span>
                </div>

                <div className="admin-dashboard__quick-item">
                  <span>Projects</span>
                  <span>Manage →</span>
                </div>

                <div className="admin-dashboard__quick-item">
                  <span>Audit Logs</span>
                  <span>View →</span>
                </div>
              </div>
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default AdminDashboard;
