import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Activity,
  Target
} from 'lucide-react';
import { type TimeEntry } from '@/lib/api';

interface TimesheetAnalyticsProps {
  timeEntries: TimeEntry[];
}

export const TimesheetAnalytics: React.FC<TimesheetAnalyticsProps> = ({ timeEntries }) => {
  // Calculate analytics data
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
  const billableHours = timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
  const totalRevenue = timeEntries.filter(e => e.billable && e.totalAmount).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
  const uniqueUsers = [...new Set(timeEntries.map(entry => entry.userId))].length;
  
  // Project breakdown
  const projectStats = timeEntries.reduce((acc, entry) => {
    const projectName = typeof entry.project === 'string' ? entry.project : entry.project?.name || 'Unknown';
    if (!acc[projectName]) {
      acc[projectName] = { hours: 0, revenue: 0, entries: 0 };
    }
    acc[projectName].hours += (entry.duration || 0) / 60;
    acc[projectName].revenue += entry.billable ? (entry.totalAmount || 0) : 0;
    acc[projectName].entries += 1;
    return acc;
  }, {} as Record<string, { hours: number; revenue: number; entries: number }>);

  const topProjects = Object.entries(projectStats)
    .sort(([,a], [,b]) => b.hours - a.hours)
    .slice(0, 5);

  // Daily breakdown for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyStats = last7Days.map(date => {
    const dayEntries = timeEntries.filter(entry => 
      entry.createdAt && entry.createdAt.startsWith(date)
    );
    const hours = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
    return {
      date,
      hours,
      entries: dayEntries.length,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const maxDailyHours = Math.max(...dailyStats.map(d => d.hours), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Daily Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Activity (Last 7 Days)</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {dailyStats.map((day, index) => (
            <div key={day.date} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                  {day.dayName}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-32">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(day.hours / maxDailyHours) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {day.hours.toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {day.entries} entries
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Projects</h3>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {topProjects.map(([project, stats], index) => (
            <div key={project} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-32">
                    {project}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.entries} entries
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {stats.hours.toFixed(1)}h
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  ${stats.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {((billableHours / totalHours) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Billable Rate</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${(totalRevenue / billableHours || 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rate/Hour</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(totalHours / uniqueUsers || 0).toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg per User</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {timeEntries.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Distribution</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Billable Hours</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {billableHours.toFixed(1)}h ({((billableHours / totalHours) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(billableHours / totalHours) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Non-billable Hours</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {(totalHours - billableHours).toFixed(1)}h ({(((totalHours - billableHours) / totalHours) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((totalHours - billableHours) / totalHours) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
