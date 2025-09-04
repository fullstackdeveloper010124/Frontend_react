
import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { TimesheetFilters } from '@/components/New folder/TimesheetFilters';
import { TimesheetAnalytics } from '@/components/New folder/TimesheetAnalytics';
import { TimesheetTable } from '@/components/New folder/TimesheetTable';
import { Calendar, Clock, Filter, Download, Loader2, BarChart3, FileText, TrendingUp } from 'lucide-react';
import { timeEntryAPI, teamAPI, userAPI, type TimeEntry } from '@/lib/api';

const Timesheets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userCache, setUserCache] = useState<Map<string, string>>(new Map());
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    project: '',
    status: '',
    user: '',
    billable: '',
    searchTerm: ''
  });
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [projects, setProjects] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch time entries on component mount
  useEffect(() => {
    fetchTimeEntries();
    
    // Set up real-time clock for active timers
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Auto-refresh time entries every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchTimeEntries();
    }, 30000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await timeEntryAPI.getAllTimeEntries(filters);
      
      if (response.success && response.data) {
        setTimeEntries(response.data);
        // Cache user names for better performance
        await cacheUserNames(response.data);
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

  const cacheUserNames = async (entries: TimeEntry[]) => {
    const newCache = new Map(userCache);
    const uncachedUserIds = new Set<string>();
    
    // Collect all unique user IDs that aren't cached
    entries.forEach(entry => {
      const userId = typeof entry.userId === 'string' ? entry.userId : entry.userId?._id;
      if (userId && !newCache.has(userId)) {
        uncachedUserIds.add(userId);
      }
    });

    // Fetch user names from both Team and User tables
    if (uncachedUserIds.size > 0) {
      try {
        // Fetch from Team table
        const teamResponse = await teamAPI.getAllTeam();
        if (teamResponse.success && teamResponse.data) {
          teamResponse.data.forEach(member => {
            if (uncachedUserIds.has(member._id)) {
              newCache.set(member._id, member.name);
              uncachedUserIds.delete(member._id);
            }
          });
        }

        // Fetch remaining from User table
        if (uncachedUserIds.size > 0) {
          // Note: userAPI.getAllUsers might not exist, so we'll handle this gracefully
          try {
            const userResponse = await userAPI.getAllUsers();
            if (userResponse.success && userResponse.data) {
              userResponse.data.forEach(user => {
                if (uncachedUserIds.has(user._id)) {
                  newCache.set(user._id, user.name);
                }
              });
            }
          } catch (userErr) {
            console.log('User API not available, using team data only');
          }
        }

        setUserCache(newCache);
      } catch (err) {
        console.error('Error caching user names:', err);
      }
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // For completed entries, we don't have seconds precision
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRealTimeTimer = (startTime: string) => {
    const start = new Date(startTime);
    const now = currentTime;
    const diffMs = now.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    // Get user ID from the user object
    const userId = typeof user === 'string' ? user : user?._id;
    
    // Check cache first
    if (userId && userCache.has(userId)) {
      return userCache.get(userId)!;
    }
    
    // If user object has name directly
    if (typeof user === 'object' && user?.name) {
      return user.name;
    }
    
    // Fallback for unknown users
    return 'Unknown User';
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
          
          <main className="p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Team Timesheets</h1>
                  <p className="text-indigo-100 text-lg">Monitor and analyze your team's time tracking data</p>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) > 0 
                        ? Math.round(timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60)
                        : 0}h
                    </div>
                    <div className="text-indigo-200 text-sm">Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeEntries.length}</div>
                    <div className="text-indigo-200 text-sm">Entries</div>
                  </div>
                  <FileText className="w-16 h-16 text-indigo-200" />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showAnalytics 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
              </button>
            </div>

            {/* Advanced Filters */}
            <TimesheetFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({
                startDate: '',
                endDate: '',
                project: '',
                status: '',
                user: '',
                billable: '',
                searchTerm: ''
              })}
              projects={projects}
              users={users}
            />

            {/* Analytics Section */}
            {showAnalytics && (
              <TimesheetAnalytics timeEntries={timeEntries} />
            )}

            {/* Enhanced Timesheet Table */}
            <TimesheetTable
              timeEntries={timeEntries}
              loading={loading}
              error={error}
              onRetry={fetchTimeEntries}
              getUserName={getUserName}
              formatDuration={formatDuration}
              formatRealTimeTimer={formatRealTimeTimer}
              formatDate={formatDate}
              getProjectName={getProjectName}
              getTaskName={getTaskName}
              currentTime={currentTime}
            />

          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Timesheets;
