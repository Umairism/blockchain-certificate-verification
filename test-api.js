// Test script to verify the frontend can connect to backend
const axios = require('axios');

async function testCertificateAPI() {
    try {
        console.log('Testing certificate verification API...');
        
        const response = await axios.get('http://127.0.0.1:5000/api/verify/simple/CERT_1756761881392_3AD63KKX6', {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3001'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
        
        // Test the exact structure our React component expects
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
        
        console.log('✅ Transformed Result for React:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testCertificateAPI();
