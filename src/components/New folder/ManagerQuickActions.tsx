import React from 'react';
import { 
  Plus, 
  UserPlus, 
  Calendar, 
  MessageSquare,
  FileText,
  Target,
  Clock,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  action: () => void;
}

interface ManagerQuickActionsProps {
  onCreateProject: () => void;
  onAddTeamMember: () => void;
  onScheduleMeeting: () => void;
  onSendMessage: () => void;
  onCreateReport: () => void;
  onAssignTask: () => void;
  onTrackTime: () => void;
  onViewReports: () => void;
}

export const ManagerQuickActions: React.FC<ManagerQuickActionsProps> = ({
  onCreateProject,
  onAddTeamMember,
  onScheduleMeeting,
  onSendMessage,
  onCreateReport,
  onAssignTask,
  onTrackTime,
  onViewReports
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'create-project',
      title: 'Create Project',
      description: 'Start a new project',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20',
      action: onCreateProject
    },
    {
      id: 'add-member',
      title: 'Add Team Member',
      description: 'Invite new team member',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20',
      action: onAddTeamMember
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Book team meeting',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20',
      action: onScheduleMeeting
    },
    {
      id: 'send-message',
      title: 'Send Message',
      description: 'Message team members',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20',
      action: onSendMessage
    },
    {
      id: 'assign-task',
      title: 'Assign Task',
      description: 'Create and assign tasks',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20',
      action: onAssignTask
    },
    {
      id: 'track-time',
      title: 'Track Time',
      description: 'Monitor time entries',
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
      action: onTrackTime
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Analytics and insights',
      icon: BarChart3,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-500/10 hover:bg-pink-100 dark:hover:bg-pink-500/20',
      action: onViewReports
    },
    {
      id: 'team-overview',
      title: 'Team Overview',
      description: 'View team status',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20',
      action: () => {} // Placeholder
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Frequently used management tasks
        </p>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.bgColor} rounded-lg p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-105 border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="px-6 pb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Created "Website Redesign" project</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Added Sarah Johnson to team</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Scheduled weekly standup</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
