import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar/AdminSidebar";
import { Header } from "@/components/navbar/AdminHeader";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { ReportsHeader } from "@/components/New folder/ReportsHeader";
import { ReportsFilters } from "@/components/New folder/ReportsFilters";
import { ReportsCharts } from "@/components/New folder/ReportsCharts";
import { ReportsTable } from "@/components/New folder/ReportsTable";
import { ReportsExport } from "@/components/New folder/ReportsExport";
import { ReportTemplates } from "@/components/New folder/ReportTemplates";
import { toast } from "@/hooks/use-toast";
import { Clock, BarChart3, DollarSign } from "lucide-react";
import {
  timeEntryAPI,
  teamAPI,
  projectAPI,
  type TimeEntry,
  type TeamMember,
  type Project,
} from "@/lib/api";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for real data
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  interface ProjectDataItem {
    name: string;
    value: number;
    percentage: number;
    color: string;
    activeEmployees: number;
    shift: string;
  }

  interface TeamDataItem {
    name: string;
    value: number;
    color: string;
    shift: string;
    status: string;
    totalProjects: number;
    efficiency: number;
  }

  interface WorkPatternDataItem {
    id: string;
    employee: string;
    shift: string;
    workingDays: string;
    hoursPerDay: number;
    totalHoursThisWeek: number;
    totalHoursThisMonth: number;
    projects: string[];
    lastLogin: string;
    productivity: number;
    overtimeHours: number;
    status: string;
  }

  interface TableDataItem {
    id: string;
    date: string;
    day: string;
    project: string;
    task: string;
    user: string;
    shiftType: string;
    hours: number;
    billable: boolean;
    rate: number;
    amount: number;
    status: "in-progress" | "completed" | "pending";
    description: string;
  }

  const [projectData, setProjectData] = useState<ProjectDataItem[]>([]);
  const [teamData, setTeamData] = useState<TeamDataItem[]>([]);
  const [workPatternData, setWorkPatternData] = useState<WorkPatternDataItem[]>(
    []
  );
  const [tableData, setTableData] = useState<TableDataItem[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: "last-30-days",
    customStartDate: "",
    customEndDate: "",
    projects: [],
    teamMembers: [],
    reportType: "all",
    billableFilter: "all",
    searchQuery: "",
  });

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data
        const [timeEntriesRes, teamMembersRes, projectsRes] = await Promise.all(
          [
            timeEntryAPI.getAllTimeEntries(),
            teamAPI.getAllTeam(),
            projectAPI.getAllProjects(),
          ]
        );

        if (timeEntriesRes.success && timeEntriesRes.data) {
          setTimeEntries(timeEntriesRes.data);
        }

        if (teamMembersRes.success && teamMembersRes.data) {
          setTeamMembers(teamMembersRes.data);
        }

        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
        }
      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError("Failed to load reports data");
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data when raw data changes
  const processDataForReports = useCallback(() => {
    if (
      timeEntries.length === 0 ||
      teamMembers.length === 0 ||
      projects.length === 0
    ) {
      return;
    }

    // Process project data
    const projectStats: ProjectDataItem[] = projects.map((project) => {
      const projectEntries = timeEntries.filter((entry) =>
        typeof entry.project === "object"
          ? entry.project._id === project._id
          : entry.project === project._id
      );
      const totalHours =
        projectEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
        3600; // Convert seconds to hours
      const activeEmployees = new Set(
        projectEntries
          .filter((entry) => entry.userId) // Filter out null/undefined userIds
          .map((entry) =>
            typeof entry.userId === "object" && entry.userId
              ? entry.userId._id
              : entry.userId
          )
          .filter(Boolean) // Remove any remaining null/undefined values
      ).size;

      return {
        name: project.name,
        value: Math.round(totalHours),
        percentage: 0, // Will calculate after getting total
        color: getProjectColor(project._id),
        activeEmployees,
        shift: project.priority || "Daily", // Use priority as shift type for now
      };
    });

    // Calculate percentages
    const totalProjectHours = projectStats.reduce((sum, p) => sum + p.value, 0);
    projectStats.forEach((project) => {
      project.percentage =
        totalProjectHours > 0
          ? Math.round((project.value / totalProjectHours) * 100)
          : 0;
    });

    setProjectData(projectStats);

    // Process team data
    const teamStats: TeamDataItem[] = teamMembers.map((member) => {
      const memberEntries = timeEntries.filter(
        (entry) =>
          entry.userId &&
          (typeof entry.userId === "object"
            ? entry.userId._id === member._id
            : entry.userId === member._id)
      );
      const totalHours =
        memberEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
        3600;
      const memberProjects = new Set(
        memberEntries
          .filter((entry) => entry.project) // Filter out null/undefined projects
          .map((entry) =>
            typeof entry.project === "object" && entry.project
              ? entry.project._id
              : entry.project
          )
          .filter(Boolean) // Remove any remaining null/undefined values
      ).size;

      return {
        name: member.name,
        value: Math.round(totalHours),
        color: getTeamMemberColor(member._id),
        shift: member.shift || "Daily",
        status: member.status || "Active",
        totalProjects: memberProjects,
        efficiency: Math.round(Math.random() * 20 + 80), // Placeholder for efficiency calculation
      };
    });

    setTeamData(teamStats);

    // Process work pattern data
    const workPatterns: WorkPatternDataItem[] = teamMembers.map((member) => {
      const memberEntries = timeEntries.filter(
        (entry) =>
          entry.userId &&
          (typeof entry.userId === "object"
            ? entry.userId._id === member._id
            : entry.userId === member._id)
      );

      const totalHours =
        memberEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
        3600;
      const thisWeekEntries = memberEntries.filter((entry) => {
        const entryDate = new Date(entry.createdAt || entry.startTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
      });
      const weekHours =
        thisWeekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
        3600;

      const memberProjects = Array.from(
        new Set(
          memberEntries
            .filter((entry) => entry.project) // Filter out null/undefined projects
            .map((entry) => {
              if (typeof entry.project === "object" && entry.project) {
                return entry.project.name;
              }
              const project = projects.find((p) => p._id === entry.project);
              return project ? project.name : "Unknown Project";
            })
            .filter(Boolean) // Remove any remaining null/undefined values
        )
      );

      return {
        id: member._id,
        employee: member.name,
        shift: member.shift || "Daily",
        workingDays: getWorkingDays(member.shift),
        hoursPerDay: Math.round((weekHours / 7) * 10) / 10,
        totalHoursThisWeek: Math.round(weekHours),
        totalHoursThisMonth: Math.round(totalHours),
        projects: memberProjects,
        lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
        productivity: Math.round(Math.random() * 20 + 80),
        overtimeHours: Math.max(0, Math.round(weekHours - 40)),
        status: member.status || "Active",
      };
    });

    setWorkPatternData(workPatterns);

    // Process table data
    const recentEntries: TableDataItem[] = timeEntries
      .slice(0, 20)
      .map((entry, index) => {
        const project =
          typeof entry.project === "object" && entry.project
            ? entry.project
            : projects.find((p) => p._id === entry.project);
        const user =
          typeof entry.userId === "object" && entry.userId
            ? entry.userId
            : teamMembers.find((m) => m._id === entry.userId);
        const task =
          typeof entry.task === "object" && entry.task
            ? entry.task
            : { name: "Task " + (index + 1) }; // Placeholder task name

        const entryDate = new Date(entry.startTime);
        const dayOfWeek = entryDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const formattedDate = entryDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        // Determine shift type based on work hours or pattern
        const hoursWorked =
          Math.round(((entry.duration || 0) / 3600) * 10) / 10;
        let shiftType = "Daily"; // Default

        if (hoursWorked >= 160) {
          // ~20 days * 8 hours
          shiftType = "Monthly";
        } else if (hoursWorked >= 35) {
          // ~5 days * 7 hours
          shiftType = "Weekly";
        } else if (hoursWorked >= 6) {
          // Full day work
          shiftType = "Daily";
        } else {
          shiftType = "Hourly";
        }

        return {
          id: entry._id,
          date: formattedDate,
          day: dayOfWeek,
          project: project?.name || "Unknown Project",
          task: task?.name || "Unknown Task",
          user: user?.name || "Unknown User",
          shiftType: shiftType,
          hours: Math.round(((entry.duration || 0) / 3600) * 10) / 10,
          billable: entry.billable || false,
          rate: entry.hourlyRate || 0,
          amount: ((entry.duration || 0) / 3600) * (entry.hourlyRate || 0),
          status:
            entry.status === "In Progress"
              ? "in-progress"
              : entry.status === "Completed"
              ? "completed"
              : entry.status === "Paused"
              ? "pending"
              : "completed",
          description: entry.description || "No description",
        };
      });

    setTableData(recentEntries);
  }, [timeEntries, teamMembers, projects]);

  useEffect(() => {
    processDataForReports();
  }, [processDataForReports]);

  const getProjectColor = (projectId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    const index = projectId.charCodeAt(projectId.length - 1) % colors.length;
    return colors[index];
  };

  const getTeamMemberColor = (memberId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    const index = memberId.charCodeAt(memberId.length - 1) % colors.length;
    return colors[index];
  };

  const getWorkingDays = (shift?: string) => {
    switch (shift) {
      case "Daily":
        return "Mon-Fri";
      case "Weekly":
        return "Flexible";
      case "Monthly":
        return "Project-based";
      case "Hourly":
        return "Variable";
      default:
        return "Mon-Fri";
    }
  };

  // Default timeSeriesData for charts (can be enhanced with real data later)
  const timeSeriesData = [
    { date: "2024-01-01", hours: 8.5, billableHours: 7.2, revenue: 576 },
    { date: "2024-01-02", hours: 7.8, billableHours: 6.8, revenue: 544 },
    { date: "2024-01-03", hours: 9.2, billableHours: 8.1, revenue: 648 },
    { date: "2024-01-04", hours: 8.0, billableHours: 7.0, revenue: 560 },
    { date: "2024-01-05", hours: 8.7, billableHours: 7.5, revenue: 600 },
    { date: "2024-01-06", hours: 6.5, billableHours: 5.8, revenue: 464 },
    { date: "2024-01-07", hours: 7.3, billableHours: 6.2, revenue: 496 },
  ];

  const availableProjects = projects.map((p) => p.name);
  const availableTeamMembers = teamMembers.map((m) => m.name);
  const availableFields = [
    "Date",
    "Day",
    "Project",
    "Task",
    "User",
    "Shift Type",
    "Hours",
    "Rate",
    "Amount",
    "Status",
    "Description",
    "Work Patterns",
    "Project Summary",
  ];

  // Report templates data
  const [reportTemplates, setReportTemplates] = useState([
    {
      id: "1",
      name: "Weekly Time Summary",
      description:
        "Comprehensive weekly time tracking report with project breakdowns",
      type: "time-tracking" as const,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      lastUsed: "2024-01-05",
      isStarred: true,
      filters: { dateRange: "last-7-days", billableFilter: "all" },
      charts: ["projects", "timeline"],
    },
    {
      id: "2",
      name: "Monthly Productivity Report",
      description:
        "Detailed productivity analysis with team performance metrics",
      type: "productivity" as const,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-500/10",
      lastUsed: "2024-01-03",
      isStarred: false,
      filters: { dateRange: "last-30-days", reportType: "productivity" },
      charts: ["team", "productivity"],
    },
    {
      id: "3",
      name: "Billing & Revenue Analysis",
      description:
        "Financial overview with billable hours and revenue tracking",
      type: "billing" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      lastUsed: "2024-01-01",
      isStarred: true,
      filters: { dateRange: "last-30-days", billableFilter: "billable" },
      charts: ["projects", "timeline"],
    },
  ]);

  // Event handlers
  interface ExportOptions {
    format?: string;
    dateRange?: string;
    fields?: string[];
  }

  interface FilterOptions {
    dateRange?: string;
    customStartDate?: string;
    customEndDate?: string;
    projects?: string[];
    teamMembers?: string[];
    reportType?: string;
    billableFilter?: string;
    searchQuery?: string;
  }

  interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: string;
    filters?: FilterOptions;
    charts?: string[];
  }

  const testSimpleDownload = () => {
    console.log("Testing simple download...");
    const testContent = "Name,Age,City\nJohn,25,New York\nJane,30,Los Angeles";
    const blob = new Blob([testContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "test-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Simple download test completed");
  };

  const handleExportReport = (options: ExportOptions) => {
    console.log("Exporting report with options:", options);
    console.log("Available tableData:", tableData.length, "items");
    console.log("Available workPatternData:", workPatternData.length, "items");
    console.log("Available projectData:", projectData.length, "items");

    // Test simple download first
    if (
      tableData.length === 0 &&
      workPatternData.length === 0 &&
      projectData.length === 0
    ) {
      console.log("No data available, testing simple download...");
      testSimpleDownload();
      return;
    }

    try {
      let exportData: ExportData[];

      // Determine what type of data to export
      if (options.fields?.includes("Work Patterns")) {
        exportData = prepareWorkPatternExportData(options);
        console.log(
          "Exporting work patterns data:",
          exportData.length,
          "items"
        );
      } else if (options.fields?.includes("Project Summary")) {
        exportData = prepareProjectSummaryExportData(options);
        console.log(
          "Exporting project summary data:",
          exportData.length,
          "items"
        );
      } else {
        exportData = prepareExportData(options);
        console.log("Exporting time entries data:", exportData.length, "items");
      }

      // Fallback to work pattern data if no time entries
      if (exportData.length === 0 && workPatternData.length > 0) {
        console.log("No time entries data, falling back to work patterns");
        exportData = prepareWorkPatternExportData(options);
      }

      // Fallback to project data if still no data
      if (exportData.length === 0 && projectData.length > 0) {
        console.log("No work patterns data, falling back to project summary");
        exportData = prepareProjectSummaryExportData(options);
      }

      if (exportData.length === 0) {
        console.log("No data found, testing simple download...");
        testSimpleDownload();
        toast({
          title: "No Data Available",
          description:
            "No data found for the selected criteria. Testing simple download instead.",
          variant: "destructive",
        });
        return;
      }

      console.log("Export format:", options.format?.toLowerCase());

      switch (options.format?.toLowerCase()) {
        case "csv":
          exportToCSV(exportData, options);
          break;
        case "excel":
          exportToExcel(exportData, options);
          break;
        case "pdf":
          exportToPDF(exportData, options);
          break;
        default:
          console.log("No format specified, defaulting to CSV");
          exportToCSV(exportData, options);
      }

      toast({
        title: "Report Export Completed",
        description: `Your ${(
          options.format || "CSV"
        ).toUpperCase()} report has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const prepareWorkPatternExportData = (
    options: ExportOptions
  ): ExportData[] => {
    return workPatternData.map((pattern) => ({
      Employee: pattern.employee,
      Shift: pattern.shift,
      "Working Days": pattern.workingDays,
      "Hours Per Day": pattern.hoursPerDay,
      "Total Hours This Week": pattern.totalHoursThisWeek,
      "Total Hours This Month": pattern.totalHoursThisMonth,
      Projects: pattern.projects.join(", "),
      Productivity: `${pattern.productivity}%`,
      "Overtime Hours": pattern.overtimeHours,
      Status: pattern.status,
    }));
  };

  const prepareProjectSummaryExportData = (
    options: ExportOptions
  ): ExportData[] => {
    return projectData.map((project) => ({
      "Project Name": project.name,
      "Total Hours": project.value,
      Percentage: `${project.percentage}%`,
      "Active Employees": project.activeEmployees,
      "Shift Type": project.shift,
    }));
  };

  interface ExportData {
    [key: string]: string | number;
  }

  const prepareExportData = (options: ExportOptions): ExportData[] => {
    const fields = options.fields || availableFields;

    // Filter data based on date range if specified
    let dataToExport = [...tableData];

    if (options.dateRange) {
      const now = new Date();
      let startDate = new Date();

      switch (options.dateRange) {
        case "last-7-days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "last-30-days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "last-90-days":
          startDate.setDate(now.getDate() - 90);
          break;
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last-month": {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          const filteredData = dataToExport.filter((item) => {
            // Parse the formatted date "MM/DD/YYYY" back to Date object
            const dateMatch = item.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (!dateMatch) return false;
            const itemDate = new Date(
              parseInt(dateMatch[3]),
              parseInt(dateMatch[1]) - 1,
              parseInt(dateMatch[2])
            );
            return itemDate >= startDate && itemDate <= endDate;
          });
          // Transform filtered data and return
          return filteredData.map((item) => {
            const exportItem: ExportData = {};
            fields.forEach((field) => {
              const key = field.toLowerCase().replace(/\s+/g, "");
              switch (key) {
                case "date":
                  exportItem.Date = item.date;
                  break;
                case "day":
                  exportItem.Day = item.day;
                  break;
                case "project":
                  exportItem.Project = item.project;
                  break;
                case "task":
                  exportItem.Task = item.task;
                  break;
                case "user":
                  exportItem.User = item.user;
                  break;
                case "shifttype":
                  exportItem["Shift Type"] = item.shiftType;
                  break;
                case "hours":
                  exportItem.Hours = item.hours;
                  break;
                case "rate":
                  exportItem.Rate = `$${item.rate}`;
                  break;
                case "amount":
                  exportItem.Amount = `$${item.amount.toFixed(2)}`;
                  break;
                case "status":
                  exportItem.Status =
                    item.status.charAt(0).toUpperCase() + item.status.slice(1);
                  break;
                case "description":
                  exportItem.Description = item.description;
                  break;
              }
            });
            return exportItem;
          });
        }
      }

      dataToExport = dataToExport.filter((item) => {
        // Parse the formatted date "MM/DD/YYYY" back to Date object
        const dateMatch = item.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!dateMatch) return false;
        const itemDate = new Date(
          parseInt(dateMatch[3]),
          parseInt(dateMatch[1]) - 1,
          parseInt(dateMatch[2])
        );
        return itemDate >= startDate;
      });
    }

    // Filter by selected fields
    return dataToExport.map((item) => {
      const filteredItem: ExportData = {};
      fields.forEach((field) => {
        const key = field.toLowerCase().replace(/\s+/g, "");
        switch (key) {
          case "date":
            filteredItem.Date = item.date;
            break;
          case "day":
            filteredItem.Day = item.day;
            break;
          case "project":
            filteredItem.Project = item.project;
            break;
          case "task":
            filteredItem.Task = item.task;
            break;
          case "user":
            filteredItem.User = item.user;
            break;
          case "shifttype":
            filteredItem["Shift Type"] = item.shiftType;
            break;
          case "hours":
            filteredItem.Hours = item.hours;
            break;
          case "rate":
            filteredItem.Rate = `$${item.rate}`;
            break;
          case "amount":
            filteredItem.Amount = `$${item.amount.toFixed(2)}`;
            break;
          case "status":
            filteredItem.Status =
              item.status.charAt(0).toUpperCase() + item.status.slice(1);
            break;
          case "description":
            filteredItem.Description = item.description;
            break;
        }
      });
      return filteredItem;
    });
  };

  const exportToCSV = (data: ExportData[], options: ExportOptions) => {
    console.log("exportToCSV called with data:", data.length, "items");
    console.log("Sample data:", data[0]);

    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for the selected criteria.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    console.log("CSV Headers:", headers);

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape commas and quotes in CSV
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    console.log("CSV Content length:", csvContent.length);
    console.log("First 200 chars:", csvContent.substring(0, 200));

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      console.log("Blob created:", blob.size, "bytes");

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      console.log("Object URL created:", url);

      link.setAttribute("href", url);
      const filename = `timesheet-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.setAttribute("download", filename);
      console.log("Download filename:", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      console.log("Link added to body, clicking...");

      link.click();
      console.log("Link clicked");

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("Cleanup completed");
    } catch (error) {
      console.error("Error in CSV export:", error);
      toast({
        title: "Export Error",
        description: "Failed to create download link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = (data: ExportData[], options: ExportOptions) => {
    // For now, export as CSV with .xlsx extension (basic Excel compatibility)
    // In a real app, you'd use a library like xlsx or exceljs
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for the selected criteria.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join("\t"), // Use tabs for better Excel compatibility
      ...data.map((row) =>
        headers.map((header) => row[header] || "").join("\t")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `timesheet-report-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: ExportData[], options: ExportOptions) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for the selected criteria.",
        variant: "destructive",
      });
      return;
    }

    // Create a simple HTML table for PDF generation
    const headers = Object.keys(data[0]);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timesheet Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin-bottom: 20px; padding: 10px; background-color: #e8f4f8; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Timesheet Report</h1>
        <div class="summary">
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Entries:</strong> ${data.length}</p>
          <p><strong>Total Hours:</strong> ${data
            .reduce(
              (sum, item) => sum + (parseFloat(String(item.Hours || 0)) || 0),
              0
            )
            .toFixed(2)}</p>
          <p><strong>Total Amount:</strong> $${data
            .reduce(
              (sum, item) =>
                sum +
                (parseFloat(String(item.Amount || "0").replace("$", "")) || 0),
              0
            )
            .toFixed(2)}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${headers
                  .map((header) => `<td>${row[header] || ""}</td>`)
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      // Auto-trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for PDF export to work.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    console.log("Sorting by:", field, direction);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    console.log("Applying filters:", newFilters);
  };

  const handleEdit = (id: string) => {
    console.log("Editing entry:", id);
    toast({
      title: "Edit Entry",
      description: "Opening edit dialog...",
    });
  };

  const handleDelete = (id: string) => {
    console.log("Deleting entry:", id);
    toast({
      title: "Entry Deleted",
      description: "The time entry has been removed.",
    });
  };

  const handleView = (id: string) => {
    console.log("Viewing entry:", id);
    toast({
      title: "View Details",
      description: "Opening detailed view...",
    });
  };

  // Template handlers
  const handleUseTemplate = (template: ReportTemplate) => {
    if (template.filters) {
      setFilters((prev) => ({
        ...prev,
        ...template.filters,
      }));
    }
    if (template.charts) {
      setSelectedChart(template.charts[0] || "projects");
    }
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template settings.`,
    });
  };

  const handleSaveTemplate = (
    template: Omit<ReportTemplate, "id" | "lastUsed">
  ) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      lastUsed: new Date().toISOString().split("T")[0],
      type: template.type as "time-tracking" | "productivity" | "billing",
      icon: Clock, // Default icon
      color: "text-blue-600", // Default color
      bgColor: "bg-blue-50 dark:bg-blue-500/10", // Default background
      isStarred: false, // Default starred state
      charts: template.charts || [],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReportTemplates((prev) => [...prev, newTemplate] as any);
    toast({
      title: "Template Saved",
      description: `"${template.name}" has been saved as a template.`,
    });
  };

  const handleEditTemplate = (id: string) => {
    console.log("Editing template:", id);
    toast({
      title: "Edit Template",
      description: "Opening template editor...",
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setReportTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "The template has been removed.",
    });
  };

  const handleStarTemplate = (id: string, starred: boolean) => {
    setReportTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: starred } : t))
    );
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6 space-y-6">
            {loading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Loading reports data...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Enhanced Reports Header with detailed metrics */}
                <ReportsHeader
                  totalHours={Math.round(
                    timeEntries.reduce(
                      (sum, entry) => sum + (entry.duration || 0),
                      0
                    ) / 3600
                  )}
                  billableHours={Math.round(
                    timeEntries
                      .filter((entry) => entry.billable)
                      .reduce((sum, entry) => sum + (entry.duration || 0), 0) /
                      3600
                  )}
                  totalRevenue={timeEntries.reduce(
                    (sum, entry) =>
                      sum +
                      ((entry.duration || 0) / 3600) * (entry.hourlyRate || 0),
                    0
                  )}
                  activeProjects={projects.length}
                  teamMembers={teamMembers.length}
                  productivityScore={94}
                  dateRange="Last 30 days"
                />

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Daily Workers
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {
                            workPatternData.filter(
                              (emp) => emp.shift === "Daily"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Avg:{" "}
                        {Math.round(
                          workPatternData
                            .filter((emp) => emp.shift === "Daily")
                            .reduce((acc, emp) => acc + emp.hoursPerDay, 0) /
                            workPatternData.filter(
                              (emp) => emp.shift === "Daily"
                            ).length || 0
                        )}
                        h/day
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Weekly Workers
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {
                            workPatternData.filter(
                              (emp) => emp.shift === "Weekly"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Avg:{" "}
                        {Math.round(
                          workPatternData
                            .filter((emp) => emp.shift === "Weekly")
                            .reduce(
                              (acc, emp) => acc + emp.totalHoursThisWeek,
                              0
                            ) /
                            workPatternData.filter(
                              (emp) => emp.shift === "Weekly"
                            ).length || 0
                        )}
                        h/week
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Monthly Workers
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {
                            workPatternData.filter(
                              (emp) => emp.shift === "Monthly"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Avg:{" "}
                        {Math.round(
                          workPatternData
                            .filter((emp) => emp.shift === "Monthly")
                            .reduce(
                              (acc, emp) => acc + emp.totalHoursThisMonth,
                              0
                            ) /
                            workPatternData.filter(
                              (emp) => emp.shift === "Monthly"
                            ).length || 0
                        )}
                        h/month
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Hourly Workers
                        </p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {
                            workPatternData.filter(
                              (emp) => emp.shift === "Hourly"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Overtime:{" "}
                        {workPatternData.reduce(
                          (acc, emp) => acc + emp.overtimeHours,
                          0
                        )}
                        h
                      </div>
                    </div>
                  </div>
                </div>

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

                  {/* Detailed Work Patterns Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Employee Work Patterns
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Detailed view of employee shifts, schedules, and
                            productivity metrics
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700">
                            <option>All Shifts</option>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Hourly</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Shift Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Working Days
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Hours/Day
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              This Week
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              This Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Projects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Productivity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {workPatternData.map((employee) => (
                            <tr
                              key={employee.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                      {employee.employee
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {employee.employee}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Last login: {employee.lastLogin}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    employee.shift === "Daily"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                      : employee.shift === "Weekly"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : employee.shift === "Monthly"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  }`}
                                >
                                  {employee.shift}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {employee.workingDays}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {employee.hoursPerDay}h
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {employee.totalHoursThisWeek}h
                                </div>
                                {employee.overtimeHours > 0 && (
                                  <div className="text-xs text-orange-600 dark:text-orange-400">
                                    +{employee.overtimeHours}h overtime
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {employee.totalHoursThisMonth}h
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {employee.projects.map((project, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                      {project}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        employee.productivity >= 90
                                          ? "bg-green-500"
                                          : employee.productivity >= 80
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${employee.productivity}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {employee.productivity}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    employee.status === "Active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {employee.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

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
              </>
            )}

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
