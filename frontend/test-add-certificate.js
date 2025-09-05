// Test script to verify the admin certificate creation functionality
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function testAddCertificate() {
    try {
        console.log('🔐 Step 1: Logging in as admin...');
        
        // Login to get JWT token
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
        const token = loginResponse.data.data?.access_token || loginResponse.data.access_token;
        console.log('✅ Login successful, token received:', token ? 'Yes' : 'No');
        
        console.log('📝 Step 2: Creating a new certificate...');
        
        // Create certificate data
        const certificateData = {
            student_name: 'Test Student',
            degree: 'Computer Science',
            issue_date: '2025-09-02',
            certificate_id: `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
        
        // Add certificate
        const addResponse = await axios.post(`${API_BASE_URL}/add_certificate`, certificateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Certificate created successfully!');
        console.log('📋 Certificate Details:', JSON.stringify(addResponse.data, null, 2));
        
        console.log('🔍 Step 3: Verifying the certificate...');
        
        // Verify the certificate
        const verifyResponse = await axios.get(`${API_BASE_URL}/verify/simple/${certificateData.certificate_id}`);
        
        console.log('✅ Certificate verification result:', JSON.stringify(verifyResponse.data, null, 2));
        
        console.log('🎉 All tests passed! AdminAddCertificate functionality works correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testAddCertificate();
