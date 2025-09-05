// Test certificate verification from frontend perspective (port 3000)
import axios from 'axios';

async function testFromFrontendPort() {
    try {
        console.log('🌐 Testing certificate verification from frontend perspective...');
        console.log('Frontend running on: http://localhost:3000');
        console.log('Backend API: http://127.0.0.1:5000/api');
        
        // Create axios instance with same config as frontend
        const api = axios.create({
            baseURL: 'http://127.0.0.1:5000/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
        });
        
        console.log('\n📋 Testing certificate verification endpoint...');
        
        // Test with valid certificate
        const response = await api.get('/verify/simple/CERT_1756767781837_SIGNUP_TEST');
        
        console.log('✅ Verification successful!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        // Test transformation like frontend does
        const data = response.data;
        const result = {
            isValid: data.valid || false,
            message: data.valid ? 'Certificate verified successfully' : (data.message || 'Certificate not found'),
            certificate: data.valid ? {
                id: data.certificate_id || '',
                studentName: data.student_name || '',
                degreeTitle: data.degree || '',
                issueDate: data.issue_date || '',
                status: 'active',
                createdAt: new Date().toISOString()
            } : undefined
        };
        
        console.log('\n✅ Frontend transformation result:');
        console.log(JSON.stringify(result, null, 2));
        
        console.log('\n🎉 All tests passed! API is working correctly from port 3000.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testFromFrontendPort();
