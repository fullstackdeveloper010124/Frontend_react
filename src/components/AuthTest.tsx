import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin, useSignup } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { execute: executeLogin, loading: loginLoading, error: loginError, reset: resetLogin } = useLogin();
  const { execute: executeSignup, loading: signupLoading, error: signupError, reset: resetSignup } = useSignup();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    phone: '',
    project: '',
    department: '',
    position: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetLogin();
    try {
      await executeLogin(loginForm);
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetSignup();
    try {
      await executeSignup(signupForm);
    } catch (error) {
      console.error('Signup test failed:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Authentication Successful!
          </CardTitle>
          <CardDescription>
            You are now logged in and can test the API integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?._id}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            {user?.department && <p><strong>Department:</strong> {user.department}</p>}
            {user?.position && <p><strong>Position:</strong> {user.position}</p>}
          </div>
          
          <Button onClick={logout} variant="outline" className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Authentication Test</CardTitle>
        <CardDescription>
          Test signup and login functionality with your backend API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Login...
                  </>
                ) : (
                  'Test Login'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="signup-password">Password</Label>
                 <Input
                   id="signup-password"
                   type="password"
                   placeholder="Enter your password"
                   value={signupForm.password}
                   onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                 <Input
                   id="signup-confirm-password"
                   type="password"
                   placeholder="Confirm your password"
                   value={signupForm.confirmPassword}
                   onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="signup-phone">Phone Number</Label>
                 <Input
                   id="signup-phone"
                   type="tel"
                   placeholder="Enter your phone number"
                   value={signupForm.phone}
                   onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                   required
                 />
               </div>

                             <div className="space-y-2">
                 <Label htmlFor="signup-role">Role</Label>
                 <select
                   id="signup-role"
                   className="w-full p-2 border border-gray-300 rounded-md"
                   value={signupForm.role}
                   onChange={(e) => setSignupForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'employee' }))}
                   required
                 >
                   <option value="employee">Employee</option>
                   <option value="manager">Manager</option>
                   <option value="admin">Admin</option>
                 </select>
               </div>

               {signupForm.role === 'employee' && (
                 <div className="space-y-2">
                   <Label htmlFor="signup-project">Project ID</Label>
                   <Input
                     id="signup-project"
                     type="text"
                     placeholder="Enter project ID (or leave default)"
                     value={signupForm.project}
                     onChange={(e) => setSignupForm(prev => ({ ...prev, project: e.target.value }))}
                   />
                   <p className="text-xs text-gray-500">Leave empty to use default project</p>
                 </div>
               )}

              <div className="space-y-2">
                <Label htmlFor="signup-department">Department (Optional)</Label>
                <Input
                  id="signup-department"
                  type="text"
                  placeholder="Enter department"
                  value={signupForm.department}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-position">Position (Optional)</Label>
                <Input
                  id="signup-position"
                  type="text"
                  placeholder="Enter position"
                  value={signupForm.position}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              {signupError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={signupLoading}>
                {signupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Signup...
                  </>
                ) : (
                  'Test Signup'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test Instructions:</h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. Make sure your backend is running on port 5000</li>
            <li>2. Try signing up with a new account first</li>
            <li>3. Then try logging in with the same credentials</li>
            <li>4. Check the browser console for any errors</li>
            <li>5. Check the Network tab to see API calls</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthTest;
