import api from "./api";

export const getManagerDashboard = async (organizationId) => {
  const response = await api.get(
    `/dashboard/manager/${organizationId}`
  );

  return response.data;
};