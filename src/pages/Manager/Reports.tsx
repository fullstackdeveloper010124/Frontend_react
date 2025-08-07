import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportTimeframe, setExportTimeframe] = useState('last-7-days');

  const handleExportReport = () => {
    console.log('Exporting report:', { format: exportFormat, timeframe: exportTimeframe });
    // Here you would typically generate the export
    setIsExportOpen(false);
    toast({
      title: "Report Export Started",
      description: `Your ${exportFormat.toUpperCase()} report is being generated.`
    });
  };

  const reportData = [
    { name: 'Website Redesign', hours: 120, percentage: 35, color: 'bg-blue-500' },
    { name: 'Mobile App', hours: 100, percentage: 29, color: 'bg-green-500' },
    { name: 'Marketing Campaign', hours: 80, percentage: 23, color: 'bg-purple-500' },
    { name: 'Internal Training', hours: 45, percentage: 13, color: 'bg-yellow-500' }
  ];

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
                <p className="text-gray-600 dark:text-gray-400">Analyze your time tracking data and productivity</p>
              </div>
              <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Format</label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Period</label>
                      <Select value={exportTimeframe} onValueChange={setExportTimeframe}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleExportReport}>
                        Export
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>All Projects</option>
                    <option>Billable Only</option>
                    <option>Non-billable Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Total Hours</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">345</h3>
                    <p className="text-green-500 text-sm mt-1">+12% from last period</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Billable Hours</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">280</h3>
                    <p className="text-green-500 text-sm mt-1">81% billable rate</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Projects</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</h3>
                    <p className="text-blue-500 text-sm mt-1">5 active projects</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Hours/Day</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">7.8</h3>
                    <p className="text-yellow-500 text-sm mt-1">Above target</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Time by Project Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time by Project</h3>
                <div className="space-y-4">
                  {reportData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.hours}h ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Trends</h3>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Reports;
