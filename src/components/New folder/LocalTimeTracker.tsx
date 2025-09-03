import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface LocalTimeEntry {
  id: string;
  project: string;
  task: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  billable: boolean;
  date: string;
}

export const LocalTimeTracker: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [entries, setEntries] = useState<LocalTimeEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<Date | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('localTimeEntries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved entries:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('localTimeEntries', JSON.stringify(entries));
  }, [entries]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - currentSession.getTime()) / 1000);
        setElapsed(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!project.trim() || !description.trim()) {
      alert('Please enter project and description');
      return;
    }
    
    const now = new Date();
    setCurrentSession(now);
    setIsRunning(true);
    setElapsed(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (!currentSession) return;
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentSession.getTime()) / 1000);
    
    const newEntry: LocalTimeEntry = {
      id: Date.now().toString(),
      project: project.trim(),
      task: task.trim() || 'General Work',
      description: description.trim(),
      startTime: currentSession.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      billable,
      date: new Date().toISOString().split('T')[0]
    };
    
    setEntries(prev => [newEntry, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentSession(null);
    setProject('');
    setTask('');
    setDescription('');
  };

  const deleteEntry = (id: string) => {
    if (confirm('Delete this time entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Task', 'Description', 'Start Time', 'End Time', 'Duration (Hours)', 'Billable'];
    const csvData = entries.map(entry => [
      entry.date,
      entry.project,
      entry.task,
      entry.description,
      new Date(entry.startTime).toLocaleTimeString(),
      entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : '',
      (entry.duration / 3600).toFixed(2),
      entry.billable ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getTotalHours = () => {
    return entries.reduce((total, entry) => total + entry.duration, 0) / 3600;
  };

  const getTodayHours = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter(entry => entry.date === today)
      .reduce((total, entry) => total + entry.duration, 0) / 3600;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Today's Hours</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {getTodayHours().toFixed(1)}h
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-green-600 dark:text-green-400 text-sm font-medium">Total Hours</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {getTotalHours().toFixed(1)}h
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Entries</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {entries.length}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white mb-4">
            {formatTime(elapsed)}
          </div>
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button onClick={startTimer} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-5 h-5 mr-2" />
                Start Timer
              </Button>
            ) : (
              <>
                <Button onClick={pauseTimer} size="lg" variant="outline">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopTimer} size="lg" className="bg-red-600 hover:bg-red-700">
                  <Square className="w-5 h-5 mr-2" />
                  Stop & Save
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project *
            </label>
            <Input
              placeholder="Enter project name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task
            </label>
            <Input
              placeholder="Enter task name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <Textarea
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch checked={billable} onCheckedChange={setBillable} disabled={isRunning} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
          </div>
          
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Entries</h3>
        </div>
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No time entries yet. Start tracking your time!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Billable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {entry.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {entry.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {entry.task}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(entry.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={entry.billable ? "default" : "secondary"}>
                        {entry.billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEntry(entry.id)}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
