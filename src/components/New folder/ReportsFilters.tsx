import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  X, 
  ChevronDown,
  Users,
  Briefcase,
  Tag
} from 'lucide-react';

interface FilterOptions {
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  projects: string[];
  teamMembers: string[];
  reportType: string;
  billableFilter: string;
  searchQuery: string;
}

interface ReportsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableProjects: string[];
  availableTeamMembers: string[];
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  onFiltersChange,
  availableProjects,
  availableTeamMembers
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-3-months', label: 'Last 3 months' },
    { value: 'last-6-months', label: 'Last 6 months' },
    { value: 'last-year', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const reportTypeOptions = [
    { value: 'all', label: 'All Reports' },
    { value: 'time-tracking', label: 'Time Tracking' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'project-summary', label: 'Project Summary' },
    { value: 'team-performance', label: 'Team Performance' },
    { value: 'billing', label: 'Billing & Revenue' }
  ];

  const billableOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'billable', label: 'Billable Only' },
    { value: 'non-billable', label: 'Non-billable Only' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: 'last-30-days',
      customStartDate: '',
      customEndDate: '',
      projects: [],
      teamMembers: [],
      reportType: 'all',
      billableFilter: 'all',
      searchQuery: ''
    });
  };

  const activeFiltersCount = [
    filters.projects.length > 0,
    filters.teamMembers.length > 0,
    filters.reportType !== 'all',
    filters.billableFilter !== 'all',
    filters.searchQuery.length > 0
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full text-xs font-medium">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span>Advanced</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Report Type */}
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filters.reportType}
            onChange={(e) => handleFilterChange('reportType', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {reportTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Billable Filter */}
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filters.billableFilter}
            onChange={(e) => handleFilterChange('billableFilter', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {billableOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Projects Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Projects
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableProjects.map(project => (
                <label key={project} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.projects.includes(project)}
                    onChange={(e) => {
                      const newProjects = e.target.checked
                        ? [...filters.projects, project]
                        : filters.projects.filter(p => p !== project);
                      handleFilterChange('projects', newProjects);
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{project}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Team Members Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Members
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableTeamMembers.map(member => (
                <label key={member} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.teamMembers.includes(member)}
                    onChange={(e) => {
                      const newMembers = e.target.checked
                        ? [...filters.teamMembers, member]
                        : filters.teamMembers.filter(m => m !== member);
                      handleFilterChange('teamMembers', newMembers);
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{member}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
