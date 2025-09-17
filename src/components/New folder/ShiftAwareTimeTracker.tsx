import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Timer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectAPI, taskAPI, timeEntryAPI, type Task, type Project, type TeamMember } from '@/lib/api';

interface ShiftAwareTimeTrackerProps {
  onAddEntry: (entry: any) => void;
  activeTimer: any;
  setActiveTimer: (timer: any) => void;
  currentUser: TeamMember; // Must be a team member with shift information
}

export const ShiftAwareTimeTracker: React.FC<ShiftAwareTimeTrackerProps> = ({ 
  onAddEntry, 
  activeTimer, 
  setActiveTimer, 
  currentUser 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [manualTime, setManualTime] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeEntry, setActiveTimeEntry] = useState<any>(null);

  // Get the user's assigned shift type
  const assignedShiftType = currentUser.shift?.toLowerCase() || 'hourly';
  const trackingType = currentUser.shift || 'Hourly';

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchProjects();
        await fetchTasks();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAllProjects();
      if (response?.success && response.data && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        // Fallback sample projects
        const sampleProjects: Project[] = [
          {
            _id: 'project-1',
            name: 'Website Redesign',
            client: 'TechCorp Inc',
            description: 'Complete website redesign and modernization',
            startDate: new Date().toISOString(),
            progress: 35,
            team: 4,
            hours: 120,
            status: 'active',
            assignedTeam: [],
            budget: 15000,
            priority: 'high'
          },
          {
            _id: 'project-2',
            name: 'Mobile App Development',
            client: 'StartupXYZ',
            description: 'Native mobile app for iOS and Android',
            startDate: new Date().toISOString(),
            progress: 60,
            team: 5,
            hours: 200,
            status: 'active',
            assignedTeam: [],
            budget: 25000,
            priority: 'high'
          }
        ];
        setProjects(sampleProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getAllTasks();
      if (response?.success && response.data && Array.isArray(response.data)) {
        setTasks(response.data as Task[]);
      } else {
        // Fallback sample tasks
        const sampleTasks: Task[] = [
          { _id: 'task-1', name: 'Development', description: 'Software development work', project: '', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 0, actualHours: 0, tags: [], isActive: true },
          { _id: 'task-2', name: 'Testing', description: 'Quality assurance testing', project: '', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 0, actualHours: 0, tags: [], isActive: true },
          { _id: 'task-3', name: 'Documentation', description: 'Project documentation', project: '', assignedTo: '', priority: 'low', status: 'todo', estimatedHours: 0, actualHours: 0, tags: [], isActive: true }
        ];
        setTasks(sampleTasks as Task[]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a description of what you are working on');
      return;
    }

    // Use first available task as default if none selected
    let taskToUse = selectedTask;
    if (!taskToUse) {
      taskToUse = tasks.length > 0 ? tasks[0]._id : '507f1f77bcf86cd799439011';
    }

    try {
      const response = await timeEntryAPI.startTimer({
        userId: currentUser._id,
        project: selectedProject,
        task: taskToUse,
        description,
        trackingType: trackingType,
        userType: 'TeamMember',
        hourlyRate: currentUser.charges || 0
      });

      if (response.success && response.data) {
        setActiveTimeEntry(response.data);
        setIsRunning(true);
        setActiveTimer({
          id: response.data._id,
          project: selectedProject,
          task: taskToUse,
          startTime: Date.now()
        });
        console.log(`✅ Timer started with ${trackingType} tracking type`);
      } else {
        alert(`Failed to start timer: ${response.error || response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Timer start error:', error);
      
      // Handle offline mode
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        const mockTimeEntry = {
          _id: 'mock-' + Date.now(),
          userId: currentUser._id,
          project: selectedProject,
          task: taskToUse,
          description,
          startTime: new Date().toISOString(),
          status: 'In Progress',
          trackingType: trackingType
        };
        
        setActiveTimeEntry(mockTimeEntry);
        setIsRunning(true);
        setActiveTimer({
          id: mockTimeEntry._id,
          project: selectedProject,
          task: taskToUse,
          startTime: Date.now()
        });
        
        alert('⚠️ Backend server not running. Timer started in offline mode for testing.');
        return;
      }
      
      alert('Failed to start timer. Please try again.');
    }
  };

  const stopTimer = async () => {
    if (!activeTimeEntry) {
      alert('No active timer found');
      return;
    }

    try {
      const response = await timeEntryAPI.stopTimer(activeTimeEntry._id);
      
      if (response.success) {
        setIsRunning(false);
        setElapsed(0);
        setActiveTimer(null);
        setActiveTimeEntry(null);
        resetForm();
        
        onAddEntry(response.data);
        alert('Timer stopped and time entry saved successfully!');
      }
    } catch (error) {
      console.error('Failed to stop timer:', error);
      
      // Handle offline mode
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        const duration = Math.floor(elapsed / 60);
        const mockCompletedEntry = {
          ...activeTimeEntry,
          endTime: new Date().toISOString(),
          duration: duration,
          status: 'Completed'
        };
        
        setIsRunning(false);
        setElapsed(0);
        setActiveTimer(null);
        setActiveTimeEntry(null);
        resetForm();
        
        onAddEntry(mockCompletedEntry);
        alert(`⚠️ Timer stopped in offline mode. Duration: ${Math.floor(duration/60)}h ${duration%60}m`);
        return;
      }
      
      alert('Failed to stop timer. Please try again.');
    }
  };

  const saveManualEntry = async () => {
    if (!manualTime || !selectedProject || !description) {
      alert('Please fill in all required fields (project and description)');
      return;
    }
    
    let taskToUse = selectedTask;
    if (!taskToUse) {
      taskToUse = tasks.length > 0 ? tasks[0]._id : '507f1f77bcf86cd799439011';
    }

    try {
      // Parse manual time
      const timeParts = manualTime.split(':');
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      
      const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
      
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000);

      const response = await timeEntryAPI.createTimeEntry({
        userId: currentUser._id,
        project: selectedProject,
        task: taskToUse,
        description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        billable,
        trackingType: trackingType,
        isManualEntry: true,
        hourlyRate: currentUser.charges || 0
      });

      if (response.success) {
        resetForm();
        onAddEntry(response.data);
        alert('Manual time entry saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save manual entry:', error);
      
      // Handle offline mode
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        const timeParts = manualTime.split(':');
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        const calculatedMinutes = hours * 60 + minutes;
        
        const mockStartTime = new Date();
        const mockEndTime = new Date(mockStartTime.getTime() + calculatedMinutes * 60 * 1000);
        
        const mockManualEntry = {
          _id: 'mock-manual-' + Date.now(),
          userId: currentUser._id,
          project: selectedProject,
          task: taskToUse,
          description,
          startTime: mockStartTime.toISOString(),
          endTime: mockEndTime.toISOString(),
          duration: calculatedMinutes,
          billable,
          trackingType: trackingType,
          isManualEntry: true,
          status: 'Completed'
        };
        
        resetForm();
        onAddEntry(mockManualEntry);
        alert(`⚠️ Manual entry saved in offline mode. Duration: ${Math.floor(calculatedMinutes/60)}h ${calculatedMinutes%60}m`);
        return;
      }
      
      alert('Failed to save manual entry. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedProject('');
    setSelectedTask('');
    setDescription('');
    setManualTime('');
    setBillable(true);
  };

  const getShiftDescription = () => {
    switch (assignedShiftType) {
      case 'hourly':
        return 'Track time by the hour - best for detailed work';
      case 'daily':
        return 'Track time by the day - for full-day projects';
      case 'weekly':
        return 'Track time by the week - for long-term assignments';
      case 'monthly':
        return 'Track time by the month - for ongoing responsibilities';
      default:
        return 'Track your work time';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Tracker</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Manual Entry</span>
            <Switch checked={isManualEntry} onCheckedChange={setIsManualEntry} />
          </div>
        </div>

        {/* Shift Information Display */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Assigned Shift: {trackingType}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {getShiftDescription()}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Employee: {currentUser.name} ({currentUser.employeeId})
              </p>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Single Tab for Assigned Shift */}
        <Tabs value={assignedShiftType} className="mb-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value={assignedShiftType} className="capitalize">
              {trackingType}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={assignedShiftType} className="mt-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              {getShiftDescription()}
            </div>

            {!isManualEntry ? (
              /* Timer Mode */
              <div className="space-y-4">
                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                    {formatTime(elapsed)}
                  </div>
                  <div className="flex justify-center space-x-2">
                    {!isRunning ? (
                      <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button onClick={stopTimer} className="bg-red-600 hover:bg-red-700">
                        <Square className="w-4 h-4 mr-2" />
                        Stop Timer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project *
                  </label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name} - {project.client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task
                  </label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task._id} value={task._id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Billable Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Billable Time
                  </label>
                  <Switch checked={billable} onCheckedChange={setBillable} />
                </div>
              </div>
            ) : (
              /* Manual Entry Mode */
              <div className="space-y-4">
                {/* Manual Time Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Duration (HH:MM:SS or HH:MM) *
                  </label>
                  <Input
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="e.g., 2:30:00 or 2:30"
                  />
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project *
                  </label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name} - {project.client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task
                  </label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task._id} value={task._id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you work on?"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Billable Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Billable Time
                  </label>
                  <Switch checked={billable} onCheckedChange={setBillable} />
                </div>

                {/* Save Button */}
                <Button onClick={saveManualEntry} className="w-full">
                  Save Manual Entry
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
