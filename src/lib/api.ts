// Centralized API URLs for the project

const API_BASE_URL = "http://localhost:5000/api"; // or your deployed backend

export const API_URLS = {
  signup: `${API_BASE_URL}/team/signup`,
  login: `${API_BASE_URL}/team/login`,
  getUser: `${API_BASE_URL}/team/user`,
  forgotPassword: `${API_BASE_URL}/team/forgot-password`,
  upiPayment: `${API_BASE_URL}/payment/upi`, // UPI payment endpoint
  leaveApplication: `${API_BASE_URL}/leave/apply`, // Leave application endpoint
  notFound: `${API_BASE_URL}/not-found`,
  // Add more endpoints as needed
  // Example: dashboard: `${API_BASE_URL}/dashboard`,
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
export default API_URLS;