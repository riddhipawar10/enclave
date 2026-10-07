import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRoleSelect = (role) => {
    navigate(`/${role}/login`);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <main className="landing-page">

      {/* Hamburger Button */}
      <button
        type="button"
        className="landing-page__menu-button"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="landing-page__sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`landing-page__sidebar ${
          isSidebarOpen
            ? "landing-page__sidebar--open"
            : ""
        }`}
      >
        <div className="landing-page__sidebar-header">
          <h2>Enclave</h2>

          <button
            type="button"
            className="landing-page__sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        <nav className="landing-page__sidebar-nav">

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Dashboard
          </button>

          <button type="button" onClick={closeSidebar}>
            Projects
          </button>

          <button type="button" onClick={closeSidebar}>
            My Tasks
          </button>

          <button type="button" onClick={closeSidebar}>
            Boards
          </button>

          <button type="button" onClick={closeSidebar}>
            Calendar
          </button>

          <button type="button" onClick={closeSidebar}>
            Sprints
          </button>

          <button type="button" onClick={closeSidebar}>
            Team
          </button>

          <button type="button" onClick={closeSidebar}>
            Notifications
          </button>

          <button type="button" onClick={closeSidebar}>
            Analytics
          </button>

          <button type="button" onClick={closeSidebar}>
            AI Assistant
          </button>

          <button type="button" onClick={closeSidebar}>
            Activity
          </button>

          <button type="button" onClick={closeSidebar}>
            Audit Logs
          </button>

          <button type="button" onClick={closeSidebar}>
            Organizations
          </button>

          <button type="button" onClick={closeSidebar}>
            Settings
          </button>

        </nav>
      </aside>

      {/* Landing Content */}
      <section className="landing-page__hero">
        <p className="landing-page__eyebrow">
          Welcome to Enclave
        </p>

        <h1 className="landing-page__title">
          Manage your work.
          <br />
          Empower your team.
        </h1>

        <p className="landing-page__description">
          Enclave brings projects, tasks, teams, organizations,
          and collaboration together in one secure workspace.
        </p>
      </section>

      <section className="landing-page__roles">
        <h2 className="landing-page__roles-title">
          Choose your workspace
        </h2>

        <p className="landing-page__roles-subtitle">
          Select how you want to access Enclave.
        </p>

        <div className="landing-page__role-grid">

          <button
            type="button"
            className="landing-page__role-card"
            onClick={() => handleRoleSelect("admin")}
          >
            <span className="landing-page__role-icon">
              A
            </span>

            <span className="landing-page__role-name">
              ADMIN
            </span>

            <span className="landing-page__role-description">
              Manage organizations, members, roles,
              permissions, and platform settings.
            </span>

            <span className="landing-page__role-action">
              Continue →
            </span>
          </button>

          <button
            type="button"
            className="landing-page__role-card"
            onClick={() => handleRoleSelect("manager")}
          >
            <span className="landing-page__role-icon">
              M
            </span>

            <span className="landing-page__role-name">
              MANAGER
            </span>

            <span className="landing-page__role-description">
              Manage projects, teams, tasks, sprints,
              and organization activities.
            </span>

            <span className="landing-page__role-action">
              Continue →
            </span>
          </button>

          <button
            type="button"
            className="landing-page__role-card"
            onClick={() => handleRoleSelect("team-member")}
          >
            <span className="landing-page__role-icon">
              T
            </span>

            <span className="landing-page__role-name">
              TEAM MEMBER
            </span>

            <span className="landing-page__role-description">
              Work on assigned tasks, projects, boards,
              and team activities.
            </span>

            <span className="landing-page__role-action">
              Continue →
            </span>
          </button>

        </div>
      </section>
    </main>
  );
}

export default Landing;