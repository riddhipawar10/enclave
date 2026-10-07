import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyOrganizations,
  getOrganizationMembers,
} from "../../services/organizationService";

import { getProjects } from "../../services/projectService";
import { getSprints } from "../../services/sprintService";

import TaskList from "../task/TaskList";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [organizationId, setOrganizationId] = useState("");

  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);

  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");
  const [sprintsError, setSprintsError] = useState("");

  /*
   * Load project and determine its organization.
   */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setError("");

        const organizations = await getMyOrganizations();

        let foundProject = null;
        let foundOrganizationId = "";

        for (const organization of organizations) {
          const projects = await getProjects(organization.id);

          foundProject = projects.find(
            (item) => item.id === projectId
          );

          if (foundProject) {
            foundOrganizationId = organization.id;
            break;
          }
        }

        if (!foundProject) {
          setError("Project not found.");
          return;
        }

        setProject(foundProject);
        setOrganizationId(foundOrganizationId);
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Failed to load project.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  /*
   * Load organization team members and project sprints.
   */
  useEffect(() => {
    if (!organizationId || !projectId) {
      setMembers([]);
      setSprints([]);
      return;
    }

    const fetchProjectRelatedData = async () => {
      setIsLoadingMembers(true);
      setIsLoadingSprints(true);

      setMembersError("");
      setSprintsError("");

      /*
       * Load team members.
       */
      try {
        const memberData =
          await getOrganizationMembers(organizationId);

        setMembers(memberData || []);
      } catch (err) {
        console.error(
          "Failed to load project team members:",
          err
        );

        setMembers([]);
        setMembersError("Failed to load team members.");
      } finally {
        setIsLoadingMembers(false);
      }

      /*
       * Load project sprints.
       */
      try {
        const sprintData = await getSprints(
          organizationId,
          projectId
        );

        setSprints(sprintData || []);
      } catch (err) {
        console.error(
          "Failed to load project sprints:",
          err
        );

        setSprints([]);
        setSprintsError("Failed to load project sprints.");
      } finally {
        setIsLoadingSprints(false);
      }
    };

    fetchProjectRelatedData();
  }, [organizationId, projectId]);

  /*
   * Format member name.
   */
  const getMemberName = (member) => {
    const fullName = [
      member.firstName,
      member.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || member.email || "Unknown User";
  };

  /*
   * Format sprint date.
   */
  const formatSprintDate = (dateValue) => {
    if (!dateValue) {
      return "Not set";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Format sprint status.
   */
  const formatSprintStatus = (status) => {
    if (!status) {
      return "Not set";
    }

    return status
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div className="project-details">
        <p>Loading project...</p>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error || !project) {
    return (
      <div className="project-details">
        <p>{error || "Project not found."}</p>

        <button
          type="button"
          className="project-details-back-button"
          onClick={() => navigate("/projects")}
        >
          &larr; Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-details">
      {/* Back to Projects */}

      <button
        type="button"
        className="project-details-back-button"
        onClick={() => navigate("/projects")}
      >
        &larr; Back to Projects
      </button>

      {/* Project Header */}

      <div className="project-details-header">
        <div className="project-details-header-content">
          <h1>{project.name}</h1>

          <p>
            {project.description ||
              "No description available."}
          </p>
        </div>

        <button
          type="button"
          className="project-details-edit-button"
          onClick={() =>
            navigate(`/projects/${projectId}/edit`)
          }
        >
          Edit Project
        </button>
      </div>

      {/* Project Information */}

      <div className="project-details-info">
        <div>
          <h3>Start Date</h3>

          <p>
            {project.startDate || "Not set"}
          </p>
        </div>

        <div>
          <h3>End Date</h3>

          <p>
            {project.endDate || "Not set"}
          </p>
        </div>

        <div>
          <h3>Status</h3>

          <p>
            {project.archived
              ? "Archived"
              : "Active"}
          </p>
        </div>
      </div>

      {/* Project Sections */}

      <div className="project-details-sections">

        {/* =========================
            TASKS
        ========================== */}

        <section className="project-details-section">
          <div className="project-details-task-header">
            <div>
              <h2>Tasks</h2>

              <p>
                Tasks for this project are
                managed from the Tasks page.
              </p>
            </div>
          </div>

          <TaskList
            organizationId={organizationId}
            projectId={projectId}
          />
        </section>

        {/* =========================
            TEAM MEMBERS
        ========================== */}

        <section className="project-details-section">
          <div className="project-details-section-header">
            <div>
              <h2>Team Members</h2>

              <p>
                Members of this project's
                organization.
              </p>
            </div>

            <button
              type="button"
              className="project-details-action-button"
              onClick={() =>
                navigate("/team", {
                  state: {
                    organizationId,
                  },
                })
              }
            >
              Manage Team
            </button>
          </div>

          {isLoadingMembers ? (
            <p>Loading team members...</p>
          ) : membersError ? (
            <p>{membersError}</p>
          ) : members.length === 0 ? (
            <p>No team members found.</p>
          ) : (
            <div className="project-details-members">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="project-details-member-card"
                >
                  <div className="project-details-member-avatar">
                    {getMemberName(member)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="project-details-member-info">
                    <strong>
                      {getMemberName(member)}
                    </strong>

                    <span>
                      {member.email || "No email"}
                    </span>

                    <span>
                      {member.roleName || "Member"}
                    </span>
                  </div>

                  <span
                    className={
                      member.isActive
                        ? "project-details-member-status active"
                        : "project-details-member-status inactive"
                    }
                  >
                    {member.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            SPRINTS
        ========================== */}

        <section className="project-details-section">
          <div className="project-details-section-header">
            <div>
              <h2>Sprints</h2>

              <p>
                Sprints created for this
                project.
              </p>
            </div>

            <button
              type="button"
              className="project-details-action-button"
              onClick={() => navigate("/sprints")}
            >
              View Sprints
            </button>
          </div>

          {isLoadingSprints ? (
            <p>Loading sprints...</p>
          ) : sprintsError ? (
            <p>{sprintsError}</p>
          ) : sprints.length === 0 ? (
            <p>
              No sprints found for this
              project.
            </p>
          ) : (
            <div className="project-details-sprints">
              {sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="project-details-sprint-card"
                >
                  <div className="project-details-sprint-header">
                    <h3>{sprint.name}</h3>

                    <span>
                      {formatSprintStatus(
                        sprint.status
                      )}
                    </span>
                  </div>

                  {sprint.goal && (
                    <p>{sprint.goal}</p>
                  )}

                  <div className="project-details-sprint-dates">
                    <div>
                      <small>Start Date</small>

                      <strong>
                        {formatSprintDate(
                          sprint.startDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>End Date</small>

                      <strong>
                        {formatSprintDate(
                          sprint.endDate
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProjectDetails;