import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  billable: boolean;
}

export const StandaloneTimeTracker: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(entries));
  }, [entries]);

  // Timer logic
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

  const startTimer = () => {
    if (!project || !description) {
      alert('Please enter project and description');
      return;
    }
    setIsRunning(true);
    setStartTime(new Date());
    setElapsed(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (!startTime) return;
    
    const endTime = new Date();
    const duration = Math.floor(elapsed / 60); // Convert to minutes
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project,
      task: task || 'General',
      description,
      startTime,
      endTime,
      duration,
      billable
    };
    
    setEntries(prev => [newEntry, ...prev]);
    resetTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
    setProject('');
    setTask('');
    setDescription('');
  };

  const saveManualEntry = () => {
    if (!project || !description || !task) {
      alert('Please fill all fields');
      return;
    }

    const duration = parseInt(task) || 60; // Use task field as duration in minutes
    const now = new Date();
    const startTime = new Date(now.getTime() - duration * 60 * 1000);

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project,
      task: 'Manual Entry',
      description,
      startTime,
      endTime: now,
      duration,
      billable
    };

    setEntries(prev => [newEntry, ...prev]);
    setProject('');
    setTask('');
    setDescription('');
  };

  const exportEntries = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-entries-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Timer Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Standalone Time Tracker</h2>
        
        <div className="text-center mb-6">
          <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
            {formatTime(elapsed)}
          </div>
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button onClick={startTimer} className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <>
                <Button onClick={pauseTimer} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopTimer} className="bg-red-600 hover:bg-red-700">
                  <Square className="w-4 h-4 mr-2" />
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
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch checked={billable} onCheckedChange={setBillable} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={saveManualEntry} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button onClick={exportEntries} variant="outline">
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Entries</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No time entries yet</p>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{entry.project}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{entry.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.startTime.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
