/**
 * tokenStorage.js
 *
 * Centralized storage for the access token and refresh token
 * returned by the Spring Boot backend.
 *
 * The access token is kept in memory.
 * The refresh token is persisted so it can be used to restore
 * the session after a page refresh.
 */

let accessToken = null;

const REFRESH_TOKEN_KEY = "enclave_refresh_token";

/**
 * Access token
 */

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

/**
 * Refresh token
 *
 * The backend returns the refresh token in the authentication
 * response and expects it in the request body for:
 *
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear both authentication tokens.
 */

export function clearTokens() {
  clearAccessToken();
  clearRefreshToken();
}