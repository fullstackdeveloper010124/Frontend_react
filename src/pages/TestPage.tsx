import React from 'react';
import AuthTest from '@/components/AuthTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">API Integration Test Page</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test your signup and login functionality with the new API integration system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* New API Integration Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ New API Integration</CardTitle>
              <CardDescription>
                Test the new API integration with custom hooks and authentication context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthTest />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Testing Instructions</CardTitle>
              <CardDescription>
                Follow these steps to verify your authentication is working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Prerequisites:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Backend server running on port 5000</li>
                  <li>• MongoDB connected and running</li>
                  <li>• CORS enabled on backend</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Test Steps:</h4>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li>1. <strong>Signup Test:</strong> Create a new account using the signup form</li>
                  <li>2. <strong>Login Test:</strong> Try logging in with the created credentials</li>
                  <li>3. <strong>Token Storage:</strong> Check if token is stored in localStorage</li>
                  <li>4. <strong>User Data:</strong> Verify user information is displayed after login</li>
                  <li>5. <strong>Logout Test:</strong> Test the logout functionality</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Debug Tools:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Open browser DevTools (F12)</li>
                  <li>• Check Console tab for errors</li>
                  <li>• Check Network tab for API calls</li>
                  <li>• Check Application tab → Local Storage</li>
                </ul>
              </div>

              <Separator />

                             <div>
                 <h4 className="font-semibold mb-2">Expected API Calls:</h4>
                 <ul className="text-sm space-y-1 text-gray-600">
                   <li>• <code>POST /api/auth/user/signup</code> - Admin/Manager registration</li>
                   <li>• <code>POST /api/auth/member/signup</code> - Employee registration</li>
                   <li>• <code>POST /api/auth/login</code> - User login</li>
                 </ul>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend Issues:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• CORS errors → Check backend CORS configuration</li>
                  <li>• Network errors → Verify backend is running</li>
                  <li>• Type errors → Check TypeScript interfaces</li>
                  <li>• Import errors → Verify file paths</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend Issues:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• MongoDB connection → Check MONGO_URI</li>
                  <li>• Port conflicts → Verify port 5000 is free</li>
                  <li>• Route errors → Check endpoint paths</li>
                  <li>• Validation errors → Check request body format</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
