import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "../../services/userService";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [accountInfo, setAccountInfo] = useState({
    isActive: false,
    createdAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");

        const user = await getCurrentUser();

        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
        });

        setAccountInfo({
          isActive: Boolean(user.isActive),
          createdAt: user.createdAt || null,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!profile.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!profile.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!profile.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setIsSaving(true);

      const updatedUser = await updateCurrentUser({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
      });

      setProfile({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        email: updatedUser.email || "",
      });

      setAccountInfo({
        isActive: Boolean(updatedUser.isActive),
        createdAt: updatedUser.createdAt || null,
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to update your profile.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError("New password is required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordSuccess("Password changed successfully.");
    } catch (err) {
      console.error("Failed to change password:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to change your password.";

      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to logout:", err);
      setIsLoggingOut(false);
    }
  };

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) {
      return "—";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-page__state">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile and account settings.</p>
        </div>
      </header>

      <main className="settings-page__content">
        {/* Profile */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div>
              <h2>Profile</h2>
              <p>Update your personal information.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-form__row">
              <div className="settings-form__field">
                <label htmlFor="firstName">First name</label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  maxLength={100}
                  disabled={isSaving}
                />
              </div>

              <div className="settings-form__field">
                <label htmlFor="lastName">Last name</label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  maxLength={100}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="settings-form__field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                maxLength={255}
                disabled={isSaving}
              />
            </div>

            {error && (
              <div className="settings-message settings-message--error">
                {error}
              </div>
            )}

            {success && (
              <div className="settings-message settings-message--success">
                {success}
              </div>
            )}

            <div className="settings-form__actions">
              <button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Security */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div>
              <h2>Security</h2>
              <p>Change your password to keep your account secure.</p>
            </div>
          </div>

          <form
            className="settings-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="settings-form__field">
              <label htmlFor="currentPassword">
                Current password
              </label>

              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                disabled={isChangingPassword}
              />
            </div>

            <div className="settings-form__field">
              <label htmlFor="newPassword">
                New password
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                minLength={8}
                maxLength={100}
                disabled={isChangingPassword}
              />

              <small className="settings-form__hint">
                Password must be at least 8 characters.
              </small>
            </div>

            <div className="settings-form__field">
              <label htmlFor="confirmPassword">
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                minLength={8}
                maxLength={100}
                disabled={isChangingPassword}
              />
            </div>

            {passwordError && (
              <div className="settings-message settings-message--error">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="settings-message settings-message--success">
                {passwordSuccess}
              </div>
            )}

            <div className="settings-form__actions">
              <button
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword
                  ? "Changing password..."
                  : "Change password"}
              </button>
            </div>
          </form>
        </section>

        {/* Account */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div>
              <h2>Account</h2>
              <p>
                View your account information and session options.
              </p>
            </div>
          </div>

          <div className="settings-account">
            <div className="settings-account__item">
              <span className="settings-account__label">
                Account status
              </span>

              <span
                className={`settings-account__status ${
                  accountInfo.isActive
                    ? "settings-account__status--active"
                    : "settings-account__status--inactive"
                }`}
              >
                {accountInfo.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="settings-account__item">
              <span className="settings-account__label">
                Member since
              </span>

              <span className="settings-account__value">
                {formatCreatedAt(accountInfo.createdAt)}
              </span>
            </div>

            <div className="settings-account__logout">
              <div>
                <h3>Sign out</h3>
                <p>
                  Sign out of your Enclave account on this device.
                </p>
              </div>

              <button
                type="button"
                className="settings-account__logout-button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;