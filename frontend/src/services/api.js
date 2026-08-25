// src/services/api.js
//
// Single axios instance for the whole app. Every feature module
// (auth, and later organization/RBAC) should import `api` from here
// instead of creating its own axios instance or calling axios directly.

import axios from "axios";
import { getAccessToken } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request interceptor: attach the access token, if we have one ----
// Token reading lives in one helper (getAccessToken) instead of being
// duplicated here, so there's only one place that knows where/how
// tokens are stored.
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: structure for handling a 401 ----
// A 401 usually means the access token expired. The actual refresh
// call (POST to whatever the backend's real refresh endpoint is) does
// NOT belong in this file — it belongs in authService.js, next to the
// rest of the auth API calls. This interceptor is just the hook point.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO (connect to authService.js):
      // 1. Import the refresh function from authService.js here
      //    (avoid importing it at the top of this file to prevent a
      //    circular import, since authService.js will likely import
      //    `api` from this file too).
      // 2. Call it to get a new access token, store it via the same
      //    token helper used above.
      // 3. Update originalRequest's Authorization header with the
      //    new token and return api(originalRequest) to retry once.
      // 4. If the refresh call itself fails, clear stored tokens and
      //    let the error propagate so the app can redirect to /login.
    }

    return Promise.reject(error);
  }
);

export default api;