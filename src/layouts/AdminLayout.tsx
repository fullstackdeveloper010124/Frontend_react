import React from "react";
import AdminNavbar from "@/components/Navbar/AdminNavbar";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Admin Navbar */}
      <AdminNavbar />
      <div className="admin-content">
        {/* Admin Sidebar */}
        <AdminSidebar />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
