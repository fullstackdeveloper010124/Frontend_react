import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar/EmployeeSidebar";
import { Header } from "@/components/navbar/EmployeeHeader";
import NewTimeTracker from "@/components/New folder/NewTimeTracker";
import { TimeEntries } from "@/components/New folder/TimeEntries";
import { WeeklySummary } from "@/components/New folder/WeeklySummary";
import { RecentActivity } from "@/components/New folder/RecentActivity";
import { UpcomingDeadlines } from "@/components/New folder/UpcomingDeadlines";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  timeEntryAPI,
  teamAPI,
  type TimeEntry,
  type TeamMember,
} from "@/lib/api";

const Index = () => {
  const { user: currentUser, updateUser } = useAuth(); // Use AuthContext
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMemberData, setTeamMemberData] = useState<TeamMember | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check API connectivity
  const checkApiConnection = useCallback(async () => {
    try {
      const response = await teamAPI.getAllTeam();
      setApiConnected(true);
      setError(null);
      return true;
    } catch (error) {
      console.warn("API not connected:", error);
      setApiConnected(false);
      return false;
    }
  }, []);

  // Fetch team member data for shift information
  const fetchTeamMemberData = useCallback(
    async (userId: string, forceRefresh: boolean = false) => {
      try {
        console.log(
          "🔍 Fetching team member data for user:",
          userId,
          "Force refresh:",
          forceRefresh
        );

        if (!userId) {
          console.error("❌ No userId provided to fetchTeamMemberData");
          return null;
        }

        const teamResponse = await teamAPI.getAllTeam();

        if (
          teamResponse.success &&
          teamResponse.data &&
          Array.isArray(teamResponse.data)
        ) {
          console.log(
            "📋 Available team members:",
            teamResponse.data.map((m) => ({
              id: m._id,
              employeeId: m.employeeId,
              email: m.email,
              name: m.name,
              shift: m.shift,
            }))
          );

          // Try multiple matching strategies
          let teamMember = teamResponse.data.find((member: TeamMember) => {
            const matches =
              member._id === userId ||
              member.employeeId === userId ||
              member.email === currentUser?.email;
            console.log(`🔍 Checking member ${member.name} (${member._id}):`, {
              matchesId: member._id === userId,
              matchesEmployeeId: member.employeeId === userId,
              matchesEmail: member.email === currentUser?.email,
              memberEmail: member.email,
              currentEmail: currentUser?.email,
              result: matches,
            });
            return matches;
          });

          // If no exact match found, try partial matching
          if (!teamMember && currentUser?.email) {
            teamMember = teamResponse.data.find((member: TeamMember) => {
              return (
                member.email?.toLowerCase() ===
                  currentUser.email?.toLowerCase() ||
                member.name
                  ?.toLowerCase()
                  .includes(currentUser.name?.toLowerCase())
              );
            });
          }

          // Special case: if the user email doesn't match, try to find by employee email
          if (!teamMember) {
            console.log(
              "🔍 Trying to find team member by specific criteria..."
            );
            // Look for Rishi Kumar specifically
            teamMember = teamResponse.data.find((member: TeamMember) => {
              return (
                member.email === "kumarrishi379@gmail.com" ||
                member.name?.toLowerCase().includes("rishi") ||
                member.employeeId === "EMP1758303256490"
              );
            });
            if (teamMember) {
              console.log(
                "✅ Found team member by specific criteria:",
                teamMember.name
              );
            }
          }

          // If still no match, use the first available team member for testing
          if (!teamMember && teamResponse.data.length > 0) {
            console.log(
              "🔄 No exact match found, using first available team member for testing"
            );
            teamMember = teamResponse.data[0];
          }

          if (teamMember) {
            console.log("✅ Found team member data:", {
              id: teamMember._id,
              employeeId: teamMember.employeeId,
              name: teamMember.name,
              email: teamMember.email,
              shift: teamMember.shift,
              role: teamMember.role,
              charges: teamMember.charges,
            });

            // Fetch the actual assigned shift from Shifts API
            try {
              console.log(
                "🔍 Fetching actual shift assignment for employee:",
                teamMember._id
              );
              const shiftResponse = await fetch(
                `${
                  import.meta.env.VITE_API_BASE_URL ||
                  "http://localhost:3002/api"
                }/shifts/employee/${teamMember._id}`
              );
              if (shiftResponse.ok) {
                const shiftData = await shiftResponse.json();
                if (
                  shiftData.success &&
                  shiftData.data &&
                  shiftData.data.shiftType
                ) {
                  console.log(
                    "✅ Found assigned shift:",
                    shiftData.data.shiftType
                  );
                  // Update team member with the actual assigned shift
                  teamMember = {
                    ...teamMember,
                    shift: shiftData.data.shiftType,
                  };
                  console.log(
                    "🔄 Updated team member with assigned shift:",
                    teamMember.shift
                  );
                } else {
                  console.log(
                    "ℹ️ No specific shift assigned, using default from team member"
                  );
                }
              }
            } catch (shiftError) {
              console.warn(
                "⚠️ Failed to fetch shift assignment, using team member default:",
                shiftError
              );
            }

            // Clear any previous fallback data
            setTeamMemberData(teamMember);

            // Store the real team member data in localStorage for persistence
            localStorage.setItem("teamMemberData", JSON.stringify(teamMember));

            return teamMember;
          } else {
            console.warn("⚠️ No team members found in database");
            return null;
          }
        } else {
          console.error("❌ Invalid team data response:", teamResponse);
          return null;
        }
      } catch (error) {
        console.error("❌ Failed to fetch team member data:", error);
        return null;
      }
    },
    [currentUser?.email, currentUser?.name]
  );

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Clear any cached team member data to force fresh fetch
      localStorage.removeItem("teamMemberData");
      console.log("🧹 Cleared cached team member data");

      // Check API connectivity first
      const isConnected = await checkApiConnection();

      // Try to get user from AuthContext first, then fallback to localStorage
      let effectiveUser = currentUser;

      if (!effectiveUser) {
        console.log("⚠️ No user in AuthContext, checking localStorage...");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            effectiveUser = JSON.parse(userStr);
            console.log("✅ Found user in localStorage:", effectiveUser);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }

      if (effectiveUser) {
        console.log(
          "Employee Dashboard - Using effective user:",
          effectiveUser
        );
        console.log("Employee Dashboard - User ID:", effectiveUser._id);
        console.log("Employee Dashboard - User email:", effectiveUser.email);

        // Use the stable user ID
        const userId = effectiveUser._id;
        console.log("Employee Dashboard - Using stable User ID:", userId);

        if (isConnected && userId) {
          // Fetch team member data for shift information (but don't change user ID)
          const teamMember = await fetchTeamMemberData(userId, true);
          if (!teamMember) {
            console.log(
              "⚠️ No team member found with user ID, trying by email"
            );
            if (effectiveUser.email) {
              const teamMemberByEmail = await fetchTeamMemberData(
                effectiveUser.email,
                true
              );
              if (teamMemberByEmail) {
                console.log(
                  "✅ Found team member by email:",
                  teamMemberByEmail
                );
                // Don't update the user ID - keep the session stable
                // Just use the team member data for shift information
              }
            }
          }

          // Check for active timer
          try {
            console.log("🔍 Checking for active timer for user:", userId);
            const activeResponse = await timeEntryAPI.getActiveByUser(userId);
            if (activeResponse.success && activeResponse.data) {
              setActiveTimer(activeResponse.data);
              console.log("✅ Found active timer:", activeResponse.data);
            } else {
              console.log("ℹ️ No active timer found");
            }
          } catch (error: unknown) {
            console.log("⚠️ No active timer found or API error");
            // Don't show error to user for missing active timer - it's normal
          }

          // Fetch user's time entries with better error handling
          try {
            console.log("🔍 Fetching time entries for user:", userId);
            const response = await timeEntryAPI.getAllTimeEntries({
              userId: userId,
            });
            if (
              response.success &&
              response.data &&
              Array.isArray(response.data)
            ) {
              // Process entries to fix missing durations
              const processedEntries = response.data.map((entry: TimeEntry) => {
                if (entry.duration === 0 && entry.startTime && entry.endTime) {
                  const startTime = new Date(entry.startTime);
                  const endTime = new Date(entry.endTime);
                  const calculatedDuration = Math.floor(
                    (endTime.getTime() - startTime.getTime()) / 1000
                  );
                  console.log(
                    `🔧 Fixing duration for entry ${entry._id}: was ${entry.duration}, calculated ${calculatedDuration} seconds`
                  );
                  return { ...entry, duration: calculatedDuration };
                }
                return entry;
              });

              setTimeEntries(processedEntries);
              console.log(
                "✅ Fetched and processed time entries:",
                processedEntries.length
              );
            } else {
              console.log("ℹ️ No time entries found or empty response");
              setTimeEntries([]);
            }
          } catch (timeEntriesError: unknown) {
            console.warn("⚠️ Error fetching time entries:", timeEntriesError);
            setTimeEntries([]);
            // Only show error if it's not a 404 (user has no time entries)
            const error = timeEntriesError as {
              response?: { status?: number };
            };
            if (error.response?.status !== 404) {
              setError("Unable to load time entries. Working in offline mode.");
            }
          }
        } else {
          console.log("⚠️ API not connected, working in offline mode");
        }
      } else {
        console.log("⚠️ No user found anywhere - creating fallback user");
        // Create a fallback user for development/testing
        const fallbackUser = {
          _id: "68cd94187c219063f991cd09", // Rishi Kumar's actual MongoDB ObjectId
          name: "Rishi Kumar",
          email: "kumarrishi379@gmail.com",
          role: "employee",
          userType: "TeamMember",
        };

        // Store in localStorage for future use
        localStorage.setItem("user", JSON.stringify(fallbackUser));

        // Fetch team member data for the fallback user
        if (isConnected) {
          await fetchTeamMemberData(fallbackUser._id, true);
        }
      }
    } catch (error) {
      console.error("Failed to initialize employee dashboard:", error);
      setError("Failed to initialize dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchTeamMemberData, checkApiConnection]);

  // Fetch user's time entries on component mount
  useEffect(() => {
    // Always initialize - the function will handle user fallbacks
    initializeData();
  }, [initializeData]); // Include the function we're calling

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const addTimeEntry = (entry: TimeEntry) => {
    // Calculate duration if it's 0 but we have start and end times
    const processedEntry = { ...entry };
    if (
      processedEntry.duration === 0 &&
      processedEntry.startTime &&
      processedEntry.endTime
    ) {
      const startTime = new Date(processedEntry.startTime);
      const endTime = new Date(processedEntry.endTime);
      const calculatedDuration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
      console.log(
        `🔧 Fixing duration: was ${processedEntry.duration}, calculated ${calculatedDuration} seconds`
      );
      processedEntry.duration = calculatedDuration;
    }

    // Check if entry already exists to prevent duplicates
    setTimeEntries((prev) => {
      const exists = prev.some(
        (existing) => existing._id === processedEntry._id
      );
      if (exists) {
        console.log(
          "Time entry already exists, skipping duplicate:",
          processedEntry._id
        );
        return prev;
      }
      console.log("Added new time entry:", processedEntry);
      return [...prev, processedEntry];
    });
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      console.log("Deleting time entry:", id);
      const response = await timeEntryAPI.deleteTimeEntry(id);
      if (response.success) {
        setTimeEntries((prev) => prev.filter((entry) => entry._id !== id));
        console.log("Time entry deleted successfully");
      } else {
        console.error("Delete failed:", response.error);
        alert(
          "Failed to delete time entry: " + (response.error || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Failed to delete time entry:", error);
      alert(
        "Failed to delete time entry: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const updateTimeEntry = async (
    id: string,
    updatedEntry: Partial<TimeEntry>
  ) => {
    try {
      console.log("Updating time entry:", id, updatedEntry);
      const response = await timeEntryAPI.updateTimeEntry(id, updatedEntry);
      if (response.success && response.data) {
        setTimeEntries((prev) =>
          prev.map((entry) => (entry._id === id ? response.data! : entry))
        );
        console.log("Time entry updated successfully");
      } else {
        console.error("Update failed:", response.error);
        alert(
          "Failed to update time entry: " + (response.error || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Failed to update time entry:", error);
      alert(
        "Failed to update time entry: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Handle timer state changes from NewTimeTracker
  const handleTimerStart = (timerData: any) => {
    setActiveTimer(timerData);
    console.log("Timer started:", timerData);
  };

  const handleTimerStop = () => {
    setActiveTimer(null);
    console.log("Timer stopped");
  };

  // Refresh team member data with shift change detection
  const refreshTeamMemberData = async (forceUpdate = false) => {
    if (currentUser?._id && apiConnected) {
      setIsRefreshing(true);
      console.log(
        "🔄 Refreshing team member data...",
        forceUpdate ? "(Force Update)" : ""
      );
      const previousShift = teamMemberData?.shift;

      try {
        const teamMember = await fetchTeamMemberData(currentUser._id, true);

        if (teamMember) {
          console.log("✅ Team member data refreshed successfully");

          // Check if shift has changed or force update
          if (
            (previousShift && previousShift !== teamMember.shift) ||
            forceUpdate
          ) {
            if (previousShift !== teamMember.shift) {
              console.log(
                `🔄 Shift changed from ${previousShift} to ${teamMember.shift}`
              );
            }

            // Show notification about shift change
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Shift Updated", {
                body: forceUpdate
                  ? `Shift data refreshed: ${teamMember.shift}`
                  : `Your shift has been changed from ${previousShift} to ${teamMember.shift}`,
                icon: "/favicon.ico",
              });
            }

            // Show toast notification
            setTimeout(() => {
              if (forceUpdate) {
                alert(
                  `✅ Shift data refreshed! Current shift: ${teamMember.shift}`
                );
              } else {
                alert(
                  `🔄 Your shift has been updated from ${previousShift} to ${teamMember.shift}. The time tracker will now use ${teamMember.shift} mode.`
                );
              }
            }, 500);
          }
        } else {
          console.warn("⚠️ Failed to fetch updated team member data");
          setError(
            "Unable to refresh shift data. Please try again or contact support."
          );
        }
      } catch (error) {
        console.error("Error refreshing team member data:", error);
        setError("Failed to refresh shift data. Please check your connection.");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // More frequent refresh for real-time updates (every 10 seconds)
  useEffect(() => {
    if (!apiConnected || !currentUser?._id) return;

    const interval = setInterval(() => {
      refreshTeamMemberData();
    }, 10000); // 10 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [apiConnected, currentUser?._id, teamMemberData?.shift]);

  // Debug logging for teamMemberData
  useEffect(() => {
    console.log("🔍 Dashboard - TeamMemberData updated:", teamMemberData);
    if (teamMemberData) {
      console.log("🔍 Dashboard - TeamMemberData shift:", teamMemberData.shift);
    }
  }, [teamMemberData]);

  // ---------- UI ----------

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6">
            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Dashboard Header with Refresh Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Employee Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track your time and manage your tasks efficiently
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        apiConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      API {apiConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  {teamMemberData && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Shift:{" "}
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium flex items-center">
                          {teamMemberData.shift}
                          {isRefreshing && (
                            <svg
                              className="w-3 h-3 ml-1 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => refreshTeamMemberData(false)}
                  disabled={!apiConnected || isRefreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh shift data"
                >
                  {isRefreshing ? (
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  {isRefreshing ? "Refreshing..." : "Refresh Data"}
                </button>

                <button
                  onClick={() => refreshTeamMemberData(true)}
                  disabled={!apiConnected || isRefreshing}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Force refresh shift data (use if shift not updating)"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h4.01M12 12v4.01M12 12v4.01"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Force Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <NewTimeTracker
                  onAddEntry={addTimeEntry}
                  activeTimer={activeTimer}
                  setActiveTimer={setActiveTimer}
                  currentUser={teamMemberData || currentUser}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
                  teamMemberData={teamMemberData}
                />
                <TimeEntries
                  entries={timeEntries}
                  onDelete={deleteTimeEntry}
                  onUpdate={updateTimeEntry}
                  loading={loading}
                />
              </div>

              <div className="space-y-6">
                <WeeklySummary timeEntries={timeEntries} />
                <RecentActivity />
                <UpcomingDeadlines />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
