import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/navbar/ManagerHeader";
import { Sidebar } from "@/components/Sidebar/ManagerSidebar";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  status: "active" | "completed" | "on-hold" | "In Progress";
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
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
    }
  };

  const priorityBadge = (priority: Project['priority']) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Projects
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your projects and track progress
                </p>
              </div>
              <Button
                onClick={openNewDialog}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </Button>
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

            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No projects found.</p>
                <Button onClick={openNewDialog}>
                  Create your first project
                </Button>
              </div>
            ) : (
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/40">
                    <tr>
                      {"PROJECT CLIENT DESCRIPTION PROGRESS DEADLINE TEAM HOURS STATUS PRIORITY ACTIONS"
                        .split(" ")
                        .map((label) => (
                          <th
                            key={label}
                            className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 tracking-wider"
                          >
                            {label}
                          </th>
                        ))}
                    </tr>
                    <tr key="filter-row" className="bg-white dark:bg-gray-800">
                      {[
                        "project",
                        "client",
                        "description",
                        "progress",
                        "deadline",
                        "team",
                        "hours",
                        "status",
                        "priority",
                      ].map((field) => (
                        <td key={field} className="px-6 py-2">
                          <Select
                            value={filters[field as keyof typeof filters]}
                            onValueChange={(v) =>
                              setFilters({ ...filters, [field]: v })
                            }
                          >
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="all" value="All">
                                All
                              </SelectItem>
                              {unique(field === "project" ? "name" : (field as keyof Project))
                                .filter((opt) => opt !== undefined && opt !== null && opt !== "")
                                .map((opt) => (
                                  <SelectItem 
                                    key={opt?.toString() || `opt-${field}`} 
                                    value={opt?.toString() || `opt-${field}`}
                                  >
                                    {field === "progress" ? `${opt || 0}%` : opt}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                      <td className="px-6 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProjects.map((project, idx) => (
                      <tr key={project._id || idx}>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                          {project.client}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300 max-w-xs truncate">
                          {project.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {project.progress || 0}%
                            </span>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div
                                className="h-2 rounded-full bg-indigo-600"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                          {formatDate(project.deadline)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                          {project.team || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                          {project.hours || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusBadge(project.status)}>
                            {project.status || "active"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={priorityBadge(project.priority)}>
                            {project.priority || "medium"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="mr-2"
                            onClick={() => handleEdit(idx)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(idx)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}