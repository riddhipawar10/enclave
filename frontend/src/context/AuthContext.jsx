import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import * as authService from "../services/authService";

import {
  getRefreshToken,
  clearTokens,
} from "../utils/tokenStorage";

/**
 * AuthContext
 *
 * Central place for authentication state used across the app:
 * current user, authentication status, loading state, and
 * login/register/logout actions.
 *
 * The access token is kept in memory, so it is lost when the
 * page is refreshed. The refresh token is persisted and is used
 * to restore the session when the application starts.
 */

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  // ---------------------------------------------------------
  // Restore session on application startup
  // ---------------------------------------------------------

  useEffect(() => {
    async function restoreSession() {
      const refreshToken = getRefreshToken();

      // No refresh token means there is no session to restore.
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data =
          await authService.refreshAccessToken(refreshToken);

        if (data?.user) {
          setUser(data.user);
        }
      } catch {
        // Refresh token is invalid, expired, or revoked.
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------

  const login = async (email, password) => {
    const data =
      await authService.login(email, password);

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  };

  // ---------------------------------------------------------
  // Register
  // ---------------------------------------------------------

  const register = async (name, email, password) => {
    const data =
      await authService.register(
        name,
        email,
        password
      );

    /*
     * IMPORTANT:
     *
     * Registration does NOT authenticate the user.
     *
     * Do not call setUser() here.
     *
     * The user must go to the login page and
     * authenticate using their email and password.
     */

    return data;
  };

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------

  const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // ---------------------------------------------------------
  // Context value
  // ---------------------------------------------------------

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// AuthProvider and useAuth intentionally live in the same context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}