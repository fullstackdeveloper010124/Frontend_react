import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar/AdminSidebar";
import { Header } from "@/components/navbar/AdminHeader";
import { Dashboard } from "@/components/New folder/Dashboard";
import NewTimeTracker from "@/components/New folder/NewTimeTracker";
import { TimeEntries } from "@/components/New folder/TimeEntries";
import { WeeklySummary } from "@/components/New folder/WeeklySummary";
import { RecentActivity } from "@/components/New folder/RecentActivity";
import { UpcomingDeadlines } from "@/components/New folder/UpcomingDeadlines";
import { TeamOverview } from "@/components/New folder/TeamOverview";
import { QuickActions } from "@/components/New folder/QuickActions";
import { SystemHealth } from "@/components/New folder/SystemHealth";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { timeEntryAPI, projectAPI, teamAPI, type TimeEntry } from "@/lib/api";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch all time entries on component mount (admin can see all entries)
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Get current user
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
          } catch (parseError) {
            console.error("❌ Error parsing user data:", parseError);
            localStorage.removeItem("user");
          }
        } else {
          // Create a temporary admin user for testing
          const tempAdmin = {
            _id: "temp-admin-123",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
          };
          setCurrentUser(tempAdmin);
          localStorage.setItem("user", JSON.stringify(tempAdmin));
        }

        // Fetch all time entries (admin view)
        const response = await timeEntryAPI.getAllTimeEntries();
        if (response.success && response.data) {
          setTimeEntries(response.data);
        } else {
          // Fallback sample data for admin dashboard
          const sampleEntries: TimeEntry[] = [
            {
              _id: "sample-1",
              userId: "user-1",
              project: "project-1",
              task: "task-1",
              description: "Working on the hero section and navigation",
              startTime: new Date(
                Date.now() - 3.5 * 60 * 60 * 1000
              ).toISOString(),
              endTime: new Date().toISOString(),
              duration: 210, // 3.5 hours in minutes
              billable: true,
              status: "Completed",
              trackingType: "Hourly",
              isManualEntry: false,
              hourlyRate: 50,
              totalAmount: 175,
              createdAt: new Date().toISOString(),
            },
            {
              _id: "sample-2",
              userId: "user-2",
              project: "project-2",
              task: "task-4",
              description: "Integrated user authentication endpoints",
              startTime: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              endTime: new Date().toISOString(),
              duration: 120, // 2 hours in minutes
              billable: true,
              status: "Completed",
              trackingType: "Hourly",
              isManualEntry: false,
              hourlyRate: 60,
              totalAmount: 120,
              createdAt: new Date().toISOString(),
            },
          ];
          setTimeEntries(sampleEntries);
        }
      } catch (error) {
        console.error("Failed to fetch time entries:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const addTimeEntry = (entry: TimeEntry) => {
    setTimeEntries((prev) => [...prev, entry]);
    console.log("Added new time entry to admin dashboard:", entry);
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
      // Fallback for offline mode
      setTimeEntries((prev) => prev.filter((entry) => entry._id !== id));
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
      // Fallback for offline mode
      setTimeEntries((prev) =>
        prev.map((entry) =>
          entry._id === id ? { ...entry, ...updatedEntry } : entry
        )
      );
    }
  };

  // Handle timer state changes
  const handleTimerStart = (timerData: any) => {
    setActiveTimer(timerData);
    console.log("Admin timer started:", timerData);
  };

  const handleTimerStop = () => {
    setActiveTimer(null);
    console.log("Admin timer stopped");
  };

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    console.log("Quick action triggered:", action);
    // Add routing or modal logic here based on action
    switch (action) {
      case "add-project":
        // Navigate to project creation or open modal
        break;
      case "manage-team":
        // Navigate to team management
        break;
      case "generate-report":
        // Open report generation modal
        break;
      case "schedule-meeting":
        // Open calendar or meeting scheduler
        break;
      case "system-settings":
        // Navigate to settings
        break;
      case "notifications":
        // Open notifications panel
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6 space-y-8">
            {/* Main Dashboard Overview */}
            <Dashboard timeEntries={timeEntries} />

            {/* Team Overview and Quick Actions Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TeamOverview timeEntries={timeEntries} />
              </div>
              <div>
                <QuickActions onAction={handleQuickAction} />
              </div>
            </div>

            {/* Admin Time Tracking Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Time Tracking
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your administrative tasks and manage team time entries
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live tracking active</span>
                </div>
              </div>
            </div>

            {/* Time Tracking and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <NewTimeTracker
                  onAddEntry={addTimeEntry}
                  activeTimer={activeTimer}
                  setActiveTimer={setActiveTimer}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
                  currentUser={currentUser}
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

            {/* System Health and Monitoring */}
            <SystemHealth />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
