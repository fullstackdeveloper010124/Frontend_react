
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, FileText, AlertCircle, CheckCircle, Loader2, Info, Calendar, Clock } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar/EmployeeSidebar';
import { Header } from '@/components/navbar/EmployeeHeader';
import { leaveAPI } from '@/lib/api';

interface LeaveFormData {
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
  emergencyContact: string;
  emergencyPhone: string;
}

const LeaveApplication = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    employeeName: '',
    supervisorName: '',
    department: '',
    leaveDate: '',
    leaveTime: '',
    leaveType: '',
    duration: '',
    selectedReasons: [],
    otherReason: '',
    description: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation Leave', color: 'bg-blue-100 text-blue-800' },
    { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
    { value: 'personal', label: 'Personal Leave', color: 'bg-purple-100 text-purple-800' },
    { value: 'maternity', label: 'Maternity Leave', color: 'bg-pink-100 text-pink-800' },
    { value: 'paternity', label: 'Paternity Leave', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'bereavement', label: 'Bereavement Leave', color: 'bg-gray-100 text-gray-800' },
    { value: 'jury', label: 'Jury Duty', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'military', label: 'Military Leave', color: 'bg-green-100 text-green-800' }
  ];

  const durationOptions = [
    { value: 'half-day', label: 'Half Day' },
    { value: 'full-day', label: 'Full Day' },
    { value: 'multiple-days', label: 'Multiple Days' }
  ];

  const leaveReasons = [
    'Medical Appointment',
    'Family Emergency',
    'Personal Matters',
    'Travel',
    'Rest and Relaxation',
    'Education/Training',
    'Religious Observance',
    'Other'
  ];

  // Auto-fill form with user data if available
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setFormData(prev => ({
          ...prev,
          employeeName: userData.name || userData.fullName || '',
          department: userData.department || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof LeaveFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedReasons: [...prev.selectedReasons, reason]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedReasons: prev.selectedReasons.filter(r => r !== reason)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveDate) {
      alert("Please select a leave date");
      return;
    }

    if (formData.selectedReasons.length === 0 && !formData.otherReason) {
      alert("Please select at least one reason for leave");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        employeeName: formData.employeeName,
        supervisorName: formData.supervisorName,
        department: formData.department,
        leaveDate: formData.leaveDate,
        leaveTime: formData.leaveTime,
        leaveType: formData.leaveType,
        duration: formData.duration,
        selectedReasons: formData.selectedReasons,
        otherReason: formData.otherReason,
        description: formData.description,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone
      };

      // Call the API to submit leave application
      const response = await leaveAPI.applyLeave(submitData);
      
      if (response.success) {
        console.log('Leave application submitted successfully:', response.data);
        setShowSuccess(true);

        // Reset form
        setFormData({
          employeeName: formData.employeeName, // Keep employee name
          department: formData.department, // Keep department
          supervisorName: '',
          leaveDate: '',
          leaveTime: '',
          leaveType: '',
          duration: '',
          selectedReasons: [],
          otherReason: '',
          description: '',
          emergencyContact: '',
          emergencyPhone: ''
        });

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(response.message || 'Failed to submit leave request');
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.employeeName && 
           formData.supervisorName && 
           formData.department && 
           formData.leaveDate && 
           formData.leaveTime && 
           formData.leaveType && 
           formData.duration &&
           (formData.selectedReasons.length > 0 || formData.otherReason);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Leave Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your leave application has been successfully submitted. Our HR team will review and process your request within 2-3 business days.
            </p>
            <Button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6  mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Leave Application Form
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Submit your leave request with all necessary details. Our HR team will review 
              and process your request within 2-3 business days.
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Employee Leave Request
              </CardTitle>
              <CardDescription className="text-blue-100">
                Please fill in all required fields marked with *
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Employee Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Employee Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employeeName" className="text-gray-700 font-medium">
                        Employee Name *
                      </Label>
                      <Input
                        id="employeeName"
                        value={formData.employeeName}
                        onChange={(e) => handleInputChange('employeeName', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisorName" className="text-gray-700 font-medium">
                        Supervisor Name *
                      </Label>
                      <Input
                        id="supervisorName"
                        value={formData.supervisorName}
                        onChange={(e) => handleInputChange('supervisorName', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Enter supervisor's name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700 font-medium">
                        Department *
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Enter your department"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-gray-700 font-medium">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone" className="text-gray-700 font-medium">
                        Emergency Phone
                      </Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Emergency contact phone"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Details Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Leave Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Leave Type *
                      </Label>
                      <Select value={formData.leaveType} onValueChange={(value) => handleInputChange('leaveType', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={type.color}>{type.label}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Duration *
                      </Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leaveDate" className="text-gray-700 font-medium">
                        Leave Date *
                      </Label>
                      <Input
                        id="leaveDate"
                        type="date"
                        value={formData.leaveDate}
                        onChange={(e) => handleInputChange('leaveDate', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leaveTime" className="text-gray-700 font-medium">
                        Leave Time *
                      </Label>
                      <Input
                        id="leaveTime"
                        type="time"
                        value={formData.leaveTime}
                        onChange={(e) => handleInputChange('leaveTime', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Reason Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Reason for Leave
                  </h3>
                  
                  <div className="space-y-4">
                    <Label className="text-gray-700 font-medium">
                      Select Reasons * (Choose all that apply)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {leaveReasons.map((reason) => (
                        <div key={reason} className="flex items-center space-x-2">
                          <Checkbox
                            id={reason}
                            checked={formData.selectedReasons.includes(reason)}
                            onCheckedChange={(checked) => 
                              handleReasonChange(reason, checked as boolean)
                            }
                            className="border-gray-300 focus:ring-blue-500"
                          />
                          <Label 
                            htmlFor={reason}
                            className="text-gray-700 cursor-pointer text-sm font-normal"
                          >
                            {reason}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="otherReason" className="text-gray-700 font-medium">
                        Other Reason
                      </Label>
                      <Input
                        id="otherReason"
                        value={formData.otherReason}
                        onChange={(e) => handleInputChange('otherReason', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Specify other reason if not listed above"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Additional Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 font-medium">
                      Detailed Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 min-h-[100px]"
                      placeholder="Provide additional details about your leave request..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submit Leave Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="mt-8 shadow-lg border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Important Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium">Processing Time:</p>
                  <p>2-3 business days for review</p>
                </div>
                <div>
                  <p className="font-medium">Notification:</p>
                  <p>You'll receive email confirmation</p>
                </div>
                <div>
                  <p className="font-medium">Required Fields:</p>
                  <p>All fields marked with * are mandatory</p>
                </div>
                <div>
                  <p className="font-medium">Contact HR:</p>
                  <p>For urgent requests, contact HR directly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default LeaveApplication;
