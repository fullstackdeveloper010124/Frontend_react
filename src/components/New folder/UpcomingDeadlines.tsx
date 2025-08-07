
import React from 'react';
import { AlertTriangle, FileText, Calendar } from 'lucide-react';

export const UpcomingDeadlines: React.FC = () => {
  const deadlines = [
    {
      id: 1,
      title: 'Website Launch',
      dueDate: 'Due in 3 days',
      priority: 'high',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-500/20'
    },
    {
      id: 2,
      title: 'Client Report',
      dueDate: 'Due in 5 days',
      priority: 'medium',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20'
    },
    {
      id: 3,
      title: 'Sprint Planning',
      dueDate: 'Due in 1 week',
      priority: 'low',
      icon: Calendar,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {deadlines.map((deadline) => (
          <div 
            key={deadline.id} 
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
              deadline.priority === 'high' 
                ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{deadline.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{deadline.dueDate}</p>
            </div>
            <div className={`w-8 h-8 rounded-full ${deadline.bgColor} flex items-center justify-center flex-shrink-0`}>
              <deadline.icon className={`w-4 h-4 ${deadline.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
