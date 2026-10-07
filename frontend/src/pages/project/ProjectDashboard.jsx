import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrganizations } from "../../services/organizationService";
import { getProjects } from "../../services/projectService";

import "./ProjectDashboard.css";

function ProjectDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError("");

        const organizations = await getMyOrganizations();

        const projectResponses = await Promise.all(
          organizations.map((organization) =>
            getProjects(organization.id)
          )
        );

        const allProjects = projectResponses.flat();

        setProjects(allProjects);
      } catch {
        setError("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return <p>Loading projects...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="project-dashboard">
      <div className="project-dashboard-header">
        <div>
          <h1>My Projects</h1>
          <p>Manage your organization's projects</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/projects/create")}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="project-dashboard-empty">
          <h2>No projects yet</h2>

          <p>
            Create your first project to start managing
            tasks and your team.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects/create")}
          >
            + Create Project
          </button>
        </div>
      ) : (
        <div className="project-dashboard-list">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
            >
              <h2>{project.name}</h2>

              <p>
                {project.description ||
                  "No description available."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/projects/${project.id}`)
                }
              >
                Open Project
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDashboard;