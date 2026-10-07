import api from "./api";

export const getProjects = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects`
  );

  return response.data;
};

export const createProject = async (
  organizationId,
  projectData
) => {
  const response = await api.post(
    `/organizations/${organizationId}/projects`,
    projectData
  );

  return response.data;
};

export const updateProject = async (
  organizationId,
  projectId,
  projectData
) => {
  const response = await api.put(
    `/organizations/${organizationId}/projects/${projectId}`,
    projectData
  );

  return response.data;
};