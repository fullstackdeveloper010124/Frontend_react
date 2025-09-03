import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/EmployeeSidebar';
import { Header } from '@/components/navbar/EmployeeHeader';
import { NewTimeTracker } from '@/components/New folder/NewTimeTracker';
import { TimeEntries } from '@/components/New folder/TimeEntries';
import { WeeklySummary } from '@/components/New folder/WeeklySummary';
import { RecentActivity } from '@/components/New folder/RecentActivity';
import { UpcomingDeadlines } from '@/components/New folder/UpcomingDeadlines';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { timeEntryAPI, type TimeEntry } from '@/lib/api';



const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch user's time entries on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            console.log('Employee Dashboard - Current user:', user);
            
            // Check for active timer first
            if (user._id) {
              try {
                const activeResponse = await timeEntryAPI.getActiveByUser(user._id);
                if (activeResponse.success && activeResponse.data) {
                  setActiveTimer(activeResponse.data);
                  console.log('Found active timer:', activeResponse.data);
                }
              } catch (error) {
                console.log('No active timer found or error fetching:', error);
              }
            }
            
            // Fetch user's time entries
            const response = await timeEntryAPI.getAllTimeEntries({ userId: user._id });
            if (response.success && response.data) {
              setTimeEntries(response.data);
              console.log('Fetched time entries:', response.data.length);
            } else {
              console.log('No time entries found or API error');
              setTimeEntries([]);
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('user');
          }
        } else {
          console.log('No user found in localStorage');
          // Create a temporary employee user for testing
          const tempEmployee = {
            _id: 'temp-employee-123',
            name: 'Employee User',
            email: 'employee@example.com',
            role: 'employee',
            userType: 'TeamMember'
          };
          setCurrentUser(tempEmployee);
          localStorage.setItem('user', JSON.stringify(tempEmployee));
        }
      } catch (error) {
        console.error('Failed to initialize employee dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const addTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
    console.log('Added new time entry:', entry);
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      console.log('Deleting time entry:', id);
      const response = await timeEntryAPI.deleteTimeEntry(id);
      if (response.success) {
        setTimeEntries(prev => prev.filter(entry => entry._id !== id));
        console.log('Time entry deleted successfully');
      } else {
        console.error('Delete failed:', response.error);
        alert('Failed to delete time entry: ' + (response.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to delete time entry:', error);
      alert('Failed to delete time entry: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateTimeEntry = async (id: string, updatedEntry: Partial<TimeEntry>) => {
    try {
      console.log('Updating time entry:', id, updatedEntry);
      const response = await timeEntryAPI.updateTimeEntry(id, updatedEntry);
      if (response.success && response.data) {
        setTimeEntries(prev => prev.map(entry => 
          entry._id === id ? response.data! : entry
        ));
        console.log('Time entry updated successfully');
      } else {
        console.error('Update failed:', response.error);
        alert('Failed to update time entry: ' + (response.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to update time entry:', error);
      alert('Failed to update time entry: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle timer state changes from NewTimeTracker
  const handleTimerStart = (timerData: any) => {
    setActiveTimer(timerData);
    console.log('Timer started:', timerData);
  };

  const handleTimerStop = () => {
    setActiveTimer(null);
    console.log('Timer stopped');
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
            {/* Employee Dashboard Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {currentUser?.name || 'Employee'}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Track your time and manage your tasks efficiently
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    API Status: <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Backend: <span className="font-mono text-xs">localhost:5000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <NewTimeTracker 
                  onAddEntry={addTimeEntry}
                  activeTimer={activeTimer}
                  setActiveTimer={setActiveTimer}
                  currentUser={currentUser}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
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


