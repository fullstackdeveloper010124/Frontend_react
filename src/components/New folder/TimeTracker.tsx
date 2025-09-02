import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectAPI, taskAPI, timeEntryAPI, authAPI, type Task, type Project } from '@/lib/api';

interface TimeTrackerProps {
  onAddEntry: (entry: any) => void;
  activeTimer: any;
  setActiveTimer: (timer: any) => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ onAddEntry, activeTimer, setActiveTimer }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [manualTime, setManualTime] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [timeframeTab, setTimeframeTab] = useState('hourly');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<any>(null);

  // Initialize user and fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        }
        
        // Try to fetch real projects from backend first
        const backendProjects = await fetchProjects();
        
        // Always ensure we have projects to display
        if (!backendProjects || backendProjects.length === 0) {
          console.log('No backend projects found, using sample projects as fallback');
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
            },
            {
              _id: 'project-3',
              name: 'Marketing Campaign',
              client: 'RetailCorp',
              description: 'Digital marketing campaign and analytics',
              startDate: new Date().toISOString(),
              progress: 20,
              team: 3,
              hours: 80,
              status: 'active',
              assignedTeam: [],
              budget: 10000,
              priority: 'medium'
            },
            {
              _id: 'project-4',
              name: 'Internal Training',
              client: 'Internal',
              description: 'Employee training and development program',
              startDate: new Date().toISOString(),
              progress: 75,
              team: 2,
              hours: 40,
              status: 'active',
              assignedTeam: [],
              budget: 5000,
              priority: 'medium'
            }
          ];
          setProjects(sampleProjects);
          console.log('✅ Sample projects loaded:', sampleProjects.length);
        }
        
        // Fetch all tasks from backend
        await fetchTasks();
        
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchProjects = async (): Promise<Project[]> => {
    try {
      console.log('🔄 Fetching projects from API...');
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
      
      const response = await projectAPI.getAllProjects();
      console.log('📦 Projects API response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response success:', response?.success);
      console.log('📦 Response data:', response?.data);
      console.log('📦 Data is array:', Array.isArray(response?.data));
      console.log('📦 Data length:', response?.data?.length);
      
      if (response?.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setProjects(response.data);
        console.log('✅ Projects loaded from backend:', response.data.length, 'projects');
        console.log('📋 Backend project names:', response.data.map(p => p.name));
        return response.data;
      }
      
      console.log('⚠️ No projects found in backend - response success:', response?.success, 'data length:', response?.data?.length);
      return [];
    } catch (error) {
      console.error('❌ Backend API error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error response:', error.response?.data);
      return [];
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getAllTasks();
      console.log('Tasks API response:', response);
      
      if (response?.success && response.data && Array.isArray(response.data)) {
        setTasks(response.data as Task[]);
        console.log('Tasks loaded from backend:', response.data.length);
      } else {
        console.warn('No tasks found or API failed, using fallback');
        // Set comprehensive tasks for all projects
        const sampleTasks: Task[] = [
          // Website Redesign tasks
          { _id: 'task-1', name: 'Homepage Design', description: 'Design new homepage layout', project: 'project-1', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 20, actualHours: 0, tags: ['design'], isActive: true },
          { _id: 'task-2', name: 'Navigation Menu', description: 'Implement responsive navigation', project: 'project-1', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['frontend'], isActive: true },
          { _id: 'task-3', name: 'Contact Form', description: 'Build contact form functionality', project: 'project-1', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 12, actualHours: 0, tags: ['backend'], isActive: true },
          
          // Mobile App Development tasks
          { _id: 'task-4', name: 'User Authentication', description: 'Implement login/signup system', project: 'project-2', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 30, actualHours: 0, tags: ['backend'], isActive: true },
          { _id: 'task-5', name: 'UI Components', description: 'Create reusable UI components', project: 'project-2', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 40, actualHours: 0, tags: ['frontend'], isActive: true },
          { _id: 'task-6', name: 'API Integration', description: 'Connect app to backend APIs', project: 'project-2', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 25, actualHours: 0, tags: ['integration'], isActive: true },
          
          // Marketing Campaign tasks
          { _id: 'task-7', name: 'Content Creation', description: 'Create marketing content and copy', project: 'project-3', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 15, actualHours: 0, tags: ['content'], isActive: true },
          { _id: 'task-8', name: 'Social Media Setup', description: 'Set up social media campaigns', project: 'project-3', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 10, actualHours: 0, tags: ['marketing'], isActive: true },
          { _id: 'task-9', name: 'Analytics Setup', description: 'Configure tracking and analytics', project: 'project-3', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['analytics'], isActive: true },
          
          // Internal Training tasks
          { _id: 'task-10', name: 'Training Materials', description: 'Develop training documentation', project: 'project-4', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 20, actualHours: 0, tags: ['documentation'], isActive: true },
          { _id: 'task-11', name: 'Workshop Planning', description: 'Plan and schedule workshops', project: 'project-4', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 12, actualHours: 0, tags: ['planning'], isActive: true },
          { _id: 'task-12', name: 'Assessment Creation', description: 'Create training assessments', project: 'project-4', assignedTo: '', priority: 'low', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['assessment'], isActive: true }
        ];
        setTasks(sampleTasks as Task[]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Set minimal fallback on error
      setTasks([
        { _id: 'default-1', name: 'Development', description: 'Software development work', project: '', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 0, actualHours: 0, tags: [], isActive: true }
      ] as Task[]);
    }
  };

  // Fetch tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      console.log('Project changed to:', selectedProject);
      fetchTasksByProject(selectedProject);
      // Reset selected task when project changes
      setSelectedTask('');
    } else {
      // If no project selected, show all tasks
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchTasksByProject = async (projectId: string) => {
    try {
      console.log('Fetching tasks for project:', projectId);
      const response = await taskAPI.getTasksByProject(projectId);
      
      if (response?.success && response.data && Array.isArray(response.data)) {
        setTasks(response.data as Task[]);
        console.log('Project tasks loaded:', response.data.length);
      } else {
        console.warn('No tasks found for project, filtering from sample tasks');
        // Filter tasks based on selected project
        const allTasks = [
          // Website Redesign tasks
          { _id: 'task-1', name: 'Homepage Design', description: 'Design new homepage layout', project: 'project-1', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 20, actualHours: 0, tags: ['design'], isActive: true },
          { _id: 'task-2', name: 'Navigation Menu', description: 'Implement responsive navigation', project: 'project-1', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['frontend'], isActive: true },
          { _id: 'task-3', name: 'Contact Form', description: 'Build contact form functionality', project: 'project-1', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 12, actualHours: 0, tags: ['backend'], isActive: true },
          
          // Mobile App Development tasks
          { _id: 'task-4', name: 'User Authentication', description: 'Implement login/signup system', project: 'project-2', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 30, actualHours: 0, tags: ['backend'], isActive: true },
          { _id: 'task-5', name: 'UI Components', description: 'Create reusable UI components', project: 'project-2', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 40, actualHours: 0, tags: ['frontend'], isActive: true },
          { _id: 'task-6', name: 'API Integration', description: 'Connect app to backend APIs', project: 'project-2', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 25, actualHours: 0, tags: ['integration'], isActive: true },
          
          // Marketing Campaign tasks
          { _id: 'task-7', name: 'Content Creation', description: 'Create marketing content and copy', project: 'project-3', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 15, actualHours: 0, tags: ['content'], isActive: true },
          { _id: 'task-8', name: 'Social Media Setup', description: 'Set up social media campaigns', project: 'project-3', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 10, actualHours: 0, tags: ['marketing'], isActive: true },
          { _id: 'task-9', name: 'Analytics Setup', description: 'Configure tracking and analytics', project: 'project-3', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['analytics'], isActive: true },
          
          // Internal Training tasks
          { _id: 'task-10', name: 'Training Materials', description: 'Develop training documentation', project: 'project-4', assignedTo: '', priority: 'high', status: 'todo', estimatedHours: 20, actualHours: 0, tags: ['documentation'], isActive: true },
          { _id: 'task-11', name: 'Workshop Planning', description: 'Plan and schedule workshops', project: 'project-4', assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 12, actualHours: 0, tags: ['planning'], isActive: true },
          { _id: 'task-12', name: 'Assessment Creation', description: 'Create training assessments', project: 'project-4', assignedTo: '', priority: 'low', status: 'todo', estimatedHours: 8, actualHours: 0, tags: ['assessment'], isActive: true }
        ];
        
        const projectTasks = allTasks.filter(task => task.project === projectId);
        setTasks(projectTasks as Task[]);
      }
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      // Fallback tasks for the project
      setTasks([
        { _id: 'default-1', name: 'Development', description: 'Software development work', project: projectId, assignedTo: '', priority: 'medium', status: 'todo', estimatedHours: 0, actualHours: 0, tags: [], isActive: true }
      ] as Task[]);
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
    if (!currentUser) {
      alert('Please log in to start tracking time');
      return;
    }
    
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }
    
    if (!selectedTask) {
      alert('Please select a task');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a description of what you are working on');
      return;
    }

    try {
      const response = await timeEntryAPI.startTimer({
        userId: currentUser._id,
        project: selectedProject,
        task: selectedTask,
        description,
        trackingType: timeframeTab.charAt(0).toUpperCase() + timeframeTab.slice(1)
      });

      if (response.success && response.data) {
        setActiveTimeEntry(response.data);
        setIsRunning(true);
        setActiveTimer({
          id: response.data._id,
          project: selectedProject,
          task: selectedTask,
          startTime: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('Failed to start timer. Please try again.');
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
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
        
        // Notify parent component
        onAddEntry(response.data);
        
        alert('Timer stopped and time entry saved successfully!');
      }
    } catch (error) {
      console.error('Failed to stop timer:', error);
      alert('Failed to stop timer. Please try again.');
    }
  };

  const saveManualEntry = async () => {
    if (!manualTime || !currentUser || !selectedProject || !selectedTask || !description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Parse manual time (format: HH:MM:SS or HH:MM)
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
        task: selectedTask,
        description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        billable,
        trackingType: timeframeTab.charAt(0).toUpperCase() + timeframeTab.slice(1),
        isManualEntry: true
      });

      if (response.success) {
        resetForm();
        onAddEntry(response.data);
        alert('Manual time entry saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save manual entry:', error);
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

        <Tabs value={timeframeTab} onValueChange={setTimeframeTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the hour - best for detailed work
          </TabsContent>
          <TabsContent value="daily" className="mt-2 text-center text-sm text-gray-500">
            Track time by the day - for full day assignments
          </TabsContent>
          <TabsContent value="weekly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the week - for long-running tasks
          </TabsContent>
          <TabsContent value="monthly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the month - for project-level tracking
          </TabsContent>
        </Tabs>

        {!isManualEntry && (
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-4">
              {formatTime(elapsed)}
            </div>
            <div className="flex justify-center space-x-3">
              {!isRunning ? (
                <Button onClick={startTimer} className="bg-emerald-600 hover:bg-emerald-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={stopTimer} className="bg-red-600 hover:bg-red-700">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <Select value={selectedProject} onValueChange={(value) => {
              console.log('Project selected:', value);
              setSelectedProject(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading projects..." : "Select project"} />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  console.log('Rendering projects dropdown, projects count:', projects.length);
                  console.log('Projects data:', projects);
                  return projects.length > 0 ? (
                    projects.map(p => {
                      console.log('Rendering project:', p);
                      return (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name} {p.client ? `(${p.client})` : ''}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-projects" disabled>
                      No projects available
                    </SelectItem>
                  );
                })()}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task
            </label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(t => (
                  <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isManualEntry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time *
              </label>
              <Input
                placeholder="2:30:00"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <Textarea
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch checked={billable} onCheckedChange={setBillable} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
          </div>
          
          {isManualEntry && (
            <Button onClick={saveManualEntry} className="bg-indigo-600 hover:bg-indigo-700">
              <Clock className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
