// Quick test to verify CORS fix for signup
import axios from 'axios';

async function testSignupCORS() {
    try {
        console.log('🔧 Testing CORS fix for signup endpoint...');
        
        const testUser = {
            username: `corstest_${Date.now()}`,
            password: 'testpassword123',
            role: 'User'
        };
        
        console.log(`Testing signup for user: ${testUser.username}`);
        
        const response = await axios.post('http://127.0.0.1:5000/api/auth/register', testUser, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3001'
            }
        });
        
        console.log('✅ CORS Fix Successful!');
        console.log('Response:', response.data);
        console.log('Status:', response.status);
        
    } catch (error) {
        console.error('❌ CORS Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testSignupCORS();
