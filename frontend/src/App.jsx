/*import React from "react";*/
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";


import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
import CreateOrganization from "./pages/organization/CreateOrganization";
import OrganizationDetails from "./pages/organization/OrganizationDetails";
import EditOrganization from "./pages/organization/EditOrganization";
import ManageMembers from "./pages/organization/ManageMembers";
/**
 * App
 *
 * Top-level routing for the Enclave frontend.
 *
 * IMPORTANT:
 * - No API calls happen in this file — all auth logic lives in
 *   AuthContext / AuthProvider.
 * - Only Authentication & Users routes are defined here. Organization
 *   Management (Madhura) and RBAC (Riddhi) routes are NOT implemented
 *   yet. They can be added as additional <Route> entries below,
 *   nested inside <ProtectedRoute> if they require authentication.
 *
 * Structure:
 * - AuthProvider wraps the entire app so `useAuth()` is available
 *   everywhere, including inside Navbar.
 * - Navbar is rendered once, outside <Routes>, so it appears on
 *   every page.
 * - Public routes: /login, /register, /forgot-password
 * - Protected routes: /dashboard, /profile (guarded by ProtectedRoute)
 * - Root path redirects to /dashboard (ProtectedRoute will bounce
 *   unauthenticated users to /login automatically).
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

                        {/* Organization Management routes (Madhura) */}
            <Route path="/organizations" element={<OrganizationDashboard />} />
            <Route path="/organizations/create" element={<CreateOrganization />} />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
            <Route path="/organizations/:id/members" element={<ManageMembers />} />

            {/* RBAC routes (Riddhi) - not yet added */}
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;