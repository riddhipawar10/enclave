import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import * as authService from "../services/authService";
import { clearAccessToken } from "../utils/tokenStorage";

/**
 * AuthContext
 *
 * Central place for authentication state used across the app:
 * current user, authentication status, and loading state — plus
 * login/register/logout actions. No component should call
 * authService or axios directly except through this context.
 *
 * On mount, this tries to silently restore a session by calling
 * refreshAccessToken() (since the access token lives only in
 * memory and is lost on page refresh). If that fails (no valid
 * refresh token/cookie), the user is simply treated as logged out
 * — this is expected behavior for first-time visitors, not an error.
 */
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    async function restoreSession() {
      try {
        const data = await authService.refreshAccessToken();

        if (data?.user) {
          setUser(data.user);
        }
      } catch {
        // No valid session to restore — this is a normal case,
        // not necessarily an error the user needs to see.
        clearAccessToken();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

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
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}