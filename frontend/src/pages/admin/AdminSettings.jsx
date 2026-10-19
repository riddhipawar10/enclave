
import { useState } from "react";
import "./AdminSettings.css";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <div>
          <h1>Admin Settings</h1>
          <p>
            Manage your organization and administrative
            preferences.
          </p>
        </div>
      </div>

      <div className="admin-settings__layout">
        <aside className="admin-settings__tabs">
          <button
            type="button"
            className={
              activeTab === "general" ? "active" : ""
            }
            onClick={() => setActiveTab("general")}
          >
            General
          </button>

          <button
            type="button"
            className={
              activeTab === "members" ? "active" : ""
            }
            onClick={() => setActiveTab("members")}
          >
            Members & Access
          </button>

          <button
            type="button"
            className={
              activeTab === "notifications" ? "active" : ""
            }
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>

          <button
            type="button"
            className={
              activeTab === "security" ? "active" : ""
            }
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </aside>

        <section className="admin-settings__content">
          {activeTab === "general" && (
            <div>
              <h2>General Settings</h2>
              <p>
                View and manage general administrative
                preferences.
              </p>

              <div className="admin-settings__notice">
                General settings are not connected to the
                backend yet.
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div>
              <h2>Members & Access</h2>
              <p>
                Manage organization membership and access
                settings.
              </p>

              <div className="admin-settings__notice">
                Access settings will be implemented after
                checking the existing role and permission APIs.
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2>Notification Preferences</h2>
              <p>
                Configure administrative notification
                preferences.
              </p>

              <div className="admin-settings__notice">
                Notification preferences are not saved yet.
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2>Security</h2>
              <p>
                Review administrative security options.
              </p>

              <div className="admin-settings__notice">
                Security changes will be added only after
                verifying the existing authentication APIs.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminSettings;
