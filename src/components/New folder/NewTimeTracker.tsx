import React, { useState, useEffect, useRef } from 'react';
import { projectAPI, taskAPI, timeEntryAPI, type Project, type Task } from '@/lib/api';

interface NewTimeTrackerProps {
  onAddEntry?: (entry: any) => void;
  activeTimer?: any;
  setActiveTimer?: (timer: any) => void;
  currentUser?: any;
  onTimerStart?: (timerData: any) => void;
  onTimerStop?: () => void;
}

export const NewTimeTracker: React.FC<NewTimeTrackerProps> = ({
  onAddEntry,
  activeTimer,
  setActiveTimer,
  currentUser: propCurrentUser,
  onTimerStart,
  onTimerStop
}) => {
  const [activeTab, setActiveTab] = useState('Hourly');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isBillable, setIsBillable] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const tabDescriptions = {
    'Hourly': 'Track time by the hour',
    'Daily': 'Track time by the day – for tasks across a day',
    'Weekly': 'Track time by the week – for long-running tasks',
    'Monthly': 'Track time by the month – for big projects'
  };

  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const createNewTask = async () => {
    if (!newTaskName.trim() || !selectedProject) {
      alert('Please enter a task name and select a project.');
      return;
    }

    try {
      setCreatingTask(true);
      const taskData = {
        name: newTaskName.trim(),
        description: `Task created from time tracker`,
        project: selectedProject,
        assignedModel: 'TeamMember', // Required field for backend
        priority: 'medium' as const,
        status: 'todo' as const,
        estimatedHours: 0,
        actualHours: 0,
        tags: [],
        isActive: true
      };

      console.log('Creating task with data:', taskData);
      const response = await taskAPI.createTask(taskData);
      if (response.success && response.data) {
        // Add the new task to the tasks list
        setTasks(prev => [...prev, response.data!]);
        // Select the newly created task
        setSelectedTask(response.data._id);
        // Reset the input
        setNewTaskName('');
        setShowTaskInput(false);
        console.log('Task created successfully:', response.data);
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create task. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStartStop = async () => {
    if (!selectedProject || (!selectedTask && !showTaskInput)) {
      alert('Please select a project and task before starting the timer.');
      return;
    }

    if (!isRunning) {
      try {
        let taskId = selectedTask;
        
        // If we're in task input mode, create the task first
        if (showTaskInput && newTaskName.trim()) {
          await createNewTask();
          // After creating task, selectedTask should be set to the new task ID
          taskId = selectedTask;
        }
        
        if (!taskId) {
          alert('Please select or create a task before starting the timer.');
          return;
        }
        
        // Start timer via API (only for non-manual entries)
        if (currentUser && !isManualEntry) {
          // Validate all required fields
          if (!currentUser._id || !selectedProject || !taskId) {
            alert('Missing required data. Please ensure you are logged in and have selected a project and task.');
            return;
          }
          
          // Check for existing active timer first
          if (activeTimer) {
            alert('You already have an active timer running. Please stop it first.');
            return;
          }
          
          const timerData = {
            userId: currentUser._id,
            project: selectedProject,
            task: taskId,
            description: description || 'Time tracking',
            trackingType: activeTab,
            userType: currentUser.userType || 'TeamMember'
          };
          
          console.log('=== TIMER START DEBUG ===');
          console.log('🚀 Starting timer with employee details:');
          console.log('Timer Data:', timerData);
          console.log('📋 Employee Details:');
          console.log('  - User ID:', currentUser._id);
          console.log('  - Name:', currentUser.name);
          console.log('  - Email:', currentUser.email);
          console.log('  - User Type:', currentUser.userType);
          console.log('  - Role:', currentUser.role);
          console.log('📊 Project & Task Details:');
          console.log('  - Project ID:', selectedProject);
          console.log('  - Task ID:', taskId);
          console.log('  - Description:', description || 'Time tracking');
          console.log('  - Tracking Type:', activeTab);
          console.log('🌐 API Call:', 'POST /time-entries/start');
          console.log('📦 Complete User Object:', currentUser);
          
          const response = await timeEntryAPI.startTimer(timerData);
          if (response.success && response.data) {
            setActiveTimer?.(response.data);
            onAddEntry?.(response.data);
          }
        }
        
        setIsRunning(true);
        timerInterval.current = setInterval(() => {
          setTotalSeconds(prev => prev + 1);
        }, 1000);
      } catch (error: any) {
        console.error('=== TIMER START ERROR DEBUG ===');
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Response headers:', error.response?.headers);
        console.error('Request config:', error.config);
        console.error('Timer data that was sent:', {
          userId: currentUser?._id,
          project: selectedProject,
          task: selectedTask,
          description: description || 'Time tracking',
          trackingType: activeTab,
          userType: currentUser.userType || 'TeamMember'
        });
        
        let errorMessage = 'Unknown error occurred';
        
        if (error.response) {
          // Server responded with error status
          console.log('Server responded with error status:', error.response.status);
          if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = `Server error (${error.response.status})`;
          }
        } else if (error.request) {
          // Request was made but no response received
          console.log('No response received from server');
          errorMessage = 'No response from server. Check if backend is running.';
        } else {
          // Something else happened
          errorMessage = error.message || 'Request setup error';
        }
        
        alert(`Timer start failed: ${errorMessage}`);
      }
    } else {
      try {
        // Stop timer via API
        if (activeTimer && !isManualEntry) {
          const response = await timeEntryAPI.stopTimer(activeTimer._id);
          if (response.success) {
            setActiveTimer?.(null);
          }
        } else if (isManualEntry && currentUser) {
          // Create manual entry
          const entryData = {
            userId: currentUser._id,
            project: selectedProject,
            task: selectedTask,
            description: description || 'Manual time entry',
            startTime: new Date(Date.now() - totalSeconds * 1000).toISOString(),
            endTime: new Date().toISOString(),
            billable: isBillable,
            trackingType: activeTab,
            isManualEntry: true,
            hourlyRate: 0,
            userType: currentUser.userType || 'TeamMember'
          };
          
          const response = await timeEntryAPI.createTimeEntry(entryData);
          if (response.success && response.data) {
            onAddEntry?.(response.data);
          }
        }
        
        setIsRunning(false);
        setTotalSeconds(0);
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        
        // Reset form
        setSelectedProject('');
        setSelectedTask('');
        setDescription('');
        setIsBillable(false);
      } catch (error) {
        console.error('Failed to stop timer:', error);
        alert('Failed to stop timer. Please try again.');
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Fetch projects on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current user (prioritize prop over localStorage)
        if (propCurrentUser) {
          setCurrentUser(propCurrentUser);
          console.log('Using prop current user:', propCurrentUser);
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            console.log('Using localStorage user:', user);
          } else {
            // Fallback: Create a temporary user for testing
            const tempUser = {
              _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
              name: 'Test Employee',
              email: 'test@example.com',
              userType: 'TeamMember',
              role: 'employee'
            };
            setCurrentUser(tempUser);
            console.log('Using temporary user for testing:', tempUser);
          }
        }
        
        // Fetch all projects
        const projectResponse = await projectAPI.getAllProjects();
        if (projectResponse.success && projectResponse.data) {
          setProjects(projectResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  // Fetch tasks when project is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject) {
        try {
          const taskResponse = await taskAPI.getTasksByProject(selectedProject);
          if (taskResponse.success && taskResponse.data) {
            setTasks(taskResponse.data);
          }
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        }
      } else {
        setTasks([]);
        setSelectedTask('');
      }
    };

    fetchTasks();
  }, [selectedProject]);

  return (
    <div className="container mx-auto mt-5 p-4 border rounded shadow-sm bg-white" style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="m-0 text-xl font-semibold text-gray-800">Time Tracker</h4>
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700" htmlFor="manualToggle">
            Manual Entry
          </label>
          <label className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              id="manualToggle"
              className="sr-only"
              checked={isManualEntry}
              onChange={(e) => setIsManualEntry(e.target.checked)}
            />
            <span
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-400 ${
                isManualEntry ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute h-4.5 w-4.5 rounded-full bg-white transition-all duration-400 top-0.75 ${
                  isManualEntry ? 'translate-x-5' : 'translate-x-0.75'
                }`}
                style={{
                  height: '18px',
                  width: '18px',
                  top: '3px',
                  left: isManualEntry ? '20px' : '3px'
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 text-center">
        <div className="flex w-full justify-center">
          {Object.keys(tabDescriptions).map((tab) => (
            <button
              key={tab}
              className={`border-none bg-none py-2.5 px-5 font-medium cursor-pointer transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gray-100 rounded-lg'
                  : 'hover:bg-gray-50'
              }`}
              style={{ padding: window.innerWidth <= 767 ? '5px 10px' : '10px 20px' }}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <small className="text-gray-500 block mt-2">
          {tabDescriptions[activeTab as keyof typeof tabDescriptions]}
        </small>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div className="text-3xl font-bold my-5 text-gray-800">
          {formatTime(totalSeconds)}
        </div>
        <button
          onClick={handleStartStop}
          className={`font-medium py-2 px-4 rounded transition-colors duration-200 min-w-32 ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : (!selectedProject || (!selectedTask && !showTaskInput))
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          disabled={!selectedProject || (!selectedTask && !showTaskInput)}
        >
          {isRunning ? '■ Stop' : '▶ Start'}
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex flex-wrap -mx-2 mt-4">
        <div className="w-full md:w-1/2 px-2 mb-3">
          <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select project</option>
            {loading ? (
              <option disabled>Loading projects...</option>
            ) : (
              projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="w-full md:w-1/2 px-2 mb-3">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700">
              Task *
            </label>
            {selectedProject && (
              <button
                type="button"
                onClick={() => {
                  setShowTaskInput(!showTaskInput);
                  if (showTaskInput) {
                    setNewTaskName('');
                    setSelectedTask('');
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {showTaskInput ? 'Select from list' : '+ Add new task'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    createNewTask();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={createNewTask}
                  disabled={creatingTask || !newTaskName.trim()}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {creatingTask ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskInput(false);
                    setNewTaskName('');
                  }}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <select
              id="taskSelect"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                {selectedProject ? 'Select task' : 'Select a project first'}
              </option>
              {selectedProject && tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          placeholder="What did you work on?"
          rows={3}
        />
      </div>

      {/* Billable Toggle */}
      <div className="text-left">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700" htmlFor="billableToggle">
            Billable
          </label>
          <label className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              id="billableToggle"
              className="sr-only"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
            />
            <span
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-400 ${
                isBillable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute h-4.5 w-4.5 rounded-full bg-white transition-all duration-400 top-0.75 ${
                  isBillable ? 'translate-x-5' : 'translate-x-0.75'
                }`}
                style={{
                  height: '18px',
                  width: '18px',
                  top: '3px',
                  left: isBillable ? '20px' : '3px'
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
