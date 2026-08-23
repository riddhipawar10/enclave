/**
 * apiEndpoints.js
 *
 * PLACEHOLDER CONFIGURATION — NOT CONFIRMED WITH BACKEND.
 *
 * These paths are NOT guaranteed to match the real Spring Boot
 * controllers. They are named based on common convention only.
 * Update these to the real paths before relying on auth features.
 *
 * Keeping all endpoint paths in ONE file means fixing them later
 * only requires editing here — nothing else in the app needs to change.
 */
const AUTH_ENDPOINTS = {
  REGISTER: "/api/auth/register", // TODO: confirm with backend
  LOGIN: "/api/auth/login", // TODO: confirm with backend
  LOGOUT: "/api/auth/logout", // TODO: confirm with backend
  REFRESH: "/api/auth/refresh", // TODO: confirm with backend
};

/**
 * ORGANIZATION_ENDPOINTS
 *
 * Confirmed against com.enclave.organization.controller.OrganizationController.
 * All paths below are verified against the actual @RequestMapping/@GetMapping/
 * @PostMapping/etc. annotations in that file - not guessed.
 *
 * Exception: LIST_ALL is marked TODO because no "list all my organizations"
 * endpoint exists in that controller (only GET /{organizationId}). This is
 * still unconfirmed - flag with the backend team.
 */
const ORGANIZATION_ENDPOINTS = {
  LIST_ALL: "/api/organizations", // TODO: NOT confirmed - no such endpoint seen yet
  CREATE: "/api/organizations", // confirmed: POST
  BY_ID: (organizationId) => `/api/organizations/${organizationId}`, // confirmed: GET, PUT, DELETE
  MEMBERS: (organizationId) => `/api/organizations/${organizationId}/members`, // confirmed: GET, POST
  MEMBER_BY_USER: (organizationId, userId) =>
    `/api/organizations/${organizationId}/members/${userId}`, // confirmed: DELETE
  MEMBER_ROLE: (organizationId, userId) =>
    `/api/organizations/${organizationId}/members/${userId}/role`, // confirmed: PATCH
};

export { AUTH_ENDPOINTS, ORGANIZATION_ENDPOINTS };
export default AUTH_ENDPOINTS;