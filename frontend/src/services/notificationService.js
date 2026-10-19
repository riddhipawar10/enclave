
import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  await api.put(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.put("/notifications/read-all");
};

export default {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
