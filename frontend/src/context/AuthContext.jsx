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
 * current user, roles, authentication status, loading state,
 * and login/register/logout actions.
 *
 * The access token is kept in memory, so it is lost when the
 * page is refreshed. The refresh token is persisted and is used
 * to restore the session when the application starts.
 */

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  // ---------------------------------------------------------
  // Restore session on application startup
  // ---------------------------------------------------------

  useEffect(() => {
    async function restoreSession() {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data =
          await authService.refreshAccessToken(refreshToken);

        if (data?.user) {
          setUser(data.user);
          setRoles(data.roles ?? []);
        }
      } catch {
        clearTokens();
        setUser(null);
        setRoles([]);
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
      setRoles(data.roles ?? []);
    }

    return data;
  };

  // ---------------------------------------------------------
  // Clear authentication state
  // ---------------------------------------------------------

  const clearAuthState = () => {
    clearTokens();
    setUser(null);
    setRoles([]);
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
     * Registration does NOT authenticate the user.
     *
     * Do not call setUser() or setRoles() here.
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
      setRoles([]);
    }
  };

  
  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  // ---------------------------------------------------------
  // Context value
  // ---------------------------------------------------------

  const value = {
    user,
    roles,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    clearAuthState,
    updateUser,
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