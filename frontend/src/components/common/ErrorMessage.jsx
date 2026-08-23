/*import React from "react";*/
import "./ErrorMessage.css";

/**
 * ErrorMessage
 *
 * Reusable, user-friendly error display component, meant to be
 * shared across Login, Register, Dashboard, and future modules
 * (Organization, RBAC, etc).
 *
 * IMPORTANT:
 * - Displays ONLY the message passed in — never stack traces,
 *   raw error objects, or backend internals.
 * - Does NOT log anything (no console.log/console.error here).
 *   Logging, if needed, belongs in the calling code or a dedicated
 *   error-handling utility, not in this presentational component.
 * - Renders nothing if no message is provided, so it's always
 *   safe to include in a form/page without conditional wrapping.
 *
 * Props:
 * - message (string) the user-friendly error text to display
 */
function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;