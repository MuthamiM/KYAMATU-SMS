// using native fetch

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';
// const API_URL = 'http://localhost:3000/api'; // Uncomment for local testing

const CREDENTIALS = {
    email: 'admin@kyamatu.ac.ke',
    password: 'Admin@123'
};

const testLogin = async () => {
    console.log(`\nTesting connectivity to: ${API_URL}`);

    // 1. Test Server Wakeup / Health
    const startHealth = Date.now();
    try {
        // Try hitting a non-protected endpoint or root to wake it up
        await fetch(API_URL.replace('/api', ''));
        console.log(`✅ Server Reachable in ${(Date.now() - startHealth) / 1000}s`);
    } catch (error) {
        console.log(`⚠️  Server ping failed (might be 404 but reachable): ${error.message}`);
    }

    // 2. Test Login
    console.log('\nPlease wait, attempting login...');
    const startLogin = Date.now();
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(CREDENTIALS),
        });

        const duration = (Date.now() - startLogin) / 1000;
        console.log(`⏱️  Login Request took ${duration}s`);

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Login Failed: ${response.status} ${response.statusText}`);
            console.error('Response:', JSON.stringify(data, null, 2));
            return;
        }

        console.log('✅ Login Successful!');
        console.log(`Welcome ${data.data.user.email} (${data.data.user.role})`);

        // 3. Test Loading Students
        const token = data.data.accessToken;
        console.log('\nAttempting to load students...');
        const startStudents = Date.now();

        const studentsRes = await fetch(`${API_URL}/students?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const studentsDuration = (Date.now() - startStudents) / 1000;
        console.log(`⏱️  Students Load took ${studentsDuration}s`);

        if (!studentsRes.ok) {
            const err = await studentsRes.json();
            console.error(`❌ Load Students Failed: ${studentsRes.status}`);
            console.error(err);
        } else {
            const studentsData = await studentsRes.json();
            console.log(`✅ Loaded ${studentsData.data.length} students (Pagination meta: ${JSON.stringify(studentsData.meta)})`);
        }

    } catch (error) {
        console.error('❌ Network/Script Error:', error);
    }
};

testLogin();
