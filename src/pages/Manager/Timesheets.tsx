import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar/ManagerSidebar";
import { Header } from "@/components/navbar/ManagerHeader";
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
        // Filter to only show entries from Employee users (not Admin/Manager)
        const employeeEntries = response.data.filter((entry) => {
          // This would need to be enhanced based on your actual data structure
          // For now, we'll show all entries but you might want to filter by user role
          return true;
        });

        setTimeEntries(employeeEntries);
        // Cache user names for better performance
        await cacheUserNames(employeeEntries);

        // Extract unique projects and users for filters
        const uniqueProjects = Array.from(
          new Set(
            employeeEntries
              .map((entry) => getProjectName(entry.project))
              .filter(Boolean)
          )
        );
        const uniqueUsers = Array.from(
          new Set(
            employeeEntries
              .map((entry) => getUserName(entry.userId))
              .filter(Boolean)
          )
        );

        setProjects(uniqueProjects);
        setUsers(uniqueUsers);
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
        // Filter to only show Employee team members (not Admin/Manager)
        const employeeMembers = response.data.filter(
          (member) => member.role !== "Admin" && member.role !== "Manager"
        );
        setTeamMembers(employeeMembers);
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
          for (const userId of uncachedUserIds) {
            try {
              const userResponse = await userAPI.getUserById(userId);
              if (userResponse.success && userResponse.data) {
                newCache.set(userId, userResponse.data.name);
              }
            } catch (error) {
              console.warn(`Failed to fetch user ${userId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error("Error caching user names:", error);
      }
    }

    setUserCache(newCache);
  };

  // Helper functions
  const getUserName = (
    userId: string | { _id: string; name?: string }
  ): string => {
    if (typeof userId === "object" && userId?.name) {
      return userId.name;
    }
    const id = typeof userId === "string" ? userId : userId?._id;
    return userCache.get(id) || id || "Unknown User";
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatRealTimeTimer = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;
    const duration = Math.max(0, end.getTime() - start.getTime());
    return formatDuration(Math.floor(duration / 1000));
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getProjectName = (project: any): string => {
    if (typeof project === "string") return project;
    if (project && typeof project === "object") {
      return project.name || project.title || "Unknown Project";
    }
    return "No Project";
  };

  const getTaskName = (task: any): string => {
    if (typeof task === "string") return task;
    if (task && typeof task === "object") {
      return task.name || task.title || task.description || "Unknown Task";
    }
    return "No Task";
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6 space-y-6">
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Team Timesheets
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage your team's time entries and productivity
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading timesheets...
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
                <button
                  onClick={fetchTimeEntries}
                  className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Team Overview</h2>
                  <p className="text-indigo-200 text-sm">
                    Current timesheet summary
                  </p>
                </div>
                <div className="flex items-center space-x-8">
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
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {teamMembers.length}
                    </div>
                    <div className="text-indigo-200 text-sm">Team Members</div>
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
