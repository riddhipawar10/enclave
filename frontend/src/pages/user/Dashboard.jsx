import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getMyOrganizations,
  getOrganizationMembers,
} from "../../services/organizationService";

import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";

import "./Dashboard.css";

const IN_PROGRESS_STATUS_ID =
  "cf8e322b-86ed-4597-8d4c-dd17dc917273";

const DONE_STATUS_ID =
  "ceceaeed-5a8f-494f-9005-8c7330eb4e35";

const HIGH_PRIORITY_ID =
  "ccb1a560-2cfe-4b5f-9fe3-d8af19196e55";

const URGENT_PRIORITY_ID =
  "17153d97-f8bc-4fc6-8b41-abf279b98152";

function getPriorityLabel(priorityId) {
  if (priorityId === URGENT_PRIORITY_ID) {
    return "Urgent";
  }

  if (priorityId === HIGH_PRIORITY_ID) {
    return "High";
  }

  return "Normal";
}

function getStatusLabel(statusId) {
  if (statusId === DONE_STATUS_ID) {
    return "Done";
  }

  if (statusId === IN_PROGRESS_STATUS_ID) {
    return "In Progress";
  }

  return "To Do";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "No due date";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate) {
    return false;
  }

  const dueDate = new Date(task.dueDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return (
    dueDate < today &&
    task.statusId !== DONE_STATUS_ID
  );
}

function getRoleLabel(roleName) {
  if (roleName === "ADMIN") {
    return "Administrator";
  }

  if (roleName === "MANAGER") {
    return "Manager";
  }

  if (roleName === "TEAM_MEMBER") {
    return "Team Member";
  }

  return roleName || "Member";
}

function getMemberName(member) {
  if (member.firstName || member.lastName) {
    return `${member.firstName || ""} ${
      member.lastName || ""
    }`.trim();
  }

  if (member.user?.firstName || member.user?.lastName) {
    return `${member.user?.firstName || ""} ${
      member.user?.lastName || ""
    }`.trim();
  }

  if (member.name) {
    return member.name;
  }

  if (member.user?.name) {
    return member.user.name;
  }

  return member.email || "Unknown member";
}

function getMemberEmail(member) {
  return (
    member.email ||
    member.user?.email ||
    ""
  );
}

