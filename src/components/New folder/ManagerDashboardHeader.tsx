import React from 'react';
import { 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface ManagerDashboardHeaderProps {
  teamSize: number;
  activeProjects: number;
  totalHoursThisWeek: number;
  completedTasks: number;
  pendingTasks: number;
  teamProductivity: number;
  weeklyRevenue: number;
  currentWeek: string;
}

export const ManagerDashboardHeader: React.FC<ManagerDashboardHeaderProps> = ({
  teamSize,
  activeProjects,
  totalHoursThisWeek,
  completedTasks,
  pendingTasks,
  teamProductivity,
  weeklyRevenue,
  currentWeek
}) => {
  const metrics = [
    {
      title: 'Team Members',
      value: teamSize,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      change: '+2 this month',
      changeType: 'positive' as const
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      change: '3 in progress',
      changeType: 'neutral' as const
    },
    {
      title: 'Hours This Week',
      value: `${totalHoursThisWeek}h`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      change: '+12% vs last week',
      changeType: 'positive' as const
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      change: `${pendingTasks} pending`,
      changeType: 'neutral' as const
    },
    {
      title: 'Team Productivity',
      value: `${teamProductivity}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      change: teamProductivity >= 85 ? '+5% this week' : '-2% this week',
      changeType: teamProductivity >= 85 ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Weekly Revenue',
      value: `$${weeklyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      change: '+8% vs last week',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
            <p className="text-blue-100 mt-1">Team overview and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{currentWeek}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.changeType === 'positive' && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {metric.changeType === 'negative' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {metric.changeType === 'neutral' && (
                  <Calendar className="w-4 h-4 text-gray-500" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <p className={`text-xs ${
                  metric.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : metric.changeType === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {metric.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
