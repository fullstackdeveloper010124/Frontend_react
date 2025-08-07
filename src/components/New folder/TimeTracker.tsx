import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeTrackerProps {
  onAddEntry: (entry: any) => void;
  activeTimer: any;
  setActiveTimer: (timer: any) => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ onAddEntry, activeTimer, setActiveTimer }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [manualTime, setManualTime] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [timeframeTab, setTimeframeTab] = useState('hourly');

  const projects = [
    'Website Redesign',
    'Mobile App',
    'Marketing Campaign',
    'Internal Training',
    'Client Consultation'
  ];

  const tasks = [
    'Design',
    'Development',
    'Testing',
    'Meeting',
    'Documentation',
    'Research'
  ];

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
    if (!project || !task) {
      alert('Please select a project and task before starting the timer');
      return;
    }
    setIsRunning(true);
    setActiveTimer({ project, task, startTime: Date.now() });
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (elapsed > 0 && project && task) {
      const timeString = formatTime(elapsed);
      onAddEntry({
        project,
        task,
        time: timeString,
        status: 'Completed',
        billable,
        description,
        timeframe: timeframeTab
      });
    }
    setIsRunning(false);
    setElapsed(0);
    setActiveTimer(null);
    resetForm();
  };

  const saveManualEntry = () => {
    if (!project || !task || !manualTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    onAddEntry({
      project,
      task,
      time: manualTime,
      status: 'Completed',
      billable,
      description,
      timeframe: timeframeTab
    });
    
    resetForm();
  };

  const resetForm = () => {
    setProject('');
    setTask('');
    setDescription('');
    setManualTime('');
    setBillable(true);
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
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the hour - best for detailed work
          </TabsContent>
          <TabsContent value="daily" className="mt-2 text-center text-sm text-gray-500">
            Track time by the day - for full day assignments
          </TabsContent>
          <TabsContent value="weekly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the week - for long-running tasks
          </TabsContent>
          <TabsContent value="monthly" className="mt-2 text-center text-sm text-gray-500">
            Track time by the month - for project-level tracking
          </TabsContent>
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
              Project *
            </label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task *
            </label>
            <Select value={task} onValueChange={setTask}>
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
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
