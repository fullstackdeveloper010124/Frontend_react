import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/navbar/AdminHeader";
import { Sidebar } from "@/components/Sidebar/AdminSidebar";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { Plus, Edit, Trash2, Filter, Search, Calendar, Users, Clock, DollarSign, BarChart3, TrendingUp, Target, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { API_URLS } from '@/lib/api';

// Define an interface for your project structure for better type safety
interface Project {
  _id?: string; // Optional because it might not exist for new projects
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate?: string;
  deadline?: string;
  progress: number;
  team: number;
  hours: number;
  status: "active" | "completed" | "on-hold" | "cancelled" | "In Progress";
  budget: number;
  priority: "low" | "medium" | "high" | "urgent";
}

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    name: "",
    client: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    deadline: "",
    progress: 0,
    team: 0,
    hours: 0,
    status: "active",
    budget: 0,
    priority: "medium",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    project: "All",
    client: "All",
    progress: "All",
    deadline: "All",
    team: "All",
    hours: "All",
    status: "All",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URLS.projectsAll);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data: Project[] = await res.json();
      console.log("Fetched projects:", data);
      setProjects(data);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const unique = (key: keyof Project) => {
    return [
      ...new Set(
        projects
          .map((p) => p[key])
          .filter((value) => value !== undefined && value !== null && value !== "")
      ),
    ];
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const match = (field: keyof typeof filters, projectKey: keyof Project) => {
        if (filters[field] === "All") return true;

        const projectValue = p[projectKey];
        const filterValue = filters[field];

        if (field === "progress") {
          return (parseInt(projectValue as string) || 0) >= (parseInt(filterValue as string) || 0);
        }
        return String(projectValue) === String(filterValue);
      };

      return (
        match("project", "name") &&
        match("client", "client") &&
        match("progress", "progress") &&
        match("deadline", "deadline") &&
        match("team", "team") &&
        match("hours", "hours") &&
        match("status", "status")
      );
    });
  }, [filters, projects]);

  const openNewDialog = () => {
    setIsEditMode(false);
    setNewProject({
      name: "",
      client: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      deadline: "",
      progress: 0,
      team: 0,
      hours: 0,
      status: "active",
      budget: 0,
      priority: "medium",
    });
    setIsNewProjectOpen(true);
  };

  const handleSaveProject = async () => {
    if (!newProject.name || !newProject.client || !newProject.description) {
      alert("Please fill in Project Name, Client, and Description.");
      return;
    }

    try {
      if (isEditMode && editIndex !== null) {
        const projectToUpdate = projects[editIndex];
        if (!projectToUpdate || !projectToUpdate._id) {
          console.error("Error: Project to update has no _id. Cannot update.");
          alert("Failed to update project: Missing ID.");
          return;
        }

        const updatedProject = { ...projectToUpdate, ...newProject };
        const res = await fetch(
          API_URLS.projectById(updatedProject._id),
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify(updatedProject),
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data: Project = await res.json();
        const updated = [...projects];
        updated[editIndex] = data;
        setProjects(updated);
      } else {
        const res = await fetch(API_URLS.projects, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProject),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data: Project = await res.json();
        setProjects([...projects, data]);
      }
      setIsNewProjectOpen(false);
      fetchProjects(); // Refresh the list
    } catch (err: any) {
      console.error("Error saving project:", err);
      alert("Failed to save project. Please check console for details and ensure backend is running.");
    }
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setIsEditMode(true);
    const p = projects[idx];
    setNewProject({
      name: p.name,
      client: p.client,
      description: p.description,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : "",
      deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : "",
      progress: p.progress || 0,
      team: p.team || 0,
      hours: p.hours || 0,
      status: p.status || "active",
      budget: p.budget || 0,
      priority: p.priority || "medium",
    });
    setIsNewProjectOpen(true);
  };

  const handleDelete = async (idx: number) => {
    const project = projects[idx];
    if (!project || !project._id) {
      console.error("Error: Project to delete has no _id or does not exist.");
      alert("Failed to delete project: Missing ID.");
      return;
    }

    if (confirm(`Delete project "${project.name}"?`)) {
      try {
        const res = await fetch(API_URLS.projectById(project._id), {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        setProjects(projects.filter((_, i) => i !== idx));
      } catch (err: any) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project. Please check console for details and ensure backend is running.");
      }
    }
  };

  const statusBadge = (status: Project['status']) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30";
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
    }
  };

  const priorityBadge = (priority: Project['priority']) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30";
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string provided to formatDate:", dateString);
        return "";
      }
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error in formatDate:", e, "for input:", dateString);
      return "";
    }
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 overflow-auto">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="container mx-auto p-6">
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2">Loading projects...</span>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 overflow-auto">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="container mx-auto p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
                <button 
                  onClick={fetchProjects}
                  className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Projects Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                  Manage and track your projects with advanced analytics and insights
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <Button onClick={openNewDialog} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client">Client *</Label>
                      <Input
                        id="client"
                        value={newProject.client}
                        onChange={(e) =>
                          setNewProject({ ...newProject, client: e.target.value })
                        }
                        placeholder="Enter client name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newProject.deadline}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            deadline: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value: Project['status']) =>
                          setNewProject({ ...newProject, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newProject.priority}
                        onValueChange={(value: Project['priority']) =>
                          setNewProject({ ...newProject, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={newProject.progress}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            progress: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team">Team Size</Label>
                      <Input
                        id="team"
                        type="number"
                        min="0"
                        value={newProject.team}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            team: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="hours">Estimated Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="0"
                        value={newProject.hours}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            hours: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProject.budget}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          budget: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewProjectOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProject}>
                      {isEditMode ? "Save" : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">Total Projects</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{projects.length}</p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">+12% from last month</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium uppercase tracking-wide">Active Projects</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                      {projects.filter(p => p.status === 'active' || p.status === 'In Progress').length}
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-xs mt-1">Currently running</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-medium uppercase tracking-wide">Completed</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">Success rate: 94%</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium uppercase tracking-wide">Total Budget</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                      ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">+8% this quarter</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-indigo-600" />
                  Filter Projects
                </h3>
                <Button variant="outline" size="sm" onClick={() => setFilters({ status: 'All', priority: 'All', client: 'All', progress: 'All' })}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: "status", label: "Status", icon: Activity },
                  { key: "priority", label: "Priority", icon: Target },
                  { key: "client", label: "Client", icon: Users },
                  { key: "progress", label: "Progress", icon: BarChart3 },
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <div key={filter.key} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-500" />
                        {filter.label}
                      </Label>
                      <Select
                        value={filters[filter.key as keyof typeof filters]}
                        onValueChange={(v) => setFilters({ ...filters, [filter.key]: v })}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {unique(filter.key === "project" ? "name" : (filter.key as keyof Project))
                            .filter((opt) => opt !== undefined && opt !== null && opt !== "")
                            .map((opt) => (
                              <SelectItem key={opt?.toString()} value={opt?.toString() || ""}>
                                {filter.key === "progress" ? `${opt || 0}%` : opt}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {projects.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <Plus className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Get started by creating your first project and begin tracking your progress
                  </p>
                  <Button onClick={openNewDialog} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first project
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredProjects.map((project, idx) => (
                        <tr key={project._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {project.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {project.client}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={statusBadge(project.status)}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={`border ${priorityBadge(project.priority)}`}>
                              {project.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    (project.progress || 0) < 30 ? 'bg-red-500' :
                                    (project.progress || 0) < 70 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.progress || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {project.team || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${(project.budget || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {project.deadline ? (
                              <div className="flex items-center text-sm text-orange-700 dark:text-orange-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(project.deadline)}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(idx)}
                                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(idx)}
                                className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}