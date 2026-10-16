
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyOrganizations } from "../../services/organizationService";
import { getAdminDashboard } from "../../services/dashboardService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [error, setError] = useState("");

  const displayName =
    user?.firstName ||
    user?.email?.split("@")[0] ||
    "Admin";

  // Load only organizations where the current user has an Admin role.
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
              organization.roleName === "ADMIN" &&
              organization.id
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

          return stillAvailable
            ? currentId
            : adminOrganizations[0].id;
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

  // Load statistics for the selected Admin organization.
  useEffect(() => {
    if (!selectedOrganizationId) return;

    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");
        setDashboard(null);

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

  const formatRate = (rate) =>
    `${Number(rate ?? 0).toFixed(1)}%`;

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );

  const stats = dashboard
    ? [
        {
          label: "Members",
          value: dashboard.totalMembers,
          description: `${dashboard.activeMembers} active members`,
        },
        {
          label: "Projects",
          value: dashboard.activeProjects,
          description: `${dashboard.totalProjects} total projects`,
        },
        {
          label: "Tasks",
          value: dashboard.totalTasks,
          description: `${dashboard.completedTasks} completed tasks`,
        },
        {
          label: "Completion Rate",
          value: formatRate(dashboard.completionRate),
          description: "Overall task completion",
        },
      ]
    : [];

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">
            Administration
          </p>

          <h1 className="admin-dashboard__title">
            Welcome back, {displayName}
          </h1>

          <p className="admin-dashboard__subtitle">
            Manage your organization, members, projects,
            permissions, and overall workspace activity.
          </p>
        </div>
      </section>

      {!isLoadingOrganizations && organizations.length > 0 && (
        <section className="admin-dashboard__panel">
          <label htmlFor="admin-organization">
            <strong>Organization</strong>
          </label>

          <select
            id="admin-organization"
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

          {selectedOrganization && (
            <p className="admin-dashboard__subtitle">
              Showing statistics for {selectedOrganization.name}.
            </p>
          )}
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
                <span className="admin-dashboard__stat-label">
                  {stat.label}
                </span>

                <strong className="admin-dashboard__stat-value">
                  {stat.value ?? 0}
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
                    Organization Analytics
                  </p>
                  <h2 className="admin-dashboard__panel-title">
                    Workspace performance
                  </h2>
                </div>
              </div>

              <div className="admin-dashboard__analytics-grid">
                <div className="admin-dashboard__analytics-card">
                  <span>Task Completion</span>
                  <strong>
                    {formatRate(dashboard.completionRate)}
                  </strong>
                </div>

                <div className="admin-dashboard__analytics-card">
                  <span>Tasks by Status</span>
                  <strong>{dashboard.totalTasks ?? 0} total</strong>
                </div>

                <div className="admin-dashboard__analytics-card">
                  <span>Team Workload</span>
                  <strong>
                    {dashboard.activeMembers ?? 0} active members
                  </strong>
                </div>
              </div>
            </article>

            <article className="admin-dashboard__panel">
              <div className="admin-dashboard__panel-header">
                <div>
                  <p className="admin-dashboard__panel-eyebrow">
                    Alerts
                  </p>
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
                      {dashboard.overdueTasks ?? 0} overdue tasks need
                      attention.
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
                        (dashboard.totalMembers ?? 0) -
                          (dashboard.activeMembers ?? 0)
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
                      Sprint deadline information is not yet available
                      in this dashboard API.
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
                    Organization Summary
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
                    Administration
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