import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import "./Notifications.css";

const USER_ID =
  "ce6f779f-4be7-4d2a-b72f-9ad95635b0c4";

const formatNotificationTime = (createdAt) => {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  const hours = Math.floor(
    difference / 3600000
  );

  const days = Math.floor(
    difference / 86400000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return "📋";

    case "TASK_REASSIGNED":
      return "🔄";

    case "TASK_COMPLETED":
      return "✅";

    case "TASK_UPDATED":
      return "🔄";

    case "COMMENT":
      return "💬";

    case "PROJECT":
      return "📁";

    case "SPRINT":
      return "🏃";

    default:
      return "🔔";
  }
};

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getNotifications(USER_ID);

      const notificationList = data || [];

      setNotifications(notificationList);

      const unreadCount =
        notificationList.filter(
          (notification) =>
            !notification.read
        ).length;

      window.dispatchEvent(
        new CustomEvent(
          "notifications-updated",
          {
            detail: {
              unreadCount,
            },
          }
        )
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  const handleMarkAsRead = async (
    notification
  ) => {
    if (notification.read) {
      return;
    }

    try {
      await markNotificationAsRead(
        USER_ID,
        notification.id
      );

      setNotifications((current) => {
        const updatedNotifications =
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item
          );

        const updatedUnreadCount =
          updatedNotifications.filter(
            (item) => !item.read
          ).length;

        window.dispatchEvent(
          new CustomEvent(
            "notifications-updated",
            {
              detail: {
                unreadCount:
                  updatedUnreadCount,
              },
            }
          )
        );

        return updatedNotifications;
      });
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    /*
     * Mark unread notification as read first.
     */
    if (!notification.read) {
      try {
        await markNotificationAsRead(
          USER_ID,
          notification.id
        );

        setNotifications((current) => {
          const updatedNotifications =
            current.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    read: true,
                  }
                : item
            );

          const updatedUnreadCount =
            updatedNotifications.filter(
              (item) => !item.read
            ).length;

          window.dispatchEvent(
            new CustomEvent(
              "notifications-updated",
              {
                detail: {
                  unreadCount:
                    updatedUnreadCount,
                },
              }
            )
          );

          return updatedNotifications;
        });
      } catch (err) {
        console.error(
          "Failed to mark notification as read:",
          err
        );
      }
    }

    /*
     * Task notifications contain:
     *
     * referenceType = TASK
     * referenceId   = task ID
     */
    if (
      notification.referenceType === "TASK" &&
      notification.referenceId &&
      notification.projectId
    ) {
      navigate(
        `/tasks/${notification.projectId}/${notification.referenceId}/edit`
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead(
        USER_ID
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      window.dispatchEvent(
        new CustomEvent(
          "notifications-updated",
          {
            detail: {
              unreadCount: 0,
            },
          }
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>

          <p>
            Stay up to date with your tasks,
            projects, and team activity.
          </p>
        </div>

        <button
          className="mark-all-button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="notifications-summary">
          <span className="notifications-summary-dot"></span>

          <strong>{unreadCount}</strong>

          <span>
            unread notification
            {unreadCount === 1
              ? ""
              : "s"}
          </span>
        </div>
      )}

      {loading && (
        <div className="notifications-state">
          <div className="notifications-spinner"></div>

          <p>
            Loading notifications...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="notifications-state notifications-error">
          <p>{error}</p>

          <button onClick={loadNotifications}>
            Try again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>No notifications</h2>

            <p>
              You're all caught up. New
              activity will appear here.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >
                  <div className="notification-icon">
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="notification-unread-dot"></span>
                      )}
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {formatNotificationTime(
                        notification.createdAt
                      )}
                    </span>
                  </div>

                  {!notification.read && (
                    <button
                      className="notification-read-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        handleMarkAsRead(
                          notification
                        );
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

export default Notifications;