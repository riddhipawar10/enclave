import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notificationService";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate("/login");
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

  const navItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      label: "Organizations",
      to: "/organizations",
    },
    {
      label: "My Projects",
      to: "/projects",
    },
    {
      label: "My Team",
      to: "/team",
    },
    {
      label: "Tasks",
      to: "/tasks",
    },
    {
      label: "Board",
      to: "/board",
    },
    {
      label: "Sprints",
      to: "/sprints",
    },
    {
      label: "Calendar",
      to: "/calendar",
    },
    {
      label: "Analytics",
      to: "/analytics",
    },
    {
      label: "Notifications",
      to: "/notifications",
      notificationCount: unreadNotificationCount,
    },
    {
      label: "Settings",
      to: "/settings",
    },
  ];

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