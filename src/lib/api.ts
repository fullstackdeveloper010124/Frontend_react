import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Centralized API URLs for the project
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' 
    ? "http://localhost:5000/api" 
    : "https://timesheetsbackend.myadminbuddy.com/api");

export const API_URLS = {
  // Auth endpoints
  userSignup: `${API_BASE_URL}/auth/user/signup`,
  memberSignup: `${API_BASE_URL}/auth/member/signup`,
  login: `${API_BASE_URL}/auth/login`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  
  // Payment and other endpoints
  upiPayment: `${API_BASE_URL}/payment/upi`,
  leaveApplication: `${API_BASE_URL}/leave/apply`,
  notFound: `${API_BASE_URL}/not-found`,
  
  // Projects
  projects: `${API_BASE_URL}/projects`,
  projectsAll: `${API_BASE_URL}/projects/all`,
  projectById: (id: string) => `${API_BASE_URL}/projects/${id}`,
  
  // Team
  teamAll: `${API_BASE_URL}/team/all`,
  teamAdd: `${API_BASE_URL}/team/add`,
  teamDelete: (id: string) => `${API_BASE_URL}/team/delete/${id}`,
  teamUpdate: (id: string) => `${API_BASE_URL}/team/update/${id}`,
  
  // Leave
  leave: `${API_BASE_URL}/leave`,
  
  // Time Entries
  timeEntries: `${API_BASE_URL}/time-entries`,
  timeEntriesStart: `${API_BASE_URL}/time-entries/start`,
  timeEntriesStop: (id: string) => `${API_BASE_URL}/time-entries/stop/${id}`,
  timeEntriesSummary: (userId: string) => `${API_BASE_URL}/time-entries/summary/${userId}`,
  
  // Tasks
  tasks: `${API_BASE_URL}/tasks`,
  tasksByProject: (projectId: string) => `${API_BASE_URL}/tasks/project/${projectId}`,
  tasksByUser: (userId: string) => `${API_BASE_URL}/tasks/user/${userId}`,
  
  // Shifts
  shifts: `${API_BASE_URL}/shifts`,
  shiftsAll: `${API_BASE_URL}/shifts/all`,
  shiftsByEmployee: (employeeId: string) => `${API_BASE_URL}/shifts/employee/${employeeId}`,
  shiftsAssign: `${API_BASE_URL}/shifts/assign`,
  shiftUpdate: (shiftId: string) => `${API_BASE_URL}/shifts/${shiftId}`,
  shiftDelete: (shiftId: string) => `${API_BASE_URL}/shifts/${shiftId}`,
  shiftHistory: (employeeId: string) => `${API_BASE_URL}/shifts/history/${employeeId}`,
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and user role
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user role for permission checks
    if (user.role) {
      config.headers['user-role'] = user.role;
    }
    
    // Debug: Log the request (only in development)
    if (import.meta.env.MODE === 'development') {
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        headers: {
          Authorization: config.headers.Authorization ? '[TOKEN]' : 'none',
          'user-role': config.headers['user-role']
        }
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.MODE === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User types
export interface User {
  shift: any;
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  userType?: 'Admin' | 'Manager' | 'TeamMember'; // Added for backend compatibility
  department?: string;
  position?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager' | 'employee';
  
  // For User signup (admin/manager)
  fullName?: string;
  phone?: string;
  
  // For TeamMember signup (employee)
  name?: string;
  project?: string;
  
  // Optional fields
  department?: string;
  position?: string;
}

// Project types
export interface Project {
  _id: string;
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate?: string;
  deadline?: string;
  progress: number;
  team: number;
  hours: number;
  status: 'active' | 'completed' | 'on-hold' | 'In Progress';
  assignedTeam: TeamMember[];
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  updatedAt?: string;
}

// Leave Application types
export interface LeaveApplication {
  _id: string;
  employeeName: string;
  supervisorName: string;
  department: string;
  leaveDate: string;
  leaveTime: string;
  leaveType: string;
  duration: string;
  selectedReasons: string[];
  otherReason: string;
  description: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

// TeamMember interface
export interface TeamMember {
  isUser: any;
  _id: string;
  employeeId: string;
  name: string;
  project: string | Project;
  email: string;
  phone?: string;
  password?: string;
  address?: string;
  bankName?: string;
  bankAddress?: string;
  accountHolder?: string;
  accountHolderAddress?: string;
  account?: string;
  accountType?: string;
  role: 'Employee' | 'Manager' | 'Admin';
  charges: number;
  status: 'Active' | 'Inactive' | 'Pending';
  shift: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  userType?: 'TeamMember'; // Added for consistency
  createdAt?: string;
  updatedAt?: string;
} 

// Time Entry types - FIXED: Added missing userType property
export interface TimeEntry {
  _id: string;
  id?: string; // Optional id property for backend compatibility
  userId: string | User;
  project: string | Project;
  task: string | Task;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  billable: boolean;
  status: 'In Progress' | 'Completed' | 'Paused';
  trackingType: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  isManualEntry: boolean;
  hourlyRate: number;
  totalAmount: number;
  userType: string; // ADDED: This was missing and causing the error
  createdAt?: string;
  updatedAt?: string;
}

// Task types
export interface Task {
  _id: string;
  name: string;
  description?: string;
  project: string | Project;
  assignedTo?: string | User;
  assignedModel?: string; // Added for backend compatibility
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold';
  estimatedHours: number;
  actualHours: number;
  dueDate?: string;
  tags: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Shift types
export interface Shift {
  _id: string;
  employeeId: string | TeamMember;
  shiftType: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  startTime: string;
  endTime: string;
  workingDays: string[];
  isActive: boolean;
  assignedBy: string | User;
  assignedDate: string;
  description?: string;
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerMonth: number;
  monthlyHours: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Authentication API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Normalize the response
      const responseData = response.data;
      
      return {
        success: true,
        data: {
          token: responseData.token,
          user: responseData.user
        }
      };
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupData): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      // Choose the appropriate signup endpoint based on role
      const endpoint = userData.role === 'employee' ? '/auth/member/signup' : '/auth/user/signup';
      
      // Format data according to backend expectations
      let formattedData;
      const normalizeRole = (r: string | undefined): 'Admin' | 'Manager' | 'Employee' | undefined => {
        if (!r) return undefined;
        const lower = r.toLowerCase();
        if (lower === 'admin') return 'Admin';
        if (lower === 'manager') return 'Manager';
        if (lower === 'employee') return 'Employee';
        return undefined;
      };
      
      if (userData.role === 'employee') {
        // TeamMember signup format
        formattedData = {
          name: userData.name,
          phone: userData.phone || '1234567890',
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          project: userData.project || '507f1f77bcf86cd799439011',
          role: normalizeRole(userData.role) || 'Employee'
        };
      } else {
        // User signup format (admin/manager)
        formattedData = {
          fullName: userData.fullName || userData.name,
          phone: userData.phone || '1234567890',
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          role: normalizeRole(userData.role) || 'Manager'
        };
      }
      
      const response = await apiClient.post(endpoint, formattedData);
      
      return {
        success: true,
        data: {
          token: response.data.token,
          user: response.data.user
        }
      };
    } catch (error: any) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user found');
      }
      const user = JSON.parse(userStr);
      return { success: true, data: user };
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// User API functions
export const userAPI = {
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Team API functions
export const teamAPI = {
  getAllTeam: async (): Promise<ApiResponse<TeamMember[]>> => {
    try {
      const response = await apiClient.get('/team/all');
      
      // Handle different response formats
      let data = response.data;
      if (Array.isArray(data)) {
        return { success: true, data };
      } else if (data && data.data) {
        return { success: true, data: data.data };
      } else if (data && data.members) {
        return { success: true, data: data.members };
      } else if (data && data.success) {
        return data;
      } else {
        return { success: false, data: [], error: 'Unexpected response format' };
      }
    } catch (error) {
      console.error('Team API error:', error);
      throw error;
    }
  },

  addTeamMember: async (memberData: Omit<TeamMember, '_id'>): Promise<ApiResponse<TeamMember>> => {
    try {
      const response = await apiClient.post('/team/add', memberData);
      return response.data;
    } catch (error) {
      console.error('Add team member error:', error);
      throw error;
    }
  },

  updateTeamMember: async (id: string, memberData: Partial<TeamMember>): Promise<ApiResponse<TeamMember>> => {
    try {
      const response = await apiClient.put(`/team/update/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Update team member error:', error);
      throw error;
    }
  },

  deleteTeamMember: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/team/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete team member error:', error);
      throw error;
    }
  },
};

// Project API functions
export const projectAPI = {
  getAllProjects: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await apiClient.get('/projects/all');
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      } else if (response.data?.success && response.data?.data) {
        return response.data;
      } else if (response.data?.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, data: [], error: 'Unexpected response format' };
    } catch (error: any) {
      console.error('Project API error:', error);
      return { success: false, data: [], error: error.message || 'Unknown error' };
    }
  },

  getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProject: async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> => {
    try {
      const transformedData = {
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : new Date().toISOString(),
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : undefined,
        deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : undefined,
      };
      
      const response = await apiClient.post('/projects', transformedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id: string, projectData: Partial<Omit<Project, '_id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Project>> => {
    try {
      const transformedData = {
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : undefined,
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : undefined,
        deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : undefined,
      };
      
      const response = await apiClient.put(`/projects/${id}`, transformedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Leave Application API functions
export const leaveAPI = {
  getAllLeaveApplications: async (): Promise<ApiResponse<LeaveApplication[]>> => {
    try {
      const response = await apiClient.get('/leave');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLeaveApplicationById: async (id: string): Promise<ApiResponse<LeaveApplication>> => {
    try {
      const response = await apiClient.get(`/leave/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  applyLeave: async (leaveData: Omit<LeaveApplication, '_id' | 'status' | 'submittedAt'>): Promise<ApiResponse<LeaveApplication>> => {
    try {
      const response = await apiClient.post('/leave', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateLeaveStatus: async (id: string, status: 'approved' | 'rejected', comments?: string, reviewedBy?: string): Promise<ApiResponse<LeaveApplication>> => {
    try {
      const response = await apiClient.put(`/leave/${id}/status`, { status, comments, reviewedBy });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFilteredLeaveApplications: async (filters: {
    status?: string;
    department?: string;
    employeeName?: string;
  }): Promise<ApiResponse<LeaveApplication[]>> => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await apiClient.get(`/leave?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteLeaveApplication: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/leave/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Time Entry API functions - ENHANCED with better error handling and userType support
export const timeEntryAPI = {
  getAllTimeEntries: async (filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    project?: string;
    status?: string;
  }): Promise<ApiResponse<TimeEntry[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/time-entries?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTimeEntry: async (timeEntryData: {
    userId: string;
    project: string;
    task: string;
    description: string;
    startTime: string;
    endTime?: string;
    billable?: boolean;
    trackingType?: string;
    isManualEntry?: boolean;
    hourlyRate?: number;
    userType?: string; // Added userType support
  }): Promise<ApiResponse<TimeEntry>> => {
    try {
      // Ensure userType is included
      const dataWithUserType = {
        ...timeEntryData,
        userType: timeEntryData.userType || 'TeamMember'
      };
      
      const response = await apiClient.post('/time-entries', dataWithUserType);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  startTimer: async (timerData: {
    userId: string;
    project: string;
    task: string;
    description: string;
    trackingType?: string;
    userType?: string;
    hourlyRate?: number;
  }): Promise<ApiResponse<TimeEntry>> => {
    try {
      console.log('🔄 API: Starting timer with data:', timerData);
      
      // Ensure userType is included
      const dataWithUserType = {
        ...timerData,
        userType: timerData.userType || 'TeamMember'
      };
      
      const response = await apiClient.post('/time-entries/start', dataWithUserType);
      console.log('🔄 API: Timer start response:', response.data);
      
      // Handle different response formats from backend
      if (response.status === 200 || response.status === 201) {
        if (response.data && typeof response.data === 'object') {
          // Check if it's already wrapped in ApiResponse format
          if ('success' in response.data) {
            return response.data;
          }
          // If it's direct data, wrap it
          else if ('_id' in response.data || 'id' in response.data) {
            return { success: true, data: response.data };
          }
          // If it has nested data
          else if ('data' in response.data) {
            return { success: true, data: response.data.data };
          }
        }
      }
      
      // Fallback
      return response.data;
    } catch (error: any) {
      console.error('🔄 API: Timer start error:', error);
      throw error;
    }
  },

  stopTimer: async (timeEntryId: string): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.put(`/time-entries/stop/${timeEntryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveByUser: async (userId: string): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.get(`/time-entries/active/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTimeEntryById: async (id: string): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.get(`/time-entries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createManualEntry: async (data: {
    userId: string;
    project: string;
    task: string;
    description: string;
    startTime: string;
    endTime: string;
    billable?: boolean;
    hourlyRate?: number;
    userType?: string;
  }): Promise<ApiResponse<TimeEntry>> => {
    try {
      const dataWithUserType = {
        ...data,
        userType: data.userType || 'TeamMember'
      };
      
      const response = await apiClient.post('/time-entries/manual', dataWithUserType);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTimeEntry: async (id: string, updateData: Partial<TimeEntry>): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.put(`/time-entries/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTimeEntry: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/time-entries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserSummary: async (userId: string, startDate?: string, endDate?: string): Promise<ApiResponse<{
    summary: {
      totalHours: number;
      billableHours: number;
      totalEntries: number;
      period: { start: string; end: string };
    };
    recentEntries: TimeEntry[];
  }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await apiClient.get(`/time-entries/summary/${userId}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Task API functions - ENHANCED with assignedModel support
export const taskAPI = {
  getAllTasks: async (filters?: {
    project?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<ApiResponse<Task[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTasksByProject: async (projectId: string, status?: string): Promise<ApiResponse<Task[]>> => {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiClient.get(`/tasks/project/${projectId}${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserTasks: async (userId: string, status?: string): Promise<ApiResponse<Task[]>> => {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiClient.get(`/tasks/user/${userId}${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> => {
    try {
      // Ensure assignedModel is included for backend compatibility
      const dataWithModel = {
        ...taskData,
        assignedModel: taskData.assignedModel || 'TeamMember'
      };
      
      const response = await apiClient.post('/tasks', dataWithModel);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Shift API functions
export const shiftAPI = {
  getEmployeeShift: async (employeeId: string): Promise<ApiResponse<Shift>> => {
    try {
      const response = await apiClient.get(`/shifts/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllShifts: async (): Promise<ApiResponse<Shift[]>> => {
    try {
      const response = await apiClient.get('/shifts/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  assignShift: async (shiftData: {
    employeeId: string;
    shiftType: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
    startTime?: string;
    endTime?: string;
    workingDays?: string[];
    description?: string;
    hoursPerDay?: number;
    daysPerWeek?: number;
    weeksPerMonth?: number;
    monthlyHours?: number;
    assignedBy: string;
  }): Promise<ApiResponse<Shift>> => {
    try {
      const response = await apiClient.post('/shifts/assign', shiftData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateShift: async (shiftId: string, shiftData: Partial<Shift>): Promise<ApiResponse<Shift>> => {
    try {
      const response = await apiClient.put(`/shifts/${shiftId}`, shiftData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteShift: async (shiftId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getShiftHistory: async (employeeId: string): Promise<ApiResponse<Shift[]>> => {
    try {
      const response = await apiClient.get(`/shifts/history/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
