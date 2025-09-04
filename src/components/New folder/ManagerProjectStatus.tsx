import React, { useState } from 'react';
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  Play,
  Pause,
  Target,
  DollarSign
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'delayed';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamMembers: number;
  hoursLogged: number;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  manager: string;
}

interface ManagerProjectStatusProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

export const ManagerProjectStatus: React.FC<ManagerProjectStatusProps> = ({
  projects,
  onProjectClick,
  onUpdateProject
}) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const delayedProjects = projects.filter(p => p.status === 'delayed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Status</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} projects
          </span>
        </div>

        {/* Project Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">{activeProjects}</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Completed</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-1">{completedProjects}</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900 dark:text-red-100">Delayed</span>
            </div>
            <p className="text-xl font-bold text-red-600 mt-1">{delayedProjects}</p>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Budget</span>
            </div>
            <p className="text-xl font-bold text-indigo-600 mt-1">${totalBudget.toLocaleString()}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Spent</span>
            </div>
            <p className="text-xl font-bold text-purple-600 mt-1">${totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6">
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(project.priority)}`}
              onClick={() => onProjectClick(project.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(selectedProject === project.id ? null : project.id);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.teamMembers} members
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hours</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.hoursLogged}/{project.estimatedHours}h
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${project.spent.toLocaleString()}/${project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Progress */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Budget Used</span>
                  <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div
                    className="h-1 bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Expanded Actions */}
              {selectedProject === project.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors">
                      <Target className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors">
                      <Users className="w-3 h-3" />
                      <span>Manage Team</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors">
                      <Calendar className="w-3 h-3" />
                      <span>Timeline</span>
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
