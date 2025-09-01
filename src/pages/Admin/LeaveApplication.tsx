import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Clock, CheckCircle, XCircle, Eye, Search, Calendar as CalendarIcon2, User, FileText, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/Sidebar/AdminSidebar';
import { Header } from '@/components/navbar/AdminHeader';
import { API_URLS, leaveAPI } from '@/lib/api';

interface LeaveApplication {
  _id: string;
  employeeName: string;
  supervisorName: string;
  department: string;
  leaveDate: string;
  leaveTime: string;
  leaveType: string;
  duration: string;
  selectedReasons: string[];
  otherReason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

const LeaveApplication = () => {
  console.log('📝 Admin LeaveApplication component is rendering');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  
  // Form state
  const [employeeName, setEmployeeName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [department, setDepartment] = useState('');
  const [leaveDate, setLeaveDate] = useState<Date>();
  const [leaveTime, setLeaveTime] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  
  // Review state
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  const leaveReasons = [
    'Vacation',
    'Sick - Family',
    'Sick - Self',
    'Doctor Appointment',
    "Worker's Comp",
    'Funeral',
    'Leave of Absence',
    'Military',
    'Jury Duty'
  ];

  // Fetch real leave applications from API
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        setIsLoading(true);
        const response = await leaveAPI.getAllLeaveApplications();
        
        if (response.success && response.data) {
          setApplications(response.data);
        } else {
          console.error('Failed to fetch leave applications:', response);
          toast({
            title: "Error",
            description: "Failed to load leave applications"
          });
        }
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        toast({
          title: "Error",
          description: "Failed to connect to server"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveApplications();
  }, [toast]);

  const handleReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setSelectedReasons([...selectedReasons, reason]);
    } else {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      employeeName,
      supervisorName,
      department,
      leaveDate: leaveDate ? leaveDate.toISOString().split("T")[0] : "",
      leaveTime,
      leaveType,
      duration,
      selectedReasons,
      otherReason,
      description,
      emergencyContact,
      emergencyPhone
    };

    try {
      const response = await leaveAPI.applyLeave(formData);

      if (response.success) {
        toast({
          title: "Leave Request Submitted",
          description: "Your leave request has been submitted successfully. HR will contact you shortly."
        });

        // Reset form
        setEmployeeName('');
        setSupervisorName('');
        setDepartment('');
        setLeaveDate(undefined);
        setLeaveTime('');
        setLeaveType('');
        setDuration('');
        setDescription('');
        setEmergencyContact('');
        setEmergencyPhone('');
        setSelectedReasons([]);
        setOtherReason('');
      } else {
        toast({ title: "Error", description: response.message || "Submission failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network or server error" });
    }
  };

  // Review functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'vacation': { label: 'Vacation', color: 'bg-blue-100 text-blue-800' },
      'sick': { label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
      'personal': { label: 'Personal', color: 'bg-purple-100 text-purple-800' },
      'maternity': { label: 'Maternity', color: 'bg-pink-100 text-pink-800' },
      'paternity': { label: 'Paternity', color: 'bg-indigo-100 text-indigo-800' },
      'bereavement': { label: 'Bereavement', color: 'bg-gray-100 text-gray-800' },
      'jury': { label: 'Jury Duty', color: 'bg-yellow-100 text-yellow-800' },
      'military': { label: 'Military', color: 'bg-green-100 text-green-800' }
    };

    const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const reviewerName = user.name || user.fullName || 'Admin';
      
      const response = await leaveAPI.updateLeaveStatus(
        applicationId, 
        newStatus, 
        reviewComments,
        reviewerName
      );
      
      if (response.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { 
                  ...app, 
                  status: newStatus, 
                  reviewedBy: reviewerName,
                  reviewedAt: new Date().toISOString(),
                  comments: reviewComments
                }
              : app
          )
        );

        toast({
          title: "Status Updated",
          description: `Leave application has been ${newStatus}.`
        });

