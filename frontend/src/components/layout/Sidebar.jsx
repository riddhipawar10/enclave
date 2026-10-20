
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notificationService";
import "./Sidebar.css";

function Sidebar() {
  const { user, roles, logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const isAdmin = roles?.includes("ADMIN");
  const isTeamMember = roles?.includes("TEAM_MEMBER");

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    let loginPath = "/login";

    if (roles?.includes("ADMIN")) {
      loginPath = "/admin/login";
    } else if (roles?.includes("MANAGER")) {
      loginPath = "/manager/login";
    } else if (roles?.includes("TEAM_MEMBER")) {
      loginPath = "/team-member/login";
    }

    try {
      await logout();
    } finally {
      window.location.href = loginPath;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setUnreadNotificationCount(0);
      return;
    }

    let isMounted = true;

    const loadUnreadNotificationCount = async () => {
      try {
        const count = await getUnreadNotificationCount(user.id);

        if (isMounted) {
          setUnreadNotificationCount(Number(count) || 0);
        }
      } catch (error) {
        console.error(
          "Failed to load unread notification count:",
          error
        );
      }
    };

    loadUnreadNotificationCount();

    const handleNotificationsUpdated = (event) => {
      const count = event.detail?.unreadCount;

      if (typeof count === "number") {
        setUnreadNotificationCount(count);
      }
    };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [user?.id]);

  // Existing Manager navigation — unchanged.
  const managerNavItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Organizations", to: "/organizations" },
    { label: "My Projects", to: "/projects" },
    { label: "My Team", to: "/team" },
    { label: "Tasks", to: "/tasks" },
    { label: "Board", to: "/board" },
    { label: "Sprints", to: "/sprints" },
    { label: "Calendar", to: "/calendar" },
    { label: "Analytics", to: "/analytics" },
    {
      label: "Notifications",
      to: "/notifications",
      notificationCount: unreadNotificationCount,
    },
    { label: "Settings", to: "/settings" },
  ];

  // Existing Admin navigation — unchanged.
  const adminNavItems = [
    { label: "Dashboard", to: "/admin-dashboard" },
    {
      label: "Organization Overview",
      to: "/admin/organizations",
    },
    {
      label: "Members",
      to: "/admin/members",
    },
    {
      label: "Invitations",
      to: "/admin/invitations",
    },
    {
      label: "Organization Settings",
      to: "/admin/organizations/settings",
    },
    { label: "Projects", to: "/admin/projects" },
    { label: "Tasks", to: "/admin/tasks" },
    { label: "Analytics", to: "/admin/analytics" },
    { label: "Audit Logs", to: "/admin/audit-logs" },
    { label: "Role Management", to: "/admin/roles" },
    {
      label: "Notifications",
      to: "/notifications",
      notificationCount: unreadNotificationCount,
    },
    { label: "Settings", to: "/settings" },
  ];

  // New Team Member navigation.
  const teamMemberNavItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "My Tasks", to: "/tasks" },
    { label: "My Projects", to: "/projects" },
    { label: "My Board", to: "/board" },
    { label: "Calendar", to: "/calendar" },
    {
      label: "Notifications",
      to: "/notifications",
      notificationCount: unreadNotificationCount,
    },
    { label: "AI Assistant", to: "/ai-assistant" },
    { label: "Profile", to: "/profile" },
  ];

  // Select the correct menu based on the user's role.
  const navItems = isAdmin
    ? adminNavItems
    : isTeamMember
      ? teamMemberNavItems
      : managerNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__logo">Enclave</h1>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={
              item.to === "/dashboard" ||
              item.to === "/admin-dashboard" ||
              item.to === "/admin/organizations" ||
              item.to === "/admin/members" ||
              item.to === "/admin/invitations"
            }
            className={({ isActive }) =>
              `sidebar__link ${
                isActive ? "sidebar__link--active" : ""
              }`
            }
          >
            <span className="sidebar__link-label">
              {item.label}
            </span>

            {item.notificationCount > 0 && (
              <span className="sidebar__notification-badge">
                {item.notificationCount > 99
                  ? "99+"
                  : item.notificationCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="sidebar__user-info">
            <p className="sidebar__user-name">
              {user?.firstName || "User"}
            </p>

            <p className="sidebar__user-email">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
