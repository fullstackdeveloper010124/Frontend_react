import React from "react";
import { Header } from "@/components/navbar/ManagerHeader";
import { Sidebar } from "@/components/Sidebar/ManagerSidebar";
import { Outlet } from "react-router-dom";


const ManagerLayout = () => {
  return (
    <div className="manager-layout">
      {/* Manager Navbar */}
      <Header onMenuClick={() => {}} />
      <div className="manager-content">
        {/* Manager Sidebar */}
        <Sidebar isOpen={true} onClose={() => {}} />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout;
