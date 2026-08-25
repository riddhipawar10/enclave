// src/services/organizationService.js
//
// Organization Management API calls. Uses the shared `api` axios instance
// from api.js (token attachment + future refresh handling centralized
// there) and endpoint paths from config/apiEndpoints.js, matching the
// exact pattern authService.js already uses.

import api from "./api";
import { ORGANIZATION_ENDPOINTS } from "../config/apiEndpoints";

// ---------- Organization CRUD ----------

// NOTE: ORGANIZATION_ENDPOINTS.LIST_ALL is unconfirmed - no "list all my
// organizations" endpoint exists in the controller shared so far (only
// GET /{organizationId}). This will 404 until such an endpoint exists.
export const getMyOrganizations = async () => {
  const response = await api.get(ORGANIZATION_ENDPOINTS.LIST_ALL);
  return response.data;
};

export const getOrganizationById = async (organizationId) => {
  const response = await api.get(ORGANIZATION_ENDPOINTS.BY_ID(organizationId));
  return response.data;
};

export const createOrganization = async (organizationData) => {
  const response = await api.post(ORGANIZATION_ENDPOINTS.CREATE, organizationData);
  return response.data;
};

export const updateOrganization = async (organizationId, organizationData) => {
  const response = await api.put(ORGANIZATION_ENDPOINTS.BY_ID(organizationId), organizationData);
  return response.data;
};

// Confirmed: DELETE /{organizationId} deactivates (not a hard delete).
export const deactivateOrganization = async (organizationId) => {
  await api.delete(ORGANIZATION_ENDPOINTS.BY_ID(organizationId));
};

// ---------- Members ----------

export const getOrganizationMembers = async (organizationId) => {
  const response = await api.get(ORGANIZATION_ENDPOINTS.MEMBERS(organizationId));
  return response.data;
};

// Matches AddMemberRequest exactly: { userId, roleId }.
// Adds an EXISTING user to the org - does not create a user, does not
// send an email invite (no such endpoint exists).
export const addMember = async (organizationId, { userId, roleId }) => {
  const response = await api.post(ORGANIZATION_ENDPOINTS.MEMBERS(organizationId), {
    userId,
    roleId,
  });
  return response.data;
};

// Confirmed: DELETE /{organizationId}/members/{userId} - takes userId, not a membership row id.
export const removeMember = async (organizationId, userId) => {
  await api.delete(ORGANIZATION_ENDPOINTS.MEMBER_BY_USER(organizationId, userId));
};

// Confirmed: PATCH /{organizationId}/members/{userId}/role - body { roleId }.
export const updateMemberRole = async (organizationId, userId, roleId) => {
  const response = await api.patch(ORGANIZATION_ENDPOINTS.MEMBER_ROLE(organizationId, userId), {
    roleId,
  });
  return response.data;
};

export default {
  getMyOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
  getOrganizationMembers,
  addMember,
  removeMember,
  updateMemberRole,
};