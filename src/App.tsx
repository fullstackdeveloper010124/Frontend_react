import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminTimesheets from '@/pages/Admin/Timesheets';
import AdminProjects from '@/pages/Admin/Projects';
import AdminTeam from '@/pages/Admin/Team';
import AdminReports from '@/pages/Admin/Reports';
import AdminSettings from '@/pages/Admin/Settings';
import AdminLeaveApplication from '@/pages/Admin/LeaveApplication';
import AdminNotFound from '@/pages/Admin/NotFound';
import ManagerDashboard from '@/pages/Manager/Dashboard';
import ManagerTimesheets from '@/pages/Manager/Timesheets';
import ManagerProjects from '@/pages/Manager/Projects';
import ManagerTeam from '@/pages/Manager/Team';
import ManagerReports from '@/pages/Manager/Reports';
import ManagerSettings from '@/pages/Manager/Settings';
import ManagerNotFound from '@/pages/Manager/NotFound';
import EmployeeDashboard from '@/pages/Employee/Dashboard';
import EmployeeLeaveApplication from '@/pages/Employee/LeaveApplication';

// New: import Login and Signup
import Login from '@/pages/Index';
import Signup from '@/pages/Signup';
import TestPage from '@/pages/TestPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Home: keep Index as landing/marketing; or replace with Login if desired */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test" element={<TestPage />} />

        {/* Dashboard routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/timesheets" element={<AdminTimesheets />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/team" element={<AdminTeam />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/leave-application" element={<AdminLeaveApplication />} />
        <Route path="/admin/invoice" element={<AdminNotFound />} />
        
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/timesheets" element={<ManagerTimesheets />} />
        <Route path="/manager/projects" element={<ManagerProjects />} />
        <Route path="/manager/team" element={<ManagerTeam />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
        <Route path="/manager/settings" element={<ManagerSettings />} />
        <Route path="/manager/leave-application" element={<ManagerNotFound />} />
        <Route path="/manager/invoice" element={<ManagerNotFound />} />

        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/timesheets" element={<EmployeeDashboard />} />
        <Route path="/employee/projects" element={<EmployeeDashboard />} />
        <Route path="/employee/team" element={<EmployeeDashboard />} />
        <Route path="/employee/reports" element={<EmployeeDashboard />} />
        <Route path="/employee/settings" element={<EmployeeDashboard />} />
        <Route path="/employee/invoice" element={<EmployeeDashboard />} />
        <Route path="/employee/leave-application" element={<EmployeeLeaveApplication />} />

        {/* Shorthand dashboard redirect */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Unknown route -> home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
