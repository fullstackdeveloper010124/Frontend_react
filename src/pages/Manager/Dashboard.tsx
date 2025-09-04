import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar/ManagerSidebar';
import { Header } from '@/components/navbar/ManagerHeader';
import { ManagerDashboardHeader } from '@/components/New folder/ManagerDashboardHeader';
import { ManagerTeamOverview } from '@/components/New folder/ManagerTeamOverview';
import { ManagerProjectStatus } from '@/components/New folder/ManagerProjectStatus';
import { ManagerAnalytics } from '@/components/New folder/ManagerAnalytics';
import { ManagerQuickActions } from '@/components/New folder/ManagerQuickActions';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { toast } from '@/hooks/use-toast';
import API_URLS from '@/lib/api';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Sample data for manager dashboard
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      avatar: '',
      status: 'online' as const,
      hoursToday: 7.5,
      hoursThisWeek: 38,
      tasksCompleted: 12,
      tasksPending: 3,
      productivity: 92,
      currentTask: 'Homepage Design'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Backend Developer',
      avatar: '',
      status: 'online' as const,
      hoursToday: 8,
      hoursThisWeek: 40,
      tasksCompleted: 15,
      tasksPending: 2,
      productivity: 88,
      currentTask: 'API Integration'
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'UI/UX Designer',
      avatar: '',
      status: 'away' as const,
      hoursToday: 6,
      hoursThisWeek: 32,
      tasksCompleted: 8,
      tasksPending: 4,
      productivity: 85,
      currentTask: 'User Research'
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      role: 'DevOps Engineer',
      avatar: '',
      status: 'offline' as const,
      hoursToday: 0,
      hoursThisWeek: 35,
      tasksCompleted: 10,
      tasksPending: 1,
      productivity: 95
    }
  ];

  const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'active' as const,
      progress: 75,
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      budget: 50000,
      spent: 35000,
      teamMembers: 4,
      hoursLogged: 280,
      estimatedHours: 400,
      priority: 'high' as const,
      manager: 'John Manager'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'iOS and Android mobile application',
      status: 'active' as const,
      progress: 45,
      startDate: '2024-01-15',
      endDate: '2024-04-30',
      budget: 80000,
      spent: 25000,
      teamMembers: 3,
      hoursLogged: 180,
      estimatedHours: 600,
      priority: 'high' as const,
      manager: 'John Manager'
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Q1 digital marketing campaign',
      status: 'on-hold' as const,
      progress: 30,
      startDate: '2024-01-10',
      endDate: '2024-03-31',
      budget: 25000,
      spent: 8000,
      teamMembers: 2,
      hoursLogged: 60,
      estimatedHours: 200,
      priority: 'medium' as const,
      manager: 'John Manager'
    }
  ];

  const analyticsData = {
    timeTracking: {
      thisWeek: 145,
      lastWeek: 132,
      billableHours: 120,
      nonBillableHours: 25
    },
    productivity: {
      teamAverage: 90,
      topPerformer: 'Alex Rodriguez',
      improvementAreas: ['Code review process', 'Meeting efficiency', 'Documentation']
    },
    projects: {
      onTrack: 2,
      delayed: 0,
      completed: 1
    },
    revenue: {
      thisMonth: 45000,
      lastMonth: 42000,
      projected: 48000
    }
  };

  // Event handlers
  const handleMemberClick = (memberId: string) => {
    toast({
      title: "Team Member Details",
      description: `Opening details for member ${memberId}`
    });
  };

  const handleMessageMember = (memberId: string) => {
    toast({
      title: "Send Message",
      description: `Opening message dialog for member ${memberId}`
    });
  };

  const handleProjectClick = (projectId: string) => {
    toast({
      title: "Project Details",
      description: `Opening project details for ${projectId}`
    });
  };

  const handleUpdateProject = (projectId: string, updates: any) => {
    toast({
      title: "Project Updated",
      description: `Project ${projectId} has been updated`
    });
  };

  // Quick action handlers
  const handleCreateProject = () => {
    toast({
      title: "Create Project",
      description: "Opening new project dialog..."
    });
  };

  const handleAddTeamMember = () => {
    toast({
      title: "Add Team Member",
      description: "Opening team member invitation..."
    });
  };

  const handleScheduleMeeting = () => {
    toast({
      title: "Schedule Meeting",
      description: "Opening calendar to schedule meeting..."
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "Send Message",
      description: "Opening messaging interface..."
    });
  };

  const handleCreateReport = () => {
    toast({
      title: "Create Report",
      description: "Opening report builder..."
    });
  };

  const handleAssignTask = () => {
    toast({
      title: "Assign Task",
      description: "Opening task assignment dialog..."
    });
  };

  const handleTrackTime = () => {
    toast({
      title: "Track Time",
      description: "Opening time tracking interface..."
    });
  };

  const handleViewReports = () => {
    toast({
      title: "View Reports",
      description: "Navigating to reports page..."
    });
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
            {/* Manager Dashboard Header */}
            <ManagerDashboardHeader
              teamSize={teamMembers.length}
              activeProjects={projects.filter(p => p.status === 'active').length}
              totalHoursThisWeek={analyticsData.timeTracking.thisWeek}
              completedTasks={teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
              pendingTasks={teamMembers.reduce((sum, member) => sum + member.tasksPending, 0)}
              teamProductivity={analyticsData.productivity.teamAverage}
              weeklyRevenue={analyticsData.revenue.thisMonth / 4}
              currentWeek="January 1-7, 2024"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Team and Projects */}
              <div className="lg:col-span-2 space-y-6">
                <ManagerTeamOverview
                  teamMembers={teamMembers}
                  onMemberClick={handleMemberClick}
                  onMessageMember={handleMessageMember}
                />
                
                <ManagerProjectStatus
                  projects={projects}
                  onProjectClick={handleProjectClick}
                  onUpdateProject={handleUpdateProject}
                />
              </div>
              
              {/* Right Column - Analytics and Quick Actions */}
              <div className="space-y-6">
                <ManagerAnalytics
                  data={analyticsData}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
                
                <ManagerQuickActions
                  onCreateProject={handleCreateProject}
                  onAddTeamMember={handleAddTeamMember}
                  onScheduleMeeting={handleScheduleMeeting}
                  onSendMessage={handleSendMessage}
                  onCreateReport={handleCreateReport}
                  onAssignTask={handleAssignTask}
                  onTrackTime={handleTrackTime}
                  onViewReports={handleViewReports}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
