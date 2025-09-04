import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

interface SystemHealthProps {
  className?: string;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ className = '' }) => {
  const [systemStatus, setSystemStatus] = useState({
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    notifications: 'warning'
  });

  const [metrics, setMetrics] = useState({
    uptime: '99.9%',
    responseTime: '120ms',
    activeUsers: 24,
    dataSync: 'synced'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const systemComponents = [
    {
      name: 'API Server',
      status: systemStatus.api,
      icon: Server,
      description: 'All endpoints responding normally'
    },
    {
      name: 'Database',
      status: systemStatus.database,
      icon: Database,
      description: 'Connection stable, queries optimized'
    },
    {
      name: 'File Storage',
      status: systemStatus.storage,
      icon: Wifi,
      description: 'Cloud storage accessible'
    },
    {
      name: 'Notifications',
      status: systemStatus.notifications,
      icon: AlertTriangle,
      description: '2 pending email notifications'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'info',
      message: 'System backup completed successfully',
      time: '10 minutes ago',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'warning',
      message: 'High memory usage detected on server',
      time: '1 hour ago',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'success',
      message: 'Database optimization completed',
      time: '3 hours ago',
      icon: TrendingUp
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Health</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
        </div>
      </div>

      {/* System Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {systemComponents.map((component, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <component.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{component.name}</span>
              </div>
              {getStatusIcon(component.status)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{component.description}</p>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.uptime}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.responseTime}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.activeUsers}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">✓</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Data Sync</div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Alerts</h3>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <alert.icon className={`w-4 h-4 ${
                  alert.type === 'success' ? 'text-green-500' :
                  alert.type === 'warning' ? 'text-yellow-500' :
                  alert.type === 'error' ? 'text-red-500' :
                  'text-blue-500'
                }`} />
                <span className="text-sm text-gray-900 dark:text-white">{alert.message}</span>
              </div>
              <span className="text-xs text-gray-500">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
