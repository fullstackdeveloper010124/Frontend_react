import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiHealthCheckProps {
  onHealthCheck?: (isHealthy: boolean) => void;
}

const ApiHealthCheck: React.FC<ApiHealthCheckProps> = ({ onHealthCheck }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      setError('');
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      // Try to make a simple request to check if API is responding
      const response = await axios.get(`${baseUrl.replace('/api', '')}/`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setApiStatus('healthy');
      onHealthCheck?.(true);
    } catch (err: any) {
      console.error('API Health Check Failed:', err);
      setApiStatus('unhealthy');
      setError(err.message || 'API connection failed');
      onHealthCheck?.(false);
    }
  };

  if (apiStatus === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded shadow">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
          <span>Checking API connection...</span>
        </div>
      </div>
    );
  }

  if (apiStatus === 'unhealthy') {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">API Offline</span>
            </div>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-1">
              Backend server may not be running on localhost:5000
            </p>
          </div>
          <button
            onClick={checkApiHealth}
            className="ml-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>API Connected</span>
      </div>
    </div>
  );
};

export default ApiHealthCheck;
