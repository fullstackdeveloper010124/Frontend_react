import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  User,
  MoreVertical,
  MessageSquare,
  Calendar,
  Target
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  hoursToday: number;
  hoursThisWeek: number;
  tasksCompleted: number;
  tasksPending: number;
  productivity: number;
  currentTask?: string;
}

interface ManagerTeamOverviewProps {
  teamMembers: TeamMember[];
  onMemberClick: (memberId: string) => void;
  onMessageMember: (memberId: string) => void;
}

export const ManagerTeamOverview: React.FC<ManagerTeamOverviewProps> = ({
  teamMembers,
  onMemberClick,
  onMessageMember
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 90) return 'text-green-600';
    if (productivity >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalHours = teamMembers.reduce((sum, member) => sum + member.hoursThisWeek, 0);
  const avgProductivity = teamMembers.reduce((sum, member) => sum + member.productivity, 0) / teamMembers.length;
  const totalTasksCompleted = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
  const totalTasksPending = teamMembers.reduce((sum, member) => sum + member.tasksPending, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Overview</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {teamMembers.length} members
          </span>
        </div>

        {/* Team Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Hours</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-1">{totalHours}h</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Completed</span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">{totalTasksCompleted}</p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pending</span>
            </div>
            <p className="text-xl font-bold text-yellow-600 mt-1">{totalTasksPending}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Avg Productivity</span>
            </div>
            <p className="text-xl font-bold text-purple-600 mt-1">{Math.round(avgProductivity)}%</p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="p-6">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onMemberClick(member.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar with Status */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 ${getStatusColor(member.status)}`}></div>
                  </div>

                  {/* Member Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    {member.currentTask && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <Target className="w-3 h-3 inline mr-1" />
                        {member.currentTask}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageMember(member.id);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(selectedMember === member.id ? null : member.id);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Member Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {member.hoursToday}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {member.hoursThisWeek}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {member.tasksCompleted}/{member.tasksCompleted + member.tasksPending}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Productivity</p>
                  <div className="flex items-center justify-center space-x-1">
                    <p className={`text-sm font-semibold ${getProductivityColor(member.productivity)}`}>
                      {member.productivity}%
                    </p>
                    {member.productivity >= 90 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : member.productivity < 70 ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Productivity Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Weekly Progress</span>
                  <span>{member.productivity}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      member.productivity >= 90 
                        ? 'bg-green-500' 
                        : member.productivity >= 70 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${member.productivity}%` }}
                  ></div>
                </div>
              </div>

              {/* Expanded Actions */}
              {selectedMember === member.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors">
                      <Calendar className="w-3 h-3" />
                      <span>Schedule Meeting</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors">
                      <Target className="w-3 h-3" />
                      <span>Assign Task</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors">
                      <TrendingUp className="w-3 h-3" />
                      <span>View Performance</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
