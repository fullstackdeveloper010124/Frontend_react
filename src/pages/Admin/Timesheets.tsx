
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { Calendar, Clock, Filter, Download, Loader2 } from 'lucide-react';
import { timeEntryAPI, type TimeEntry } from '@/lib/api';

const Timesheets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    project: '',
    status: ''
  });

  // Fetch time entries on component mount
  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await timeEntryAPI.getAllTimeEntries(filters);
      
      if (response.success && response.data) {
        setTimeEntries(response.data);
      } else {
        setError('Failed to fetch time entries');
      }
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError('Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}.${mins.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectName = (project: any) => {
    return typeof project === 'string' ? project : project?.name || 'Unknown Project';
  };

  const getTaskName = (task: any) => {
    return typeof task === 'string' ? task : task?.name || 'Unknown Task';
  };

  const getUserName = (user: any) => {
    return typeof user === 'string' ? user : user?.name || 'Unknown User';
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Timesheets</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and review your time entries</p>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>This Week</option>
                      <option>Last Week</option>
                      <option>This Month</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Projects</option>
                      <option>Website Redesign</option>
                      <option>Mobile App</option>
                      <option>Marketing Campaign</option>
                    </select>
                  </div>
                </div>
                <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Timesheet Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Entries</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Billable</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span className="text-gray-500 dark:text-gray-400">Loading time entries...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-red-600 dark:text-red-400">{error}</div>
                          <button 
                            onClick={fetchTimeEntries}
                            className="mt-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    ) : timeEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No time entries found
                        </td>
                      </tr>
                    ) : (
                      timeEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(entry.createdAt || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {getProjectName(entry.project)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {getTaskName(entry.task)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDuration(entry.duration)}
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
