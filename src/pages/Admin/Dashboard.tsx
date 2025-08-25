
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { Dashboard } from '@/components/New folder/Dashboard';
import { TimeTracker } from '@/components/New folder/TimeTracker';
import { TimeEntries } from '@/components/New folder/TimeEntries';
import { WeeklySummary } from '@/components/New folder/WeeklySummary';
import { RecentActivity } from '@/components/New folder/RecentActivity';
import { UpcomingDeadlines } from '@/components/New folder/UpcomingDeadlines';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import API_URLS from '@/lib/api';


const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([
    { 
      id: 1, 
      project: "Website Redesign", 
      task: "Homepage Design", 
      time: "3:30:00", 
      status: "In Progress", 
      billable: true, 
      date: new Date(),
      description: "Working on the hero section and navigation"
    },
    { 
      id: 2, 
      project: "Mobile App", 
      task: "API Integration", 
      time: "2:00:00", 
      status: "Completed", 
      billable: true, 
      date: new Date(),
      description: "Integrated user authentication endpoints"
    },
    { 
      id: 3, 
      project: "Marketing Campaign", 
      task: "Campaign Setup", 
      time: "1:30:00", 
      status: "Pending", 
      billable: false, 
      date: new Date(),
      description: "Setting up Google Ads campaign"
    },
    { 
      id: 4, 
      project: "Internal Training", 
      task: "Team Meeting", 
      time: "0:30:00", 
      status: "Completed", 
      billable: false, 
      date: new Date(),
      description: "Weekly team standup meeting"
    }
  ]);

  const addTimeEntry = (entry) => {
    setTimeEntries(prev => [...prev, { ...entry, id: Date.now(), date: new Date() }]);
  };

  const deleteTimeEntry = (id) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateTimeEntry = (id, updatedEntry) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
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
