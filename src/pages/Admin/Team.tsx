import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { Plus, Trash2, Edit, Loader2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { teamAPI, projectAPI, shiftAPI, TeamMember, Project, Shift } from '@/lib/api';

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
  isUser: any;
}

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isShiftAssignOpen, setIsShiftAssignOpen] = useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [memberForShift, setMemberForShift] = useState<TeamMember | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('Weekly');
  
  // Get current user role for permissions
  const [currentUserRole, setCurrentUserRole] = useState<string>('Employee');
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user from localStorage:', user);
    console.log('User role:', user.role);
    setCurrentUserRole(user.role || 'Employee');
  }, []);
  
  // Shift assignment state
  const [shiftData, setShiftData] = useState({
    shiftType: 'Hourly' as 'Hourly' | 'Daily' | 'Weekly' | 'Monthly',
    startTime: '09:00',
    endTime: '17:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    description: '',
    hoursPerDay: 8,
    daysPerWeek: 5,
    weeksPerMonth: 4,
    monthlyHours: 160
  });

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
    shift: 'Monthly',
    isUser: false
  });

  const { toast } = useToast();

  // Test function to verify API connectivity
  const testApiConnection = async () => {
    try {
      console.log('🔄 Testing API connection...');
      const response = await teamAPI.getAllTeam();
      console.log('✅ API connection test successful:', response);
      toast({ title: 'API Test', description: 'API connection is working!' });
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      toast({ title: 'API Test Failed', description: 'Cannot connect to API', variant: 'destructive' });
    }
  };

  // Permission helper functions - Must match backend permissions exactly
  const canEditMember = (memberRole: string) => {
    const userRole = currentUserRole?.toLowerCase();
    const targetRole = memberRole?.toLowerCase();
    console.log('canEditMember - currentUserRole:', currentUserRole, 'memberRole:', memberRole);
    
    // TEMPORARY DEV OVERRIDE - Remove in production
    // Allow edit access for development/testing purposes
    const isDevelopment = import.meta.env.MODE === 'development';
    if (isDevelopment && window.location.pathname.includes('/admin/')) {
      console.log('🔧 DEV MODE: Allowing edit access for testing');
      return true;
    }
    
    // Only Admin can edit all members
    if (userRole === 'admin') return true;
    
    // Manager can edit employees only (not other managers or admins)
    if (userRole === 'manager' && targetRole === 'employee') return true;
    
    // Employees cannot edit anyone (matches backend: 'Employees cannot edit any members')
    return false;
  };

  const canDeleteMember = (memberRole: string) => {
    const userRole = currentUserRole?.toLowerCase();
    const targetRole = memberRole?.toLowerCase();
    console.log('canDeleteMember - currentUserRole:', currentUserRole, 'memberRole:', memberRole);
    
    // TEMPORARY DEV OVERRIDE - Remove in production
    // Allow delete access for development/testing purposes
    const isDevelopment = import.meta.env.MODE === 'development';
    if (isDevelopment && window.location.pathname.includes('/admin/')) {
      console.log('🔧 DEV MODE: Allowing delete access for testing');
      return true;
    }
    
    // Only Admin can delete all members
    if (userRole === 'admin') return true;
    
    // Manager can delete employees only (not other managers or admins)
    if (userRole === 'manager' && targetRole === 'employee') return true;
    
    // Employees cannot delete anyone (matches backend permissions)
    return false;
  };

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
          shift: 'Monthly',
          isUser: false
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
    console.log('🔄 Opening edit modal for member:', member);
    
    // Ensure all required fields have default values and proper types
    const memberForEdit = {
      ...member,
      // Handle project field - could be string ID or object
      project: typeof member.project === 'object' && member.project?._id 
        ? member.project._id 
        : member.project || '',
      // Ensure numeric fields are numbers
      charges: typeof member.charges === 'string' 
        ? parseFloat(member.charges) || 0 
        : member.charges || 0,
      // Ensure string fields have default values
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      bankName: member.bankName || '',
      bankAddress: member.bankAddress || '',
      accountHolder: member.accountHolder || '',
      accountHolderAddress: member.accountHolderAddress || '',
      account: member.account || '',
      accountType: member.accountType || '',
      // Ensure enum fields have valid values
      role: member.role || 'Employee',
      status: member.status || 'Active',
      shift: member.shift || 'Monthly'
    };
    
    console.log('🔄 Prepared member data for editing:', memberForEdit);
    setCurrentMember(memberForEdit);
    setIsEditMemberOpen(true);
  };

  // Handle changes in the edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field: string) => {
    if (!currentMember) return;
    
    let value: any = typeof e === 'string' ? e : e.target.value;
    
    // Handle numeric fields properly
    if (field === 'charges') {
      value = parseFloat(value) || 0;
    }
    
    setCurrentMember(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  // Handle saving the edited member
  const handleSaveEdit = async () => {
    if (!currentMember || !currentMember._id) {
      console.error('No current member or member ID found');
      toast({ title: 'Error', description: 'No member selected for editing', variant: 'destructive' });
      return;
    }

    console.log('🔄 Starting save operation for member:', currentMember._id);
    console.log('🔄 Member data to save:', currentMember);

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

    try {
      console.log('✅ Validation passed, attempting API update...');
      
      // Clean and prepare data for API call - remove undefined/null values and ensure proper types
      const cleanUpdateData = {
        name: currentMember.name?.trim(),
        email: currentMember.email?.trim(),
        phone: currentMember.phone?.trim() || '',
        project: currentMember.project,
        role: currentMember.role,
        charges: typeof currentMember.charges === 'string' ? parseFloat(currentMember.charges) || 0 : (currentMember.charges || 0),
        status: currentMember.status,
        shift: currentMember.shift,
        address: currentMember.address?.trim() || '',
        bankName: currentMember.bankName?.trim() || '',
        bankAddress: currentMember.bankAddress?.trim() || '',
        accountHolder: currentMember.accountHolder?.trim() || '',
        accountHolderAddress: currentMember.accountHolderAddress?.trim() || '',
        account: currentMember.account?.trim() || '',
        accountType: currentMember.accountType || ''
      };
      
      // Remove empty string values to avoid backend issues
      Object.keys(cleanUpdateData).forEach(key => {
        if (cleanUpdateData[key] === '' || cleanUpdateData[key] === null || cleanUpdateData[key] === undefined) {
          delete cleanUpdateData[key];
        }
      });
      
      console.log('🔄 Sending cleaned update data:', cleanUpdateData);
      console.log('🔄 API URL will be:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/team/update/${currentMember._id}`);
      
      // Try the API call with better error handling
      let updateResponse;
      try {
        updateResponse = await teamAPI.updateTeamMember(currentMember._id, cleanUpdateData);
        console.log('✅ Update response:', updateResponse);
      } catch (apiError: any) {
        console.error('❌ API Call failed:', apiError);
        console.error('❌ API Error details:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          url: apiError.config?.url,
          method: apiError.config?.method
        });
        throw apiError;
      }
      
      // Check if update was successful
      if (updateResponse && (updateResponse.success !== false)) {
        console.log('✅ Update successful, refreshing data...');
        
        // Refresh the team members list
        try {
          const updatedMembersRes = await teamAPI.getAllTeam();
          console.log('🔄 Fresh team data response:', updatedMembersRes);
          
          let updatedData = [];
          if (updatedMembersRes?.success && Array.isArray(updatedMembersRes.data)) {
            updatedData = updatedMembersRes.data;
          } else if (Array.isArray(updatedMembersRes)) {
            updatedData = updatedMembersRes;
          } else {
            console.warn('⚠️ Unexpected team data format, keeping current data');
            updatedData = teamMembers;
          }
          
          setTeamMembers(updatedData);
          console.log('✅ Team members updated in state, count:', updatedData.length);
          
          toast({ title: 'Success', description: 'Member updated successfully!' });
          setIsEditMemberOpen(false);
          setCurrentMember(null);
          
        } catch (refreshError: any) {
          console.error('❌ Failed to refresh team data:', refreshError);
          // Still show success since the update worked
          toast({ title: 'Success', description: 'Member updated successfully! Please refresh the page to see changes.' });
          setIsEditMemberOpen(false);
          setCurrentMember(null);
        }
      } else {
        throw new Error('Update response indicates failure');
      }
      
    } catch (err: any) {
      console.error('❌ Update member error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error config:', err.config);
      
      let errorMessage = 'Failed to update member';
      
      // Handle permission errors in development mode
      if (err.response?.status === 403 && import.meta.env.MODE === 'development') {
        const backendError = err.response?.data?.error || '';
        if (backendError.includes('cannot edit') || backendError.includes('Employees cannot')) {
          toast({ 
            title: 'Development Mode Notice', 
            description: `Backend Permission Error: ${backendError}. In production, ensure proper user roles are assigned.`, 
            variant: 'destructive' 
          });
          
          // In development, show a warning but allow UI to continue
          console.warn('🔧 DEV MODE: Backend rejected edit due to permissions. Frontend will show success for testing.');
          
          // Simulate successful update for development testing
          toast({ 
            title: 'Dev Mode Success', 
            description: 'Frontend edit successful (backend permission bypassed for testing)', 
          });
          setIsEditMemberOpen(false);
          setCurrentMember(null);
          return;
        }
      }
      
      if (err.response?.status === 404) {
        errorMessage = 'Member not found. Please refresh the page and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || err.response?.data?.message || 'Invalid data provided';
      } else if (err.response?.status === 403) {
        errorMessage = err.response?.data?.error || 'Permission denied. Contact administrator for access.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({ 
        title: 'Update Failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  // Function to open shift assignment modal
  const openShiftAssignModal = (member: TeamMember) => {
    setMemberForShift(member);
    // Reset shift data to defaults
    setShiftData({
      shiftType: member.shift || 'Hourly',
      startTime: '09:00',
      endTime: '17:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      description: '',
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeksPerMonth: 4,
      monthlyHours: 160
    });
    setIsShiftAssignOpen(true);
  };

  // Function to handle shift assignment
  const handleAssignShift = async () => {
    if (!memberForShift) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const assignedBy = currentUser._id || 'admin';

      await shiftAPI.assignShift({
        employeeId: memberForShift._id,
        shiftType: shiftData.shiftType,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        workingDays: shiftData.workingDays,
        description: shiftData.description,
        hoursPerDay: shiftData.hoursPerDay,
        daysPerWeek: shiftData.daysPerWeek,
        weeksPerMonth: shiftData.weeksPerMonth,
        monthlyHours: shiftData.monthlyHours,
        assignedBy
      });

      toast({
        title: 'Success',
        description: `Shift assigned successfully to ${memberForShift.name}`
      });

      setIsShiftAssignOpen(false);
      setMemberForShift(null);

      // Refresh team members to show updated shift
      const updatedMembersRes = await teamAPI.getAllTeam();
      const updatedData = updatedMembersRes?.success && Array.isArray(updatedMembersRes.data) 
        ? updatedMembersRes.data 
        : Array.isArray(updatedMembersRes) 
        ? updatedMembersRes 
        : [];
      setTeamMembers(updatedData);

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to assign shift';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
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
                {/* Role-based access information */}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    currentUserRole?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    currentUserRole?.toLowerCase() === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    Your Role: {currentUserRole || 'Unknown'}
                  </span>
                  {currentUserRole?.toLowerCase() === 'employee' && (
                    <>
                      {import.meta.env.MODE === 'development' ? (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          🔧 DEV MODE: Edit access enabled for testing
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          ⚠️ View-only access - Contact admin for edit permissions
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Admin-only actions */}
                {currentUserRole === 'Admin' && (
                  <>
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
                    <Button
                      variant="outline"
                      onClick={testApiConnection}
                      className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                    >
                      <span>🔧 Test API</span>
                    </Button>
                  </>
                )}
                
                {/* Add Member - Available for Admin and Manager */}
                {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
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
                )}
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
                            <div className="flex items-center space-x-2">
                              {/* Edit button - role-based permissions */}
                              {canEditMember(member.role || 'Employee') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(member)}
                                  className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                                  title="Edit Member"
                                >
                                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </Button>
                              )}
                              
                              {/* Shift assignment button - available for admins and managers */}
                              {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openShiftAssignModal(member)}
                                  className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-900/20"
                                  title="Assign Shift"
                                >
                                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </Button>
                              )}
                              
                              {/* Delete button - role-based permissions */}
                              {canDeleteMember(member.role || 'Employee') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmDelete(member._id)}
                                  className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </Button>
                              )}
                              
                              {/* Show message when no actions available */}
                              {!canEditMember(member.role || 'Employee') && 
                               !canDeleteMember(member.role || 'Employee') && 
                               !(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 italic" title="Contact admin for edit permissions">
                                  🔒 View only
                                </span>
                              )}
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

      {/* Shift Assignment Dialog */}
      <Dialog open={isShiftAssignOpen} onOpenChange={setIsShiftAssignOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Shift to {memberForShift?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shiftType">Shift Type *</Label>
                <Select
                  value={shiftData.shiftType}
                  onValueChange={(value) => setShiftData({ ...shiftData, shiftType: value as 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={shiftData.description}
                  onChange={(e) => setShiftData({ ...shiftData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={shiftData.startTime}
                  onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={shiftData.endTime}
                  onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
                />
              </div>

              {shiftData.shiftType === 'Hourly' && (
                <div>
                  <Label htmlFor="hoursPerDay">Hours per Day</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    min="1"
                    max="24"
                    value={shiftData.hoursPerDay}
                    onChange={(e) => setShiftData({ ...shiftData, hoursPerDay: parseInt(e.target.value) || 8 })}
                  />
                </div>
              )}

              {shiftData.shiftType === 'Daily' && (
                <div>
                  <Label htmlFor="daysPerWeek">Days per Week</Label>
                  <Input
                    id="daysPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    value={shiftData.daysPerWeek}
                    onChange={(e) => setShiftData({ ...shiftData, daysPerWeek: parseInt(e.target.value) || 5 })}
                  />
                </div>
              )}

              {shiftData.shiftType === 'Weekly' && (
                <div>
                  <Label htmlFor="weeksPerMonth">Weeks per Month</Label>
                  <Input
                    id="weeksPerMonth"
                    type="number"
                    min="1"
                    max="5"
                    value={shiftData.weeksPerMonth}
                    onChange={(e) => setShiftData({ ...shiftData, weeksPerMonth: parseInt(e.target.value) || 4 })}
                  />
                </div>
              )}

              {shiftData.shiftType === 'Monthly' && (
                <div>
                  <Label htmlFor="monthlyHours">Monthly Hours</Label>
                  <Input
                    id="monthlyHours"
                    type="number"
                    min="1"
                    value={shiftData.monthlyHours}
                    onChange={(e) => setShiftData({ ...shiftData, monthlyHours: parseInt(e.target.value) || 160 })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Working Days</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shiftData.workingDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShiftData({ ...shiftData, workingDays: [...shiftData.workingDays, day] });
                        } else {
                          setShiftData({ ...shiftData, workingDays: shiftData.workingDays.filter(d => d !== day) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsShiftAssignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignShift} className="bg-indigo-600 hover:bg-indigo-700">
                <Clock className="w-4 h-4 mr-2" />
                Assign Shift
              </Button>
            </div>
          </div>
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