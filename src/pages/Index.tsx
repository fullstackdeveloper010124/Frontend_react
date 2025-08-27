import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee',
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect based on role
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      const roleToPath: Record<string, string> = {
        employee: '/employee/dashboard',
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
      };
      navigate(roleToPath[user.role] || '/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(formData.email, formData.password);
      if (!ok) {
        setError('Invalid credentials');
        toast({ title: 'Login Failed', description: 'Invalid credentials', variant: 'destructive' });
        return;
      }
      toast({ title: 'Success', description: 'Logged in successfully!' });
      const roleToPath: Record<string, string> = {
        employee: '/employee/dashboard',
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
      };
      const chosenRole = user?.role || formData.role;
      const next = roleToPath[chosenRole] || '/employee/dashboard';
      navigate(next, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Login failed');
      toast({ title: 'Login Failed', description: err?.message || 'Login failed', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your TimeTracker account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting || isLoading}>
              {submitting ? 'Signing In...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
