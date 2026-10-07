import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getManagerDashboard } from "../../services/dashboardService";

import "./ManagerDashboard.css";

function ManagerDashboard({ organizationId }) {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setError("");

        const data =
          await getManagerDashboard(
            organizationId
          );

        setDashboard(data);

      } catch (err) {

        console.error(
          "Failed to load manager dashboard:",
          err
        );

        setError(
          "Failed to load manager dashboard."
        );

      } finally {

        setIsLoading(false);

      }

    };


    if (organizationId) {

      fetchDashboard();

    } else {

      setError(
        "Organization ID is missing."
      );

      setIsLoading(false);

    }

  }, [organizationId]);


  if (isLoading) {

    return (
      <div className="manager-dashboard">
        <p>Loading dashboard...</p>
      </div>
    );

  }


  if (error) {

    return (
      <div className="manager-dashboard">
        <p>{error}</p>
      </div>
    );

  }


  if (!dashboard) {

    return (
      <div className="manager-dashboard">
        <p>No dashboard data available.</p>
      </div>
    );

  }


  const teamWorkload =
    dashboard.teamWorkload || [];


  const urgentTasks =
    dashboard.urgentTasks || [];


  return (

    <div className="manager-dashboard">

      {/* ==========================================
          HEADER
          ========================================== */}

      <div className="manager-dashboard-header">

        <h1>
          Good morning, Riddhi 👋
        </h1>

        <p>
          Here's your team's progress
        </p>

      </div>


      {/* ==========================================
          SUMMARY
          ========================================== */}

      <div className="manager-dashboard-summary">

        <div className="manager-dashboard-card">

          <h3>Projects</h3>

          <p>
            {dashboard.projectCount}
          </p>

        </div>


        <div className="manager-dashboard-card">

          <h3>Tasks</h3>

          <p>
            {dashboard.taskCount}
          </p>

        </div>


        <div className="manager-dashboard-card">

          <h3>Completed</h3>

          <p>
            {dashboard.completedTaskCount}
          </p>

        </div>


        <div className="manager-dashboard-card">

          <h3>Overdue</h3>

          <p>
            {dashboard.overdueTaskCount}
          </p>

        </div>

      </div>


      {/* ==========================================
          PROJECT PROGRESS
          ========================================== */}

      <section className="manager-dashboard-section">

        <h2>
          Project Progress
        </h2>


        {dashboard.projects.length === 0 ? (

          <p>
            No projects found.
          </p>

        ) : (

          <div className="manager-dashboard-projects">

            {dashboard.projects.map(
              (project) => (

                <div
                  className="manager-dashboard-project-card"
                  key={project.projectId}
                >

                  <div className="manager-dashboard-project-header">

                    <h3>
                      {project.projectName}
                    </h3>

                    <span>
                      {project.progress}%
                    </span>

                  </div>


                  <div className="manager-dashboard-progress">

                    <div
                      className="manager-dashboard-progress-bar"
                      style={{
                        width:
                          `${project.progress}%`
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ==========================================
          TEAM WORKLOAD
          ========================================== */}

      <section className="manager-dashboard-section">

        <div className="manager-dashboard-section-header">

          <div>

            <h2>
              Team Workload
            </h2>

            <p>
              See how tasks are distributed
              across your team.
            </p>

          </div>

        </div>


        {teamWorkload.length === 0 ? (

          <div className="manager-dashboard-placeholder">

            <p>
              No team members found.
            </p>

          </div>

        ) : (

          <div className="manager-dashboard-workload">

            {teamWorkload.map(
              (member) => (

                <div
                  className="manager-dashboard-workload-card"
                  key={member.userId}
                >

                  <div className="manager-dashboard-workload-member">

                    <div className="manager-dashboard-member-avatar">

                      {member.userName
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}

                    </div>


                    <div>

                      <h3>
                        {member.userName}
                      </h3>

                      <span>
                        {member.totalTasks}{" "}
                        assigned
                      </span>

                    </div>

                  </div>


                  <div className="manager-dashboard-workload-stats">

                    <div>

                      <strong>
                        {member.totalTasks}
                      </strong>

                      <span>
                        Total
                      </span>

                    </div>


                    <div>

                      <strong>
                        {member.completedTasks}
                      </strong>

                      <span>
                        Completed
                      </span>

                    </div>


                    <div>

                      <strong>
                        {member.pendingTasks}
                      </strong>

                      <span>
                        Pending
                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ==========================================
          URGENT TASKS
          ========================================== */}

      <section className="manager-dashboard-section">

        <div className="manager-dashboard-section-header">

          <div>

            <h2>
              Urgent Tasks
            </h2>

            <p>
              High and urgent priority tasks
              that need attention.
            </p>

          </div>

        </div>


        {urgentTasks.length === 0 ? (

          <div className="manager-dashboard-placeholder">

            <p>
              No high-priority or urgent tasks.
            </p>

          </div>

        ) : (

          <div className="manager-dashboard-urgent-tasks">

            {urgentTasks.map(
              (task) => (

                <div
                  className="manager-dashboard-urgent-card"
                  key={task.taskId}
                  onClick={() =>
                    navigate(
                      `/tasks/${task.projectId}/${task.taskId}/edit`
                    )
                  }
                >

                  <div className="manager-dashboard-urgent-main">

                    <div className="manager-dashboard-urgent-title-row">

                      <h3>
                        {task.taskTitle}
                      </h3>

                      <span
                        className={
                          task.priority === "URGENT"
                            ? "manager-dashboard-priority urgent"
                            : "manager-dashboard-priority high"
                        }
                      >
                        {task.priority}
                      </span>

                    </div>


                    <p>
                      {task.projectName}
                    </p>

                  </div>


                  <div className="manager-dashboard-urgent-details">

                    <div>

                      <span>
                        Assignee
                      </span>

                      <strong>
                        {task.assignedTo ||
                          "Unassigned"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Due date
                      </span>

                      <strong>
                        {task.dueDate ||
                          "No due date"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Status
                      </span>

                      <strong>
                        {task.status}
                      </strong>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>

  );
}

export default ManagerDashboard;