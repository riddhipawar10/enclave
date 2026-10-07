import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Determine which portal the user entered.
   *
   * This identifies the selected portal only.
   * It does NOT assign a backend role.
   */
  const getPortal = () => {
    const path = location.pathname;

    if (path === "/admin/register") {
      return "admin";
    }

    if (path === "/manager/register") {
      return "manager";
    }

    if (path === "/team-member/register") {
      return "team-member";
    }

    return "default";
  };

  const portal = getPortal();

  const portalDetails = {
    admin: {
      title: "Create Admin Account",
      subtitle: "Register for the Enclave Admin workspace",
      loginPath: "/admin/login",
    },

    manager: {
      title: "Create Manager Account",
      subtitle: "Register for the Enclave Manager workspace",
      loginPath: "/manager/login",
    },

    "team-member": {
      title: "Create Team Member Account",
      subtitle: "Register for your Enclave workspace",
      loginPath: "/team-member/login",
    },

    default: {
      title: "Create your account",
      subtitle: "Join Enclave to get started",
      loginPath: "/login",
    },
  };

  const currentPortal = portalDetails[portal];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (authError) {
      setAuthError("");
    }
  };

  const isValidEmail = (email) => {
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
      errors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.confirmPassword !== formData.password
    ) {
      errors.confirmPassword =
        "Passwords do not match.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setAuthError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password
      );

      /*
       * Registration should NOT automatically take the user
       * into the dashboard.
       *
       * Send them back to the login page for the portal
       * they selected.
       */
      navigate(currentPortal.loginPath);
    } catch (err) {
      setAuthError(
        err?.message ||
          "Unable to register. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={currentPortal.title}
      subtitle={currentPortal.subtitle}
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
          <p
            className="register-page__auth-error"
            role="alert"
          >
            {authError}
          </p>
        )}

        <button
          type="submit"
          className="register-page__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account..."
            : "Create account"}
        </button>

      </form>

      <div className="register-page__links">
        <p className="register-page__login-text">
          Already have an account?{" "}

          <Link
            to={currentPortal.loginPath}
            className="register-page__link"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;