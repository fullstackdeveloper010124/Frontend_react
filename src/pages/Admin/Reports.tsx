import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { ReportsHeader } from '@/components/New folder/ReportsHeader';
import { ReportsFilters } from '@/components/New folder/ReportsFilters';
import { ReportsCharts } from '@/components/New folder/ReportsCharts';
import { ReportsTable } from '@/components/New folder/ReportsTable';
import { ReportsExport } from '@/components/New folder/ReportsExport';
import { ReportTemplates } from '@/components/New folder/ReportTemplates';
import { toast } from '@/hooks/use-toast';
import { Clock, BarChart3, DollarSign } from 'lucide-react';

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState('projects');

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: 'last-30-days',
    customStartDate: '',
    customEndDate: '',
    projects: [],
    teamMembers: [],
    reportType: 'all',
    billableFilter: 'all',
    searchQuery: ''
  });

  // Sample data
  const projectData = [
    { name: 'Website Redesign', value: 120, percentage: 35, color: 'bg-blue-500' },
    { name: 'Mobile App Development', value: 100, percentage: 29, color: 'bg-green-500' },
    { name: 'Marketing Campaign', value: 80, percentage: 23, color: 'bg-purple-500' },
    { name: 'Internal Training', value: 45, percentage: 13, color: 'bg-yellow-500' }
  ];

  const teamData = [
    { name: 'John Smith', value: 42, color: 'bg-blue-500' },
    { name: 'Sarah Johnson', value: 38, color: 'bg-green-500' },
    { name: 'Mike Wilson', value: 35, color: 'bg-purple-500' },
    { name: 'Emily Davis', value: 32, color: 'bg-orange-500' },
    { name: 'David Brown', value: 28, color: 'bg-red-500' },
    { name: 'Lisa Anderson', value: 25, color: 'bg-indigo-500' }
  ];

  const timeSeriesData = [
    { date: '2024-01-01', hours: 8.5, billableHours: 7.2, revenue: 576 },
    { date: '2024-01-02', hours: 7.8, billableHours: 6.8, revenue: 544 },
    { date: '2024-01-03', hours: 9.2, billableHours: 8.1, revenue: 648 },
    { date: '2024-01-04', hours: 8.0, billableHours: 7.0, revenue: 560 },
    { date: '2024-01-05', hours: 8.7, billableHours: 7.5, revenue: 600 },
    { date: '2024-01-06', hours: 6.5, billableHours: 5.8, revenue: 464 },
    { date: '2024-01-07', hours: 7.3, billableHours: 6.2, revenue: 496 }
  ];

  const tableData = [
    {
      id: '1',
      date: '2024-01-05',
      project: 'Website Redesign',
      task: 'Homepage Layout Design',
      user: 'John Smith',
      hours: 8.5,
      billable: true,
      rate: 80,
      amount: 680,
      status: 'completed' as const,
      description: 'Created responsive homepage layout with modern design principles'
    },
    {
      id: '2',
      date: '2024-01-05',
      project: 'Mobile App Development',
      task: 'User Authentication',
      user: 'Sarah Johnson',
      hours: 6.0,
      billable: true,
      rate: 75,
      amount: 450,
      status: 'in-progress' as const,
      description: 'Implementing OAuth integration and user session management'
    },
    {
      id: '3',
      date: '2024-01-04',
      project: 'Marketing Campaign',
      task: 'Content Strategy',
      user: 'Mike Wilson',
      hours: 4.5,
      billable: false,
      rate: 0,
      amount: 0,
      status: 'completed' as const,
      description: 'Developed comprehensive content strategy for Q1 campaign'
    },
    {
      id: '4',
      date: '2024-01-04',
      project: 'Website Redesign',
      task: 'Database Optimization',
      user: 'Emily Davis',
      hours: 7.2,
      billable: true,
      rate: 85,
      amount: 612,
      status: 'completed' as const,
      description: 'Optimized database queries and improved performance by 40%'
    },
    {
      id: '5',
      date: '2024-01-03',
      project: 'Internal Training',
      task: 'React Workshop',
      user: 'David Brown',
      hours: 3.0,
      billable: false,
      rate: 0,
      amount: 0,
      status: 'pending' as const,
      description: 'Conducted React best practices workshop for junior developers'
    }
  ];

  const availableProjects = ['Website Redesign', 'Mobile App Development', 'Marketing Campaign', 'Internal Training'];
  const availableTeamMembers = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'David Brown', 'Lisa Anderson'];
  const availableFields = ['Date', 'Project', 'Task', 'User', 'Hours', 'Rate', 'Amount', 'Status', 'Description'];

  // Report templates data
  const [reportTemplates, setReportTemplates] = useState([
    {
      id: '1',
      name: 'Weekly Time Summary',
      description: 'Comprehensive weekly time tracking report with project breakdowns',
      type: 'time-tracking' as const,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      lastUsed: '2024-01-05',
      isStarred: true,
      filters: { dateRange: 'last-7-days', billableFilter: 'all' },
      charts: ['projects', 'timeline']
    },
    {
      id: '2',
      name: 'Monthly Productivity Report',
      description: 'Detailed productivity analysis with team performance metrics',
      type: 'productivity' as const,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      lastUsed: '2024-01-03',
      isStarred: false,
      filters: { dateRange: 'last-30-days', reportType: 'productivity' },
      charts: ['team', 'productivity']
    },
    {
      id: '3',
      name: 'Billing & Revenue Analysis',
      description: 'Financial overview with billable hours and revenue tracking',
      type: 'billing' as const,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      lastUsed: '2024-01-01',
      isStarred: true,
      filters: { dateRange: 'last-30-days', billableFilter: 'billable' },
      charts: ['projects', 'timeline']
    }
  ]);

  // Event handlers
  const handleExportReport = (options: any) => {
    console.log('Exporting report:', options);
    toast({
      title: "Report Export Started",
      description: `Your ${options.format.toUpperCase()} report is being generated.`
    });
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    console.log('Sorting by:', field, direction);
  };

  const handleFilter = (newFilters: any) => {
    console.log('Applying filters:', newFilters);
  };

  const handleEdit = (id: string) => {
    console.log('Editing entry:', id);
    toast({
      title: "Edit Entry",
      description: "Opening edit dialog..."
    });
  };

  const handleDelete = (id: string) => {
    console.log('Deleting entry:', id);
    toast({
      title: "Entry Deleted",
      description: "The time entry has been removed."
    });
  };

  const handleView = (id: string) => {
    console.log('Viewing entry:', id);
    toast({
      title: "View Details",
      description: "Opening detailed view..."
    });
  };

  // Template handlers
  const handleUseTemplate = (template: any) => {
    setFilters(template.filters);
    setSelectedChart(template.charts[0] || 'projects');
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template settings.`
    });
  };

  const handleSaveTemplate = (template: any) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      lastUsed: new Date().toISOString().split('T')[0]
    };
    setReportTemplates(prev => [...prev, newTemplate]);
    toast({
      title: "Template Saved",
      description: `"${template.name}" has been saved as a template.`
    });
  };

  const handleEditTemplate = (id: string) => {
    console.log('Editing template:', id);
    toast({
      title: "Edit Template",
      description: "Opening template editor..."
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setReportTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "The template has been removed."
    });
  };

  const handleStarTemplate = (id: string, starred: boolean) => {
    setReportTemplates(prev => 
      prev.map(t => t.id === id ? { ...t, isStarred: starred } : t)
    );
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
            {/* Modern Reports Header */}
            <ReportsHeader
              totalHours={345}
              billableHours={280}
              totalRevenue={28500}
              activeProjects={8}
              teamMembers={6}
              productivityScore={94}
              dateRange="Last 30 days"
            />

            {/* Advanced Filters */}
            <ReportsFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableProjects={availableProjects}
              availableTeamMembers={availableTeamMembers}
            />

            <div className="space-y-6">
            {/* Report Templates Section */}
            <ReportTemplates
              templates={reportTemplates}
              onUseTemplate={handleUseTemplate}
              onSaveTemplate={handleSaveTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onStarTemplate={handleStarTemplate}
            />

            {/* Charts Section */}
            <ReportsCharts 
              projectData={projectData}
              teamData={teamData}
              timeSeriesData={timeSeriesData}
              selectedChart={selectedChart}
              onChartChange={setSelectedChart}
            />

            {/* Reports Table */}
            <ReportsTable 
              data={tableData}
              onSort={handleSort}
              onFilter={handleFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onExport={() => setIsExportOpen(true)}
            />
          </div>

            {/* Export Modal */}
            <ReportsExport
              isOpen={isExportOpen}
              onClose={() => setIsExportOpen(false)}
              onExport={handleExportReport}
              availableFields={availableFields}
            />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reports;
