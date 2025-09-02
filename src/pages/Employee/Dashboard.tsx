import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/EmployeeSidebar';
import { Header } from '@/components/navbar/EmployeeHeader';
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

  // Fetch user's time entries on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          
          // Fetch user's time entries
          const response = await timeEntryAPI.getAllTimeEntries({ userId: user._id });
          if (response.success && response.data) {
            setTimeEntries(response.data);
          }
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


