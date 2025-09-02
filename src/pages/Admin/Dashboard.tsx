import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { Dashboard } from '@/components/New folder/Dashboard';
import { TimeTracker } from '@/components/New folder/TimeTracker';
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

  // Fetch all time entries on component mount (admin can see all entries)
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
          } catch (parseError) {
            console.error('❌ Error parsing user data:', parseError);
            localStorage.removeItem('user');
          }
        } else {
          // Create a temporary admin user for testing
          const tempAdmin = {
            _id: 'temp-admin-123',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          };
          setCurrentUser(tempAdmin);
          localStorage.setItem('user', JSON.stringify(tempAdmin));
        }
        
        // Fetch all time entries (admin view)
        const response = await timeEntryAPI.getAllTimeEntries();
        if (response.success && response.data) {
          setTimeEntries(response.data);
        } else {
          // Fallback sample data for admin dashboard
          const sampleEntries: TimeEntry[] = [
            {
              _id: 'sample-1',
              userId: 'user-1',
              project: 'project-1',
              task: 'task-1',
              description: 'Working on the hero section and navigation',
              startTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
              endTime: new Date().toISOString(),
              duration: 210, // 3.5 hours in minutes
              billable: true,
              status: 'Completed',
              trackingType: 'Hourly',
              isManualEntry: false,
              hourlyRate: 50,
              totalAmount: 175,
              createdAt: new Date().toISOString()
            },
            {
              _id: 'sample-2',
              userId: 'user-2',
              project: 'project-2',
              task: 'task-4',
              description: 'Integrated user authentication endpoints',
              startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              endTime: new Date().toISOString(),
              duration: 120, // 2 hours in minutes
              billable: true,
              status: 'Completed',
              trackingType: 'Hourly',
              isManualEntry: false,
              hourlyRate: 60,
              totalAmount: 120,
              createdAt: new Date().toISOString()
            }
          ];
          setTimeEntries(sampleEntries);
        }
      } catch (error) {
        console.error('Failed to fetch time entries:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const addTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      const response = await timeEntryAPI.deleteTimeEntry(id);
      if (response.success) {
        setTimeEntries(prev => prev.filter(entry => entry._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete time entry:', error);
      // Fallback for offline mode
      setTimeEntries(prev => prev.filter(entry => entry._id !== id));
    }
  };

  const updateTimeEntry = async (id: string, updatedEntry: Partial<TimeEntry>) => {
    try {
      const response = await timeEntryAPI.updateTimeEntry(id, updatedEntry);
      if (response.success && response.data) {
        setTimeEntries(prev => prev.map(entry => 
          entry._id === id ? response.data! : entry
        ));
      }
    } catch (error) {
      console.error('Failed to update time entry:', error);
      // Fallback for offline mode
      setTimeEntries(prev => prev.map(entry => 
        entry._id === id ? { ...entry, ...updatedEntry } : entry
      ));
    }
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
            <Dashboard timeEntries={timeEntries} />
            
            {/* Admin Time Tracking Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Admin Time Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Track your administrative tasks and manage team time entries
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TimeTracker 
                  onAddEntry={addTimeEntry}
                  activeTimer={activeTimer}
                  setActiveTimer={setActiveTimer}
                />
                <TimeEntries 
                  entries={timeEntries}
                  onDelete={deleteTimeEntry}
                  onUpdate={updateTimeEntry}
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
