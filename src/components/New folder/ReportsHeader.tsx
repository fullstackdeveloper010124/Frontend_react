import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Target,
  Activity,
  Calendar
} from 'lucide-react';

interface ReportsHeaderProps {
  totalHours: number;
  billableHours: number;
  totalRevenue: number;
  activeProjects: number;
  teamMembers: number;
  productivityScore: number;
  dateRange: string;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  totalHours,
  billableHours,
  totalRevenue,
  activeProjects,
  teamMembers,
  productivityScore,
  dateRange
}) => {
  const metrics = [
    {
      title: 'Total Hours',
      value: totalHours.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
    },
    {
      title: 'Billable Hours',
      value: billableHours.toLocaleString(),
      change: `${((billableHours / totalHours) * 100).toFixed(1)}% rate`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/20',
    },
    {
      title: 'Revenue Generated',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+18.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      borderColor: 'border-emerald-200 dark:border-emerald-500/20',
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: '+2 this month',
      changeType: 'positive',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
    },
    {
      title: 'Team Members',
      value: teamMembers.toString(),
      change: '100% active',
      changeType: 'neutral',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/20',
    },
    {
      title: 'Productivity Score',
      value: `${productivityScore}%`,
      change: '+5.3%',
      changeType: 'positive',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      borderColor: 'border-orange-200 dark:border-orange-500/20',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
            <p className="text-indigo-100 text-lg">
              Comprehensive insights into your team's productivity and performance
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{dateRange}</span>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-300" />
            <span className="text-sm">Real-time data</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-300" />
            <span className="text-sm">Advanced analytics</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-300" />
            <span className="text-sm">Performance tracking</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${metric.borderColor} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {metric.value}
                </p>
                <p className={`text-sm ${
                  metric.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : metric.changeType === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {metric.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
