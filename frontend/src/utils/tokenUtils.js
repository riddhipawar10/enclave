// src/utils/tokenUtils.js
//
// The ONLY place in the app that touches localStorage for auth tokens.
// Every other file (api.js, authService.js, context, components) must
// go through these functions instead of reading/writing storage
// directly — that's what makes it easy to swap storage strategies
// later without touching anything else.

// ---- Storage strategy ----
// Security tradeoff, read this before changing anything below:
//
// localStorage is used here because it's simple and the backend
// currently returns both tokens in the JSON response body (not as
// cookies). The tradeoff: anything in localStorage is readable by any
// JavaScript that runs on the page, including a malicious script
// injected via an XSS vulnerability. sessionStorage has the same
// weakness (also plain JS-readable), it just clears when the tab
// closes instead of persisting — it doesn't fix the XSS exposure.
//
// The safer alternative is an HttpOnly cookie set directly by the
// backend, which JavaScript cannot read at all, closing off that XSS
// path (though it introduces its own concern: CSRF, which needs its
// own defenses like a CSRF token or SameSite cookie settings).
//
// If the backend later switches to HttpOnly cookies for the refresh
// token, only this file needs to change: the getters/setters below
// would stop touching localStorage for the refresh token, and the
// browser would send/receive it automatically with each request
// instead. Nothing outside this file — no component, no service —
// should need to change, since they only ever call these functions.

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// ---- Access token ----

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (!token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// ---- Refresh token ----

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (!token) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ---- Combined helpers ----

export function clearTokens() {
  removeAccessToken();
  removeRefreshToken();
}

/**
 * Returns true if an access token is present.
 *
 * Deliberately simple: this only checks that a token exists in
 * storage, it does not decode or verify it. Decoding a JWT client-side
 * to check its expiry is unnecessary here — the backend is the source
 * of truth on validity, and an expired/invalid token will simply fail
 * on the next request and trigger the refresh flow (or a redirect to
 * login) instead. Avoiding decoding also means this file has no
 * dependency on a JWT library.
 */
export function isAuthenticated() {
  return Boolean(getAccessToken());
}