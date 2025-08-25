// Centralized API URLs for the project

const API_BASE_URL = "http://localhost:5000/api";

export const API_URLS = {
  signup: `${API_BASE_URL}/team/signup`,
  login: `${API_BASE_URL}/team/login`,
  getUser: `${API_BASE_URL}/team/user`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  upiPayment: `${API_BASE_URL}/payment/upi`, // UPI payment endpoint
  leaveApplication: `${API_BASE_URL}/leave/apply`, // Leave application endpoint
  notFound: `${API_BASE_URL}/not-found`,
  // Add more endpoints as needed
  // Example: dashboard: `${API_BASE_URL}/dashboard`,
};

export default API_URLS;
