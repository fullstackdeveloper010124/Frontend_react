import React from "react";
import { MoreHorizontal, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type TimeEntry } from "@/lib/api";

interface TimeEntriesProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, entry: Partial<TimeEntry>) => void;
  loading?: boolean;
}

export const TimeEntries: React.FC<TimeEntriesProps> = ({
  entries,
  onDelete,
  onUpdate,
  loading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "Paused":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const formatDuration = (seconds: number) => {
    // Duration is always in seconds from the backend
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProjectName = (project: any) => {
    return typeof project === "string"
      ? project
      : project?.name || "Unknown Project";
  };

  const getTaskName = (task: any) => {
    return typeof task === "string" ? task : task?.name || "Unknown Task";
  };

  const getUserName = (user: any) => {
    return typeof user === "string" ? user : user?.name || "Current User";
  };

  const totalTime = entries.reduce((acc, entry) => {
    return acc + entry.duration / 3600; // Convert seconds to hours
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Time Entries
          </h3>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Bulk Edit</DropdownMenuItem>
                <DropdownMenuItem>Filter Entries</DropdownMenuItem>
                <DropdownMenuItem>Export CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          <div>Project</div>
          <div>Task</div>
          <div>Employee</div>
          <div>Time</div>
          <div>Status</div>
          <div>Billable</div>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="md:col-span-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getProjectName(entry.project)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                  {getTaskName(entry.task)} • {getUserName(entry.userId)}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {getTaskName(entry.task)}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {getUserName(entry.userId)}
                </div>
              </div>

              <div>
                <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                  {formatDuration(entry.duration)}
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    entry.status
                  )}`}
                >
                  {entry.status}
                </span>
              </div>

              <div className="flex items-center">
                {entry.billable ? (
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-xs">Billable</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Non-billable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total hours today
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalTime.toFixed(1)} hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
