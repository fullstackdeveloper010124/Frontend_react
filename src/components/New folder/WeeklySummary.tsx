
import React from 'react';

interface WeeklySummaryProps {
  timeEntries: any[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ timeEntries }) => {
  const totalHours = timeEntries.reduce((acc, entry) => {
    const [hours, minutes] = entry.time.split(':').map(Number);
    return acc + hours + minutes / 60;
  }, 0);

  const targetHours = 40;
  const percentage = Math.min((totalHours / targetHours) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Summary</h3>
      
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-indigo-600 transition-all duration-300 ease-in-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Target: {targetHours}h</span>
          <span className="text-gray-600 dark:text-gray-400">Completed: {totalHours.toFixed(1)}h</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {timeEntries.filter(e => e.billable).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Billable Entries</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {[...new Set(timeEntries.map(e => e.project))].length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
};
