// NewTimeTracker.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  projectAPI,
  taskAPI,
  timeEntryAPI,
  authAPI,
  userAPI,
  type Project,
  type Task,
  type User,
  type TeamMember,
} from "@/lib/api";

interface NewTimeTrackerProps {
  onAddEntry?: (entry: any) => void;
  propCurrentUser?: User | null;
  currentUser?: User | TeamMember | null;
  activeTimer?: any;
  setActiveTimer?: (t: any) => void;
  onTimerStart?: (timerData: any) => void;
  onTimerStop?: () => void;
  teamMemberData?: TeamMember | null;
}

const TAB_DESCRIPTIONS: Record<string, string> = {
  Hourly: "Track time by the hour",
  Daily: "Track time by the day – for tasks across a day",
  Weekly: "Track time by the week – for long-running tasks",
  Monthly: "Track time by the month – for big projects",
};

// Determine available tabs based on user's shift
const getAvailableTabsForShift = (userShift: string | undefined) => {
  const allTabs = Object.keys(TAB_DESCRIPTIONS);

  // If user has a specific shift, only show that shift
  if (userShift && allTabs.includes(userShift)) {
    return [userShift];
  }

  // Fallback to all tabs if no specific shift is set
  return allTabs;
};

export default function NewTimeTracker({
  onAddEntry,
  propCurrentUser,
  currentUser,
  activeTimer,
  setActiveTimer,
  onTimerStart,
  onTimerStop,
  teamMemberData,
}: NewTimeTrackerProps) {
  const [localUser, setLocalUser] = useState<User | null>(null);

  // Initialize available tabs based on teamMemberData shift if available
  const getInitialTabs = () => {
    if (teamMemberData?.shift) {
      return getAvailableTabsForShift(teamMemberData.shift);
    }
    // If no teamMemberData yet, start with all tabs - will be filtered when data loads
    return Object.keys(TAB_DESCRIPTIONS);
  };

  const [availableTabs, setAvailableTabs] = useState<string[]>(
    getInitialTabs()
  );
  const [activeTab, setActiveTab] = useState<string>(
    teamMemberData?.shift || "Hourly"
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isBillable, setIsBillable] = useState(false);
  const [description, setDescription] = useState("");

  // Timer / duration
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent double-clicks
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual start/end inputs
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  // ---------- helpers ----------
  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // ---------- fetch current user (always latest) ----------
  const fetchCurrentUser = async () => {
    try {
      // prefer propCurrentUser if provided
      let id = propCurrentUser?._id;
      if (!id) {
        const stored = localStorage.getItem("user");
        if (stored) id = JSON.parse(stored)?._id;
      }
      if (!id) return;

      const res = await userAPI.getUserById(id);
      if (res.success && res.data) {
        setLocalUser(res.data);

        // Get available tabs based on user's shift
        const userShift = (res.data as User & { shift?: string })?.shift;
        const filteredTabs = getAvailableTabsForShift(userShift);
        setAvailableTabs(filteredTabs);

        // Set active tab to user's shift if valid, otherwise first available
        if (userShift && filteredTabs.includes(userShift)) {
          setActiveTab(userShift);
        } else {
          setActiveTab(filteredTabs[0] || "Hourly");
        }

        // persist refreshed user locally (optional)
        try {
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (e) {
          // Handle error silently
          console.warn("Failed to save user to localStorage:", e);
        }
      }
    } catch (e) {
      console.warn("Failed to refresh user:", e);
    }
  };

  // ---------- fetch projects / tasks (use correct API method names) ----------
  const fetchProjects = async () => {
    try {
      const res = await projectAPI.getAllProjects(); // CORRECT name
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
    }
  };

  const fetchTasksForProject = async (projectId: string) => {
    try {
      const res = await taskAPI.getTasksByProject(projectId); // CORRECT name
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error("Failed to load tasks for project", e);
      setTasks([]);
    }
  };

  // ---------- create quick task ----------
  const createNewTask = async () => {
    if (!newTaskName.trim() || !selectedProject) {
      alert("Please enter a task name and select a project.");
      return;
    }
    setCreatingTask(true);
    try {
      const payload = {
        name: newTaskName.trim(),
        description: "Task created from time tracker",
        project: selectedProject,
        assignedModel: "TeamMember",
        priority: "medium" as const,
        status: "todo" as const,
        estimatedHours: 0,
        actualHours: 0,
        tags: [],
        isActive: true,
      };
      const resp = await taskAPI.createTask(payload);
      if (resp.success && resp.data) {
        setTasks((s) => [...s, resp.data]);
        setSelectedTask(resp.data._id);
        setNewTaskName("");
        setShowTaskInput(false);
      } else {
        alert(resp.message || "Failed to create task");
      }
    } catch (err: unknown) {
      console.error("createNewTask error", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create task"
      );
    } finally {
      setCreatingTask(false);
    }
  };

  // ---------- start / stop timer OR save manual entry ----------
  const handleStartStop = async () => {
    console.log(
      "🔄 handleStartStop called - isRunning:",
      isRunning,
      "isProcessing:",
      isProcessing,
      "activeTimer:",
      activeTimer
    );

    // Prevent double-clicks
    if (isProcessing) {
      console.log("⚠️ Already processing, ignoring click");
      return;
    }

    if (!selectedProject || (!selectedTask && !showTaskInput)) {
      alert("Please select a project and task before continuing.");
      return;
    }

    setIsProcessing(true); // Set processing state

    // Get the stable user ID from teamMemberData first, then fallback to other sources
    const effectiveUserId =
      teamMemberData?._id || // Prioritize team member ID (most reliable)
      propCurrentUser?._id ||
      currentUser?._id ||
      (() => {
        const stored = localStorage.getItem("user");
        try {
          return stored ? JSON.parse(stored)?._id : undefined;
        } catch {
          return undefined;
        }
      })();

    console.log(
      "🔍 Getting user ID - teamMemberData._id:",
      teamMemberData?._id
    );
    console.log(
      "🔍 Getting user ID - propCurrentUser._id:",
      propCurrentUser?._id
    );
    console.log("🔍 Getting user ID - effectiveUserId:", effectiveUserId);
    if (!effectiveUserId) {
      alert("No user found. Please sign in again.");
      setIsProcessing(false);
      return;
    }

    // Manual save
    if (isManualEntry) {
      if (!manualStart || !manualEnd) {
        alert("Please select start and end time.");
        return;
      }
      const s = new Date(manualStart);
      const e = new Date(manualEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
        alert(
          "Please select a valid start and end time (end must be after start)."
        );
        return;
      }
      const durationSeconds = Math.floor((e.getTime() - s.getTime()) / 1000);
      setTotalSeconds(durationSeconds);

      // save to backend
      try {
        const entryData = {
          userId: effectiveUserId,
          project: selectedProject,
          task: selectedTask,
          description: description || "Manual time entry",
          startTime: s.toISOString(),
          endTime: e.toISOString(),
          duration: durationSeconds, // Explicitly pass the calculated duration
          billable: isBillable,
          trackingType: activeTab,
          isManualEntry: true,
          hourlyRate: 0,
          userType:
            propCurrentUser?.userType || currentUser?.userType || "TeamMember",
        };
        const resp = await timeEntryAPI.createTimeEntry(entryData);
        if (resp.success && resp.data) {
          onAddEntry?.(resp.data);
          // reset form
          setManualStart("");
          setManualEnd("");
          setSelectedProject("");
          setSelectedTask("");
          setDescription("");
          setIsBillable(false);
          setTotalSeconds(0);
        } else {
          alert(resp.message || "Failed to save entry");
        }
      } catch (err) {
        console.error("Failed to save manual entry", err);
        alert("Failed to save manual entry. Check console for details.");
      } finally {
        setIsProcessing(false); // Reset processing state
      }
      return;
    }

    // Timer mode
    if (!isRunning) {
      // start
      console.log("🟢 Starting timer...");
      try {
        // Start on backend
        const timerData = {
          userId: effectiveUserId,
          project: selectedProject,
          task: selectedTask,
          description: description || "Time tracking",
          trackingType: activeTab,
          userType:
            propCurrentUser?.userType || currentUser?.userType || "TeamMember",
        };
        console.log("🟢 Calling startTimer API with data:", timerData);
        const resp = await timeEntryAPI.startTimer(timerData);
        console.log("🟢 Start timer API response:", resp);

        if (resp.success && resp.data) {
          console.log(
            "🟢 Timer started successfully, setting activeTimer:",
            resp.data
          );
          setActiveTimer?.(resp.data);

          // Calculate elapsed time if timer was already running
          if (resp.data.startTime) {
            const startTime = new Date(resp.data.startTime);
            const now = new Date();
            const elapsedSeconds = Math.floor(
              (now.getTime() - startTime.getTime()) / 1000
            );
            console.log(
              "🕐 Timer already running for",
              elapsedSeconds,
              "seconds"
            );
            setTotalSeconds(elapsedSeconds);
          } else {
            setTotalSeconds(0);
          }

          // Don't add to entries list yet - only add when timer stops
        }
        setIsRunning(true);
        console.log("🟢 Set isRunning to true");
        // start local counter
        timerIntervalRef.current = setInterval(() => {
          setTotalSeconds((t) => t + 1);
        }, 1000);
      } catch (err) {
        console.error("Failed to start timer", err);
        alert("Timer start failed. Check console for details.");
      } finally {
        setIsProcessing(false); // Reset processing state
      }
    } else {
      // stop
      console.log("🔴 Stopping timer...");
      console.log("🔴 Current isRunning state:", isRunning);
      console.log("🔴 Current activeTimer:", activeTimer);

      try {
        console.log("🛑 Attempting to stop timer...");
        console.log("🛑 Active timer:", activeTimer);

        if (activeTimer && activeTimer._id) {
          console.log("🛑 Calling stopTimer API with ID:", activeTimer._id);
          const resp = await timeEntryAPI.stopTimer(activeTimer._id);
          console.log("🛑 Stop timer API response:", resp);

          if (resp.success) {
            console.log("✅ Timer stopped successfully");
            console.log("✅ Final timer data:", resp.data);

            // Calculate duration from startTime and endTime if duration field is missing or 0
            let finalDuration = resp.data?.duration || 0;

            if (
              finalDuration === 0 &&
              resp.data?.startTime &&
              resp.data?.endTime
            ) {
              const startTime = new Date(resp.data.startTime);
              const endTime = new Date(resp.data.endTime);
              finalDuration = Math.floor(
                (endTime.getTime() - startTime.getTime()) / 1000
              );
              console.log(
                "🕐 Calculated duration from timestamps:",
                finalDuration,
                "seconds"
              );
            }

            // Show the actual duration
            if (finalDuration > 0) {
              console.log("🕐 Final duration:", finalDuration, "seconds");
              setTotalSeconds(finalDuration);

              // Wait a moment to show the final duration before resetting
              setTimeout(() => {
                setTotalSeconds(0);
                setSelectedProject("");
                setSelectedTask("");
                setDescription("");
                setIsBillable(false);
              }, 2000); // Show final duration for 2 seconds
            } else {
              // Reset immediately if no duration data
              console.log("⚠️ No duration calculated, resetting immediately");
              setTotalSeconds(0);
              setSelectedProject("");
              setSelectedTask("");
              setDescription("");
              setIsBillable(false);
            }

            setActiveTimer?.(null);
            onAddEntry?.(resp.data); // Add the completed entry to the list
          } else {
            console.error("❌ Stop timer failed:", resp.message);
            alert(resp.message || "Failed to stop timer");
          }
        } else {
          console.error("❌ No active timer found to stop");
          alert("No active timer found");
        }

        // Reset UI state regardless of API result
        console.log("🔴 Resetting UI state...");
        setIsRunning(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        onTimerStop?.();

        // Don't reset form immediately if we got a successful response -
        // let the success block handle it with a delay to show final duration
      } catch (err: unknown) {
        console.error("❌ Failed to stop timer:", err);
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to stop timer";
        alert(errorMessage);

        // Still reset UI state even if API fails
        console.log("🔴 Resetting UI state after error...");
        setIsRunning(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setTotalSeconds(0);
        setSelectedProject("");
        setSelectedTask("");
        setDescription("");
        setIsBillable(false);
      } finally {
        setIsProcessing(false); // Reset processing state
      }
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    // initial load - only fetch projects, not user (we get teamMemberData from props)
    fetchProjects();

    // cleanup timer on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [propCurrentUser]);

  // Sync with active timer from props
  useEffect(() => {
    if (activeTimer && activeTimer.startTime) {
      console.log("🔄 Syncing with active timer:", activeTimer);
      const startTime = new Date(activeTimer.startTime);
      const now = new Date();
      const elapsedSeconds = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      );
      console.log(
        "🕐 Active timer has been running for",
        elapsedSeconds,
        "seconds"
      );

      setTotalSeconds(elapsedSeconds);
      setIsRunning(true);

      // Start the local counter if not already running
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setTotalSeconds((t) => t + 1);
        }, 1000);
      }
    } else if (!activeTimer && isRunning) {
      // No active timer but local state thinks it's running - reset
      console.log("🔄 No active timer found, resetting local state");
      setIsRunning(false);
      setTotalSeconds(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [activeTimer, isRunning]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasksForProject(selectedProject);
    } else {
      setTasks([]);
      setSelectedTask("");
    }
  }, [selectedProject]);

  // compute manual duration preview when inputs change
  useEffect(() => {
    if (manualStart && manualEnd) {
      const s = new Date(manualStart);
      const e = new Date(manualEnd);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
        setTotalSeconds(Math.floor((e.getTime() - s.getTime()) / 1000));
      } else {
        setTotalSeconds(0);
      }
    }
  }, [manualStart, manualEnd]);

  // Handle teamMemberData changes for shift updates
  useEffect(() => {
    console.log("🔍 TeamMemberData:", teamMemberData);
    console.log("🔍 TeamMemberData shift:", teamMemberData?.shift);

    if (teamMemberData?.shift) {
      const filteredTabs = getAvailableTabsForShift(teamMemberData.shift);
      console.log(
        "🔍 Filtered tabs for shift",
        teamMemberData.shift,
        ":",
        filteredTabs
      );
      setAvailableTabs(filteredTabs);

      // Set active tab to the user's shift
      setActiveTab(teamMemberData.shift);
    } else {
      console.log("🔍 No shift in teamMemberData, using all tabs");
      // If no specific shift, show all tabs (fallback behavior)
      const allTabs = Object.keys(TAB_DESCRIPTIONS);
      setAvailableTabs(allTabs);
      setActiveTab("Hourly"); // Default to Hourly if no shift assigned
    }
  }, [teamMemberData]);

  // ---------- UI ----------
  return (
    <div className="container mx-auto mt-5 p-4 border rounded shadow-sm bg-white max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-800 m-0">
          Time Tracker
        </h4>
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium">Manual Entry</label>
          <input
            type="checkbox"
            checked={isManualEntry}
            onChange={(e) => setIsManualEntry(e.target.checked)}
          />
        </div>
      </div>

      {/* Tabs (dynamic) */}
      <div className="mb-3 text-center">
        <div className="flex justify-center flex-wrap gap-2">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-100 text-blue-700" : "bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <small className="text-gray-500 block mt-2">
          {TAB_DESCRIPTIONS[activeTab] ?? "Select a shift"}
        </small>
        {currentUser?.shift && (
          <small className="text-blue-600 block mt-1 font-medium">
            Your assigned shift: {currentUser.shift}
          </small>
        )}
      </div>

      {/* Timer / Manual UI */}
      <div className="text-center my-4">
        {isManualEntry ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="font-semibold text-lg">
              Duration: {formatTime(totalSeconds)}
            </div>

            <button
              onClick={handleStartStop}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Save Entry
            </button>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold my-5">
              {formatTime(totalSeconds)}
            </div>
            <button
              onClick={handleStartStop}
              disabled={!selectedProject || !selectedTask || isProcessing}
              className={`py-2 px-5 rounded text-white ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : isRunning
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isProcessing
                ? "Processing..."
                : isRunning
                ? "■ Stop"
                : "▶ Start"}
            </button>
          </>
        )}
      </div>

      {/* Project & Task */}
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-3">
          <label className="block text-sm font-medium mb-1">Project *</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Task *</label>
            {selectedProject && (
              <button
                type="button"
                onClick={() => {
                  setShowTaskInput((s) => !s);
                  if (showTaskInput) {
                    setNewTaskName("");
                    setSelectedTask("");
                  }
                }}
                className="text-xs text-blue-600"
              >
                {showTaskInput ? "Select from list" : "+ Add new task"}
              </button>
            )}
          </div>

          {showTaskInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter new task name"
                className="w-full px-3 py-2 border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewTask}
                  disabled={creatingTask || !newTaskName.trim()}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
                <button
                  onClick={() => {
                    setShowTaskInput(false);
                    setNewTaskName("");
                  }}
                  className="px-3 py-1 text-xs bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">
                {selectedProject ? "Select task" : "Select a project first"}
              </option>
              {tasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded resize-vertical"
          rows={3}
        />
      </div>

      {/* Billable */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Billable</label>
        <input
          type="checkbox"
          checked={isBillable}
          onChange={(e) => setIsBillable(e.target.checked)}
        />
      </div>
    </div>
  );
}
