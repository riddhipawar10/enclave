import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import { useAuth } from "../../context/AuthContext";

/**
 * Login Page
 *
 * Handles user login using the AuthContext's `login` function.
 * This page does NOT call axios or any API directly — all
 * network logic lives inside AuthContext / the auth service layer.
 *
 * IMPORTANT:
 * - Access tokens and refresh tokens are never displayed or logged here.
 * - Only form-level state (email, password, errors, loading) is kept locally.
 */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Field-level validation errors (e.g. "Email is required")
  const [fieldErrors, setFieldErrors] = useState({});

  // Error returned from the backend (e.g. "Invalid email or password")
  const [authError, setAuthError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the field error as soon as the user starts fixing it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions while a request is in flight
    if (isSubmitting) return;

    setAuthError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      // Show a clean, user-friendly message. Never log tokens here.
      setAuthError(
        err?.message || "Unable to log in. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your Enclave account"
    >
      <form onSubmit={handleSubmit} noValidate>
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
          placeholder="Enter your password"
          error={fieldErrors.password}
          required
          disabled={isSubmitting}
        />

        {authError && (
          <p className="login-page__auth-error" role="alert">
            {authError}
          </p>
        )}

        <button
          type="submit"
          className="login-page__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="login-page__links">
        <Link to="/forgot-password" className="login-page__link">
          Forgot password?
        </Link>
        <p className="login-page__register-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="login-page__link">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;