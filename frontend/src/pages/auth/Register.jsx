import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import { useAuth } from "../../context/AuthContext";

/**
 * Register Page
 *
 * Handles new user registration using AuthContext's `register` function.
 * This page does NOT call axios or any API directly — all network
 * logic lives inside AuthContext / the auth service layer.
 *
 * IMPORTANT:
 * - Passwords and tokens are never logged or displayed here.
 * - Only form-level state (fields, errors, loading) is kept locally.
 *
 * NOTE ON NAVIGATION:
 * The backend response shape after registration isn't finalized yet.
 * This page checks whether `register()` returns an authenticated
 * session (e.g. a user/accessToken) and navigates to /dashboard if so,
 * otherwise falls back to /login. Adjust this once AuthContext's
 * exact return shape is confirmed.
 */
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isValidEmail = (email) => {
    // Simple, readable email pattern — good enough for frontend validation.
    // Final validation always happens on the backend too.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setAuthError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password
      );

      // If registration also returns an authenticated session
      // (user info / access token), treat the user as logged in.
      // Otherwise, send them to Login to sign in manually.
      const isAuthenticated = Boolean(
        response && (response.accessToken || response.user)
      );

      navigate(isAuthenticated ? "/dashboard" : "/login");
    } catch (err) {
      // Handle duplicate email and other backend validation errors cleanly.
      setAuthError(
        err?.message || "Unable to register. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Enclave to get started"
    >
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Full Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          error={fieldErrors.name}
          required
          disabled={isSubmitting}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={fieldErrors.email}
          required
          disabled={isSubmitting}
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          error={fieldErrors.password}
          required
          disabled={isSubmitting}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
          required
          disabled={isSubmitting}
        />

        {authError && (
          <p className="register-page__auth-error" role="alert">
            {authError}
          </p>
        )}

        <button
          type="submit"
          className="register-page__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="register-page__links">
        <p className="register-page__login-text">
          Already have an account?{" "}
          <Link to="/login" className="register-page__link">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;