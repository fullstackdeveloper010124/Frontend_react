import React from "react";
import { Header} from "@/components/navbar/EmployeeHeader";
import { Sidebar } from "@/components/Sidebar/EmployeeSidebar";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="employee-layout">
      {/* Employee Navbar */}
      <Header onMenuClick={() => { /* handle menu click */ }} />
      <div className="employee-content">
        {/* Employee Sidebar */}
        <Sidebar isOpen={true} onClose={() => { /* handle sidebar close */ }} />
        <div className="main-content">
          {/* Render nested routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
