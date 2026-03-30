const axios = require('axios');
async function test() {
    try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'student1@kyamatu.ac.ke',
            password: 'Admin@123'
        });
        const token = loginRes.data.data.token;

        const dashRes = await axios.get('http://localhost:3000/api/dashboard/student', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(dashRes.data);
    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }
}
test();
