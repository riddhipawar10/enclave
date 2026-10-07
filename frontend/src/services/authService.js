// src/services/authService.js
//
// All authentication-related API calls live here. Components and
// AuthContext call these functions instead of using axios/api directly.

import api from "./api";
import AUTH_ENDPOINTS from "../config/apiEndpoints";

import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../utils/tokenStorage";

/**
 * Stores the access token and refresh token returned
 * by the backend.
 *
 * Used after LOGIN and REFRESH.
 */
function storeAuthTokens(data) {
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }

  if (data?.refreshToken) {
    setRefreshToken(data.refreshToken);
  }
}

/**
 * register
 *
 * Backend request body:
 * {
 *   firstName,
 *   lastName,
 *   email,
 *   password
 * }
 *
 * IMPORTANT:
 * Registration creates the account only.
 * It does NOT establish a frontend session.
 *
 * The user must log in separately after registration.
 */
export async function register(name, email, password) {
  const nameParts = name.trim().split(/\s+/);

  const firstName = nameParts[0];

  const lastName =
    nameParts.slice(1).join(" ") || "User";

  const response = await api.post(
    AUTH_ENDPOINTS.REGISTER,
    {
      firstName,
      lastName,
      email,
      password,
    }
  );

  /*
   * Do NOT call storeAuthTokens() here.
   *
   * Registration must not automatically log the user in.
   */
  return response.data;
}

/**
 * login
 *
 * Login establishes the authenticated frontend session.
 */
export async function login(email, password) {
  const response = await api.post(
    AUTH_ENDPOINTS.LOGIN,
    {
      email,
      password,
    }
  );

  const data = response.data;

  storeAuthTokens(data);

  return data;
}

/**
 * logout
 *
 * Backend expects:
 * {
 *   refreshToken
 * }
 */
export async function logout(refreshToken) {
  try {
    await api.post(
      AUTH_ENDPOINTS.LOGOUT,
      {
        refreshToken,
      }
    );
  } finally {
    clearTokens();
  }
}

/**
 * refreshAccessToken
 *
 * Backend expects:
 * {
 *   refreshToken
 * }
 */
export async function refreshAccessToken(refreshToken) {
  const response = await api.post(
    AUTH_ENDPOINTS.REFRESH,
    {
      refreshToken,
    }
  );

  const data = response.data;

  storeAuthTokens(data);

  return data;
}