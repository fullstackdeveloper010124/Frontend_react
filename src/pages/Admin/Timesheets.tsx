import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar/AdminSidebar";
import { Header } from "@/components/navbar/AdminHeader";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { TimesheetFilters } from "@/components/New folder/TimesheetFilters";
import { TimesheetAnalytics } from "@/components/New folder/TimesheetAnalytics";
import { TimesheetTable } from "@/components/New folder/TimesheetTable";
import {
  Calendar,
  Clock,
  Filter,
  Download,
  Loader2,
  BarChart3,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  timeEntryAPI,
  teamAPI,
  userAPI,
  type TimeEntry,
  type TeamMember,
} from "@/lib/api";

const Timesheets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userCache, setUserCache] = useState<Map<string, string>>(new Map());
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    project: "",
    status: "",
    user: "",
    billable: "",
    searchTerm: "",
    teamMember: "",
    shiftType: "",
  });
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [projects, setProjects] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<TeamMember | null>(null);
  const [filteredTimeEntries, setFilteredTimeEntries] = useState<TimeEntry[]>(
    []
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch time entries and team members on component mount
  useEffect(() => {
    fetchTimeEntries();
    fetchTeamMembers();

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

  // Filter time entries when filters change
  useEffect(() => {
    applyFilters();
  }, [timeEntries, filters, selectedTeamMember]);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create filter object without teamMember and shiftType for API call
      const apiFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        project: filters.project,
        status: filters.status,
        userId: filters.user,
      };

      const response = await timeEntryAPI.getAllTimeEntries(apiFilters);

      if (response.success && response.data) {
        setTimeEntries(response.data);
        // Cache user names for better performance
        await cacheUserNames(response.data);
      } else {
        setError("Failed to fetch time entries");
      }
    } catch (err) {
      console.error("Error fetching time entries:", err);
      setError("Failed to fetch time entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await teamAPI.getAllTeam();
      if (response.success && response.data) {
        setTeamMembers(response.data);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...timeEntries];

    // Apply shift-based filtering
    if (filters.teamMember && selectedTeamMember) {
      // Filter by selected team member's ID
      filtered = filtered.filter((entry) => {
        const userId =
          typeof entry.userId === "string" ? entry.userId : entry.userId?._id;
        return userId === filters.teamMember;
      });

      // Filter by shift type in trackingType
      if (filters.shiftType) {
        const shiftType =
          filters.shiftType.charAt(0).toUpperCase() +
          filters.shiftType.slice(1).toLowerCase();
        filtered = filtered.filter((entry) => entry.trackingType === shiftType);
      }
    }

    // Apply search term filtering
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.description?.toLowerCase().includes(searchLower) ||
          getProjectName(entry.project).toLowerCase().includes(searchLower) ||
          getTaskName(entry.task).toLowerCase().includes(searchLower)
      );
    }

    // Apply billable filtering
    if (filters.billable) {
      const isBillable = filters.billable === "true";
      filtered = filtered.filter((entry) => entry.billable === isBillable);
    }

    setFilteredTimeEntries(filtered);
  };

  const handleTeamMemberSelect = (member: TeamMember | null) => {
    setSelectedTeamMember(member);
    if (member) {
      console.log(
        `Selected team member: ${member.name} with ${member.shift} shift`
      );
    }
  };

  const cacheUserNames = async (entries: TimeEntry[]) => {
    const newCache = new Map(userCache);
    const uncachedUserIds = new Set<string>();

    // Collect all unique user IDs that aren't cached
    entries.forEach((entry) => {
      const userId =
        typeof entry.userId === "string" ? entry.userId : entry.userId?._id;
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
          teamResponse.data.forEach((member) => {
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
              userResponse.data.forEach((user) => {
                if (uncachedUserIds.has(user._id)) {
                  newCache.set(user._id, user.name);
                }
              });
            }
          } catch (userErr) {
            console.log("User API not available, using team data only");
          }
        }

        setUserCache(newCache);
      } catch (err) {
        console.error("Error caching user names:", err);
      }
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // For completed entries, we don't have seconds precision
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatRealTimeTimer = (startTime: string) => {
    const start = new Date(startTime);
    const now = currentTime;
    const diffMs = now.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectName = (project: any) => {
    return typeof project === "string"
      ? project
      : project?.name || "Unknown Project";
  };

  const getTaskName = (task: any) => {
    return typeof task === "string" ? task : task?.name || "Unknown Task";
  };

  const getUserName = (user: any) => {
    // Get user ID from the user object
    const userId = typeof user === "string" ? user : user?._id;

    // Check cache first
    if (userId && userCache.has(userId)) {
      return userCache.get(userId)!;
    }

    // If user object has name directly
    if (typeof user === "object" && user?.name) {
      return user.name;
    }

    // Fallback for unknown users
    return "Unknown User";
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Team Timesheets</h1>
                  <p className="text-indigo-100 text-lg">
                    Monitor and analyze your team's time tracking data
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {timeEntries.reduce(
                        (sum, entry) => sum + (entry.duration || 0),
                        0
                      ) > 0
                        ? Math.round(
                            timeEntries.reduce(
                              (sum, entry) => sum + (entry.duration || 0),
                              0
                            ) / 3600
                          )
                        : 0}
                      h
                    </div>
                    <div className="text-indigo-200 text-sm">Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {timeEntries.length}
                    </div>
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
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{showAnalytics ? "Hide" : "Show"} Analytics</span>
              </button>
            </div>

            {/* Advanced Filters */}
            <TimesheetFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => {
                setFilters({
                  startDate: "",
                  endDate: "",
                  project: "",
                  status: "",
                  user: "",
                  billable: "",
                  searchTerm: "",
                  teamMember: "",
                  shiftType: "",
                });
                setSelectedTeamMember(null);
              }}
              projects={projects}
              users={users}
              teamMembers={teamMembers}
              onTeamMemberSelect={handleTeamMemberSelect}
            />

            {/* Shift Information Display */}
            {selectedTeamMember && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Viewing {selectedTeamMember.shift} Shift Data
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Employee: {selectedTeamMember.name} (
                      {selectedTeamMember.employeeId})
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Showing time entries with{" "}
                      {selectedTeamMember.shift.toLowerCase()} tracking type
                      only
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {filteredTimeEntries.length}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300 text-sm">
                      Entries Found
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {showAnalytics && (
              <TimesheetAnalytics
                timeEntries={
                  filteredTimeEntries.length > 0
                    ? filteredTimeEntries
                    : timeEntries
                }
              />
            )}

            {/* Enhanced Timesheet Table */}
            <TimesheetTable
              timeEntries={
                filteredTimeEntries.length > 0 || filters.teamMember
                  ? filteredTimeEntries
                  : timeEntries
              }
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
