import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  X, 
  ChevronDown,
  Users,
  Briefcase,
  Clock,
  DollarSign,
  UserCheck,
  Timer
} from 'lucide-react';

interface FilterState {
  startDate: string;
  endDate: string;
  project: string;
  status: string;
  user: string;
  billable: string;
  searchTerm: string;
  teamMember: string;
  shiftType: string;
}

interface TeamMemberWithShift {
  _id: string;
  name: string;
  shift: string;
  employeeId: string;
}

interface TimesheetFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  projects?: string[];
  users?: string[];
  teamMembers?: TeamMemberWithShift[];
  onTeamMemberSelect?: (member: TeamMemberWithShift | null) => void;
}

export const TimesheetFilters: React.FC<TimesheetFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  projects = [],
  users = [],
  teamMembers = [],
  onTeamMemberSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value.trim() !== '').length;
  };

  const quickDateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' }
  ];

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Paused', value: 'Paused' }
  ];

  const billableOptions = [
    { label: 'All Types', value: '' },
    { label: 'Billable Only', value: 'true' },
    { label: 'Non-billable Only', value: 'false' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by description, project, or task..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {quickDateRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => {
              // Set date range based on selection
              const today = new Date();
              let startDate = '';
              let endDate = '';

              switch (range.value) {
                case 'today':
                  startDate = endDate = today.toISOString().split('T')[0];
                  break;
                case 'yesterday':
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  startDate = endDate = yesterday.toISOString().split('T')[0];
                  break;
                case 'this_week':
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  startDate = startOfWeek.toISOString().split('T')[0];
                  endDate = today.toISOString().split('T')[0];
                  break;
                case 'last_week':
                  const lastWeekEnd = new Date(today);
                  lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                  const lastWeekStart = new Date(lastWeekEnd);
                  lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
                  startDate = lastWeekStart.toISOString().split('T')[0];
                  endDate = lastWeekEnd.toISOString().split('T')[0];
                  break;
                case 'this_month':
                  startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                  endDate = today.toISOString().split('T')[0];
                  break;
                case 'last_month':
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                  startDate = lastMonth.toISOString().split('T')[0];
                  endDate = lastMonthEnd.toISOString().split('T')[0];
                  break;
              }

              onFiltersChange({
                ...filters,
                startDate,
                endDate
              });
            }}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Main Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Billable Filter */}
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <select
              value={filters.billable}
              onChange={(e) => handleFilterChange('billable', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {billableOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear ({getActiveFilterCount()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Project Filter */}
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <select
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Team Member Filter with Shift */}
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-gray-400" />
              <select
                value={filters.teamMember}
                onChange={(e) => {
                  const selectedMemberId = e.target.value;
                  const selectedMember = teamMembers.find(m => m._id === selectedMemberId);
                  
                  handleFilterChange('teamMember', selectedMemberId);
                  handleFilterChange('shiftType', selectedMember?.shift || '');
                  
                  if (onTeamMemberSelect) {
                    onTeamMemberSelect(selectedMember || null);
                  }
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Team Members</option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.employeeId}) - {member.shift} Shift
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Type Display */}
            {filters.shiftType && (
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Filtering by: {filters.shiftType} Shift
                  </span>
                </div>
              </div>
            )}

            {/* User Filter */}
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
