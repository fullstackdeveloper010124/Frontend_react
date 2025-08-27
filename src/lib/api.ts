import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Centralized API URLs for the project
const API_BASE_URL = "http://localhost:5000/api"; // or your deployed backend

export const API_URLS = {
  // Auth endpoints
  userSignup: `${API_BASE_URL}/auth/user/signup`,
  memberSignup: `${API_BASE_URL}/auth/member/signup`,
  login: `${API_BASE_URL}/auth/login`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  
  // Payment and other endpoints
  upiPayment: `${API_BASE_URL}/payment/upi`, // UPI payment endpoint
  leaveApplication: `${API_BASE_URL}/leave/apply`, // Leave application endpoint
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
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug: Log the request
    console.log('Making request to:', config.baseURL + config.url, config.data);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
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
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  position?: string;
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
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  assignedTeam: string[];
}

// Leave Application types
export interface LeaveApplication {
  _id: string;
  employeeId: string;
  leaveType: 'sick' | 'casual' | 'annual' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

// TeamMember interface
export interface TeamMember {
  _id: string;
  employeeId: string;
  name: string;
  project: string | { _id: string; name: string };
  email: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAddress?: string;
  accountHolder?: string;
  accountHolderAddress?: string;
  account?: string;
  accountType?: string;
  hoursThisWeek?: number;
  status?: string;
  role?: string;
}

// Authentication API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      // Transform backend response to match our expected format
      return {
        success: true,
        data: {
          token: response.data.token,
          user: response.data.user
        }
      };
    } catch (error) {
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
          phone: userData.phone || '1234567890', // Default phone if not provided
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          project: userData.project || '507f1f77bcf86cd799439011', // Default project ID if not provided
          // Ensure role matches backend enum
          role: normalizeRole(userData.role) || 'Employee'
        };
      } else {
        // User signup format (admin/manager)
        formattedData = {
          fullName: userData.fullName || userData.name,
          phone: userData.phone || '1234567890', // Default phone if not provided
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          // Ensure proper case for backend
          role: normalizeRole(userData.role) || 'Manager'
        };
      }
      
      const response = await apiClient.post(endpoint, formattedData);
      // Transform backend response to match our expected format
      return {
        success: true,
        data: {
          token: response.data.token,
          user: response.data.user
        }
      };
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      // Since there's no /me endpoint, we'll return the user from localStorage
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
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addTeamMember: async (memberData: Omit<TeamMember, '_id'>): Promise<ApiResponse<TeamMember>> => {
    try {
      const response = await apiClient.post('/team/add', memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTeamMember: async (id: string, memberData: Partial<TeamMember>): Promise<ApiResponse<TeamMember>> => {
    try {
      const response = await apiClient.put(`/team/update/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTeamMember: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/team/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Project API functions
export const projectAPI = {
  getAllProjects: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await apiClient.get('/projects/all');
      return response.data;
    } catch (error) {
      throw error;
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

  createProject: async (projectData: Omit<Project, '_id'>): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
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

  applyLeave: async (leaveData: Omit<LeaveApplication, '_id' | 'status' | 'appliedDate'>): Promise<ApiResponse<LeaveApplication>> => {
    try {
      const response = await apiClient.post('/leave/apply', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateLeaveStatus: async (id: string, status: 'approved' | 'rejected'): Promise<ApiResponse<LeaveApplication>> => {
    try {
      const response = await apiClient.put(`/leave/${id}/status`, { status });
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

export default apiClient;