import api from "./api";

export const getProjectAnalytics = async (
  organizationId,
  projectId
) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/${projectId}/analytics`
  );

  return response.data;
};

export default {
  getProjectAnalytics,
};