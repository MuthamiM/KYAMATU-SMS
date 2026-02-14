// check_classes.js
async function checkClasses() {
    try {
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const loginJson = await loginRes.json();
        console.log('Login User Data:', loginJson.data.user);

        const token = loginJson.data.accessToken;

        console.log('Fetching classes...');
        const res = await fetch('https://kyamatu-sms-backend.onrender.com/api/academic/classes', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const json = await res.json();

        console.log(`Status: ${res.status}`);
        if (res.ok && json.data) {
            console.log(`Class Count: ${Array.isArray(json.data) ? json.data.length : 'Not Array'}`);
            if (Array.isArray(json.data) && json.data.length > 0) {
                console.log('First Class:', JSON.stringify(json.data[0]));
            }
        } else {
            console.log('Error/Empty:', json);
        }

    } catch (e) { console.error(e); }
}

checkClasses();
