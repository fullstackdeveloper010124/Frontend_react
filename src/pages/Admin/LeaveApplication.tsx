
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

const LeaveApplication = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [department, setDepartment] = useState('');
  const [leaveDate, setLeaveDate] = useState<Date>();
  const [leaveTime, setLeaveTime] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
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

  const handleReasonChange = (reason: string, checked: boolean) => {
    if (checked) {
      setSelectedReasons([...selectedReasons, reason]);
    } else {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   const formData = {
  //     employeeName,
  //     supervisorName,
  //     department,
  //     leaveDate,
  //     leaveTime,
  //     selectedReasons,
  //     otherReason
  //   };
    
  //   console.log('Leave application submitted:', formData);
    
  //   toast({
  //     title: "Leave Request Submitted",
  //     description: "Your leave request has been submitted successfully. HR will contact you shortly."
  //   });
  // };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = {
    employeeName,
    supervisorName,
    department,
    leaveDate: leaveDate ? leaveDate.toISOString().split("T")[0] : "", // format date
    leaveTime,
    selectedReasons,
    otherReason
  };

  try {
    const response = await fetch("http://localhost:5000/api/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
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
      setSelectedReasons([]);
      setOtherReason('');
    } else {
      toast({ title: "Error", description: result.error || "Submission failed" });
    }
  } catch (error) {
    toast({ title: "Error", description: "Network or server error" });
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="">
            <Card className="shadow-lg bg-orange-50 border-orange-200">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-orange-600">
                  Employee Leave Request Form
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

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-medium mt-6"
                  >
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaveApplication;
