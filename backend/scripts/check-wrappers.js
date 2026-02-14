// check_wrappers.js
async function checkWrappers() {
    try {
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const token = (await loginRes.json()).data.accessToken;

        const endpoints = ['students', 'academic/classes', 'academic/grades'];

        for (const ep of endpoints) {
            const res = await fetch(`https://kyamatu-sms-backend.onrender.com/api/${ep}`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            const json = await res.json();

            console.log(`--- ${ep} ---`);
            if (json.data && !Array.isArray(json.data)) {
                console.log(`Keys in data:`, Object.keys(json.data));
                console.log(`Is Wrapped? YES`);
            } else if (Array.isArray(json.data)) {
                console.log(`Is Wrapped? NO (Array detected)`);
            } else {
                console.log(`Unknown structure:`, typeof json.data);
            }
        }

    } catch (e) { console.error(e); }
}

checkWrappers();
