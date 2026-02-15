import axios from 'axios';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';

async function testStudentLogin() {
    try {
        console.log('Attempting to login as student1@kyamatu.ac.ke...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'student1@kyamatu.ac.ke',
            password: 'Admin@123'
        });

        console.log('Login successful!');
        console.log(JSON.stringify(res.data.data.user, null, 2));
    } catch (e) {
        console.error('Login failed:', e.response?.data || e.message);
    }
}

testStudentLogin();
