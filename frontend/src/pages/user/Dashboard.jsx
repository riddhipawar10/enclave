import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

/**
 * Dashboard Page
 *
 * Main landing page for authenticated users.
 *
 * IMPORTANT:
 * - Only safe, non-sensitive user fields are displayed (e.g. name, email).
 * - Access tokens and refresh tokens are NEVER displayed or logged here.
 * - This page does NOT implement Organization Management or RBAC —
 *   those modules will be added later by other team members
 *   (Madhura and Riddhi) in their own dedicated pages/routes.
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      // Navigate regardless of outcome — user intent is to leave
      // the authenticated area, and logout() is responsible for
      // clearing tokens/session on its end.
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__title">Enclave</h1>
        <button
          type="button"
          className="dashboard-page__logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <main className="dashboard-page__content">
        <div className="dashboard-page__card">
          <h2 className="dashboard-page__welcome">
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </h2>

          <div className="dashboard-page__user-info">
            {user?.name && (
              <p>
                <span className="dashboard-page__label">Name:</span>{" "}
                {user.name}
              </p>
            )}
            {user?.email && (
              <p>
                <span className="dashboard-page__label">Email:</span>{" "}
                {user.email}
              </p>
            )}
          </div>

          <p className="dashboard-page__placeholder-note">
            Organization and role-based features will appear here once
            those modules are integrated by the team.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;