import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectAPI, taskAPI, timeEntryAPI, authAPI, shiftAPI, type Task, type Project, type Shift, type TimeEntry } from '@/lib/api';

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
  const [assignedShift, setAssignedShift] = useState<Shift | null>(null);
  const [allowedShiftTypes, setAllowedShiftTypes] = useState<string[]>(['hourly', 'daily', 'weekly', 'monthly']);

  // Initialize user and fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('token');
        console.log('🔍 User from localStorage:', userStr);
        console.log('🔍 Token from localStorage:', tokenStr ? 'Present' : 'Missing');
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('✅ Parsed user:', user);
            setCurrentUser(user);
          } catch (parseError) {
            console.error('❌ Error parsing user data:', parseError);
            localStorage.removeItem('user'); // Clear corrupted data
          }
        } else {
          console.log('⚠️ No user found in localStorage');
          // Create a temporary user for testing purposes
          const tempUser = {
            _id: 'temp-user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'employee'
          };
          console.log('🔧 Creating temporary user for testing:', tempUser);
          setCurrentUser(tempUser);
          localStorage.setItem('user', JSON.stringify(tempUser));
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
        
        // Fetch employee shift from backend API (priority over user profile)
        const userForShift = currentUser || (userStr ? JSON.parse(userStr) : null);
        if (userForShift) {
          console.log('🔄 Attempting to fetch employee shift from backend for user:', userForShift._id);
          try {
            // First try to get shift assignment from backend API
            await fetchEmployeeShift(userForShift._id);
          } catch (error) {
            console.log('⚠️ Backend shift fetch failed, falling back to user profile shift');
            // Fallback to user profile shift if backend call fails
            setShiftFromUserProfile(userForShift);
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const setShiftFromUserProfile = (user: any) => {
    try {
      console.log('🔄 Setting shift from user profile:', user);
      
      if (user.shift) {
        // Normalize shift type to lowercase for consistency
        const normalizedShiftType = user.shift.toLowerCase();
        
        // Validate that the shift type is one of the expected values
        const validShiftTypes = ['hourly', 'daily', 'weekly', 'monthly'];
        const shiftType = validShiftTypes.includes(normalizedShiftType) 
          ? normalizedShiftType 
          : 'hourly'; // Default to hourly if invalid
        
        console.log('✅ User profile shift (normalized):', shiftType);
        
        // Create shift data object for display
        const shiftData: Shift = {
          _id: `profile-shift-${user._id}`,
          employeeId: user._id,
          shiftType: user.shift, // Keep original case for display
          startTime: '09:00',
          endTime: '17:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          isActive: true,
          assignedBy: user._id,
          assignedDate: new Date().toISOString(),
          description: `${user.shift} shift from user profile`,
          hoursPerDay: 8,
          daysPerWeek: 5,
          weeksPerMonth: 4,
          monthlyHours: 160,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAssignedShift(shiftData);
        
        // Set allowed shift types to only the assigned shift
        setAllowedShiftTypes([shiftType]);
        
        // Update the current timeframe tab to match the assigned shift
        setTimeframeTab(shiftType);
        
        console.log('🎯 Time tracker restricted to shift type from user profile:', shiftType);
      } else {
        console.log('⚠️ No shift field in user profile, allowing all shift types');
        // If no shift field, allow all types (default behavior)
        setAllowedShiftTypes(['hourly', 'daily', 'weekly', 'monthly']);
      }
    } catch (error) {
      console.error('❌ Error setting shift from user profile:', error);
      // On error, allow all shift types as fallback
      setAllowedShiftTypes(['hourly', 'daily', 'weekly', 'monthly']);
    }
  };

  const fetchEmployeeShift = async (employeeId: string) => {
    try {
      console.log('🔄 Fetching shift for employee:', employeeId);
      const response = await shiftAPI.getEmployeeShift(employeeId);
      console.log('📋 Shift API response:', response);
      
      if (response?.success && response.data) {
        setAssignedShift(response.data);
        const shiftType = response.data.shiftType.toLowerCase();
        console.log('✅ Employee assigned shift from backend:', shiftType);
        
        // Set allowed shift types to only the assigned shift
        setAllowedShiftTypes([shiftType]);
        
        // Update the current timeframe tab to match the assigned shift
        setTimeframeTab(shiftType);
        
        console.log('🎯 Time tracker restricted to shift type:', shiftType);
        return; // Successfully fetched from backend
      } else {
        console.log('⚠️ No specific shift assigned in backend, checking user profile');
        // If no backend shift, try user profile as fallback
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setShiftFromUserProfile(user);
          return;
        }
        
        console.log('⚠️ No shift found anywhere, allowing all shift types');
        // If no shift found anywhere, allow all types (default behavior)
        setAllowedShiftTypes(['hourly', 'daily', 'weekly', 'monthly']);
      }
    } catch (error) {
      console.error('❌ Error fetching employee shift:', error);
      // On error, try user profile as fallback before allowing all types
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('🔄 Backend failed, trying user profile fallback');
          setShiftFromUserProfile(user);
          return;
        } catch (parseError) {
          console.error('❌ Error parsing user profile:', parseError);
        }
      }
      
      // Final fallback: allow all shift types
      console.log('🔄 All shift sources failed, allowing all shift types');
      setAllowedShiftTypes(['hourly', 'daily', 'weekly', 'monthly']);
    }
  };

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
    console.log('🚀 Starting timer...');
    console.log('👤 Current user:', currentUser);
    console.log('📁 Selected project:', selectedProject);
    console.log('📋 Selected task:', selectedTask);
    console.log('📝 Description:', description);
    
    // Get the current user (either from state or localStorage)
    let userToUse = currentUser;
    if (!userToUse) {
      console.error('❌ No current user found in state');
      // Try to get user from localStorage again
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          userToUse = user;
          console.log('🔄 Retrieved user from localStorage:', user);
        } catch (error) {
          console.error('❌ Error parsing user from localStorage:', error);
          alert('Please log in to start tracking time');
          return;
        }
      } else {
        // Create temporary user if none exists
        const tempUser = {
          _id: 'temp-user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'employee'
        };
        console.log('🔧 Creating temporary user for timer:', tempUser);
        setCurrentUser(tempUser);
        localStorage.setItem('user', JSON.stringify(tempUser));
        userToUse = tempUser;
      }
    }
    
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }
    
    // Task is now optional - create a default task if none selected
    let taskToUse = selectedTask;
    if (!taskToUse) {
      // Use the first available task as default, or create a valid ObjectId
      if (tasks.length > 0) {
        taskToUse = tasks[0]._id;
        console.log('📋 No task selected, using first available task:', taskToUse);
      } else {
        // Create a valid ObjectId for default task
        taskToUse = '507f1f77bcf86cd799439011'; // Valid ObjectId format
        console.log('📋 No tasks available, using default ObjectId:', taskToUse);
      }
    }
    
    if (!description.trim()) {
      alert('Please enter a description of what you are working on');
      return;
    }

    // Test API connection first
    console.log('🔍 Testing API connection before starting timer...');
    const isApiConnected = await testApiConnection();
    if (!isApiConnected) {
      console.log('⚠️ API connection failed, proceeding with offline mode');
    }

    try {
      console.log('📤 Sending timer start request:', {
        userId: userToUse._id,
        project: selectedProject,
        task: taskToUse,
        description,
        trackingType: timeframeTab.charAt(0).toUpperCase() + timeframeTab.slice(1)
      });
      
      const response = await timeEntryAPI.startTimer({
        userId: userToUse._id,
        project: selectedProject,
        task: taskToUse,
        description,
        trackingType: timeframeTab.charAt(0).toUpperCase() + timeframeTab.slice(1)
      });

      console.log('📥 Timer start response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response success:', response?.success);
      console.log('📥 Response data:', response?.data);
      
      // Handle different response formats from backend
      let responseData: TimeEntry | null = null;
      let isSuccess = false;
      
      if (response && typeof response === 'object') {
        // Check if response has success property (standard ApiResponse format)
        if (response.success === true && response.data) {
          responseData = response.data;
          isSuccess = true;
        }
        // Check if response is the data itself (direct response from backend)
        // This handles cases where backend returns TimeEntry directly without ApiResponse wrapper
        else if ((response as any)._id || (response as any).id) {
          // Cast to unknown first, then to TimeEntry to satisfy TypeScript
          responseData = response as unknown as TimeEntry;
          isSuccess = true;
        }
        // Check if response has a nested structure
        else if (response.data && ((response.data as any)._id || (response.data as any).id)) {
          responseData = response.data as TimeEntry;
          isSuccess = true;
        }
      }
      
      if (isSuccess && responseData) {
        setActiveTimeEntry(responseData);
        setIsRunning(true);
        setActiveTimer({
          id: responseData._id || responseData.id,
          project: selectedProject,
          task: taskToUse,
          startTime: Date.now()
        });
        console.log('✅ Timer started successfully!');
        alert('Timer started successfully!');
      } else {
        console.error('❌ Timer start failed - invalid response format:', response);
        const errorMsg = response?.error || response?.message || 'Invalid response format from server';
        alert(`Failed to start timer: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Timer start error details:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.response?.status);
      
      // Check if it's a network error (backend not running)
      if (error.message?.includes('Network Error') || 
          error.code === 'ERR_NETWORK' || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('fetch')) {
        console.log('🔧 Backend server not running, using offline mode');
        // Simulate successful timer start for testing
        const mockTimeEntry = {
          _id: 'mock-' + Date.now(),
          userId: userToUse._id,
          project: selectedProject,
          task: taskToUse,
          description,
          startTime: new Date().toISOString(),
          status: 'In Progress'
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
      
      // Handle specific error responses
      let errorMessage = 'Failed to start timer. ';
      
      if (error.response?.status === 400) {
        errorMessage += 'Invalid request data. Please check all fields.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage += 'API endpoint not found. Please check backend configuration.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
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
      
      // Handle offline mode for stop timer
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
        console.log('🔧 Backend server not running, stopping timer in offline mode');
        
        // Calculate duration and create mock completed entry
        const duration = Math.floor(elapsed / 60); // Convert to minutes
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
        
        // Notify parent component
        onAddEntry(mockCompletedEntry);
        
        alert(`⚠️ Timer stopped in offline mode. Duration: ${Math.floor(duration/60)}h ${duration%60}m`);
        return;
      }
      
      alert('Failed to stop timer. Please try again.');
    }
  };

  const saveManualEntry = async () => {
    if (!manualTime || !currentUser || !selectedProject || !description) {
      alert('Please fill in all required fields (project and description)');
      return;
    }
    
    // Task is optional for manual entries too
    let taskToUse = selectedTask;
    if (!taskToUse) {
      // Use the first available task as default, or create a valid ObjectId
      if (tasks.length > 0) {
        taskToUse = tasks[0]._id;
      } else {
        // Create a valid ObjectId for default task
        taskToUse = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      }
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
        task: taskToUse,
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
      
      // Handle offline mode for manual entry
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
        console.log('🔧 Backend server not running, saving manual entry in offline mode');
        
        // Recalculate time variables for offline mode
        const timeParts = manualTime.split(':');
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        const seconds = parseInt(timeParts[2]) || 0;
        const calculatedMinutes = hours * 60 + minutes + Math.round(seconds / 60);
        
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
          trackingType: timeframeTab.charAt(0).toUpperCase() + timeframeTab.slice(1),
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

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('🔍 Testing API connection...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/projects/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });
      
      console.log('🔍 API connection test response status:', response.status);
      console.log('🔍 API connection test response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ API connection successful');
        return true;
      } else {
        console.log('❌ API connection failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
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

        <Tabs value={timeframeTab} onValueChange={setTimeframeTab} className="mb-6">
          <TabsList className={`grid w-full ${allowedShiftTypes.length === 1 ? 'grid-cols-1' : `grid-cols-${allowedShiftTypes.length}`}`}>
            {allowedShiftTypes.includes('hourly') && (
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
            )}
            {allowedShiftTypes.includes('daily') && (
              <TabsTrigger value="daily">Daily</TabsTrigger>
            )}
            {allowedShiftTypes.includes('weekly') && (
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            )}
            {allowedShiftTypes.includes('monthly') && (
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            )}
          </TabsList>
          
          {/* Show shift assignment info if only one shift type is allowed */}
          {allowedShiftTypes.length === 1 && assignedShift && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Assigned Shift: {assignedShift.shiftType}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    {assignedShift.startTime} - {assignedShift.endTime}
                    {assignedShift.workingDays && assignedShift.workingDays.length > 0 && (
                      <span> • {assignedShift.workingDays.join(', ')}</span>
                    )}
                  </p>
                </div>
                <div className="text-blue-600 dark:text-blue-300">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
          
          {allowedShiftTypes.includes('hourly') && (
            <TabsContent value="hourly" className="mt-2 text-center text-sm text-gray-500">
              Track time by the hour - best for detailed work
            </TabsContent>
          )}
          {allowedShiftTypes.includes('daily') && (
            <TabsContent value="daily" className="mt-2 text-center text-sm text-gray-500">
              Track time by the day - for full day assignments
            </TabsContent>
          )}
          {allowedShiftTypes.includes('weekly') && (
            <TabsContent value="weekly" className="mt-2 text-center text-sm text-gray-500">
              Track time by the week - for long-running tasks
            </TabsContent>
          )}
          {allowedShiftTypes.includes('monthly') && (
            <TabsContent value="monthly" className="mt-2 text-center text-sm text-gray-500">
              Track time by the month - for project-level tracking
            </TabsContent>
          )}
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
