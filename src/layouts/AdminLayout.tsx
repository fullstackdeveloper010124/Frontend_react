import React from "react";
import {Header} from "@/components/navbar/AdminHeader";
import {Sidebar} from "@/components/Sidebar/AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Admin Navbar */}
      <Header onMenuClick={() => {}} />
      <div className="admin-content">
        {/* Admin Sidebar */}
        <Sidebar isOpen={true} onClose={() => {}} />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
