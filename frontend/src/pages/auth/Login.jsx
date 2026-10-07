import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Determine which portal the user entered.
   *
   * Examples:
   * /admin/login        -> admin
   * /manager/login      -> manager
   * /team-member/login  -> team-member
   *
   * The URL is only the selected portal.
   * It does NOT grant the user that role.
   */
  const getPortal = () => {
    const path = location.pathname;

    if (path === "/admin/login") {
      return "admin";
    }

    if (path === "/manager/login") {
      return "manager";
    }

    if (path === "/team-member/login") {
      return "team-member";
    }

    return "default";
  };

  const portal = getPortal();

  const portalDetails = {
    admin: {
      title: "Admin Login",
      subtitle: "Sign in to the Enclave Admin workspace",
      registerPath: "/admin/register",
    },

    manager: {
      title: "Manager Login",
      subtitle: "Sign in to the Enclave Manager workspace",
      registerPath: "/manager/register",
    },

    "team-member": {
      title: "Team Member Login",
      subtitle: "Sign in to your Enclave workspace",
      registerPath: "/team-member/register",
    },

    default: {
      title: "Welcome back",
      subtitle: "Log in to your Enclave account",
      registerPath: "/register",
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

    if (isSubmitting) {
      return;
    }

    setAuthError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(
        formData.email,
        formData.password
      );

      /*
       * Login itself is still handled by the existing backend.
       *
       * For now we navigate to the existing dashboard.
       *
       * Later, after we connect the authenticated user's actual
       * organization role, this will become:
       *
       * ADMIN       -> Admin dashboard
       * MANAGER     -> Manager dashboard
       * TEAM MEMBER  -> Team Member dashboard
       */
      if (response?.user) {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setAuthError(
        err?.message ||
          "Unable to log in. Please check your credentials."
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
          <p
            className="login-page__auth-error"
            role="alert"
          >
            {authError}
          </p>
        )}

        <button
          type="submit"
          className="login-page__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Logging in..."
            : "Log in"}
        </button>
      </form>

      <div className="login-page__links">

        <Link
          to="/forgot-password"
          className="login-page__link"
        >
          Forgot password?
        </Link>

        <p className="login-page__register-text">
          Don&apos;t have an account?{" "}

          <Link
            to={currentPortal.registerPath}
            className="login-page__link"
          >
            Register
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Login;