        setSelectedApplication(null);
        setReviewComments('');
        
        // Refresh the applications list
        const refreshResponse = await leaveAPI.getAllLeaveApplications();
        if (refreshResponse.success && refreshResponse.data) {
          setApplications(refreshResponse.data);
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update leave application status."
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Leave Management</h1>
              <p className="text-gray-600">Submit leave requests and review all employee applications</p>
              <div className="mt-2 p-3 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium border border-orange-200">
                📝 ADMIN INTERFACE - Submit & Review Leave Requests
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="submit">Submit Leave Request</TabsTrigger>
                <TabsTrigger value="review">Review Applications</TabsTrigger>
              </TabsList>

              {/* Submit Tab */}
              <TabsContent value="submit" className="mt-6">
                <Card className="shadow-lg bg-orange-50 border-orange-200">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-orange-600">
                      Submit Leave Request
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base mt-2">
                      Please fill in this form with all the required information. HR will contact
                      you shortly after the leave request has been approved by your
                      supervisor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="employeeName" className="text-orange-700 font-bold">
                          Employee Name
                        </Label>
                        <Input
                          id="employeeName"
                          value={employeeName}
                          onChange={(e) => setEmployeeName(e.target.value)}
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supervisorName" className="text-orange-700 font-bold">
                          Supervisor Name
                        </Label>
                        <Input
                          id="supervisorName"
                          value={supervisorName}
                          onChange={(e) => setSupervisorName(e.target.value)}
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-orange-700 font-bold">
                          Department
                        </Label>
                        <Input
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-orange-700 font-bold">
                          Reason for Leave
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          {leaveReasons.map((reason) => (
                            <div key={reason} className="flex items-center space-x-2">
                              <Checkbox
                                id={reason}
                                checked={selectedReasons.includes(reason)}
                                onCheckedChange={(checked) => 
                                  handleReasonChange(reason, checked as boolean)
                                }
                                className="border-orange-300"
                              />
                              <Label 
                                htmlFor={reason}
                                className="text-gray-700 cursor-pointer text-sm font-normal"
                              >
                                {reason}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2">
                            <Input
                              value={otherReason}
                              onChange={(e) => setOtherReason(e.target.value)}
                              placeholder="Other"
                              className="border-orange-300 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-orange-700 font-bold">
                          Leave Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border-orange-300",
                                !leaveDate && "text-gray-500"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {leaveDate ? format(leaveDate, "yyyy-MM-dd") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={leaveDate}
                              onSelect={setLeaveDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leaveTime" className="text-orange-700 font-bold">
                          Leave Time
                        </Label>
                        <div className="relative">
                          <Input
                            id="leaveTime"
                            type="time"
                            value={leaveTime}
                            onChange={(e) => setLeaveTime(e.target.value)}
                            className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leaveType" className="text-orange-700 font-bold">
                          Leave Type
                        </Label>
                        <Select value={leaveType} onValueChange={setLeaveType} required>
                          <SelectTrigger className="border-orange-300 focus:border-orange-500">
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vacation">Vacation</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="maternity">Maternity</SelectItem>
                            <SelectItem value="paternity">Paternity</SelectItem>
                            <SelectItem value="bereavement">Bereavement</SelectItem>
                            <SelectItem value="jury">Jury Duty</SelectItem>
                            <SelectItem value="military">Military</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-orange-700 font-bold">
                          Duration
                        </Label>
                        <Select value={duration} onValueChange={setDuration} required>
                          <SelectTrigger className="border-orange-300 focus:border-orange-500">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-day">Full Day</SelectItem>
                            <SelectItem value="half-day">Half Day</SelectItem>
                            <SelectItem value="few-hours">Few Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-orange-700 font-bold">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Please provide additional details about your leave request..."
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact" className="text-orange-700 font-bold">
                          Emergency Contact Name
                        </Label>
                        <Input
                          id="emergencyContact"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          placeholder="Emergency contact person"
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone" className="text-orange-700 font-bold">
                          Emergency Contact Phone
                        </Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          placeholder="Emergency contact phone number"
                          className="border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-medium mt-6"
                      >
                        Submit
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review" className="mt-6">
                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                          Search Applications
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="search"
                            placeholder="Search by employee name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="md:w-48">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Filter by Status
                        </Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      All Leave Applications ({filteredApplications.length})
                    </CardTitle>
                    <CardDescription>
                      Review pending applications and admin approved/rejected requests across all departments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading applications...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                No leave applications found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredApplications.map((application) => (
                              <TableRow key={application._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{application.employeeName}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{application.department}</TableCell>
                                <TableCell>{getLeaveTypeBadge(application.leaveType)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <CalendarIcon2 className="w-4 h-4 text-gray-400" />
                                    {application.leaveDate}
                                    <Clock className="w-4 h-4 text-gray-400 ml-2" />
                                    {application.leaveTime}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {application.duration.replace('-', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(application.status)}</TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedApplication(application)}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Leave Application Details</DialogTitle>
                                        <DialogDescription>
                                          Review and take action on this leave request
                                        </DialogDescription>
                                      </DialogHeader>
                                      
                                      {selectedApplication && (
                                        <div className="space-y-6">
                                          {/* Employee Info */}
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Employee Name</Label>
                                              <p className="mt-1 font-medium">{selectedApplication.employeeName}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Department</Label>
                                              <p className="mt-1">{selectedApplication.department}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Leave Type</Label>
                                              <div className="mt-1">{getLeaveTypeBadge(selectedApplication.leaveType)}</div>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Duration</Label>
                                              <p className="mt-1 capitalize">{selectedApplication.duration.replace('-', ' ')}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Leave Date</Label>
                                              <p className="mt-1">{selectedApplication.leaveDate}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Leave Time</Label>
                                              <p className="mt-1">{selectedApplication.leaveTime}</p>
                                            </div>
                                          </div>

                                          {/* Reasons */}
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Reasons for Leave</Label>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                              {selectedApplication.selectedReasons.map((reason, index) => (
                                                <Badge key={index} variant="outline">{reason}</Badge>
                                              ))}
                                              {selectedApplication.otherReason && (
                                                <Badge variant="outline">{selectedApplication.otherReason}</Badge>
                                              )}
                                            </div>
                                          </div>

                                          {/* Description */}
                                          {selectedApplication.description && (
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Description</Label>
                                              <p className="mt-1 text-gray-800">{selectedApplication.description}</p>
                                            </div>
                                          )}

                                          {/* Current Status */}
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                                            <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                          </div>

                                          {/* Review Comments */}
                                          {selectedApplication.status === 'pending' && (
                                            <div>
                                              <Label htmlFor="reviewComments" className="text-sm font-medium text-gray-600">
                                                Review Comments (Optional)
                                              </Label>
                                              <Textarea
                                                id="reviewComments"
                                                value={reviewComments}
                                                onChange={(e) => setReviewComments(e.target.value)}
                                                placeholder="Add comments about your decision..."
                                                className="mt-1"
                                              />
                                            </div>
                                          )}

                                          {/* Previous Review */}
                                          {selectedApplication.status !== 'pending' && selectedApplication.comments && (
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Previous Review</Label>
                                              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-gray-800">{selectedApplication.comments}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Reviewed by {selectedApplication.reviewedBy} on{' '}
                                                  {selectedApplication.reviewedAt && new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Action Buttons */}
                                          {selectedApplication.status === 'pending' && (
                                            <div className="flex gap-3 pt-4 border-t">
                                              <Button
                                                onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                              </Button>
                                              <Button
                                                onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                                                variant="destructive"
                                                className="flex-1"
                                              >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {applications.filter(app => app.status === 'pending').length}
                          </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                          <p className="text-2xl font-bold text-green-600">
                            {applications.filter(app => app.status === 'approved').length}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Applications</p>
                          <p className="text-2xl font-bold text-orange-600">{applications.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaveApplication;