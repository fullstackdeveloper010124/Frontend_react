import React from 'react';
import { 
  Plus, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Download, 
  Upload,
  Bell,
  BarChart3,
  Clock
} from 'lucide-react';

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'add-project',
      title: 'New Project',
      description: 'Create a new project',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      id: 'manage-team',
      title: 'Manage Team',
      description: 'Add or edit team members',
      icon: Users,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-white'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Export timesheet reports',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Plan team meetings',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    },
    {
      id: 'system-settings',
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View system alerts',
      icon: Bell,
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    }
  ];

  const handleActionClick = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    } else {
      // Default behavior for demo
      console.log(`Action clicked: ${actionId}`);
      // You can add routing or modal opening logic here
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className={`${action.color} ${action.textColor} p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <action.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Actions</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Generated monthly report</span>
            </div>
            <span className="text-xs text-gray-500">2h ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-600 dark:text-gray-400">Added new team member</span>
            </div>
            <span className="text-xs text-gray-500">1d ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Created new project</span>
            </div>
            <span className="text-xs text-gray-500">3d ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
