// check_students.js
async function checkStudents() {
    try {
        // 1. Login to get token
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@kyamatu.ac.ke',
                password: 'Admin@123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error('Login Failed:', loginData);
            return;
        }

        const token = loginData.data.accessToken;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Students
        console.log('Fetching students...');
        const studentsRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/students', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const studentsData = await studentsRes.json();
        console.log('Students Request Status:', studentsRes.status);

        if (studentsRes.ok) {
            console.log(`✅ Success! Found ${studentsData.data.students.length} students.`);
        } else {
            console.log('❌ Failed to fetch students:', JSON.stringify(studentsData, null, 2));
        }

    } catch (error) {
        console.error('Script Error:', error.message);
    }
}

checkStudents();
