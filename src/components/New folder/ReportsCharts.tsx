import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity,
  Calendar,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface TimeSeriesData {
  date: string;
  hours: number;
  billableHours: number;
  revenue: number;
}

interface ReportsChartsProps {
  projectData: ChartData[];
  teamData: ChartData[];
  timeSeriesData: TimeSeriesData[];
  selectedChart: string;
  onChartChange: (chart: string) => void;
}

export const ReportsCharts: React.FC<ReportsChartsProps> = ({
  projectData,
  teamData,
  timeSeriesData,
  selectedChart,
  onChartChange
}) => {
  const chartOptions = [
    { id: 'projects', label: 'Projects Overview', icon: BarChart3 },
    { id: 'team', label: 'Team Performance', icon: Users },
    { id: 'timeline', label: 'Time Trends', icon: TrendingUp },
    { id: 'productivity', label: 'Productivity', icon: Activity }
  ];

  const renderProjectChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Time by Project</h4>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {projectData.reduce((sum, item) => sum + item.value, 0)} hours
        </div>
      </div>
      
      <div className="space-y-3">
        {projectData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.value}h
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeamChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h4>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Avg: {(teamData.reduce((sum, item) => sum + item.value, 0) / teamData.length).toFixed(1)}h
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teamData.map((member, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {member.value}h
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${member.color}`}
                style={{ width: `${(member.value / Math.max(...teamData.map(t => t.value))) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Time Trends</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Total Hours</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Billable Hours</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between space-x-1">
          {timeSeriesData.map((day, index) => {
            const maxHours = Math.max(...timeSeriesData.map(d => d.hours));
            const totalHeight = (day.hours / maxHours) * 100;
            const billableHeight = (day.billableHours / maxHours) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div className="relative w-full flex flex-col justify-end h-48">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${totalHeight}%` }}
                    title={`${day.date}: ${day.hours}h total`}
                  ></div>
                  <div 
                    className="w-full bg-green-500 rounded-t-sm absolute bottom-0 transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${billableHeight}%` }}
                    title={`${day.date}: ${day.billableHours}h billable`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProductivityChart = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Productivity Metrics</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900 dark:text-white">Daily Averages</h5>
          <div className="space-y-3">
            {[
              { label: 'Hours per Day', value: 7.8, target: 8, color: 'bg-blue-500' },
              { label: 'Billable Rate', value: 85, target: 80, color: 'bg-green-500' },
              { label: 'Project Completion', value: 92, target: 90, color: 'bg-purple-500' },
              { label: 'Client Satisfaction', value: 96, target: 95, color: 'bg-orange-500' }
            ].map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {metric.value}{metric.label.includes('Rate') || metric.label.includes('Completion') || metric.label.includes('Satisfaction') ? '%' : 'h'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metric.color}`}
                    style={{ width: `${metric.label.includes('Hours') ? (metric.value / 12) * 100 : metric.value}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {metric.target}{metric.label.includes('Rate') || metric.label.includes('Completion') || metric.label.includes('Satisfaction') ? '%' : 'h'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900 dark:text-white">Performance Indicators</h5>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, label: 'Efficiency', value: '94%', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { icon: TrendingUp, label: 'Growth', value: '+12%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
              { icon: Users, label: 'Collaboration', value: '89%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { icon: DollarSign, label: 'Revenue', value: '+18%', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' }
            ].map((indicator, index) => (
              <div key={index} className={`${indicator.bg} rounded-lg p-4 text-center`}>
                <indicator.icon className={`w-6 h-6 ${indicator.color} mx-auto mb-2`} />
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {indicator.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {indicator.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (selectedChart) {
      case 'projects':
        return renderProjectChart();
      case 'team':
        return renderTeamChart();
      case 'timeline':
        return renderTimelineChart();
      case 'productivity':
        return renderProductivityChart();
      default:
        return renderProjectChart();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Chart Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h3>
        <div className="flex items-center space-x-2">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onChartChange(option.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedChart === option.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="min-h-[300px]">
        {renderChart()}
      </div>
    </div>
  );
};
