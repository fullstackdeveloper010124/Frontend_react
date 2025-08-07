import React from "react";
import ManagerNavbar from "@/components/Navbar/ManagerNavbar";
import ManagerSidebar from "@/components/Sidebar/ManagerSidebar";
import { Outlet } from "react-router-dom";

const ManagerLayout = () => {
  return (
    <div className="manager-layout">
      {/* Manager Navbar */}
      <ManagerNavbar />
      <div className="manager-content">
        {/* Manager Sidebar */}
        <ManagerSidebar />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout;
