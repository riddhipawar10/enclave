/**
 * apiEndpoints.js
 *
 * Centralized API endpoint definitions.
 */

// ---------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------

const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
};

// ---------------------------------------------------------
// ORGANIZATION
// ---------------------------------------------------------

const ORGANIZATION_ENDPOINTS = {
  LIST_ALL: "/organizations",
  CREATE: "/organizations",
  BY_ID: (organizationId) =>
    `/organizations/${organizationId}`,
  MEMBERS: (organizationId) =>
    `/organizations/${organizationId}/members`,
  MEMBER_CANDIDATE: (organizationId) =>
    `/organizations/${organizationId}/member-candidates`,
  MEMBER_BY_USER: (organizationId, userId) =>
    `/organizations/${organizationId}/members/${userId}`,
  MEMBER_ROLE: (organizationId, userId) =>
    `/organizations/${organizationId}/members/${userId}/role`,
};

// ---------------------------------------------------------
// ROLES
// ---------------------------------------------------------

const ROLE_ENDPOINTS = {
  LIST_ALL: "/roles",
  CREATE: "/roles",
  BY_ID: (roleId) =>
    `/roles/${roleId}`,
};

// ---------------------------------------------------------
// PERMISSIONS
// ---------------------------------------------------------

const PERMISSION_ENDPOINTS = {
  LIST_ALL: "/permissions",
  BY_ID: (permissionId) =>
    `/permissions/${permissionId}`,
};

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------

export {
  AUTH_ENDPOINTS,
  ORGANIZATION_ENDPOINTS,
  ROLE_ENDPOINTS,
  PERMISSION_ENDPOINTS,
};

export default AUTH_ENDPOINTS;