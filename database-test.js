// Database Storage Verification Test
// This script tests all major data storage operations

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  fullName: 'Test Admin User',
  phone: '1234567890',
  email: 'testadmin@example.com',
  password: 'testpass123',
  confirmPassword: 'testpass123',
  role: 'Admin'
};

const testTeamMember = {
  name: 'Test Employee',
  phone: '9876543210',
  email: 'testemployee@example.com',
  password: 'testpass123',
  confirmPassword: 'testpass123',
  project: '507f1f77bcf86cd799439011', // Valid ObjectId
  role: 'Employee'
};

const testProject = {
  name: 'Test Project Storage',
  client: 'Test Client',
  description: 'Testing project data storage',
  startDate: new Date().toISOString(),
  progress: 0,
  team: 1,
  hours: 0,
  status: 'active',
  assignedTeam: [],
  budget: 5000,
  priority: 'medium'
};

async function testDatabaseStorage() {
  console.log('🔍 Starting Database Storage Verification...\n');
  
  let testResults = {
    serverConnection: false,
    userSignup: false,
    teamMemberSignup: false,
    userLogin: false,
    projectCreation: false,
    timeEntryCreation: false,
    dataRetrieval: false
  };

  try {
    // 1. Test Server Connection
    console.log('1️⃣ Testing server connection...');
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      if (response.data.message) {
        console.log('✅ Server is running and accessible');
        testResults.serverConnection = true;
      }
    } catch (error) {
      console.log('❌ Server connection failed:', error.message);
      return testResults;
    }

    // 2. Test User Signup (Admin/Manager)
    console.log('\n2️⃣ Testing user signup and storage...');
    try {
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/user/signup`, testUser);
      if (signupResponse.data.user && signupResponse.data.token) {
        console.log('✅ User signup successful - data stored in database');
        console.log('   User ID:', signupResponse.data.user.id);
        console.log('   Role:', signupResponse.data.user.role);
        testResults.userSignup = true;
      }
    } catch (error) {
      console.log('❌ User signup failed:', error.response?.data?.error || error.message);
    }

    // 3. Test Team Member Signup (Employee)
    console.log('\n3️⃣ Testing team member signup and storage...');
    try {
      const memberSignupResponse = await axios.post(`${API_BASE_URL}/auth/member/signup`, testTeamMember);
      if (memberSignupResponse.data.user && memberSignupResponse.data.token) {
        console.log('✅ Team member signup successful - data stored in database');
        console.log('   Employee ID:', memberSignupResponse.data.user.employeeId);
        console.log('   Name:', memberSignupResponse.data.user.name);
        testResults.teamMemberSignup = true;
      }
    } catch (error) {
      console.log('❌ Team member signup failed:', error.response?.data?.error || error.message);
    }

    // 4. Test Login
    console.log('\n4️⃣ Testing user login...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      if (loginResponse.data.token) {
        console.log('✅ User login successful');
        authToken = loginResponse.data.token;
        testResults.userLogin = true;
      }
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data?.error || error.message);
    }

    // 5. Test Project Creation
    console.log('\n5️⃣ Testing project creation and storage...');
    let projectId = null;
    try {
      const projectResponse = await axios.post(`${API_BASE_URL}/projects`, testProject, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (projectResponse.data) {
        console.log('✅ Project creation successful - data stored in database');
        projectId = projectResponse.data._id || projectResponse.data.id;
        console.log('   Project ID:', projectId);
        testResults.projectCreation = true;
      }
    } catch (error) {
      console.log('❌ Project creation failed:', error.response?.data?.error || error.message);
    }

    // 6. Test Time Entry Creation
    console.log('\n6️⃣ Testing time entry creation and storage...');
    try {
      const timeEntryData = {
        userId: '507f1f77bcf86cd799439011', // Valid ObjectId
        project: projectId || '507f1f77bcf86cd799439011',
        task: '507f1f77bcf86cd799439012',
        description: 'Testing time entry storage',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        billable: true,
        trackingType: 'Hourly',
        isManualEntry: true,
        hourlyRate: 50
      };

      const timeEntryResponse = await axios.post(`${API_BASE_URL}/time-entries`, timeEntryData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (timeEntryResponse.data.success && timeEntryResponse.data.data) {
        console.log('✅ Time entry creation successful - data stored in database');
        console.log('   Entry ID:', timeEntryResponse.data.data._id);
        console.log('   Duration:', timeEntryResponse.data.data.duration, 'minutes');
        testResults.timeEntryCreation = true;
      }
    } catch (error) {
      console.log('❌ Time entry creation failed:', error.response?.data?.error || error.message);
    }

    // 7. Test Data Retrieval
    console.log('\n7️⃣ Testing data retrieval from database...');
    try {
      // Test retrieving all time entries
      const timeEntriesResponse = await axios.get(`${API_BASE_URL}/time-entries`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Test retrieving all team members
      const teamResponse = await axios.get(`${API_BASE_URL}/team/all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Test retrieving all projects
      const projectsResponse = await axios.get(`${API_BASE_URL}/projects/all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('✅ Data retrieval successful:');
      console.log('   Time Entries:', timeEntriesResponse.data?.data?.length || 0);
      console.log('   Team Members:', Array.isArray(teamResponse.data) ? teamResponse.data.length : 0);
      console.log('   Projects:', Array.isArray(projectsResponse.data) ? projectsResponse.data.length : 0);
      testResults.dataRetrieval = true;
      
    } catch (error) {
      console.log('❌ Data retrieval failed:', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.log('❌ Unexpected error during testing:', error.message);
  }

  // Summary
  console.log('\n📊 DATABASE STORAGE TEST RESULTS:');
  console.log('=====================================');
  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All database storage operations are working correctly!');
  } else {
    console.log('⚠️  Some database operations need attention.');
  }

  return testResults;
}

// Run the test
testDatabaseStorage().catch(console.error);
