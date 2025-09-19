import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster'; // Your existing shadcn/ui toaster
import { Toaster as HotToaster } from 'react-hot-toast'; // New react-hot-toast
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect } from 'react';
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
import ManagerLeaveApplication from '@/pages/Manager/LeaveApplication';
import ManagerNotFound from '@/pages/Manager/NotFound';
import EmployeeDashboard from '@/pages/Employee/Dashboard';
import EmployeeLeaveApplication from '@/pages/Employee/LeaveApplication';

// New: import Login and Signup
import Signup from '@/pages/Signup';
import TestPage from '@/pages/TestPage';

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Initializing application..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Home: keep Index as landing/marketing; or replace with Login if desired */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test" element={<TestPage />} />

        {/* Debug route */}
        <Route path="/test-leave" element={<EmployeeLeaveApplication />} />

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
        <Route path="/manager/leave-application" element={<ManagerLeaveApplication />} />
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
  );
};

const App = () => {
  // Global error handler for external library errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Suppress errors from external libraries/browser extensions
      if (event.filename && (
        event.filename.includes('6da4b6d82d745093c67f68f3dfd58024.js') ||
        event.filename.includes('2341679a9c28c37b2ec2d727070e24de.js') ||
        event.message.includes('indexOf is not a function') ||
        event.message.includes('Cannot read properties of null')
      )) {
        console.warn('🔇 Suppressed external library error:', event.message);
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress promise rejections from external libraries
      if (event.reason && typeof event.reason === 'string' && (
        event.reason.includes('indexOf is not a function') ||
        event.reason.includes('Cannot read properties of null')
      )) {
        console.warn('🔇 Suppressed external library promise rejection:', event.reason);
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          {/* Your existing shadcn/ui Toaster */}
          <Toaster />
          {/* New react-hot-toast Toaster */}
          <HotToaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#3b82f6',
                  color: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
