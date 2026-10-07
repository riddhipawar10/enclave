import api from "./api";

export const getRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};

export const getAssignableRoles = async (organizationId) => {
  const response = await api.get(
    `/organizations/${organizationId}/assignable-roles`
  );
  return response.data;
};

export default {
  getRoles,
  getAssignableRoles,
};