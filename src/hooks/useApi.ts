import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiFunction(...args);
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
        const message = typeof backendMessage === 'string' && backendMessage.trim().length > 0
          ? backendMessage
          : (error.message || 'An error occurred');
        setState({
          data: null,
          loading: false,
          error: message,
        });
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for common operations
export function useLogin() {
  return useApi(async (credentials: { email: string; password: string }) => {
    const { authAPI } = await import('@/lib/api');
    return authAPI.login(credentials);
  });
}

export function useSignup() {
  return useApi(async (userData: any) => {
    const { authAPI } = await import('@/lib/api');
    return authAPI.signup(userData);
  });
}

export function useGetAllUsers() {
  return useApi(async () => {
    const { userAPI } = await import('@/lib/api');
    return userAPI.getAllUsers();
  });
}

export function useGetAllProjects() {
  return useApi(async () => {
    const { projectAPI } = await import('@/lib/api');
    return projectAPI.getAllProjects();
  });
}

export function useGetAllTeam() {
  return useApi(async () => {
    const { teamAPI } = await import('@/lib/api');
    return teamAPI.getAllTeam();
  });
}

export function useGetAllLeaveApplications() {
  return useApi(async () => {
    const { leaveAPI } = await import('@/lib/api');
    return leaveAPI.getAllLeaveApplications();
  });
}

export function useCreateProject() {
  return useApi(async (projectData: any) => {
    const { projectAPI } = await import('@/lib/api');
    return projectAPI.createProject(projectData);
  });
}

export function useUpdateProject() {
  return useApi(async (id: string, projectData: any) => {
    const { projectAPI } = await import('@/lib/api');
    return projectAPI.updateProject(id, projectData);
  });
}

export function useDeleteProject() {
  return useApi(async (id: string) => {
    const { projectAPI } = await import('@/lib/api');
    return projectAPI.deleteProject(id);
  });
}

export function useApplyLeave() {
  return useApi(async (leaveData: any) => {
    const { leaveAPI } = await import('@/lib/api');
    return leaveAPI.applyLeave(leaveData);
  });
}

export function useUpdateLeaveStatus() {
  return useApi(async (id: string, status: 'approved' | 'rejected') => {
    const { leaveAPI } = await import('@/lib/api');
    return leaveAPI.updateLeaveStatus(id, status);
  });
}
