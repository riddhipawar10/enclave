import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";

/**
 * Forgot Password Page (PLACEHOLDER)
 *
 * ------------------------------------------------------------------
 * IMPORTANT — BACKEND STATUS
 * ------------------------------------------------------------------
 * The backend does NOT currently expose a confirmed
 * forgot-password / reset-password API endpoint.
 *
 * This page is intentionally a UI-only placeholder:
 * - It does NOT call any API.
 * - It does NOT invent an endpoint path.
 * - The email input is shown for UX completeness, but submitting
 *   the form does not send a network request — it simply shows
 *   an informational message to the user.
 *
 * ------------------------------------------------------------------
 * HOW TO WIRE THIS UP LATER
 * ------------------------------------------------------------------
 * Once the backend team confirms a real endpoint, this is the
 * only function that needs to change: `handleSubmit`.
 *
 * Example of what it might look like later:
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     if (isSubmitting) return;
 *     setIsSubmitting(true);
 *     try {
 *       await forgotPassword(email); // from AuthContext, once available
 *       setSubmitted(true);
 *     } catch (err) {
 *       setError(err?.message || "Something went wrong.");
 *     } finally {
 *       setIsSubmitting(false);
 *     }
 *   };
 *
 * No other part of this page should need to change.
 */
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError("");
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    // NOTE: No API call happens here yet — see comment block above.
    // We simply acknowledge the input and inform the user that this
    // feature is not connected to the backend yet.
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Password recovery is coming soon"
    >
      {submitted ? (
        <div className="forgot-password-page__notice" role="status">
          <p>
            Thanks! Password recovery isn&apos;t connected to the backend
            yet. Once it&apos;s available, we&apos;ll use{" "}
            <strong>{email}</strong> to send reset instructions.
          </p>
        </div>
      ) : (
        <>
          <p className="forgot-password-page__description">
            This feature is being built. For now, enter your email below —
            it won&apos;t be sent anywhere yet, but the form is ready for
            when password recovery goes live.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={fieldError}
              required
            />

            <button
              type="submit"
              className="forgot-password-page__submit"
            >
              Notify me when this is available
            </button>
          </form>
        </>
      )}

      <div className="forgot-password-page__links">
        <Link to="/login" className="forgot-password-page__link">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;