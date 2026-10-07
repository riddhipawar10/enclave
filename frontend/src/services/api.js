// src/services/api.js
//
// Single axios instance for the whole app.
//
// Responsibilities:
// 1. Attach the access token to requests.
// 2. Detect expired access tokens (401).
// 3. Use the stored refresh token to get a new access token.
// 4. Retry the failed request once.
// 5. Clear tokens if refresh fails.

import axios from "axios";

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "../utils/tokenStorage";

import AUTH_ENDPOINTS from "../config/apiEndpoints";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------
// Request interceptor
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No response means this may be a network/CORS/server error.
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 responses.
    if (
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();

    // No refresh token available.
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    try {
      // IMPORTANT:
      // Use axios directly here instead of `api`.
      //
      // Otherwise this refresh request would also go through
      // the same interceptor and could cause a refresh loop.
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = refreshResponse.data;

      if (!data?.accessToken) {
        throw new Error("Refresh response did not contain an access token");
      }

      // Store the new access token.
      setAccessToken(data.accessToken);

      // Backend may rotate the refresh token.
      // If a new one is returned, store it too.
      if (data.refreshToken) {
        localStorage.setItem(
          "enclave_refresh_token",
          data.refreshToken
        );
      }

      // Update the failed request with the new access token.
      originalRequest.headers.Authorization =
        `Bearer ${data.accessToken}`;

      // Retry the original request once.
      return api(originalRequest);

    } catch (refreshError) {

      // Refresh token is invalid/expired/revoked.
      clearTokens();

      return Promise.reject(refreshError);
    }
  }
);

export default api;