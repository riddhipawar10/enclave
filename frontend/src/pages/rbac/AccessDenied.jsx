/*import React from "react";*/
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AccessDenied.css";

/**
 * AccessDenied Page
 *
 * Reusable 403 page for permission-gated routes and navigation.
 * Mirrors NotFound.jsx's structure exactly. Uses useAuth() only to
 * decide where the button should point - no API calls, no other logic.
 *
 * Usage:
 * - Render directly when a permission check fails
 *   (e.g. in a route guard or inside a page component).
 * - Or navigate to it: navigate("/access-denied")
 */
function AccessDenied() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="access-denied-page">
      <div className="access-denied-page__card">
        <h1 className="access-denied-page__code">403</h1>
        <p className="access-denied-page__message">Access Denied</p>
        <p className="access-denied-page__description">
          You don&apos;t have permission to view this page or perform this
          action. If you believe this is a mistake, contact your
          organization administrator.
        </p>

        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="access-denied-page__button"
        >
          {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}

export default AccessDenied;
