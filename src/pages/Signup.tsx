import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSignup } from '@/hooks/useApi';
import axios from 'axios';
import { API_URLS } from '@/lib/api';


type Role = 'admin' | 'manager' | 'employee';

const isRole = (v: string): v is Role => v === 'admin' || v === 'manager' || v === 'employee';

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch {
    return 'Something went wrong';
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as Role,
    project: '',
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { execute: executeSignup, loading, error: signupError, reset } = useSignup();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, role: isRole(value) ? value : prev.role }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!emailRegex.test(formData.email)) return 'Enter a valid email';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      toast({ title: 'Error', description: validationMessage, variant: 'destructive' });
      return;
    }

    reset(); // clear previous errors

    try {
      await executeSignup({
        name: formData.name,
        fullName: formData.name, // for admin/manager signup
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        project: formData.project || undefined,
      });
      toast({ title: 'Success', description: 'Account created successfully!' });
      navigate('/login');
    } catch (err: unknown) {
      console.error('Signup error:', err);
      toast({
        title: 'Signup Failed',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to get started with TimeTracker</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Optional project input – re-enable when needed
            {formData.role === 'employee' && (
              <div className="space-y-2">
                <Label htmlFor="project">Project ID (Optional)</Label>
                <Input
                  id="project"
                  name="project"
                  type="text"
                  placeholder="Enter project ID or leave empty for default"
                  value={formData.project}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">Leave empty to use default project</p>
              </div>
            )} */}

            {signupError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {typeof signupError === 'string' ? signupError : 'Signup failed'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
