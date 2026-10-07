// src/services/organizationService.js
//
// Organization Management API calls.
// Uses the shared `api` axios instance from api.js
// and endpoint paths from config/apiEndpoints.js.

import api from "./api";
import { ORGANIZATION_ENDPOINTS } from "../config/apiEndpoints";

// =====================================================
// Organization CRUD
// =====================================================

// Returns the organizations in which the authenticated user
// has an active membership.
export const getMyOrganizations = async () => {
  const response = await api.get(
    ORGANIZATION_ENDPOINTS.LIST_ALL
  );

  return response.data;
};

// Get a single organization by ID.
export const getOrganizationById = async (
  organizationId
) => {
  const response = await api.get(
    ORGANIZATION_ENDPOINTS.BY_ID(organizationId)
  );

  return response.data;
};

// Create a new organization.
export const createOrganization = async (
  organizationData
) => {
  const response = await api.post(
    ORGANIZATION_ENDPOINTS.CREATE,
    organizationData
  );

  return response.data;
};

// Update an existing organization.
export const updateOrganization = async (
  organizationId,
  organizationData
) => {
  const response = await api.put(
    ORGANIZATION_ENDPOINTS.BY_ID(organizationId),
    organizationData
  );

  return response.data;
};

// DELETE /{organizationId}
// Deactivates the organization.
export const deactivateOrganization = async (
  organizationId
) => {
  await api.delete(
    ORGANIZATION_ENDPOINTS.BY_ID(organizationId)
  );
};

// =====================================================
// Organization Members / My Team
// =====================================================

// Get all members of an organization.
export const getOrganizationMembers = async (
  organizationId
) => {
  const response = await api.get(
    ORGANIZATION_ENDPOINTS.MEMBERS(organizationId)
  );

  return response.data;
};

// Find an active user by email who can be added to the organization.
export const findMemberCandidate = async (
  organizationId,
  email
) => {
  const response = await api.get(
    `${ORGANIZATION_ENDPOINTS.MEMBER_CANDIDATE(organizationId)}?email=${encodeURIComponent(email)}`
  );

  return response.data;
};

// Add an existing user to an organization.
export const addMember = async (
  organizationId,
  { userId, roleId }
) => {
  const response = await api.post(
    ORGANIZATION_ENDPOINTS.MEMBERS(organizationId),
    {
      userId,
      roleId,
    }
  );

  return response.data;
};

// Remove a member from an organization.
export const removeMember = async (
  organizationId,
  userId
) => {
  await api.delete(
    ORGANIZATION_ENDPOINTS.MEMBER_BY_USER(
      organizationId,
      userId
    )
  );
};

// Change the role of an organization member.
export const updateMemberRole = async (
  organizationId,
  userId,
  roleId
) => {
  const response = await api.patch(
    ORGANIZATION_ENDPOINTS.MEMBER_ROLE(
      organizationId,
      userId
    ),
    {
      roleId,
    }
  );

  return response.data;
};

// =====================================================
// Default export
// =====================================================

export default {
  getMyOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deactivateOrganization,

  getOrganizationMembers,
  findMemberCandidate,
  addMember,
  removeMember,
  updateMemberRole,
};