import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/Admin/Dashboard';
import ManagerDashboard from '@/pages/Manager/Dashboard';
import EmployeeDashboard from '@/pages/Employee/Dashboard';

// New: import Login and Signup
import Login from '@/pages/Index';
import Signup from '@/pages/Signup';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home: keep Index as landing/marketing; or replace with Login if desired */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

        {/* Shorthand dashboard redirect */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Unknown route -> home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
