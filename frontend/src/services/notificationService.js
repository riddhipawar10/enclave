import api from "./api";

export const getNotifications = async (userId) => {
  const response = await api.get("/notifications", {
    params: {
      userId,
    },
  });

  return response.data;
};

export const getUnreadNotificationCount = async (userId) => {
  const response = await api.get("/notifications/unread-count", {
    params: {
      userId,
    },
  });

  return response.data;
};

export const markNotificationAsRead = async (
  userId,
  notificationId
) => {
  await api.put(
    `/notifications/${notificationId}/read`,
    null,
    {
      params: {
        userId,
      },
    }
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  await api.put(
    "/notifications/read-all",
    null,
    {
      params: {
        userId,
      },
    }
  );
};

export default {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};