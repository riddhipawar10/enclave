import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AuthenticatedLayout.css";

function AuthenticatedLayout() {
  return (
    <div className="authenticated-layout">
      <Sidebar />

      <main className="authenticated-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthenticatedLayout;