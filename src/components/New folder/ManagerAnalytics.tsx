import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  timeTracking: {
    thisWeek: number;
    lastWeek: number;
    billableHours: number;
    nonBillableHours: number;
  };
  productivity: {
    teamAverage: number;
    topPerformer: string;
    improvementAreas: string[];
  };
  projects: {
    onTrack: number;
    delayed: number;
    completed: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    projected: number;
  };
}

interface ManagerAnalyticsProps {
  data: AnalyticsData;
  timeRange: 'week' | 'month' | 'quarter';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter') => void;
}

export const ManagerAnalytics: React.FC<ManagerAnalyticsProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedChart, setSelectedChart] = useState('overview');

  const chartOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
    { id: 'projects', label: 'Projects', icon: Target }
  ];

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const timeChange = getChangePercentage(data.timeTracking.thisWeek, data.timeTracking.lastWeek);
  const revenueChange = getChangePercentage(data.revenue.thisMonth, data.revenue.lastMonth);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics & Insights</h3>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2 mt-4">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedChart(option.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === option.id
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      <div className="p-6">
        {selectedChart === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Hours</p>
                    <p className="text-2xl font-bold text-blue-600">{data.timeTracking.thisWeek}h</p>
                    <p className={`text-xs ${timeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {timeChange >= 0 ? '+' : ''}{timeChange}% vs last {timeRange}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Team Productivity</p>
                    <p className="text-2xl font-bold text-green-600">{data.productivity.teamAverage}%</p>
                    <p className="text-xs text-green-600">Top: {data.productivity.topPerformer}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Projects On Track</p>
                    <p className="text-2xl font-bold text-purple-600">{data.projects.onTrack}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{data.projects.delayed} delayed</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Revenue</p>
                    <p className="text-2xl font-bold text-indigo-600">${data.revenue.thisMonth.toLocaleString()}</p>
                    <p className={`text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueChange >= 0 ? '+' : ''}{revenueChange}% vs last month
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Distribution Chart */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Time Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Billable Hours</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.timeTracking.billableHours}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${(data.timeTracking.billableHours / data.timeTracking.thisWeek) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Non-Billable Hours</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.timeTracking.nonBillableHours}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ 
                        width: `${(data.timeTracking.nonBillableHours / data.timeTracking.thisWeek) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Project Status Chart */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Project Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">On Track</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.projects.onTrack}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Delayed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.projects.delayed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.projects.completed}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedChart === 'productivity' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Productivity Insights</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Team Average</span>
                  <span className="text-lg font-bold text-green-600">{data.productivity.teamAverage}%</span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Performer</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{data.productivity.topPerformer}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Improvement Areas</p>
                  <ul className="space-y-1">
                    {data.productivity.improvementAreas.map((area, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other chart types can be implemented similarly */}
      </div>
    </div>
  );
};
