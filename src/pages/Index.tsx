import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLogin } from '@/hooks/useApi';

type Role = 'employee' | 'admin' | 'manager';

const isRole = (v: string): v is Role =>
  v === 'employee' || v === 'admin' || v === 'manager';

const ensureErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Invalid credentials';
  }
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  // Rename `error` to avoid shadowing with catch variable
  const { execute: executeLogin, loading, error: loginError, reset } = useLogin();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Optional basic validation to avoid bad requests
    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        title: 'Error',
        description: 'Email and password are required',
        variant: 'destructive',
      });
      return;
    }

    reset(); // Clear any previous errors

    try {
      const result = await executeLogin({
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });

      // Map validated role to route
      const roleToPath: Record<Role, string> = {
        employee: '/employee/dashboard',
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
      };

      // Safely read role and narrow it to a known union
      const rawRole = (result as any)?.data?.user?.role as string | undefined;
      const role: Role = rawRole && isRole(rawRole) ? rawRole : 'employee';

      navigate(roleToPath[role]);
    } catch (err: unknown) {
      console.error('Login error:', err);
      toast({
        title: 'Login Failed',
        description: ensureErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your TimeTracker account</CardDescription>
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

            {loginError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {typeof loginError === 'string' ? loginError : 'Login failed'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            Don&apos;t have an account?{' '}
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
