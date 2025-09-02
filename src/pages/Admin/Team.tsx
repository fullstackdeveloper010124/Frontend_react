import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { teamAPI, projectAPI, TeamMember, Project } from '@/lib/api';

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
  role: 'Employee' | 'Manager' | 'Admin';
  charges: number;
  status: 'Active' | 'Inactive' | 'Pending';
  shift: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
}

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('Weekly');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newMember, setNewMember] = useState<NewMember>({
    employeeId: '',
    name: '',
    project: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    bankName: '',
    bankAddress: '',
    accountHolder: '',
    accountHolderAddress: '',
    account: '',
    accountType: '',
    role: 'Employee',
    charges: 0,
    status: 'Active',
    shift: 'Monthly'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isAddMemberOpen) {
      // Generate sequential employee ID based on existing members
      const existingIds = teamMembers.map(member => {
        const idMatch = member.employeeId?.match(/EMP(\d+)/);
        return idMatch ? parseInt(idMatch[1]) : 0;
      });
      
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const sequentialId = 'EMP' + String(nextId).padStart(3, '0');
      
      setNewMember(prev => ({ ...prev, employeeId: sequentialId }));
    }
  }, [isAddMemberOpen, teamMembers]);

  useEffect(() => {
    const fetchMembersAndProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch team members
        const membersRes = await teamAPI.getAllTeam();
        let membersData: TeamMember[] = [];
        
        if (membersRes?.success && Array.isArray(membersRes.data)) {
          membersData = membersRes.data;
        } else if (Array.isArray(membersRes)) {
          membersData = membersRes;
        } else {
          console.warn('Unexpected team members response format:', membersRes);
        }
        
        setTeamMembers(membersData);

        // Fetch projects
        const projectsRes = await projectAPI.getAllProjects();
        let projectsData: Project[] = [];
        
        if (projectsRes?.success && Array.isArray(projectsRes.data)) {
          projectsData = projectsRes.data;
        } else if (Array.isArray(projectsRes)) {
          projectsData = projectsRes;
        } else {
          console.warn('Unexpected projects response format:', projectsRes);
        }
        
        setProjects(projectsData);
        
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch data';
        setError(errorMessage);
        toast({ 
          title: 'Error', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembersAndProjects();
  }, [toast]);

  const handleAddMember = async () => {
    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    
    if (!newMember.name.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required.', variant: 'destructive' });
      return;
    }
    
    if (!newMember.email.trim() || !emailRegex.test(newMember.email)) {
      toast({ title: 'Validation Error', description: 'Valid email is required.', variant: 'destructive' });
      return;
    }
    
    if (!newMember.password || newMember.password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    
    if (!newMember.project) {
      toast({ title: 'Validation Error', description: 'Project is required.', variant: 'destructive' });
      return;
    }
    
    if (newMember.phone && !phoneRegex.test(newMember.phone)) {
      toast({ title: 'Validation Error', description: 'Valid phone number is required.', variant: 'destructive' });
      return;
    }
    
    if (newMember.charges < 0) {
      toast({ title: 'Validation Error', description: 'Charges cannot be negative.', variant: 'destructive' });
      return;
    }

    if (newMember.name && newMember.project && newMember.email && newMember.password) {
      try {
        await teamAPI.addTeamMember(newMember);
        toast({
          title: 'Success',
          description: 'Team member added successfully'
        });

        const updatedMembersRes = await teamAPI.getAllTeam();
        const updatedData = updatedMembersRes?.success && Array.isArray(updatedMembersRes.data) 
          ? updatedMembersRes.data 
          : Array.isArray(updatedMembersRes) 
          ? updatedMembersRes 
          : [];
        setTeamMembers(updatedData);

        setNewMember({
          employeeId: '',
          name: '',
          project: '',
          email: '',
          phone: '',
          password: '',
          address: '',
          bankName: '',
          bankAddress: '',
          accountHolder: '',
          accountHolderAddress: '',
          account: '',
          accountType: '',
          role: 'Employee',
          charges: 0,
          status: 'Active',
          shift: 'Monthly'
        });

        setIsAddMemberOpen(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to add team member';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
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
      setTeamMembers(prev => prev.filter(member => member._id !== memberToDeleteId));
      toast({ title: 'Deleted', description: 'Team member removed.' });
      setIsDeleteConfirmOpen(false);
      setMemberToDeleteId(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete team member';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Function to open edit modal and pre-populate data
  const openEditModal = (member: TeamMember) => {
    // Make sure to set the 'project' field to its _id if it's already populated as an object
    setCurrentMember({
      ...member,
      project: typeof member.project === 'object' && member.project?._id ? member.project._id : member.project || ''
    });
    setIsEditMemberOpen(true);
  };

  // Handle changes in the edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field: string) => {
    if (!currentMember) return;
    
    setCurrentMember(prev => ({
      ...prev!,
      [field]: typeof e === 'string' ? e : e.target.value
    }));
  };

  // Handle saving the edited member
  const handleSaveEdit = async () => {
    if (!currentMember || !currentMember._id) return;

    // Input validation for edit
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    
    if (!currentMember.name?.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required.', variant: 'destructive' });
      return;
    }
    
    if (!currentMember.email?.trim() || !emailRegex.test(currentMember.email)) {
      toast({ title: 'Validation Error', description: 'Valid email is required.', variant: 'destructive' });
      return;
    }
    
    if (!currentMember.project) {
      toast({ title: 'Validation Error', description: 'Project is required.', variant: 'destructive' });
      return;
    }
    
    if (currentMember.phone && !phoneRegex.test(currentMember.phone)) {
      toast({ title: 'Validation Error', description: 'Valid phone number is required.', variant: 'destructive' });
      return;
    }
    
    if ((currentMember.charges || 0) < 0) {
      toast({ title: 'Validation Error', description: 'Charges cannot be negative.', variant: 'destructive' });
      return;
    }

    if (currentMember.name && currentMember.project && currentMember.email) {
      try {
        await teamAPI.updateTeamMember(currentMember._id, currentMember);
        const updatedMembersRes = await teamAPI.getAllTeam();
        const updatedData = updatedMembersRes?.success && Array.isArray(updatedMembersRes.data) 
          ? updatedMembersRes.data 
          : Array.isArray(updatedMembersRes) 
          ? updatedMembersRes 
          : [];
        setTeamMembers(updatedData);
        toast({ title: 'Updated', description: 'Member updated successfully' });
        setIsEditMemberOpen(false);
        setCurrentMember(null);
      } catch (err: any) {
        toast({ title: 'Error', description: err.response?.data?.error || 'Failed to update member', variant: 'destructive' });
      }
    }
  };


  // Function to reorder employee IDs to be sequential
  const reorderEmployeeIds = async () => {
    try {
      const reorderedMembers = teamMembers.map((member, index) => ({
        ...member,
        employeeId: 'EMP' + String(index + 1).padStart(3, '0')
      }));
      
      // Update each member in the backend
      const updatePromises = reorderedMembers.map(member => 
        member._id ? teamAPI.updateTeamMember(member._id, { employeeId: member.employeeId }) : Promise.resolve()
      );
      
      await Promise.all(updatePromises);
      setTeamMembers(reorderedMembers);
      
      toast({ 
        title: 'Success', 
        description: `Employee IDs have been reordered for ${reorderedMembers.length} members` 
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reorder employee IDs';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  // Function to sync signup data with team members
  const syncSignupData = async () => {
    try {
      setSyncLoading(true);
      const [membersRes, usersResponse] = await Promise.all([
        teamAPI.getAllTeam(),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users`)
      ]);
      
      let membersData: TeamMember[] = [];
      if (membersRes?.success && Array.isArray(membersRes.data)) {
        membersData = membersRes.data;
      } else if (Array.isArray(membersRes)) {
        membersData = membersRes;
      }
      let usersData = [];
      
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
      }
      
      if (!Array.isArray(usersData)) {
        usersData = [];
      }
      
      // Generate unique employee IDs for synced users
      const existingIds = new Set(membersData.map((m: TeamMember) => m.employeeId));
      let adminCounter = 1;
      let managerCounter = 1;
      
      const convertedUsers = usersData.map((user: any) => {
        let employeeId = '';
        if (user.role === 'Admin') {
          do {
            employeeId = `ADM${String(adminCounter).padStart(3, '0')}`;
            adminCounter++;
          } while (existingIds.has(employeeId));
        } else if (user.role === 'Manager') {
          do {
            employeeId = `MGR${String(managerCounter).padStart(3, '0')}`;
            managerCounter++;
          } while (existingIds.has(employeeId));
        } else {
          employeeId = 'USR001'; // Default for other roles
        }
        
        existingIds.add(employeeId);
        
        return {
          _id: user._id,
          employeeId,
          name: user.fullName || user.name || 'Unknown User',
          project: 'N/A',
          email: user.email || '',
          phone: user.phone || '',
          address: '',
          bankName: '',
          bankAddress: '',
          accountHolder: '',
          accountHolderAddress: '',
          account: '',
          accountType: '',
          charges: 0,
          status: 'Active' as const,
          role: user.role || 'Employee',
          shift: 'Monthly' as const,
          isUser: true
        };
      });
      
      const combinedData = [...convertedUsers, ...membersData];
      setTeamMembers(combinedData);
      toast({ 
        title: 'Success', 
        description: `Successfully synced ${convertedUsers.length} users with ${membersData.length} existing members` 
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to sync signup data';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setSyncLoading(false);
    }
  };

  const totalCharges = teamMembers.reduce((sum, m) => sum + (m.charges || 0), 0);
  const activeMembers = teamMembers.filter(m => m.status === 'Active').length;
  const avgCharges = teamMembers.length > 0 ? (totalCharges / teamMembers.length).toFixed(1) : '0';

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
                <button onClick={() => window.location.reload()} className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">Retry</button>
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Management</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Manage team members, sync signup data, and track activity</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={syncSignupData}
                  disabled={syncLoading || loading}
                  className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                >
                  {syncLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <span>🔄 Sync Data</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setReorderLoading(true);
                    try {
                      await reorderEmployeeIds();
                    } finally {
                      setReorderLoading(false);
                    }
                  }}
                  disabled={reorderLoading || loading}
                  className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                >
                  {reorderLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reordering...</span>
                    </>
                  ) : (
                    <span>📋 Reorder IDs</span>
                  )}
                </Button>
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
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
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
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
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            placeholder="Enter member name"
                          />
                        </div>
                        <div>
                          {/* Updated Select for Project */}
                          <Label htmlFor="project">Project *</Label>
                          <Select
                            value={newMember.project}
                            onValueChange={(value) => setNewMember({ ...newMember, project: value })}
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
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newMember.password}
                            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newMember.phone}
                            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newMember.address}
                            onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                            placeholder="Enter full address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newMember.role}
                            onValueChange={(value) => setNewMember({ ...newMember, role: value as 'Employee' | 'Manager' | 'Admin' })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Employee">Employee</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="charges">Charges</Label>
                          <Input
                            id="charges"
                            type="number"
                            value={newMember.charges}
                            onChange={(e) => setNewMember({ ...newMember, charges: Number(e.target.value) })}
                            placeholder="Enter charges"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newMember.status}
                            onValueChange={(value) => setNewMember({ ...newMember, status: value as 'Active' | 'Inactive' | 'Pending' })}
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

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Bank Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={newMember.bankName}
                            onChange={(e) => setNewMember({ ...newMember, bankName: e.target.value })}
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bankAddress">Full Address of Bank</Label>
                          <Input
                            id="bankAddress"
                            value={newMember.bankAddress}
                            onChange={(e) => setNewMember({ ...newMember, bankAddress: e.target.value })}
                            placeholder="Enter bank's full address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolder">Account Holder</Label>
                          <Input
                            id="accountHolder"
                            value={newMember.accountHolder}
                            onChange={(e) => setNewMember({ ...newMember, accountHolder: e.target.value })}
                            placeholder="Account holder name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="accountHolderAddress">Account Holder Address</Label>
                          <Input
                            id="accountHolderAddress"
                            value={newMember.accountHolderAddress}
                            onChange={(e) => setNewMember({ ...newMember, accountHolderAddress: e.target.value })}
                            placeholder="Account holder address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="account">Account Number</Label>
                          <Input
                            id="account"
                            value={newMember.account}
                            onChange={(e) => setNewMember({ ...newMember, account: e.target.value })}
                            placeholder="Account number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select
                            value={newMember.accountType}
                            onValueChange={(value) => setNewMember({ ...newMember, accountType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Savings">Savings</SelectItem>
                              <SelectItem value="Current">Current</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="shift">Shift *</Label>
                          <Select
                            value={newMember.shift}
                            onValueChange={(value) => setNewMember({ ...newMember, shift: value as 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hourly">Hourly</SelectItem>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>Add Member</Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Members</h3>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{teamMembers.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 dark:bg-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">👥</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg border border-green-200 dark:border-green-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Active Members</h3>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{activeMembers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 text-xl font-bold">✅</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Total Charges</h3>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">${totalCharges}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-300 text-xl font-bold">💰</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Avg Charges</h3>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">${avgCharges}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-300 text-xl font-bold">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Role</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Project</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Contact</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Address</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Bank Info</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Charges</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Shift</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member._id} className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              {member.employeeId}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              member.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              member.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {member.role || 'Employee'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.project ? (typeof member.project === 'object' ? member.project.name : member.project) : 
                                <span className="text-gray-400 italic">No Project</span>
                              }
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{member.phone || 'No phone'}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900 dark:text-white max-w-32 truncate" title={member.address || 'No address'}>
                              {member.address || <span className="text-gray-400 italic">No address</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{member.bankName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{member.account || 'No account'}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${member.charges || 0}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              member.shift === 'Hourly' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              member.shift === 'Daily' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              member.shift === 'Weekly' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }`}>
                              {member.shift || 'Monthly'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              member.status === 'Inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(member)}
                                className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(member._id)}
                                className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teamMembers.length === 0 && (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No team members yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first team member to the system.</p>
                      <Button onClick={() => setIsAddMemberOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Member
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
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
                      onChange={(e) => handleEditChange(e, 'name')}
                      placeholder="Enter member name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-project">Project *</Label>
                    <Select
                      value={typeof currentMember.project === 'object' ? currentMember.project._id : currentMember.project}
                      onValueChange={(value) => handleEditChange(value, 'project')}
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
                      onChange={(e) => handleEditChange(e, 'email')}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">Password</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={currentMember.password || ''}
                      onChange={(e) => handleEditChange(e, 'password')}
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={currentMember.phone}
                      onChange={(e) => handleEditChange(e, 'phone')}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={currentMember.address}
                      onChange={(e) => handleEditChange(e, 'address')}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={currentMember.role}
                      onValueChange={(value) => handleEditChange(value as 'Employee' | 'Manager' | 'Admin', 'role')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-charges">Charges</Label>
                    <Input
                      id="edit-charges"
                      type="number"
                      value={currentMember.charges}
                      onChange={(e) => handleEditChange(e, 'charges')}
                      placeholder="Enter charges"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={currentMember.status}
                      onValueChange={(value) => handleEditChange(value as 'Active' | 'Inactive' | 'Pending', 'status')}
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
                  <div>
                    <Label htmlFor="edit-shift">Shift *</Label>
                    <Select
                      value={currentMember.shift}
                      onValueChange={(value) => handleEditChange(value as 'Hourly' | 'Daily' | 'Weekly' | 'Monthly', 'shift')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-bankName">Bank Name</Label>
                    <Input
                      id="edit-bankName"
                      value={currentMember.bankName}
                      onChange={(e) => handleEditChange(e, 'bankName')}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-bankAddress">Full Address of Bank</Label>
                    <Input
                      id="edit-bankAddress"
                      value={currentMember.bankAddress}
                      onChange={(e) => handleEditChange(e, 'bankAddress')}
                      placeholder="Enter bank's full address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-accountHolder">Account Holder</Label>
                    <Input
                      id="edit-accountHolder"
                      value={currentMember.accountHolder}
                      onChange={(e) => handleEditChange(e, 'accountHolder')}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-accountHolderAddress">Account Holder Address</Label>
                    <Input
                      id="edit-accountHolderAddress"
                      value={currentMember.accountHolderAddress}
                      onChange={(e) => handleEditChange(e, 'accountHolderAddress')}
                      placeholder="Account holder address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-account">Account Number</Label>
                    <Input
                      id="edit-account"
                      value={currentMember.account}
                      onChange={(e) => handleEditChange(e, 'account')}
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-accountType">Account Type</Label>
                    <Select
                      value={currentMember.accountType}
                      onValueChange={(value) => handleEditChange(value, 'accountType')}
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

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member from your team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
};

export default Team;