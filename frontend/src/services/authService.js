// src/services/authService.js
//
// All authentication-related API calls live here. Components and
// AuthContext call these functions instead of using axios/api directly.

import api from "./api";
import AUTH_ENDPOINTS from "../config/apiEndpoints";
import { setAccessToken, clearAccessToken } from "../utils/tokenStorage";

/**
 * register
 * Calls the backend registration endpoint.
 *
 * ASSUMPTION (mark and confirm): request body shape is
 *   { name, email, password }
 * Response shape assumed: { user, accessToken } — but backend may
 * only return a success message instead. Adjust once confirmed.
 */
export async function register(name, email, password) {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
    name,
    email,
    password,
  });

  const data = response.data;

  // If backend logs the user in immediately after registering,
  // store the access token the same way login() does.
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }

  return data;
}

/**
 * login
 * Calls the backend login endpoint.
 *
 * ASSUMPTION (mark and confirm): response shape is
 *   { user, accessToken }
 * Refresh token is assumed to be handled separately by the backend
 * (e.g. set as an httpOnly cookie), since it should never be
 * readable by JavaScript. Confirm this with the backend team.
 */
export async function login(email, password) {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
    email,
    password,
  });

  const data = response.data;

  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }

  return data;
}

/**
 * logout
 * Calls the backend logout endpoint (expected to revoke the
 * refresh token server-side), then always clears the local
 * access token regardless of the API call's outcome.
 */
export async function logout() {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } finally {
    clearAccessToken();
  }
}

/**
 * refreshAccessToken
 * Calls the backend refresh endpoint to get a new access token
 * using the refresh token. Assumed the refresh token itself is
 * sent automatically (e.g. httpOnly cookie) rather than passed
 * in the request body — confirm with backend.
 *
 * Used by AuthContext on app startup to silently restore a
 * session after a page refresh (since the access token is only
 * ever kept in memory, not persisted).
 */
export async function refreshAccessToken() {
  const response = await api.post(AUTH_ENDPOINTS.REFRESH);

  const data = response.data;

  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }

  return data;
}