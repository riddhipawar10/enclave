/**
 * tokenStorage.js
 *
 * Centralized handling of the access token used by api.js to
 * attach the Authorization header to outgoing requests.
 *
 * IMPORTANT — SECURITY NOTE:
 * The access token is kept in memory (a plain module-level
 * variable) rather than localStorage/sessionStorage. This avoids
 * exposing it to any script running on the page (XSS risk).
 * The tradeoff: it resets on a full page refresh, so your
 * AuthContext should call the refresh-token flow on app startup
 * to restore a session, once that flow is confirmed with the
 * backend.
 *
 * IMPORTANT — BACKEND ASSUMPTION:
 * This file assumes the ACCESS TOKEN is returned in the login/
 * register/refresh JSON response body (not a cookie). If your
 * Spring Boot backend instead sets the refresh token as an
 * httpOnly cookie, that part is handled entirely by the browser
 * and backend — this file would only ever need to manage the
 * access token, which already matches what's below.
 *
 * Confirm this against the real backend contract before relying
 * on it in production.
 */

let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}