
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";
import "./Profile.css";

function Profile() {
  const { user, isLoading, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Profile unavailable</h2>
          <p>Please log in again to view your profile.</p>
        </div>
      </div>
    );
  }

  const fullName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user.name ||
    "User";

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  function startEditing() {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setMessage("");
    setMessageType("");
    setIsEditing(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setMessage("Please complete all fields.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const updatedUser = await updateProfile({
        firstName,
        lastName,
        email,
      });

      // Update the current page with the saved backend response.
      updateUser(updatedUser);

      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setEmail(updatedUser.email || "");

      setMessage("Your profile has been updated successfully.");
      setMessageType("success");
      setIsEditing(false);
    } catch (error) {
      const responseMessage =
        error.response?.data?.message ||
        error.response?.data?.error;

      setMessage(
        responseMessage ||
          "Unable to update your profile. Please try again."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="profile-eyebrow">ACCOUNT SETTINGS</p>
          <h1>My Profile</h1>
          <p className="profile-subtitle">
            Manage your personal information.
          </p>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-banner" />

        <div className="profile-main">
          <div className="profile-avatar" aria-label={fullName}>
            {initials || "U"}
          </div>

          <div className="profile-identity">
            <h2>{fullName}</h2>
            <p>{user.email || "Email not available"}</p>
            <span className="profile-status">
              <span className="profile-status-dot" />
              Account active
            </span>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="profile-button profile-button-primary"
              onClick={startEditing}
            >
              <span aria-hidden="true">✎</span> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-divider" />

        {message && (
          <p
            className={`profile-message profile-message--${messageType}`}
            role="status"
          >
            {message}
          </p>
        )}

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-section-heading">
              <div>
                <h3>Personal information</h3>
                <p>Update the details associated with your account.</p>
              </div>
            </div>

            <div className="profile-form-grid">
              <label className="profile-input-group">
                <span>First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Enter first name"
                  maxLength={100}
                  required
                  disabled={saving}
                />
              </label>

              <label className="profile-input-group">
                <span>Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Enter last name"
                  maxLength={100}
                  required
                  disabled={saving}
                />
              </label>
            </div>

            <label className="profile-input-group profile-email-group">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address"
                maxLength={255}
                required
                disabled={saving}
              />
            </label>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-button profile-button-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setMessage("");
                  setMessageType("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-button profile-button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-section-heading">
              <div>
                <h3>Personal information</h3>
                <p>Your account details at a glance.</p>
              </div>
            </div>

            <div className="profile-detail-grid">
              <div className="profile-detail">
                <span className="profile-detail-icon">♙</span>
                <div>
                  <p className="profile-detail-label">Full name</p>
                  <p className="profile-detail-value">
                    {fullName}
                  </p>
                </div>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-icon">@</span>
                <div>
                  <p className="profile-detail-label">Email address</p>
                  <p className="profile-detail-value">
                    {user.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="profile-detail profile-detail-wide">
                <span className="profile-detail-icon">⌘</span>
                <div>
                  <p className="profile-detail-label">User ID</p>
                  <p className="profile-detail-value profile-user-id">
                    {user.id || user.userId || "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
