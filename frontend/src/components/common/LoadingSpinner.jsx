/*import React from "react";*/
import "./LoadingSpinner.css";

/**
 * LoadingSpinner
 *
 * Simple, reusable loading indicator used throughout the app
 * (auth session checks, data fetching, etc).
 *
 * IMPORTANT:
 * - This component holds NO API logic.
 * - This component holds NO authentication logic.
 * - It is purely presentational.
 *
 * Props:
 * - message (string) optional text shown below the spinner
 *           (default: "Loading...")
 */
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__circle" aria-hidden="true" />
      {message && <p className="loading-spinner__message">{message}</p>}
      <span className="loading-spinner__sr-only">{message}</span>
    </div>
  );
}

export default LoadingSpinner;