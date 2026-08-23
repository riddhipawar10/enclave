import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./NotFound.css";

/**
 * NotFound Page
 *
 * Simple fallback for unmatched routes. Uses useAuth() only to
 * decide where the "go back" link should point — no API calls,
 * no other logic.
 */
function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-page">
      <div className="not-found-page__card">
        <h1 className="not-found-page__code">404</h1>
        <p className="not-found-page__message">Page Not Found</p>
        <p className="not-found-page__description">
          The page you&apos;re looking for doesn&apos;t exist or may have
          been moved.
        </p>

        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="not-found-page__button"
        >
          {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;