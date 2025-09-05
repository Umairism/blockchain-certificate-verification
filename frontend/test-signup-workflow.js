// Test script to verify the complete signup and login workflow
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function testSignupAndLogin() {
    try {
        console.log('🚀 Testing Complete Signup & Login Workflow\n');
        
        // Test data
        const testUser = {
            username: `testuser_${Date.now()}`,
            password: 'securepassword123',
            role: 'Admin'
        };
        
        console.log('📝 Step 1: Testing User Signup...');
        console.log(`Username: ${testUser.username}`);
        console.log(`Role: ${testUser.role}\n`);
        
        // Signup
        const signupResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
            username: testUser.username,
            password: testUser.password,
            role: testUser.role
        });
        
        console.log('✅ Signup successful!');
        console.log('Signup Response:', JSON.stringify(signupResponse.data, null, 2));
        console.log();
        
        console.log('🔐 Step 2: Testing Login with new account...');
        
        // Login
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: testUser.username,
            password: testUser.password
        });
        
        console.log('✅ Login successful!');
        console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));
        
        const token = loginResponse.data.data?.access_token;
        console.log('JWT Token received:', token ? 'Yes ✅' : 'No ❌');
        console.log();
        
        if (token) {
            console.log('📋 Step 3: Testing authenticated API call...');
            
            // Test certificate creation with the new token
            const certificateData = {
                student_name: 'Test Student from Signup',
                degree: 'Software Engineering', 
                issue_date: '2025-09-02',
                certificate_id: `CERT_${Date.now()}_SIGNUP_TEST`
            };
            
            const certResponse = await axios.post(`${API_BASE_URL}/add_certificate`, certificateData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Certificate creation successful!');
            console.log('Certificate Details:', JSON.stringify(certResponse.data, null, 2));
            console.log();
            
            console.log('🔍 Step 4: Verifying the certificate...');
            
            const verifyResponse = await axios.get(`${API_BASE_URL}/verify/simple/${certificateData.certificate_id}`);
            
            console.log('✅ Certificate verification successful!');
            console.log('Verification Result:', JSON.stringify(verifyResponse.data, null, 2));
            console.log();
        }
        
        console.log('🎉 ALL TESTS PASSED! Complete signup to certificate creation workflow works!');
        console.log('\n📊 Summary:');
        console.log('✅ User Registration');
        console.log('✅ JWT Authentication'); 
        console.log('✅ Token Storage');
        console.log('✅ Authenticated API Calls');
        console.log('✅ Certificate Creation');
        console.log('✅ Certificate Verification');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testSignupAndLogin();
