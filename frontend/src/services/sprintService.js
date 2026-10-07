import api from "./api";

export const getSprints = async (organizationId, projectId) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/${projectId}/sprints`
  );

  return response.data;
};

export const getSprint = async (
  organizationId,
  projectId,
  sprintId
) => {
  const response = await api.get(
    `/organizations/${organizationId}/projects/${projectId}/sprints/${sprintId}`
  );

  return response.data;
};

export const createSprint = async (
  organizationId,
  projectId,
  sprintData
) => {
  const response = await api.post(
    `/organizations/${organizationId}/projects/${projectId}/sprints`,
    sprintData
  );

  return response.data;
};

export const updateSprint = async (
  organizationId,
  projectId,
  sprintId,
  sprintData
) => {
  const response = await api.put(
    `/organizations/${organizationId}/projects/${projectId}/sprints/${sprintId}`,
    sprintData
  );

  return response.data;
};

export const deleteSprint = async (
  organizationId,
  projectId,
  sprintId
) => {
  await api.delete(
    `/organizations/${organizationId}/projects/${projectId}/sprints/${sprintId}`
  );
};

export default {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
};