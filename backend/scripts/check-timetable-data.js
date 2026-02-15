import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@kyamatu.ac.ke',
            password: 'Admin@123',
        });
        return res.data.data.accessToken;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

const checkEndpoints = async (token) => {
    console.log('--- Checking Classes ---');
    try {
        const res = await axios.get(`${API_URL}/academic/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Classes: ${res.data.data.length} found.`);
    } catch (error) {
        console.log('Classes fetch failed:', error.response?.data || error.message);
    }

    console.log('\n--- Checking Teachers (Role Filter) ---');
    try {
        const res = await axios.get(`${API_URL}/staff?role=TEACHER&limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Teachers: ${res.data.data.length} found.`);
    } catch (error) {
        console.log('Teachers fetch failed:', error.response?.data || error.message);
    }

    console.log('\n--- Checking Subjects (Invalid ClassId) ---');
    try {
        // This mimics what happens in Timetable.jsx: fetchMetaData() with undefined classId
        // axios might send "undefined" as string or exclude it. 
        // In the code: `api.get(\`/academic/subjects?classId=${classId}\`)` -> "...?classId=undefined"
        const res = await axios.get(`${API_URL}/academic/subjects?classId=undefined`, {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true // Don't throw on error status
        });
        console.log(`Subjects (classId=undefined) Status: ${res.status}`);
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.log('Subjects fetch failed (Network/Other):', error.message);
    }
};

const run = async () => {
    const token = await login();
    await checkEndpoints(token);
};

run();
