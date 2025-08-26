# API Integration Guide

This guide explains how to use the API integration system in your React frontend to communicate with your Node.js backend.

## Overview

The API integration system consists of:

1. **API Service Layer** (`src/lib/api.ts`) - Centralized API functions
2. **Custom Hooks** (`src/hooks/useApi.ts`) - React hooks for API calls with loading/error states
3. **Authentication Context** (`src/contexts/AuthContext.tsx`) - User authentication management
4. **Example Components** - Demonstrating usage patterns

## Quick Start

### 1. Authentication

The authentication system is already set up with the `AuthProvider` wrapping your app in `App.tsx`.

```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 2. Making API Calls

Use the custom hooks for API calls with built-in loading and error states:

```tsx
import { useGetAllProjects } from '@/hooks/useApi';

const ProjectsComponent = () => {
  const { execute: fetchProjects, data: projects, loading, error } = useGetAllProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project._id}>{project.name}</div>
      ))}
    </div>
  );
};
```

## Available API Functions

### Authentication
- `authAPI.login(credentials)` - User login
- `authAPI.signup(userData)` - User registration
- `authAPI.logout()` - User logout
- `authAPI.getCurrentUser()` - Get current user info
- `authAPI.forgotPassword(email)` - Password reset

### Users
- `userAPI.getAllUsers()` - Get all users
- `userAPI.getUserById(id)` - Get user by ID
- `userAPI.updateUser(id, userData)` - Update user
- `userAPI.deleteUser(id)` - Delete user

### Team
- `teamAPI.getAllTeam()` - Get all team members
- `teamAPI.addTeamMember(memberData)` - Add team member
- `teamAPI.updateTeamMember(id, memberData)` - Update team member
- `teamAPI.deleteTeamMember(id)` - Delete team member

### Projects
- `projectAPI.getAllProjects()` - Get all projects
- `projectAPI.getProjectById(id)` - Get project by ID
- `projectAPI.createProject(projectData)` - Create new project
- `projectAPI.updateProject(id, projectData)` - Update project
- `projectAPI.deleteProject(id)` - Delete project

### Leave Applications
- `leaveAPI.getAllLeaveApplications()` - Get all leave applications
- `leaveAPI.getLeaveApplicationById(id)` - Get leave application by ID
- `leaveAPI.applyLeave(leaveData)` - Apply for leave
- `leaveAPI.updateLeaveStatus(id, status)` - Update leave status
- `leaveAPI.deleteLeaveApplication(id)` - Delete leave application

## Custom Hooks

### Available Hooks

```tsx
// Authentication
const { execute: login, loading, error } = useLogin();
const { execute: signup, loading, error } = useSignup();

// Data fetching
const { execute: fetchUsers, data: users, loading, error } = useGetAllUsers();
const { execute: fetchProjects, data: projects, loading, error } = useGetAllProjects();
const { execute: fetchTeam, data: team, loading, error } = useGetAllTeam();
const { execute: fetchLeave, data: leave, loading, error } = useGetAllLeaveApplications();

// Data mutations
const { execute: createProject, loading, error } = useCreateProject();
const { execute: updateProject, loading, error } = useUpdateProject();
const { execute: deleteProject, loading, error } = useDeleteProject();
const { execute: applyLeave, loading, error } = useApplyLeave();
const { execute: updateLeaveStatus, loading, error } = useUpdateLeaveStatus();
```

### Hook Usage Pattern

```tsx
const MyComponent = () => {
  const { execute, data, loading, error, reset } = useGetAllProjects();

  useEffect(() => {
    execute(); // Fetch data on component mount
  }, [execute]);

  const handleRefresh = () => {
    reset(); // Clear previous data/errors
    execute(); // Fetch fresh data
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {data?.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## Example Components

### 1. Login Form (`src/components/LoginForm.tsx`)

Shows how to implement a login form with API integration:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/hooks/useApi';

const LoginForm = () => {
  const { execute: executeLogin, loading, error } = useLogin();

  const handleSubmit = async (credentials) => {
    await executeLogin(credentials);
    // AuthContext will handle the login response
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div>Error: {error}</div>}
    </form>
  );
};
```

### 2. Projects List (`src/components/ProjectsList.tsx`)

Shows how to fetch and display data with CRUD operations:

```tsx
import { useGetAllProjects, useDeleteProject } from '@/hooks/useApi';

const ProjectsList = () => {
  const { execute: fetchProjects, data: projects, loading, error } = useGetAllProjects();
  const { execute: deleteProject, loading: deleting } = useDeleteProject();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    await deleteProject(id);
    fetchProjects(); // Refresh list
  };

  // Render projects list
};
```

## Error Handling

The API system includes automatic error handling:

1. **Network errors** are caught and displayed
2. **401 Unauthorized** responses automatically log out the user
3. **Custom error messages** from the backend are displayed
4. **Loading states** prevent multiple simultaneous requests

## Authentication Flow

1. **Login**: User submits credentials → API call → Token stored → User redirected
2. **Protected Routes**: Check `isAuthenticated` from `useAuth()`
3. **Token Management**: Automatically included in API requests
4. **Logout**: Clear token and user data → Redirect to login

## Best Practices

### 1. Use Custom Hooks
Instead of calling API functions directly, use the custom hooks for better state management:

```tsx
// ✅ Good
const { execute, data, loading, error } = useGetAllProjects();

// ❌ Avoid
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
// Manual state management
```

### 2. Handle Loading States
Always show loading indicators for better UX:

```tsx
if (loading) return <div>Loading...</div>;
```

### 3. Error Handling
Display user-friendly error messages:

```tsx
if (error) return <div>Error: {error}</div>;
```

### 4. Refresh Data
Provide ways to refresh data:

```tsx
const handleRefresh = () => {
  reset();
  execute();
};
```

### 5. Optimistic Updates
For better UX, update UI immediately and handle errors:

```tsx
const handleDelete = async (id) => {
  // Optimistically remove from UI
  setProjects(prev => prev.filter(p => p._id !== id));
  
  try {
    await deleteProject(id);
  } catch (error) {
    // Restore on error
    fetchProjects();
  }
};
```

## Configuration

### Backend URL
The API base URL is configured in `src/lib/api.ts`:

```tsx
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Change for production
  timeout: 10000,
});
```

### Environment Variables
For production, consider using environment variables:

```tsx
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS configured
2. **401 Errors**: Check if token is valid and included in requests
3. **Network Errors**: Verify backend is running and accessible
4. **Type Errors**: Check TypeScript interfaces match backend response

### Debug Tips

1. Check browser network tab for API calls
2. Use browser console for error logging
3. Verify backend endpoints match frontend calls
4. Test API endpoints with Postman/Insomnia

## Next Steps

1. **Add more API endpoints** as needed in `apiService.ts`
2. **Create more custom hooks** for specific use cases
3. **Implement caching** for better performance
4. **Add request/response interceptors** for logging
5. **Implement retry logic** for failed requests
