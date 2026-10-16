
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { acceptInvitation } from "../../services/authService";

import "./AcceptInvitation.css";

const ROLE_NAMES = {
  "39576268-0d01-4f94-88bf-8d36c468de03": "Admin",
  "6dc96f63-0099-4e6a-9290-7bc7e0920ab2": "Manager",
  "c058e06a-4851-4c64-ba6c-aa1cff72be75": "Team Member",
};

function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function verifyInvitation() {
      if (!token) {
        setVerificationError(
          "The invitation link is missing its token. Please use the complete link from your invitation email."
        );
        setIsVerifying(false);
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

        const response = await fetch(
          `${apiBaseUrl}/invitations/verify?token=${encodeURIComponent(token)}`
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "This invitation could not be verified."
          );
        }

        if (!cancelled) {
          setInvitation(data);
        }
      } catch (error) {
        if (!cancelled) {
          setVerificationError(
            error.message || "Unable to verify this invitation."
          );
        }
      } finally {
        if (!cancelled) {
          setIsVerifying(false);
        }
      }
    }

    verifyInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");

    if (!form.firstName.trim()) {
      setSubmitError("Please enter your first name.");
      return;
    }

    if (!form.lastName.trim()) {
      setSubmitError("Please enter your last name.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setSubmitError("Your password must be between 8 and 72 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setSubmitError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await acceptInvitation(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
      });

      setSuccess(
        "Your account has been created and your invitation accepted. Please sign in."
      );

      navigate("/login", {
        replace: true,
        state: {
          message: "Invitation accepted. You can now sign in.",
          email: invitation?.email || "",
        },
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to accept this invitation. Please try again.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isVerifying) {
    return (
      <main className="accept-invitation-page">
        <h1>Accept Invitation</h1>
        <p>Verifying your invitation...</p>
      </main>
    );
  }

  if (verificationError) {
    return (
      <main className="accept-invitation-page">
        <h1>Invitation unavailable</h1>
        <p role="alert">{verificationError}</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="accept-invitation-page">
        <h1>Invitation unavailable</h1>
        <p>This invitation could not be loaded.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  const roleName =
    ROLE_NAMES[invitation.roleId] ||
    invitation.roleName ||
    invitation.role ||
    "Organization Member";

  return (
    <main className="accept-invitation-page">
      <h1>Accept Your Invitation</h1>
      <p>Complete your account details to join your organization.</p>

      <section aria-label="Invitation details">
        <p>
          <strong>Email:</strong> {invitation.email}
        </p>
        <p>
          <strong>Role:</strong> {roleName}
        </p>
        {invitation.organizationName && (
          <p>
            <strong>Organization:</strong> {invitation.organizationName}
          </p>
        )}
        {invitation.expiresAt && (
          <p>
            <strong>Expires:</strong>{" "}
            {new Date(invitation.expiresAt).toLocaleString()}
          </p>
        )}
      </section>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={100}
            value={form.firstName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            maxLength={100}
            value={form.lastName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <small>Password must be between 8 and 72 characters.</small>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        {submitError && (
          <p role="alert" className="error-message">
            {submitError}
          </p>
        )}

        {success && (
          <p role="status" className="success-message">
            {success}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Accept Invitation"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </main>
  );
}

export default AcceptInvitation;
