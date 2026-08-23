/*import React from "react";*/
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

/**
 * Profile Page
 *
 * Displays safe, non-sensitive information about the currently
 * authenticated user, sourced entirely from AuthContext.
 *
 * IMPORTANT:
 * - Never displays password, access token, or refresh token.
 * - Does NOT call any API — no "edit profile" or "get profile"
 *   backend endpoint has been confirmed yet. Once one exists,
 *   this page can be extended (e.g. an edit form) without
 *   changing how it reads the current user.
 */
function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__card">
          <p className="profile-page__status">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-page__card">
          <p className="profile-page__status">
            We couldn&apos;t find your profile information. Please try
            logging in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__card">
        <h1 className="profile-page__title">My Profile</h1>

        <div className="profile-page__field">
          <span className="profile-page__label">Name</span>
          <span className="profile-page__value">
            {user.name || "Not available"}
          </span>
        </div>

        <div className="profile-page__field">
          <span className="profile-page__label">Email</span>
          <span className="profile-page__value">
            {user.email || "Not available"}
          </span>
        </div>

        {(user.id || user.userId) && (
          <div className="profile-page__field">
            <span className="profile-page__label">User ID</span>
            <span className="profile-page__value">
              {user.id || user.userId}
            </span>
          </div>
        )}

        <p className="profile-page__note">
          Profile editing will be available once the backend supports it.
        </p>
      </div>
    </div>
  );
}

export default Profile;