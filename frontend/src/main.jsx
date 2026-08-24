import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RBACProvider } from "./context/RBACProvider.jsx";
import "./index.css";

/**
 * main.jsx
 *
 * Application entry point. Kept minimal on purpose:
 * - No authentication logic here.
 * - No API calls here.
 * - Only responsible for mounting the app and providing
 *   top-level context (AuthProvider, RBACProvider) so useAuth()
 *   and useRBAC() work throughout the entire component tree,
 *   including inside App.jsx's routing setup.
 *
 * RBACProvider is nested inside AuthProvider since role/permission
 * data is only meaningful once a user is authenticated - not a hard
 * dependency in code, just a logical ordering.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RBACProvider>
        <App />
      </RBACProvider>
    </AuthProvider>
  </React.StrictMode>
);