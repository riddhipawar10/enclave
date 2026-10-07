import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";
import { getProjectAnalytics } from "../../services/analyticsService";

import "./Analytics.css";

const STATUS_COLORS = {
  todo: "#64748b",
  inProgress: "#3b82f6",
  review: "#f59e0b",
  completed: "#22c55e",
};

const PRIORITY_COLORS = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#f97316",
  urgent: "#ef4444",
};

const HEALTH_COLORS = {
  completed: "#22c55e",
  remaining: "#e2e8f0",
  overdue: "#ef4444",
};

function Analytics() {
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState("");

  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [analytics, setAnalytics] = useState(null);

  const [loadingOrganizations, setLoadingOrganizations] =
    useState(true);

  const [loadingProjects, setLoadingProjects] =
    useState(false);

  const [loadingAnalytics, setLoadingAnalytics] =
    useState(false);

  const [error, setError] = useState("");

  const [trendRange, setTrendRange] = useState("30");

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setProjects([]);
      setSelectedProjectId("");
      return;
    }

    loadProjects(selectedOrganizationId);
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId || !selectedProjectId) {
      setAnalytics(null);
      return;
    }

    loadAnalytics(
      selectedOrganizationId,
      selectedProjectId
    );
  }, [
    selectedOrganizationId,
    selectedProjectId,
  ]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      setError("");

      const data = await getMyOrganizations();

      setOrganizations(data || []);

      if (data && data.length > 0) {
        setSelectedOrganizationId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load organizations.");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadProjects = async (organizationId) => {
    try {
      setLoadingProjects(true);
      setError("");

      const data = await getProjects(organizationId);

      setProjects(data || []);

      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
      } else {
        setSelectedProjectId("");
      }
    } catch (err) {
      console.error(err);
      setProjects([]);
      setSelectedProjectId("");
      setError("Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadAnalytics = async (
    organizationId,
    projectId
  ) => {
    try {
      setLoadingAnalytics(true);
      setError("");

      const data = await getProjectAnalytics(
        organizationId,
        projectId
      );

      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setAnalytics(null);
      setError("Failed to load analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const selectedProject = useMemo(() => {
    return projects.find(
      (project) => project.id === selectedProjectId
    );
  }, [projects, selectedProjectId]);

  const statusData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        name: "To Do",
        value: analytics.todoTasks,
        color: STATUS_COLORS.todo,
      },
      {
        name: "In Progress",
        value: analytics.inProgressTasks,
        color: STATUS_COLORS.inProgress,
      },
      {
        name: "Review",
        value: analytics.reviewTasks,
        color: STATUS_COLORS.review,
      },
      {
        name: "Completed",
        value: analytics.completedTasks,
        color: STATUS_COLORS.completed,
      },
    ];
  }, [analytics]);

  const priorityData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        name: "Low",
        tasks: analytics.lowPriorityTasks,
        color: PRIORITY_COLORS.low,
      },
      {
        name: "Medium",
        tasks: analytics.mediumPriorityTasks,
        color: PRIORITY_COLORS.medium,
      },
      {
        name: "High",
        tasks: analytics.highPriorityTasks,
        color: PRIORITY_COLORS.high,
      },
      {
        name: "Urgent",
        tasks: analytics.urgentPriorityTasks,
        color: PRIORITY_COLORS.urgent,
      },
    ];
  }, [analytics]);

  const sprintData = useMemo(() => {
    if (!analytics?.sprintProgress) {
      return [];
    }

    return analytics.sprintProgress.map(
      (sprint) => ({
        name: sprint.sprintName,
        completedTasks: sprint.completedTasks,
        remainingTasks: Math.max(
          sprint.totalTasks -
            sprint.completedTasks,
          0
        ),
      })
    );
  }, [analytics]);

  const completionPercentage = useMemo(() => {
    if (!analytics || analytics.totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (analytics.completedTasks /
        analytics.totalTasks) *
        100
    );
  }, [analytics]);

  const healthData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const completed =
      analytics.completedTasks;

    const overdue =
      analytics.overdueTasks;

    const remaining = Math.max(
      analytics.totalTasks -
        completed -
        overdue,
      0
    );

    return [
      {
        name: "Completed",
        value: completed,
        color: HEALTH_COLORS.completed,
      },
      {
        name: "Remaining",
        value: remaining,
        color: HEALTH_COLORS.remaining,
      },
      {
        name: "Overdue",
        value: overdue,
        color: HEALTH_COLORS.overdue,
      },
    ];
  }, [analytics]);

  /*
   * Completion trend
   *
   * Backend provides a continuous 30-day dataset.
   *
   * 7 Days  -> last 7 entries
   * 30 Days -> all 30 entries
   * All Time -> all entries returned by backend
   */
  const completionTrendData = useMemo(() => {
    if (!analytics?.completionTrend) {
      return [];
    }

    const rawData = analytics.completionTrend;

    if (rawData.length === 0) {
      return [];
    }

    let filteredData = rawData;

    if (trendRange === "7") {
      filteredData = rawData.slice(-7);
    } else if (trendRange === "30") {
      filteredData = rawData.slice(-30);
    }

    return filteredData.map((item) => ({
      ...item,
      formattedDate: formatTrendDate(
        item.date
      ),
    }));
  }, [analytics, trendRange]);

  /*
   * Recalculate cumulative progress for the
   * currently selected range.
   *
   * This prevents the 7-day view from starting
   * with a cumulative value that belongs to an
   * earlier period.
   */
  const trendChartData = useMemo(() => {
    let cumulative = 0;

    return completionTrendData.map((item) => {
      cumulative += item.completedTasks;

      return {
        ...item,
        rangeCumulativeCompletedTasks:
          cumulative,
      };
    });
  }, [completionTrendData]);

  const trendSummary = useMemo(() => {
    if (!trendChartData.length) {
      return {
        completed: 0,
        cumulative: 0,
      };
    }

    const completed =
      trendChartData.reduce(
        (total, item) =>
          total + item.completedTasks,
        0
      );

    const cumulative =
      trendChartData[
        trendChartData.length - 1
      ].rangeCumulativeCompletedTasks;

    return {
      completed,
      cumulative,
    };
  }, [trendChartData]);

  const handleOrganizationChange = (
    event
  ) => {
    setSelectedOrganizationId(
      event.target.value
    );
  };

  const handleProjectChange = (
    event
  ) => {
    setSelectedProjectId(
      event.target.value
    );
  };

  return (
    <div className="analytics-page">

      <div className="analytics-header">

        <div>
          <h1>Analytics</h1>

          <p>
            Understand project progress,
            task health, priorities and
            completion trends.
          </p>
        </div>

        <div className="analytics-filters">

          <div className="analytics-filter">

            <label>
              Organization
            </label>

            <select
              value={selectedOrganizationId}
              onChange={
                handleOrganizationChange
              }
              disabled={
                loadingOrganizations
              }
            >
              <option value="">
                Select organization
              </option>

              {organizations.map(
                (organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="analytics-filter">

            <label>
              Project
            </label>

            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              disabled={
                loadingProjects ||
                !selectedOrganizationId
              }
            >
              <option value="">
                Select project
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

      </div>

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      {loadingAnalytics && (
        <div className="analytics-loading">
          Loading analytics...
        </div>
      )}

      {!loadingAnalytics &&
        !analytics &&
        selectedProjectId && (
          <div className="analytics-empty-page">
            No analytics available for this
            project.
          </div>
        )}

      {analytics && (
        <>

          <div className="analytics-project-title">

            <div>
              <span>
                Project
              </span>

              <h2>
                {selectedProject?.name ||
                  "Selected Project"}
              </h2>
            </div>

          </div>

          <div className="analytics-summary-grid">

            <div className="analytics-summary-card">
              <span>
                Total Tasks
              </span>

              <strong>
                {analytics.totalTasks}
              </strong>
            </div>

            <div className="analytics-summary-card">
              <span>
                Completed
              </span>

              <strong>
                {analytics.completedTasks}
              </strong>
            </div>

            <div className="analytics-summary-card">
              <span>
                In Progress
              </span>

              <strong>
                {analytics.inProgressTasks}
              </strong>
            </div>

            <div className="analytics-summary-card">
              <span>
                Overdue
              </span>

              <strong>
                {analytics.overdueTasks}
              </strong>
            </div>

          </div>

          <div className="analytics-chart-grid">

            <section className="analytics-card">

              <div className="analytics-card-header">

                <div>
                  <h2>
                    Tasks by Status
                  </h2>

                  <p>
                    Current distribution
                    of project tasks.
                  </p>
                </div>

                <span>
                  {analytics.totalTasks}
                </span>

              </div>

              {analytics.totalTasks > 0 ? (
                <div className="analytics-rechart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>

                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                      >
                        {statusData.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>

                </div>
              ) : (
                <div className="analytics-chart-empty">
                  No tasks available.
                </div>
              )}

            </section>

            <section className="analytics-card">

              <div className="analytics-card-header">

                <div>
                  <h2>
                    Tasks by Priority
                  </h2>

                  <p>
                    Current priority
                    distribution.
                  </p>
                </div>

                <span>
                  {analytics.totalTasks}
                </span>

              </div>

              {analytics.totalTasks > 0 ? (
                <div className="analytics-rechart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart
                      data={priorityData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: -10,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="tasks"
                        name="Tasks"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      >
                        {priorityData.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          )
                        )}
                      </Bar>

                    </BarChart>
                  </ResponsiveContainer>

                </div>
              ) : (
                <div className="analytics-chart-empty">
                  No tasks available.
                </div>
              )}

            </section>

          </div>

          <section className="analytics-card analytics-trend-card">

            <div className="analytics-card-header">

              <div>
                <h2>
                  Task Completion Trend
                </h2>

                <p>
                  Track completed tasks
                  and cumulative progress
                  over time.
                </p>
              </div>

              <div className="analytics-trend-controls">

                <button
                  type="button"
                  className={
                    trendRange === "7"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendRange("7")
                  }
                >
                  7 Days
                </button>

                <button
                  type="button"
                  className={
                    trendRange === "30"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendRange("30")
                  }
                >
                  30 Days
                </button>

                <button
                  type="button"
                  className={
                    trendRange === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendRange("all")
                  }
                >
                  All Time
                </button>

              </div>

            </div>

            <div className="analytics-trend-summary">

              <div>
                <span>
                  Completed in range
                </span>

                <strong>
                  {trendSummary.completed}
                </strong>
              </div>

              <div>
                <span>
                  Total completed
                </span>

                <strong>
                  {trendSummary.cumulative}
                </strong>
              </div>

            </div>

            {trendChartData.length > 0 ? (
              <div className="analytics-trend-chart">

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <LineChart
                    data={trendChartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: -10,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="formattedDate"
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip
                      labelFormatter={(label) =>
                        `Date: ${label}`
                      }
                      formatter={(
                        value,
                        name
                      ) => [
                        value,
                        name ===
                        "Completed Tasks"
                          ? "Completed"
                          : "Cumulative",
                      ]}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="completedTasks"
                      name="Completed Tasks"
                      stroke="#334155"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 7,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="rangeCumulativeCompletedTasks"
                      name="Cumulative Completed"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>
            ) : (
              <div className="analytics-empty">
                No completion history available
                yet.
              </div>
            )}

          </section>

          <section className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <h2>
                  Sprint Progress
                </h2>

                <p>
                  Completed versus remaining
                  tasks in each sprint.
                </p>
              </div>

              <span>
                {analytics.sprintProgress?.length ||
                  0}
              </span>

            </div>

            {sprintData.length > 0 ? (
              <div className="analytics-sprint-chart">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <BarChart
                    data={sprintData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: -10,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="completedTasks"
                      name="Completed"
                      stackId="sprint"
                      fill="#22c55e"
                    />

                    <Bar
                      dataKey="remainingTasks"
                      name="Remaining"
                      stackId="sprint"
                      fill="#cbd5e1"
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>
            ) : (
              <div className="analytics-empty">
                No sprint data available.
              </div>
            )}

          </section>

          <div className="analytics-bottom-grid">

            <section className="analytics-card analytics-active-sprint">

              <div className="analytics-card-header">

                <div>
                  <h2>
                    Active Sprint
                  </h2>

                  <p>
                    Current sprint workload
                    and completion.
                  </p>
                </div>

              </div>

              {analytics.activeSprintName ? (
                <>
                  <h3>
                    {analytics.activeSprintName}
                  </h3>

                  <div className="analytics-active-sprint-stats">

                    <div>
                      <span>
                        Total Tasks
                      </span>

                      <strong>
                        {
                          analytics.activeSprintTasks
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Completed
                      </span>

                      <strong>
                        {
                          analytics.activeSprintCompletedTasks
                        }
                      </strong>
                    </div>

                  </div>

                  <div className="analytics-active-progress">

                    <div className="analytics-progress-header">

                      <span>
                        Sprint Progress
                      </span>

                      <strong>
                        {analytics.activeSprintTasks >
                        0
                          ? Math.round(
                              (analytics.activeSprintCompletedTasks /
                                analytics.activeSprintTasks) *
                                100
                            )
                          : 0}
                        %
                      </strong>

                    </div>

                    <div className="analytics-progress-track">

                      <div
                        className="analytics-progress-bar"
                        style={{
                          width: `${
                            analytics.activeSprintTasks >
                            0
                              ? Math.round(
                                  (analytics.activeSprintCompletedTasks /
                                    analytics.activeSprintTasks) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />

                    </div>

                  </div>
                </>
              ) : (
                <div className="analytics-empty">
                  No active sprint.
                </div>
              )}

            </section>

            <section className="analytics-card analytics-health-card">

              <div className="analytics-card-header">

                <div>
                  <h2>
                    Overall Task Health
                  </h2>

                  <p>
                    Completion and deadline
                    health.
                  </p>
                </div>

                <span>
                  {completionPercentage}%
                </span>

              </div>

              <div className="analytics-health">

                {analytics.totalTasks > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <PieChart>

                      <Pie
                        data={healthData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {healthData.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />

                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="analytics-chart-empty">
                    No task data.
                  </div>
                )}

                <div className="analytics-health-content">

                  <div>
                    <span>
                      Completed
                    </span>

                    <strong>
                      {
                        analytics.completedTasks
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Remaining
                    </span>

                    <strong>
                      {Math.max(
                        analytics.totalTasks -
                          analytics.completedTasks -
                          analytics.overdueTasks,
                        0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Overdue
                    </span>

                    <strong>
                      {analytics.overdueTasks}
                    </strong>
                  </div>

                </div>

              </div>

            </section>

          </div>

        </>
      )}

    </div>
  );
}

function formatTrendDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

export default Analytics;