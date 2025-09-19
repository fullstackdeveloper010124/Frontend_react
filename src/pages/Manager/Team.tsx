import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar/ManagerSidebar";
import { Header } from "@/components/navbar/ManagerHeader";
import { ThemeProvider } from "@/components/New folder/ThemeProvider";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { teamAPI, projectAPI, TeamMember, Project } from "@/lib/api";

interface NewMember {
  employeeId: string;
  name: string;
  project: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  bankName: string;
  bankAddress: string;
  accountHolder: string;
  accountHolderAddress: string;
  account: string;
  accountType: string;
  role: "Employee" | "Manager" | "Admin";
  charges: number;
  status: "Active" | "Inactive" | "Pending";
  shift: "Hourly" | "Daily" | "Weekly" | "Monthly";
}

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMember, setNewMember] = useState<NewMember>({
    employeeId: "",
    name: "",
    project: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    bankName: "",
    bankAddress: "",
    accountHolder: "",
    accountHolderAddress: "",
    account: "",
    accountType: "",
    role: "Employee",
    charges: 0,
    status: "Active",
    shift: "Monthly",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isAddMemberOpen) {
      // Generate sequential employee ID based on existing members
      const existingIds = teamMembers.map((member) => {
        const idMatch = member.employeeId?.match(/EMP(\d+)/);
        return idMatch ? parseInt(idMatch[1]) : 0;
      });

      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const sequentialId = "EMP" + String(nextId).padStart(3, "0");

      setNewMember((prev) => ({ ...prev, employeeId: sequentialId }));
    }
  }, [isAddMemberOpen, teamMembers]);

  useEffect(() => {
    const fetchMembersAndProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching team members and projects...");

        // Fetch team members
        const membersRes = await teamAPI.getAllTeam();
        console.log("Team members response:", membersRes);

        // Handle different response formats
        let membersData = [];
        if (membersRes && typeof membersRes === "object") {
          if (membersRes.data) {
            membersData = membersRes.data;
          } else if (Array.isArray(membersRes)) {
            membersData = membersRes;
          } else if (
            "members" in membersRes &&
            Array.isArray((membersRes as any).members)
          ) {
            membersData = (membersRes as any).members;
          }
        }

        console.log("Processed members data:", membersData);
        setTeamMembers(membersData);

        // Fetch projects
        const projectsRes = await projectAPI.getAllProjects();
        console.log("Projects response:", projectsRes);

        // Handle different response formats for projects
        let projectsData = [];
        if (projectsRes && typeof projectsRes === "object") {
          if (projectsRes.data) {
            projectsData = projectsRes.data;
          } else if (Array.isArray(projectsRes)) {
            projectsData = projectsRes;
          } else if (
            "projects" in projectsRes &&
            Array.isArray((projectsRes as any).projects)
          ) {
            projectsData = (projectsRes as any).projects;
          }
        }

        console.log("Processed projects data:", projectsData);
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
        });

        const errorMessage =
          err.response?.data?.error || err.message || "Failed to fetch data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembersAndProjects();
  }, [toast]);

  const handleAddMember = async () => {
    // Ensure project is an actual project ID, not a string like "Project Manager"
    if (
      newMember.name &&
      newMember.project &&
      newMember.email &&
      newMember.password
    ) {
      try {
        const res = await teamAPI.addTeamMember({
          ...newMember,
          charges: 0,
          status: "Active",
        });

        toast({
          title: "Success",
          description: "Team member added successfully",
        });

        // Update teamMembers state with the newly added member
        const updatedMembersRes = await teamAPI.getAllTeam();
        setTeamMembers(updatedMembersRes.data || []);

        setNewMember({
          employeeId: "",
          name: "",
          project: "",
          email: "",
          phone: "",
          password: "",
          address: "",
          bankName: "",
          bankAddress: "",
          accountHolder: "",
          accountHolderAddress: "",
          account: "",
          accountType: "",
          role: "Employee",
          charges: 0,
          status: "Active",
          shift: "Monthly",
        });

        setIsAddMemberOpen(false);
      } catch (err: any) {
        console.error("Add Member Error:", err);
        toast({
          title: "Error",
          description: err.response?.data?.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Name, project, and email are required.",
        variant: "destructive",
      });
    }
  };

  // Function to initiate delete confirmation
  const confirmDelete = (id: string) => {
    setMemberToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDeleteId) return;

    try {
      await teamAPI.deleteTeamMember(memberToDeleteId);
      setTeamMembers((prev) =>
        prev.filter((member) => member._id !== memberToDeleteId)
      );
      toast({ title: "Deleted", description: "Team member removed." });
      setIsDeleteConfirmOpen(false);
      setMemberToDeleteId(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete member",
        variant: "destructive",
      });
    }
  };

  // Function to open edit modal and pre-populate data
  const openEditModal = (member: TeamMember) => {
    // Make sure to set the 'project' field to its _id if it's already populated as an object
    setCurrentMember({
      ...member,
      project: member.project
        ? typeof member.project === "string"
          ? member.project
          : member.project._id
        : "",
    });
    setIsEditMemberOpen(true);
  };

  // Handle changes in the edit form
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: string
  ) => {
    setCurrentMember((prev) => ({
      ...prev,
      [field]: typeof e === "string" ? e : e.target.value,
    }));
  };

  // Handle saving the edited member
  const handleSaveEdit = async () => {
    if (!currentMember || !currentMember._id) return;

    if (currentMember.name && currentMember.project && currentMember.email) {
      try {
        await teamAPI.updateTeamMember(currentMember._id, currentMember);
        // After updating, re-fetch all members to ensure project name is correctly displayed
        const updatedMembersRes = await teamAPI.getAllTeam();
        setTeamMembers(updatedMembersRes.data || []);
        toast({ title: "Updated", description: "Member updated successfully" });
        setIsEditMemberOpen(false);
        setCurrentMember(null);
      } catch (err: any) {
        console.error("Update Member Error:", err);
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to update member",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Name, project, and email are required for update.",
        variant: "destructive",
      });
    }
  };

  // Filter out admin and manager users for all calculations - only show employees
  const nonAdminMembers = teamMembers.filter(
    (member) => member.role !== "Admin" && member.role !== "Manager"
  );
  const totalCharges = nonAdminMembers.reduce(
    (sum, m) => sum + (m.charges || 0),
    0
  );
  const activeMembers = nonAdminMembers.filter(
    (m) => m.status === "Active"
  ).length;
  const avgCharges =
    nonAdminMembers.length > 0
      ? (totalCharges / nonAdminMembers.length).toFixed(1)
      : "0";

  // Show loading state
  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 overflow-auto">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-6">
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                  <span className="text-lg">Loading team data...</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <ThemeProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 overflow-auto">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </main>
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
          <main className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Team
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your team members and track their activity
                </p>
                {nonAdminMembers.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Found {nonAdminMembers.length} team member(s)
                  </p>
                )}
              </div>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" />
                    <span>Add Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="employeeId">Employee ID</Label>
                          <Input
                            id="employeeId"
                            value={newMember.employeeId}
                            readOnly
                            placeholder="Auto generated"
                            className="bg-gray-100 dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newMember.name}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter member name"
                          />
                        </div>
                        <div>
                          {/* Updated Select for Project */}
                          <Label htmlFor="project">Project *</Label>
                          <Select
                            value={newMember.project}
                            onValueChange={(value) =>
                              setNewMember({ ...newMember, project: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((proj) => (
                                <SelectItem key={proj._id} value={proj._id}>
                                  {proj.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={newMember.role}
                            onValueChange={(value) =>
                              setNewMember({
                                ...newMember,
                                role: value as "Employee" | "Manager" | "Admin",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Employee">Employee</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                email: e.target.value,
                              })
                            }
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newMember.password}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                password: e.target.value,
                              })
                            }
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newMember.phone}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                phone: e.target.value,
                              })
                            }
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newMember.address}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                address: e.target.value,
                              })
                            }
                            placeholder="Enter full address"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        Bank Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={newMember.bankName}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                bankName: e.target.value,
                              })
                            }
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bankAddress">
                            Full Address of Bank
                          </Label>
                          <Input
                            id="bankAddress"
                            value={newMember.bankAddress}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                bankAddress: e.target.value,
                              })
                            }
                            placeholder="Enter bank's full address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolder">Account Holder</Label>
                          <Input
                            id="accountHolder"
                            value={newMember.accountHolder}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                accountHolder: e.target.value,
                              })
                            }
                            placeholder="Account holder name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="accountHolderAddress">
                            Account Holder Address
                          </Label>
                          <Input
                            id="accountHolderAddress"
                            value={newMember.accountHolderAddress}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                accountHolderAddress: e.target.value,
                              })
                            }
                            placeholder="Account holder address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="account">Account Number</Label>
                          <Input
                            id="account"
                            value={newMember.account}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                account: e.target.value,
                              })
                            }
                            placeholder="Account number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select
                            value={newMember.accountType}
                            onValueChange={(value) =>
                              setNewMember({ ...newMember, accountType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Savings">Savings</SelectItem>
                              <SelectItem value="Checking">Checking</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        Work Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="charges">Charges This Week</Label>
                          <Input
                            id="charges"
                            type="number"
                            min="0"
                            value={newMember.charges}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                charges: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter charges"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newMember.status}
                            onValueChange={(value) =>
                              setNewMember({
                                ...newMember,
                                status: value as
                                  | "Active"
                                  | "Inactive"
                                  | "Pending",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddMemberOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Members
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {nonAdminMembers.length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Members
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {activeMembers}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Charges
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${totalCharges}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Charges
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${avgCharges}
                </p>
              </div>
            </div>

            {/* Show message if no team members */}
            {nonAdminMembers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No team members found.
                </p>
                <Button onClick={() => setIsAddMemberOpen(true)}>
                  Add Your First Team Member
                </Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Team Members
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Employee ID
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Project
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Charges
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers
                          .filter(
                            (member) =>
                              member.role !== "Admin" &&
                              member.role !== "Manager"
                          )
                          .map((member) => (
                            <tr
                              key={member._id}
                              className="border-b border-gray-100 dark:border-gray-700"
                            >
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {member.employeeId}
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {member.name}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    member.role === "Admin"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400"
                                      : member.role === "Manager"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"
                                  }`}
                                >
                                  {member.role || "Employee"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {member.project
                                  ? typeof member.project === "string"
                                    ? member.project
                                    : member.project.name
                                  : "No Project"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {member.email}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                {member.charges || 0}h
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.status === "Active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : member.status === "Inactive"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  }`}
                                >
                                  {member.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(member)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => confirmDelete(member._id)}
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
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {currentMember && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-employeeId">Employee ID</Label>
                    <Input
                      id="edit-employeeId"
                      value={currentMember.employeeId}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={currentMember.name}
                      onChange={(e) => handleEditChange(e, "name")}
                      placeholder="Enter member name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role *</Label>
                    <Input
                      id="edit-role"
                      value={currentMember.role || "Employee"}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      placeholder="Role (non-editable)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-project">Project *</Label>
                    <Select
                      value={
                        typeof currentMember.project === "string"
                          ? currentMember.project
                          : currentMember.project._id
                      }
                      onValueChange={(value) =>
                        handleEditChange(value, "project")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((proj) => (
                          <SelectItem key={proj._id} value={proj._id}>
                            {proj.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={currentMember.email}
                      onChange={(e) => handleEditChange(e, "email")}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={currentMember.phone}
                      onChange={(e) => handleEditChange(e, "phone")}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={currentMember.address}
                      onChange={(e) => handleEditChange(e, "address")}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editBankName">Bank Name</Label>
                    <Input
                      id="editBankName"
                      value={currentMember.bankName}
                      onChange={(e) => handleEditChange(e, "bankName")}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editBankAddress">
                      Full Address of Bank
                    </Label>
                    <Input
                      id="editBankAddress"
                      value={currentMember.bankAddress}
                      onChange={(e) => handleEditChange(e, "bankAddress")}
                      placeholder="Enter bank's full address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAccountHolder">Account Holder</Label>
                    <Input
                      id="editAccountHolder"
                      value={currentMember.accountHolder}
                      onChange={(e) => handleEditChange(e, "accountHolder")}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editAccountHolderAddress">
                      Account Holder Address
                    </Label>
                    <Input
                      id="editAccountHolderAddress"
                      value={currentMember.accountHolderAddress}
                      onChange={(e) =>
                        handleEditChange(e, "accountHolderAddress")
                      }
                      placeholder="Account holder address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAccount">Account Number</Label>
                    <Input
                      id="editAccount"
                      value={currentMember.account}
                      onChange={(e) => handleEditChange(e, "account")}
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAccountType">Account Type</Label>
                    <Select
                      value={currentMember.accountType}
                      onValueChange={(value) =>
                        handleEditChange(value, "accountType")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Checking">Checking</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCharges">Charges This Week</Label>
                    <Input
                      id="editCharges"
                      type="number"
                      value={currentMember.charges}
                      onChange={(e) => handleEditChange(e, "charges")}
                      placeholder="Enter charges"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select
                      value={currentMember.status}
                      onValueChange={(value) =>
                        handleEditChange(value, "status")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              member from your team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
};

export default Team;
