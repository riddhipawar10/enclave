import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Landing from "./pages/Landing";

import Dashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import NotFound from "./pages/NotFound";

import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import ProjectDashboard from "./pages/project/ProjectDashboard";
import CreateProject from "./pages/project/CreateProject";
import ProjectDetails from "./pages/project/ProjectDetails";
import EditProject from "./pages/project/EditProject";
import CreateTaskPage from "./pages/task/CreateTaskPage";
import EditTask from "./pages/task/EditTask";

import MyTeam from "./pages/team/MyTeam";
import AddMember from "./pages/team/AddMember";
import Tasks from "./pages/task/Tasks";

import Board from "./pages/board/Board";

import Sprints from "./pages/sprint/Sprints";
import CreateSprint from "./pages/sprint/CreateSprint";
import EditSprint from "./pages/sprint/EditSprint";

import Calendar from "./pages/Calendar/Calendar";

import Analytics from "./pages/Analytics/Analytics";

import Notifications from "./pages/Notifications/Notifications";

import Settings from "./pages/settings/Settings";

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
      <Routes>

        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Public authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/manager/login" element={<Login />} />
        <Route path="/team-member/login" element={<Login />} />

        <Route path="/admin/register" element={<Register />} />
        <Route path="/manager/register" element={<Register />} />
        <Route path="/team-member/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/access-denied"
          element={<AccessDenied />}
        />

        {/* =====================================================
            AUTHENTICATED ROUTES
            ProtectedRoute checks authentication.
            AuthenticatedLayout provides the common sidebar.
           ===================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Manager Dashboard */}
            <Route
              path="/manager-dashboard/:organizationId"
              element={<ManagerDashboard />}
            />

            {/* Manager Projects */}
            <Route
              path="/projects"
              element={<ProjectDashboard />}
            />

            <Route
              path="/projects/create"
              element={<CreateProject />}
            />

            <Route
              path="/projects/:projectId"
              element={<ProjectDetails />}
            />

            <Route
              path="/projects/:projectId/edit"
              element={<EditProject />}
            />

            {/* Tasks */}

            <Route
              path="/tasks"
              element={<Tasks />}
            />

            <Route
              path="/tasks/create/:projectId"
              element={<CreateTaskPage />}
            />

            <Route
              path="/tasks/:projectId/:taskId/edit"
              element={<EditTask />}
            />

            <Route
              path="/team"
              element={<MyTeam />}
            />

            <Route 
              path="/team/add" 
              element={<AddMember />} 
            />

            {/* Board */}
            <Route
              path="/board"
              element={<Board />}
            />

            {/* Sprints */}
            <Route 
              path="/sprints" 
              element={<Sprints />} 
            />
            <Route
              path="/sprints/create/:organizationId/:projectId"
              element={<CreateSprint />}
            />

            <Route
              path="/sprints/:organizationId/:projectId/:sprintId/edit"
              element={<EditSprint />}
            />

            <Route
              path="/calendar"
              element={<Calendar />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route 
              path="/notifications" 
              element={<Notifications />} 
            />

            <Route 
              path="/settings" 
              element={<Settings />} 
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Organization Management */}
            <Route
              path="/organizations"
              element={<OrganizationDashboard />}
            />

            <Route
              path="/organizations/create"
              element={<CreateOrganization />}
            />

            <Route
              path="/organizations/:id"
              element={<OrganizationDetails />}
            />

            <Route
              path="/organizations/:id/edit"
              element={<EditOrganization />}
            />

            <Route
              path="/organizations/:id/members"
              element={<ManageMembers />}
            />

            {/* RBAC - read-only */}
            <Route
              path="/roles"
              element={<Roles />}
            />

            <Route
              path="/roles/:id"
              element={<RoleDetails />}
            />

            <Route
              path="/rbac-dashboard"
              element={<RBACDashboard />}
            />

          </Route>
        </Route>

        {/* =====================================================
            RBAC ROUTES REQUIRING MANAGE_ROLES
           ===================================================== */}

        <Route
          element={
            <ProtectedRoute requiredPermission="MANAGE_ROLES" />
          }
        >
          <Route
            element={<AuthenticatedLayout />}
          >
            <Route
              path="/roles/create"
              element={<CreateRole />}
            />

            <Route
              path="/roles/:id/edit"
              element={<EditRole />}
            />

            <Route
              path="/roles/:id/permissions"
              element={<Permissions />}
            />
          </Route>
        </Route>

        {/* =====================================================
            ASSIGN ROLE REQUIRES MANAGE_MEMBERS
           ===================================================== */}

        <Route
          element={
            <ProtectedRoute requiredPermission="MANAGE_MEMBERS" />
          }
        >
          <Route
            element={<AuthenticatedLayout />}
          >
            <Route
              path="/organizations/:organizationId/assign-role"
              element={<AssignRole />}
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;