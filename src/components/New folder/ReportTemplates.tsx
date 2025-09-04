import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  Star, 
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'time-tracking' | 'productivity' | 'billing' | 'team-performance' | 'custom';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  lastUsed: string;
  isStarred: boolean;
  filters: any;
  charts: string[];
}

interface ReportTemplatesProps {
  templates: ReportTemplate[];
  onUseTemplate: (template: ReportTemplate) => void;
  onSaveTemplate: (template: Omit<ReportTemplate, 'id' | 'lastUsed'>) => void;
  onEditTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onStarTemplate: (id: string, starred: boolean) => void;
}

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  templates,
  onUseTemplate,
  onSaveTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onStarTemplate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'custom' as const,
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    isStarred: false,
    filters: {},
    charts: []
  });

  const templateTypes = [
    { value: 'time-tracking', label: 'Time Tracking', icon: Clock, color: 'text-blue-600' },
    { value: 'productivity', label: 'Productivity', icon: BarChart3, color: 'text-green-600' },
    { value: 'billing', label: 'Billing & Revenue', icon: DollarSign, color: 'text-emerald-600' },
    { value: 'team-performance', label: 'Team Performance', icon: Users, color: 'text-purple-600' },
    { value: 'custom', label: 'Custom Report', icon: FileText, color: 'text-gray-600' }
  ];

  const handleCreateTemplate = () => {
    onSaveTemplate(newTemplate);
    setShowCreateModal(false);
    setNewTemplate({
      name: '',
      description: '',
      type: 'custom',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      isStarred: false,
      filters: {},
      charts: []
    });
  };

  const starredTemplates = templates.filter(t => t.isStarred);
  const recentTemplates = templates
    .filter(t => !t.isStarred)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Templates</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Starred Templates */}
      {starredTemplates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Starred Templates</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => onUseTemplate(template)}
                onEdit={() => onEditTemplate(template.id)}
                onDelete={() => onDeleteTemplate(template.id)}
                onStar={(starred) => onStarTemplate(template.id, starred)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Templates */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">Recent Templates</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => onUseTemplate(template)}
              onEdit={() => onEditTemplate(template.id)}
              onDelete={() => onDeleteTemplate(template.id)}
              onStar={(starred) => onStarTemplate(template.id, starred)}
            />
          ))}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Template
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this template is for"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Type
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => {
                    const selectedType = templateTypes.find(t => t.value === e.target.value);
                    setNewTemplate(prev => ({
                      ...prev,
                      type: e.target.value as any,
                      icon: selectedType?.icon || FileText,
                      color: selectedType?.color || 'text-blue-600'
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: ReportTemplate;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStar: (starred: boolean) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onEdit,
  onDelete,
  onStar
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${template.bgColor}`}>
          <template.icon className={`w-5 h-5 ${template.color}`} />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onStar(!template.isStarred)}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              template.isStarred ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <Star className="w-4 h-4" fill={template.isStarred ? 'currentColor' : 'none'} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-400"
            >
              <Edit className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h5 className="font-medium text-gray-900 dark:text-white mb-1">
        {template.name}
      </h5>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 inline mr-1" />
          {new Date(template.lastUsed).toLocaleDateString()}
        </div>
        <button
          onClick={onUse}
          className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Use</span>
        </button>
      </div>
    </div>
  );
};
