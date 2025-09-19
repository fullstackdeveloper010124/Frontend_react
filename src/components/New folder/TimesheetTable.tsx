import React, { useState } from "react";
import {
  Clock,
  User,
  Calendar,
  Briefcase,
  FileText,
  MoreVertical,
  Edit3,
  Trash2,
  Play,
  Pause,
  Square,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";
import { type TimeEntry } from "@/lib/api";

interface TimesheetTableProps {
  timeEntries: TimeEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
  onToggleTimer?: (entry: TimeEntry) => void;
  getUserName: (user: any) => string;
  formatDuration: (minutes: number) => string;
  formatRealTimeTimer: (startTime: string) => string;
  formatDate: (dateString: string) => string;
  getProjectName: (project: any) => string;
  getTaskName: (task: any) => string;
  currentTime: Date;
}

type SortField = "date" | "user" | "project" | "duration" | "status";
type SortDirection = "asc" | "desc";

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  timeEntries,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onToggleTimer,
  getUserName,
  formatDuration,
  formatRealTimeTimer,
  formatDate,
  getProjectName,
  getTaskName,
  currentTime,
}) => {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEntries = [...timeEntries].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case "date":
        aValue = new Date(a.createdAt || "");
        bValue = new Date(b.createdAt || "");
        break;
      case "user":
        aValue = getUserName(a.userId);
        bValue = getUserName(b.userId);
        break;
      case "project":
        aValue = getProjectName(a.project);
        bValue = getProjectName(b.project);
        break;
      case "duration":
        aValue = a.duration || 0;
        bValue = b.duration || 0;
        break;
      case "status":
        aValue = a.status || "";
        bValue = b.status || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSelectEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedEntries.size === timeEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(timeEntries.map((entry) => entry._id)));
    }
  };

  const SortButton: React.FC<{
    field: SortField;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        ))}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-500 dark:text-gray-400">
            Loading timesheets...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Entries ({timeEntries.length})
          </h3>

          {selectedEntries.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntries.size} selected
              </span>
              <button className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors text-sm">
                Delete Selected
              </button>
              <button className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors text-sm">
                Export Selected
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedEntries.size === timeEntries.length &&
                    timeEntries.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs">
                <SortButton field="user">User</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs">
                <SortButton field="date">Date</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs">
                <SortButton field="project">Project</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs">
                <SortButton field="duration">Duration</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Billable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {timeEntries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No time entries found
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Start tracking time to see entries here
                  </p>
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry) => (
                <React.Fragment key={entry._id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry._id)}
                        onChange={() => toggleSelectEntry(entry._id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {getUserName(entry.userId).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getUserName(entry.userId)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(entry.createdAt || "")}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getProjectName(entry.project)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {getTaskName(entry.task)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                      <div
                        className="truncate"
                        title={entry.description || "No description"}
                      >
                        {entry.description || "No description"}
                      </div>
                      {entry.description && entry.description.length > 50 && (
                        <button
                          onClick={() =>
                            setExpandedEntry(
                              expandedEntry === entry._id ? null : entry._id
                            )
                          }
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1"
                        >
                          {expandedEntry === entry._id
                            ? "Show less"
                            : "Show more"}
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {entry.status === "In Progress" ? (
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                            {formatRealTimeTimer(entry.startTime)}
                          </span>
                        ) : (
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {entry.duration && entry.duration > 0
                              ? formatDuration(entry.duration)
                              : entry.startTime && entry.endTime
                              ? formatDuration(
                                  Math.floor(
                                    (new Date(entry.endTime).getTime() -
                                      new Date(entry.startTime).getTime()) /
                                      1000
                                  )
                                )
                              : "00:00:00"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          entry.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
                            : entry.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400"
                        }`}
                      >
                        {entry.status === "In Progress" && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                        )}
                        {entry.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          entry.billable
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"
                        }`}
                      >
                        {entry.billable ? "💰 Billable" : "Non-billable"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {entry.status === "In Progress" ? (
                          <button
                            onClick={() => onToggleTimer?.(entry)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Stop Timer"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleTimer?.(entry)}
                            className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Start Timer"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onEdit?.(entry)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete?.(entry._id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedEntry === entry._id && entry.description && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-4 bg-gray-50 dark:bg-gray-700"
                      >
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Full Description:</strong> {entry.description}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
