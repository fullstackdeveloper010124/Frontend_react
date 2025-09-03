import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/EmployeeSidebar';
import { Header } from '@/components/navbar/EmployeeHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { Calendar, Clock, Filter, Download, Loader2, User } from 'lucide-react';
import { timeEntryAPI, type TimeEntry } from '@/lib/api';

const Timesheets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    project: '',
    status: ''
  });

  // Fetch current user's time entries on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          
          // Fetch only current user's time entries
          const response = await timeEntryAPI.getAllTimeEntries({ 
            userId: user._id,
            ...filters 
          });
          
          if (response.success && response.data) {
            setTimeEntries(response.data);
          } else {
            setError('Failed to fetch your time entries');
          }
        } else {
          setError('User not found. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching time entries:', err);
        setError('Failed to fetch your time entries');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [filters]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectName = (project: any) => {
    return typeof project === 'string' ? project : project?.name || 'Unknown Project';
  };

  const getTaskName = (task: any) => {
    return typeof task === 'string' ? task : task?.name || 'Unknown Task';
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportTimesheet = () => {
    // Simple CSV export
    const headers = ['Date', 'Project', 'Task', 'Description', 'Start Time', 'End Time', 'Duration', 'Status', 'Billable'];
    const csvContent = [
      headers.join(','),
      ...timeEntries.map(entry => [
        formatDate(entry.createdAt || ''),
        getProjectName(entry.project),
        getTaskName(entry.task),
        entry.description || '',
        entry.startTime ? formatTime(entry.startTime) : '',
        entry.endTime ? formatTime(entry.endTime) : '',
        formatDuration(entry.duration || 0),
        entry.status,
        entry.billable ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${currentUser?.name || 'employee'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Timesheets</h1>
              <p className="text-gray-600 dark:text-gray-400">View and manage your time entries</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeEntries.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Timers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {timeEntries.filter(e => e.status === 'In Progress').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Start Date"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="End Date"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select 
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Status</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={exportTimesheet}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Timesheet Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Time Entries ({timeEntries.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Billable</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span className="text-gray-500 dark:text-gray-400">Loading your time entries...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center">
                          <div className="text-red-600 dark:text-red-400">{error}</div>
                        </td>
                      </tr>
                    ) : timeEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <Clock className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">No time entries found</p>
                            <p className="text-sm">Start tracking your time to see entries here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      timeEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(entry.createdAt || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="font-medium">{getProjectName(entry.project)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {getTaskName(entry.task)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                            <div className="truncate" title={entry.description}>
                              {entry.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="space-y-1">
                              <div>{entry.startTime ? formatTime(entry.startTime) : '-'}</div>
                              <div>{entry.endTime ? formatTime(entry.endTime) : 'Running...'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDuration(entry.duration || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 
                              entry.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.billable ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' : 
                              'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                            }`}>
                              {entry.billable ? 'Billable' : 'Non-billable'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Timesheets;
