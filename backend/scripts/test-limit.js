// test-limit.js
async function testLimit() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const token = (await loginRes.json()).data.accessToken;

        console.log('Fetching students with limit=1000...');
        const start = Date.now();
        const res = await fetch('https://kyamatu-sms-backend.onrender.com/api/students?limit=1000', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const duration = Date.now() - start;

        console.log(`Status: ${res.status}`);
        console.log(`Duration: ${duration}ms`);

        if (!res.ok) {
            const text = await res.text();
            console.log('Error Body:', text);
        } else {
            const json = await res.json();
            console.log('Success! Count:', json.data.length);
        }

    } catch (e) { console.error('Script Error:', e); }
}

testLimit();
