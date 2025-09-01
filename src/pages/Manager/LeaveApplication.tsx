import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Filter, Search, Calendar, User, Clock, FileText, AlertCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar/ManagerSidebar';
import { Header } from '@/components/navbar/ManagerHeader';
import { useToast } from '@/hooks/use-toast';
import { leaveAPI } from '@/lib/api';

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
  console.log('🎯 Manager LeaveApplication component is rendering');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      const reviewerName = user.name || user.fullName || 'Manager';
      
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Leave Applications</h1>
            <p className="text-gray-600">Review and manage employee leave requests</p>
            <div className="mt-2 p-4 bg-green-100 text-green-800 rounded-lg text-lg font-bold border-2 border-green-300 shadow-lg">
              🎯 MANAGER INTERFACE - Review & Approve Employee Leave Requests
              <br />
              <span className="text-sm font-normal">This should show a TABLE with applications to review, NOT a form!</span>
            </div>
          </div>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
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
                Leave Applications ({filteredApplications.length})
              </CardTitle>
              <CardDescription>
                Review pending applications and manage approved/rejected requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                              <Calendar className="w-4 h-4 text-gray-400" />
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
        </main>
      </div>
    </div>
  );
};

export default LeaveApplication;

