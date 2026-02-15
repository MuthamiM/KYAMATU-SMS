import axios from 'axios';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';
const EMAIL = 'admin@kyamatu.ac.ke';
const PASSWORD = 'Admin@123';

async function main() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.data.accessToken;
        console.log('Logged in. Token received.');

        console.log('Triggering Timetable Generation...');
        const res = await axios.post(
            `${API_URL}/timetable/generate`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('Generation Response:', res.data);

    } catch (error) {
        console.error('Generation failed:', error.response ? error.response.data : error.message);
    }
}

main();