function getMemberUserId(member) {
  return (
    member.userId ||
    member.user?.id ||
    member.id
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        /*
         * ----------------------------------------------------
         * Load organizations
         * ----------------------------------------------------
         */
        const organizationData =
          await getMyOrganizations();

        setOrganizations(organizationData);

        /*
         * ----------------------------------------------------
         * Load projects for every organization
         * ----------------------------------------------------
         */
        const organizationProjects =
          await Promise.all(
            organizationData.map(
              async (organization) => {
                const organizationProjectData =
                  await getProjects(
                    organization.id
                  );

                return {
                  organization,
                  projects:
                    organizationProjectData,
                };
              }
            )
          );

        /*
         * ----------------------------------------------------
         * Flatten all projects
         * ----------------------------------------------------
         */
        const allProjects =
          organizationProjects.flatMap(
            (item) => item.projects
          );

        setProjects(allProjects);

        /*
         * ----------------------------------------------------
         * Load tasks for every project
         * ----------------------------------------------------
         */
        const taskResponses =
          await Promise.all(
            organizationProjects.flatMap(
              (item) =>
                item.projects.map(
                  (project) =>
                    getTasks(
                      item.organization.id,
                      project.id
                    )
                )
            )
          );

        const allTasks =
          taskResponses.flat();

        setTasks(allTasks);

        /*
         * ----------------------------------------------------
         * Load organization members for Admin / Manager
         * ----------------------------------------------------
         */
        const shouldLoadTeam =
          organizationData.some(
            (organization) =>
              organization.roleName === "ADMIN" ||
              organization.roleName === "MANAGER"
          );

        if (shouldLoadTeam) {
          const memberResponses =
            await Promise.all(
              organizationData.map(
                (organization) =>
                  getOrganizationMembers(
                    organization.id
                  )
              )
            );

          const allMembers =
            memberResponses.flatMap(
              (organizationMembers, index) =>
                organizationMembers.map(
                  (member) => ({
                    ...member,
                    organizationId:
                      organizationData[
                        index
                      ].id,
                    organizationName:
                      organizationData[
                        index
                      ].name,
                  })
                )
            );

          /*
           * Avoid duplicate users when the same
           * user belongs to multiple organizations.
           */
          const uniqueMembers =
            Array.from(
              new Map(
                allMembers.map(
                  (member) => [
                    getMemberUserId(member),
                    member,
                  ]
                )
              ).values()
            );

          setMembers(uniqueMembers);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err
        );

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  /*
   * ----------------------------------------------------
   * User roles
   * ----------------------------------------------------
   */
  const roles = useMemo(() => {
    return organizations.map(
      (organization) =>
        organization.roleName
    );
  }, [organizations]);

  const isAdmin =
    roles.includes("ADMIN");

  const isManager =
    roles.includes("MANAGER");

  /*
   * ----------------------------------------------------
   * Personal tasks
   * ----------------------------------------------------
   */
  const personalTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.assignedTo === user?.id
    );
  }, [tasks, user?.id]);

  /*
   * ----------------------------------------------------
   * Personal statistics
   * ----------------------------------------------------
   */
  const personalStatistics = useMemo(() => {
    const total =
      personalTasks.length;

    const inProgress =
      personalTasks.filter(
        (task) =>
          task.statusId ===
          IN_PROGRESS_STATUS_ID
      ).length;

    const completed =
      personalTasks.filter(
        (task) =>
          task.statusId ===
          DONE_STATUS_ID
      ).length;

    const overdue =
      personalTasks.filter(
        isOverdue
      ).length;

    return {
      total,
      inProgress,
      completed,
      overdue,
    };
  }, [personalTasks]);

  /*
   * ----------------------------------------------------
   * Organization statistics
   * ----------------------------------------------------
   */
  const organizationStatistics =
    useMemo(() => {
      const totalTasks =
        tasks.length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.statusId ===
            DONE_STATUS_ID
        ).length;

      const overdueTasks =
        tasks.filter(
          isOverdue
        ).length;

      return {
        totalTasks,
        completedTasks,
        overdueTasks,
        projectCount:
          projects.length,
        organizationCount:
          organizations.length,
      };
    }, [
      tasks,
      projects,
      organizations,
    ]);

  /*
   * ----------------------------------------------------
   * Project progress
   * ----------------------------------------------------
   */
  const projectProgress =
    useMemo(() => {
      return projects.map(
        (project) => {
          const projectTasks =
            tasks.filter(
              (task) =>
                task.projectId ===
                project.id
            );

          const totalTasks =
            projectTasks.length;

          const completedTasks =
            projectTasks.filter(
              (task) =>
                task.statusId ===
                DONE_STATUS_ID
            ).length;

          const progress =
            totalTasks === 0
              ? 0
              : Math.round(
                  (completedTasks /
                    totalTasks) *
                    100
                );

          return {
            ...project,
            totalTasks,
            completedTasks,
            progress,
          };
        }
      );
    }, [projects, tasks]);

  /*
   * ----------------------------------------------------
   * Team workload
   *
   * Total
   * Completed
   * Pending
   * Overdue
   * ----------------------------------------------------
   */
  const teamOverview =
    useMemo(() => {
      return members
        .map((member) => {
          const memberId =
            getMemberUserId(member);

          const memberTasks =
            tasks.filter(
              (task) =>
                task.assignedTo ===
                memberId
            );

          const completedTasks =
            memberTasks.filter(
              (task) =>
                task.statusId ===
                DONE_STATUS_ID
            );

          const pendingTasks =
            memberTasks.filter(
              (task) =>
                task.statusId !==
                DONE_STATUS_ID
            );

          const overdueTasks =
            pendingTasks.filter(
              isOverdue
            );

          return {
            ...member,

            memberId,

            memberName:
              getMemberName(member),

            memberEmail:
              getMemberEmail(member),

            totalTasks:
              memberTasks.length,

            completedTasks:
              completedTasks.length,

            pendingTasks:
              pendingTasks.length,

            overdueTasks:
              overdueTasks.length,
          };
        })
        .sort(
          (a, b) =>
            b.pendingTasks -
            a.pendingTasks
        );
    }, [members, tasks]);

  /*
   * ----------------------------------------------------
   * Urgent / High priority tasks
   *
   * Managers and Admins can quickly see important work.
   * Clicking a task opens Edit Task.
   * ----------------------------------------------------
   */
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.statusId !== DONE_STATUS_ID &&
          (task.priorityId ===
            HIGH_PRIORITY_ID ||
            task.priorityId ===
              URGENT_PRIORITY_ID)
      )
      .map((task) => {
        const assignedMember =
          members.find(
            (member) =>
              getMemberUserId(member) ===
              task.assignedTo
          );

        return {
          ...task,

          assigneeName:
            task.assignedTo
              ? assignedMember
                ? getMemberName(
                    assignedMember
                  )
                : "Assigned user"
              : "Unassigned",
        };
      })
      .sort((a, b) => {
        /*
         * Urgent first.
         */
        if (
          a.priorityId ===
            URGENT_PRIORITY_ID &&
          b.priorityId !==
            URGENT_PRIORITY_ID
        ) {
          return -1;
        }

        if (
          a.priorityId !==
            URGENT_PRIORITY_ID &&
          b.priorityId ===
            URGENT_PRIORITY_ID
        ) {
          return 1;
        }

        /*
         * Then sort by due date.
         * Tasks without a due date go last.
         */
        if (!a.dueDate && !b.dueDate) {
          return 0;
        }

        if (!a.dueDate) {
          return 1;
        }

        if (!b.dueDate) {
          return -1;
        }

        return (
          new Date(a.dueDate) -
          new Date(b.dueDate)
        );
      })
      .slice(0, 8);
  }, [tasks, members]);

  /*
   * ----------------------------------------------------
   * Upcoming personal tasks
   * ----------------------------------------------------
   */
  const upcomingTasks =
    useMemo(() => {
      return [...personalTasks]
        .filter(
          (task) =>
            task.dueDate &&
            task.statusId !==
              DONE_STATUS_ID
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        )
        .slice(0, 5);
    }, [personalTasks]);

  /*
   * ----------------------------------------------------
   * Recent projects
   * ----------------------------------------------------
   */
  const recentProjects =
    useMemo(() => {
      return projectProgress.slice(
        0,
        5
      );
    }, [projectProgress]);

  /*
   * ----------------------------------------------------
   * Role summary
   * ----------------------------------------------------
   */
  const roleSummary =
    useMemo(() => {
      const roleCounts = {};

      organizations.forEach(
        (organization) => {
          const role =
            organization.roleName ||
            "MEMBER";

          roleCounts[role] =
            (roleCounts[role] || 0) +
            1;
        }
      );

      return Object.entries(
        roleCounts
      );
    }, [organizations]);

  /*
   * ----------------------------------------------------
   * Dashboard subtitle
   * ----------------------------------------------------
   */
  const dashboardSubtitle =
    useMemo(() => {
      if (isAdmin) {
        return "Here's an overview of your organizations and projects.";
      }

      if (isManager) {
        return "Here's an overview of your team's work and project progress.";
      }

      return "Here's an overview of your tasks and upcoming work.";
    }, [isAdmin, isManager]);

  /*
   * ----------------------------------------------------
   * Loading
   * ----------------------------------------------------
   */
  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__state">
          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * Error
   * ----------------------------------------------------
   */
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__state dashboard-page__state--error">
          <h2>
            Unable to load dashboard
          </h2>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * MAIN DASHBOARD
   *
   * IMPORTANT:
   * We DO NOT render ManagerDashboard here.
   *
   * /dashboard remains the common dashboard.
   * ----------------------------------------------------
   */
  return (
    <div className="dashboard-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <header className="dashboard-page__header">
        <div>
          <h1 className="dashboard-page__title">
            Welcome back
            {user?.firstName
              ? `, ${user.firstName}`
              : ""}{" "}
            👋
          </h1>

          <p className="dashboard-page__subtitle">
            {dashboardSubtitle}
          </p>
        </div>
      </header>

      <main>

        {/* ==================================================
            WORKSPACE / ORGANIZATIONS
            ================================================== */}

        <section className="dashboard-page__section dashboard-page__role-section">

          <div className="dashboard-page__section-header">
            <div>
              <h2>
                Your Workspace
              </h2>

              <p>
                Your organization
                memberships and
                roles.
              </p>
            </div>
          </div>

          <div className="dashboard-page__organization-list">

            {organizations.length ===
            0 ? (
              <div className="dashboard-page__empty">
                <div>🏢</div>

                <h3>
                  No organizations
                  yet
                </h3>

                <p>
                  You are not
                  currently a member
                  of an organization.
                </p>
              </div>
            ) : (
              organizations.map(
                (organization) => (
                  <div
                    className="dashboard-page__organization dashboard-page__clickable"
                    key={
                      organization.id
                    }
                    onClick={() =>
                      navigate(
                        `/organizations/${organization.id}`
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
                        navigate(
                          `/organizations/${organization.id}`
                        );
                      }
                    }}
                  >

                    <div className="dashboard-page__organization-icon">
                      🏢
                    </div>

                    <div className="dashboard-page__organization-info">

                      <h3>
                        {
                          organization.name
                        }
                      </h3>

                      <span>
                        {getRoleLabel(
                          organization.roleName
                        )}
                      </span>

                    </div>
                  </div>
                )
              )
            )}

          </div>

          {roleSummary.length >
            0 && (
            <div className="dashboard-page__role-summary">

              {roleSummary.map(
                ([role, count]) => (
                  <span key={role}>
                    {getRoleLabel(
                      role
                    )}

                    {count > 1
                      ? ` × ${count}`
                      : ""}
                  </span>
                )
              )}

            </div>
          )}

        </section>

        {/* ==================================================
            STATISTICS
            ================================================== */}

        <section className="dashboard-page__stats">

          {isAdmin ||
          isManager ? (
            <>
              <div className="dashboard-page__stat-card">

                <span>
                  Projects
                </span>

                <strong>
                  {
                    organizationStatistics.projectCount
                  }
                </strong>

                <small>
                  Projects across
                  your
                  organizations
                </small>

              </div>

              <div className="dashboard-page__stat-card">

                <span>
                  Total Tasks
                </span>

                <strong>
                  {
                    organizationStatistics.totalTasks
                  }
                </strong>

                <small>
                  Tasks across
                  your projects
                </small>

              </div>

              <div className="dashboard-page__stat-card">

                <span>
                  Completed
                </span>

                <strong>
                  {
                    organizationStatistics.completedTasks
                  }
                </strong>

                <small>
                  Completed
                  project tasks
                </small>

              </div>

              <div className="dashboard-page__stat-card dashboard-page__stat-card--danger">

                <span>
                  Overdue
                </span>

                <strong>
                  {
                    organizationStatistics.overdueTasks
                  }
                </strong>

                <small>
                  Tasks past
                  their due date
                </small>

              </div>
            </>
          ) : (
            <>
              <div className="dashboard-page__stat-card">

                <span>
                  My Tasks
                </span>

                <strong>
                  {
                    personalStatistics.total
                  }
                </strong>

                <small>
                  Tasks assigned
                  to you
                </small>

              </div>

              <div className="dashboard-page__stat-card">

                <span>
                  In Progress
                </span>

                <strong>
                  {
                    personalStatistics.inProgress
                  }
                </strong>

                <small>
                  Currently being
                  worked on
                </small>

              </div>

              <div className="dashboard-page__stat-card">

                <span>
                  Completed
                </span>

                <strong>
                  {
                    personalStatistics.completed
                  }
                </strong>

                <small>
                  Finished tasks
                </small>

              </div>

              <div className="dashboard-page__stat-card dashboard-page__stat-card--danger">

                <span>
                  Overdue
                </span>

                <strong>
                  {
                    personalStatistics.overdue
                  }
                </strong>

                <small>
                  Past their due
                  date
                </small>

              </div>
            </>
          )}

        </section>

        {/* ==================================================
            TEAM OVERVIEW
            ================================================== */}

        {(isAdmin || isManager) && (
          <section className="dashboard-page__section dashboard-page__team-section">

            <div className="dashboard-page__section-header">

              <div>
                <h2>
                  Team Overview
                </h2>

                <p>
                  Current workload
                  across your
                  organization.
                </p>
              </div>

              <span className="dashboard-page__team-count">
                {teamOverview.length}{" "}
                member
                {teamOverview.length !==
                1
                  ? "s"
                  : ""}
              </span>

            </div>

            {teamOverview.length ===
            0 ? (
              <div className="dashboard-page__empty">

                <div>👥</div>

                <h3>
                  No team members
                </h3>

                <p>
                  There are no
                  members available
                  for your
                  organizations.
                </p>

              </div>
            ) : (
              <div className="dashboard-page__team-list">

                {teamOverview.map(
                  (member) => (
                    <div
                      className="dashboard-page__team-member"
                      key={
                        member.memberId
                      }
                    >

                      <div className="dashboard-page__team-avatar">
                        {member.memberName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="dashboard-page__team-member-info">

                        <h3>
                          {
                            member.memberName
                          }
                        </h3>

                        <div className="dashboard-page__team-member-meta">

                          <span>
                            {getRoleLabel(
                              member.roleName
                            )}
                          </span>

                          {member.memberEmail && (
                            <small>
                              {
                                member.memberEmail
                              }
                            </small>
                          )}

                        </div>

                      </div>

                      <div className="dashboard-page__team-workload">

                        <div>
                          <strong>
                            {
                              member.totalTasks
                            }
                          </strong>

                          <span>
                            Total
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              member.completedTasks
                            }
                          </strong>

                          <span>
                            Completed
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              member.pendingTasks
                            }
                          </strong>

                          <span>
                            Pending
                          </span>
                        </div>

                        {member.overdueTasks >
                          0 && (
                          <div className="dashboard-page__team-workload--danger">

                            <strong>
                              {
                                member.overdueTasks
                              }
                            </strong>

                            <span>
                              Overdue
                            </span>

                          </div>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        )}

        {/* ==================================================
            URGENT TASKS
            ================================================== */}

        {(isAdmin || isManager) && (
          <section className="dashboard-page__section dashboard-page__urgent-section">

            <div className="dashboard-page__section-header">

              <div>
                <h2>
                  Urgent Tasks
                </h2>

                <p>
                  High and urgent
                  priority tasks that
                  need attention.
                </p>
              </div>

              <span className="dashboard-page__team-count">
                {urgentTasks.length}
                {" "}
                task
                {urgentTasks.length !==
                1
                  ? "s"
                  : ""}
              </span>

            </div>

            {urgentTasks.length ===
            0 ? (
              <div className="dashboard-page__empty">

                <div>✓</div>

                <h3>
                  No urgent tasks
                </h3>

                <p>
                  There are no
                  high or urgent
                  priority tasks
                  requiring attention.
                </p>

              </div>
            ) : (
              <div className="dashboard-page__task-list">

                {urgentTasks.map(
                  (task) => (
                    <div
                      className="dashboard-page__task dashboard-page__clickable"
                      key={task.id}
                      onClick={() =>
                        navigate(
                          `/tasks/${task.projectId}/${task.id}/edit`
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
                          navigate(
                            `/tasks/${task.projectId}/${task.id}/edit`
                          );
                        }
                      }}
                    >

                      <div className="dashboard-page__task-main">

                        <h3>
                          {
                            task.title
                          }
                        </h3>

                        <span>
                          {getPriorityLabel(
                            task.priorityId
                          )}
                        </span>

                      </div>

                      <div className="dashboard-page__task-date">

                        <strong>
                          {
                            task.assigneeName
                          }
                        </strong>

                        <small>
                          Due:{" "}
                          {formatDate(
                            task.dueDate
                          )}
                        </small>

                        <small>
                          Status:{" "}
                          {getStatusLabel(
                            task.statusId
                          )}
                        </small>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        )}

        {/* ==================================================
            MAIN DASHBOARD
            ================================================== */}

        <div className="dashboard-page__grid">

          {/* ==================================================
              UPCOMING TASKS
              ================================================== */}

          <section className="dashboard-page__section">

            <div className="dashboard-page__section-header">

              <div>
                <h2>
                  Upcoming Tasks
                </h2>

                <p>
                  Your next tasks
                  that need
                  attention.
                </p>
              </div>

            </div>

            {upcomingTasks.length ===
            0 ? (
              <div className="dashboard-page__empty">

                <div>✓</div>

                <h3>
                  No upcoming tasks
                </h3>

                <p>
                  You're all caught
                  up.
                </p>

              </div>
            ) : (
              <div className="dashboard-page__task-list">

                {upcomingTasks.map(
                  (task) => (
                    <div
                      className="dashboard-page__task dashboard-page__clickable"
                      key={task.id}
                      onClick={() =>
                        navigate(
                          `/tasks/${task.projectId}/${task.id}/edit`
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
                          navigate(
                            `/tasks/${task.projectId}/${task.id}/edit`
                          );
                        }
                      }}
                    >

                      <div className="dashboard-page__task-main">

                        <h3>
                          {
                            task.title
                          }
                        </h3>

                        <span>
                          {getPriorityLabel(
                            task.priorityId
                          )}
                        </span>

                      </div>

                      <div className="dashboard-page__task-date">

                        <strong>
                          {formatDate(
                            task.dueDate
                          )}
                        </strong>

                        {isOverdue(
                          task
                        ) && (
                          <small>
                            Overdue
                          </small>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* ==================================================
              RECENT PROJECTS
              ================================================== */}

          <section className="dashboard-page__section">

            <div className="dashboard-page__section-header">

              <div>
                <h2>
                  Recent Projects
                </h2>

                <p>
                  Projects available
                  in your
                  organizations.
                </p>
              </div>

            </div>

            {recentProjects.length ===
            0 ? (
              <div className="dashboard-page__empty">

                <div>📁</div>

                <h3>
                  No projects yet
                </h3>

                <p>
                  Your organizations
                  don't have any
                  projects yet.
                </p>

              </div>
            ) : (
              <div className="dashboard-page__project-list">

                {recentProjects.map(
                  (project) => (
                    <div
                      className="dashboard-page__project dashboard-page__clickable"
                      key={project.id}
                      onClick={() =>
                        navigate(
                          `/projects/${project.id}`
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
                          navigate(
                            `/projects/${project.id}`
                          );
                        }
                      }}
                    >

                      <div className="dashboard-page__project-icon">
                        📁
                      </div>

                      <div className="dashboard-page__project-content">

                        <div className="dashboard-page__project-header">

                          <div>
                            <h3>
                              {
                                project.name
                              }
                            </h3>

                            <p>
                              {project.description ||
                                "No description available."}
                            </p>
                          </div>

                          <strong className="dashboard-page__project-progress-value">
                            {
                              project.progress
                            }
                            %
                          </strong>

                        </div>

                        <div className="dashboard-page__project-progress">

                          <div
                            className="dashboard-page__project-progress-bar"
                            style={{
                              width: `${project.progress}%`,
                            }}
                          />

                        </div>

                        <div className="dashboard-page__project-progress-label">

                          <span>
                            {
                              project.completedTasks
                            }{" "}
                            of{" "}
                            {
                              project.totalTasks
                            }{" "}
                            tasks
                            completed
                          </span>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;