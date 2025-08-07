import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

// Define an interface for your project structure for better type safety
interface Project {
  _id?: string; // Optional because it might not exist for new projects
  name: string;
  client: string;
  deadline: string;
  description?: string;
  progress?: number;
  team?: number;
  hours?: number;
  status?: "In Progress" | "Nearly Complete" | "Completed"; // Enforce specific status values
}

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null); // Use number | null for index
  const [newProject, setNewProject] = useState<Project>({
    name: "",
    client: "",
    deadline: "",
    description: "",
    progress: 0,
    team: 0,
    hours: 0,
    status: "In Progress",
  });
  const [projects, setProjects] = useState<Project[]>([]); // Specify array of Project type

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
    fetch("http://localhost:5000/api/projects/all")
      .then((res) => {
        if (!res.ok) {
          // Log specific HTTP error if response is not ok
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Project[]) => setProjects(data)) // Type assertion for incoming data
      .catch((err) => console.error("Failed to load projects:", err));
  }, []);

  // Corrected unique function to handle undefined/null values
  const unique = (key: keyof Project) => {
    // Ensure that 'key' is a valid key of the Project interface
    return [
      ...new Set(
        projects
          .map((p) => p[key])
          .filter((value) => value !== undefined && value !== null)
      ),
    ];
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const match = (field: keyof typeof filters, projectKey: keyof Project) => {
        // Explicitly type field and projectKey
        if (filters[field] === "All") return true;

        const projectValue = p[projectKey];
        const filterValue = filters[field];

        if (field === "progress") {
          return (parseInt(projectValue as string) || 0) >= (parseInt(filterValue as string) || 0);
        }
        // Safely convert to string and compare
        return String(projectValue) === String(filterValue);
      };

      return (
        match("project", "name") && // 'project' filter maps to 'name' property
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
      deadline: "",
      description: "",
      progress: 0,
      team: 0,
      hours: 0,
      status: "In Progress",
    });
    setIsNewProjectOpen(true);
  };

  const handleSaveProject = async () => {
    // Basic validation
    if (!newProject.name || !newProject.client || !newProject.deadline) {
      alert("Please fill in Project Name, Client, and Deadline.");
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
          `http://localhost:5000/api/projects/${updatedProject._id}`,
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
        const res = await fetch("http://localhost:5000/api/projects", {
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
      setIsNewProjectOpen(false); // Close dialog on success
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save project. Please check console for details and ensure backend is running.");
    }
  };

  const handleEdit = (idx: number) => { // Type 'idx' as number
    setEditIndex(idx);
    setIsEditMode(true);
    const p = projects[idx];
    setNewProject({
      name: p.name,
      client: p.client,
      deadline: p.deadline,
      description: p.description || "",
      progress: p.progress || 0,
      team: p.team || 0,
      hours: p.hours || 0,
      status: p.status || "In Progress",
    });
    setIsNewProjectOpen(true);
  };

  const handleDelete = async (idx: number) => { // Type 'idx' as number
    const project = projects[idx];
    if (!project || !project._id) {
      console.error("Error: Project to delete has no _id or does not exist.");
      alert("Failed to delete project: Missing ID.");
      return;
    }

    if (confirm(`Delete project "${project.name}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        setProjects(projects.filter((_, i) => i !== idx));
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project. Please check console for details and ensure backend is running.");
      }
    }
  };

  const statusBadge = (status: Project['status']) => { // Use type for status
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "Nearly Complete":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      default: // Handles "In Progress" and any undefined/null status gracefully
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
    }
  };

  // Robust formatDate function
  const formatDate = (dateString: string | undefined): string => { // Allow undefined input
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      // Check for "Invalid Date"
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
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={newProject.client}
                      onChange={(e) =>
                        setNewProject({ ...newProject, client: e.target.value })
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
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value: Project['status']) => // Ensure type matches Project status
                        setNewProject({ ...newProject, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Nearly Complete">
                          Nearly Complete
                        </SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
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

            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    {"PROJECT CLIENT PROGRESS DEADLINE TEAM HOURS STATUS ACTIONS"
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
                  {/* Added key prop for the filter row */}
                  <tr key="filter-row" className="bg-white dark:bg-gray-800">
                    {[
                      "project",
                      "client",
                      "progress",
                      "deadline",
                      "team",
                      "hours",
                      "status",
                    ].map((field) => (
                      <td key={field} className="px-6 py-2">
                        <Select
                          value={filters[field as keyof typeof filters]} // Type assertion for filters object access
                          onValueChange={(v) =>
                            setFilters({ ...filters, [field]: v })
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {["All", ...unique(field === "project" ? "name" : (field as keyof Project))].map(
                              (opt) => (
                                <SelectItem key={opt?.toString()} value={opt?.toString() || ""}>
                                  {field === "progress" ? `${opt || 0}%` : opt}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                    <td className="px-6 py-2" /> {/* Empty cell for Actions column filter */}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map((project, idx) => (
                    <tr key={project._id || idx}> {/* Use _id if available, otherwise idx */}
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                        {project.client}
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(
                            project.status
                          )}`}
                        >
                          {project.status || "In Progress"}
                        </span>
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
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}