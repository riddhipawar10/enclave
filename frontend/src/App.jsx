/*import React from "react";*/
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

import Roles from "./pages/rbac/Roles";
import CreateRole from "./pages/rbac/CreateRole";
import EditRole from "./pages/rbac/EditRole";
import RoleDetails from "./pages/rbac/RoleDetails";
import Permissions from "./pages/rbac/Permissions";
import RBACDashboard from "./pages/rbac/RBACDashboard";
import AssignRole from "./pages/rbac/AssignRole";
import AccessDenied from "./pages/rbac/AccessDenied";

function App() {
  return (
    <BrowserRouter>
      <>
        <Navbar />

        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Protected routes (authentication only) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Organization Management routes (Madhura) */}
            <Route path="/organizations" element={<OrganizationDashboard />} />
            <Route path="/organizations/create" element={<CreateOrganization />} />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
            <Route path="/organizations/:id/members" element={<ManageMembers />} />

            {/* RBAC routes (Riddhi) - read-only, authentication only */}
            <Route path="/roles" element={<Roles />} />
            <Route path="/roles/:id" element={<RoleDetails />} />
            <Route path="/rbac-dashboard" element={<RBACDashboard />} />
          </Route>

          {/* RBAC routes requiring MANAGE_ROLES permission */}
          <Route element={<ProtectedRoute requiredPermission="MANAGE_ROLES" />}>
            <Route path="/roles/create" element={<CreateRole />} />
            <Route path="/roles/:id/edit" element={<EditRole />} />
            <Route path="/roles/:id/permissions" element={<Permissions />} />
          </Route>

          {/* Assign role to an org member - requires MANAGE_MEMBERS permission
              (checked again inside AssignRole.jsx itself as a second guard).
              Resolves the earlier organizationId routing question: the param
              is scoped under /organizations/:organizationId, matching how
              AssignRole.jsx already reads it via useParams(). */}
          <Route element={<ProtectedRoute requiredPermission="MANAGE_MEMBERS" />}>
            <Route
              path="/organizations/:organizationId/assign-role"
              element={<AssignRole />}
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;