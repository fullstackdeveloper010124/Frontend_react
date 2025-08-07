import React from "react";
import EmployeeNavbar from "@/components/Navbar/EmployeeNavbar";
import EmployeeSidebar from "@/components/Sidebar/EmployeeSidebar";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="employee-layout">
      {/* Employee Navbar */}
      <EmployeeNavbar />
      <div className="employee-content">
        {/* Employee Sidebar */}
        <EmployeeSidebar />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
