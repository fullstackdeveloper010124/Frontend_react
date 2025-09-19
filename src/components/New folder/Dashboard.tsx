import React from "react";
import {
  Clock,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import { type TimeEntry } from "@/lib/api";

interface DashboardProps {
  timeEntries: TimeEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ timeEntries }) => {
  const getProjectName = (project: any) => {
    return typeof project === "string"
      ? project
      : project?.name || "Unknown Project";
  };

  const totalHours = timeEntries.reduce((acc, entry) => {
    return acc + entry.duration / 3600; // Convert seconds to hours
  }, 0);

  const billableHours = timeEntries
    .filter((entry) => entry.billable)
    .reduce((acc, entry) => {
      return acc + entry.duration / 3600; // Convert seconds to hours
    }, 0);

  const activeProjects = [
    ...new Set(timeEntries.map((entry) => getProjectName(entry.project))),
  ].length;

  // Get unique projects with their time data
  const projectSummary = timeEntries.reduce((acc, entry) => {
    const projectName = getProjectName(entry.project);
    if (!acc[projectName]) {
      acc[projectName] = {
        name: projectName,
        totalHours: 0,
        billableHours: 0,
        entryCount: 0,
      };
    }
    acc[projectName].totalHours += entry.duration / 3600;
    if (entry.billable) {
      acc[projectName].billableHours += entry.duration / 3600;
    }
    acc[projectName].entryCount += 1;
    return acc;
  }, {} as Record<string, { name: string; totalHours: number; billableHours: number; entryCount: number }>);

  const projectList = Object.values(projectSummary);

  // Calculate revenue and productivity metrics
  const totalRevenue = timeEntries
    .filter((entry) => entry.billable && entry.totalAmount)
    .reduce((acc, entry) => acc + (entry.totalAmount || 0), 0);

  const averageHourlyRate =
    billableHours > 0 ? totalRevenue / billableHours : 0;
  const productivityScore =
    totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
  const uniqueUsers = [...new Set(timeEntries.map((entry) => entry.userId))]
    .length;

  const stats = [
    {
      title: "Total Team Hours",
      value: totalHours.toFixed(1),
      change: "+12.5% from last week",
      changeType: "positive",
      icon: Clock,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/20",
    },
    {
      title: "Active Team Members",
      value: uniqueUsers.toString(),
      change: `${activeProjects} projects active`,
      changeType: "neutral",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-500/20",
    },
    {
      title: "Revenue Generated",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+8.3% from last week",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-500/10",
      borderColor: "border-green-200 dark:border-green-500/20",
    },
    {
      title: "Productivity Score",
      value: `${productivityScore.toFixed(1)}%`,
      change: `${billableHours.toFixed(1)}h billable`,
      changeType:
        productivityScore >= 75
          ? "positive"
          : productivityScore >= 50
          ? "warning"
          : "negative",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Welcome back! Here's your team's performance overview.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Date().toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-blue-200 text-sm">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.title}
                  </p>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stat.changeType === "warning"
                      ? "text-amber-600 dark:text-amber-400"
                      : stat.changeType === "negative"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Overview */}
      {projectList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Project Overview
            </h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectList.slice(0, 6).map((project, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate">
                  {project.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Hours:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Billable:
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {project.billableHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Entries:
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {project.entryCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
