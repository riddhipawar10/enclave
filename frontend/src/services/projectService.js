
import api from "./api";

export const getProjects = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects`
  );

  return response.data;
};

export const getProjectById = async (
  organizationId,
  projectId
) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/${projectId}`
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

export const archiveProject = async (organizationId, projectId) => {
  const response = await api.patch(
    `/organizations/${organizationId}/projects/${projectId}/archive`
  );
  return response.data;
};


export const restoreProject = async (organizationId, projectId) => {
  const response = await api.patch(
    `/organizations/${organizationId}/projects/${projectId}/restore`
  );
  return response.data;
};

export const getArchivedProjects = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/archived`
  );

  return response.data;
};