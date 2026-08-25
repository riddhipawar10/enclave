// src/utils/permissionUtils.js
//
// Pure, framework-independent helper functions for RBAC checks.
// No React, no API calls, no side effects - just array/string logic.
// Safe to use anywhere: components, hooks, other services, or tests.
//
// All functions expect plain arrays of strings, e.g.:
//   userPermissions = ["CREATE_TASK", "VIEW_PROJECT"]
//   userRoles = ["ADMIN"]

/**
 * Checks if userPermissions includes a single required permission.
 * @param {string[]|null|undefined} userPermissions
 * @param {string} requiredPermission
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (!requiredPermission) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
};

/**
 * Checks if userPermissions includes AT LEAST ONE of requiredPermissions.
 * @param {string[]|null|undefined} userPermissions
 * @param {string[]|null|undefined} requiredPermissions
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Checks if userPermissions includes ALL of requiredPermissions.
 * @param {string[]|null|undefined} userPermissions
 * @param {string[]|null|undefined} requiredPermissions
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.every((permission) => userPermissions.includes(permission));
};

/**
 * Checks if userRoles includes a single required role.
 * @param {string[]|null|undefined} userRoles
 * @param {string} requiredRole
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return false;
  }
  if (!requiredRole) {
    return false;
  }
  return userRoles.includes(requiredRole);
};

/**
 * Checks if userRoles includes AT LEAST ONE of requiredRoles.
 * @param {string[]|null|undefined} userRoles
 * @param {string[]|null|undefined} requiredRoles
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return false;
  }
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    return false;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
};