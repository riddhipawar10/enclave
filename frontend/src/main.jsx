import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

/**
 * main.jsx
 *
 * Application entry point. Kept minimal on purpose:
 * - No authentication logic here.
 * - No API calls here.
 * - Only responsible for mounting the app and providing
 *   top-level context (AuthProvider) so useAuth() works
 *   throughout the entire component tree, including inside
 *   App.jsx's routing setup.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);