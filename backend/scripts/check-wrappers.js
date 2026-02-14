// check_wrappers.js
async function checkWrappers() {
    try {
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const token = (await loginRes.json()).data.accessToken;

        const endpoints = ['academic/classes'];

        for (const ep of endpoints) {
            const res = await fetch(`https://kyamatu-sms-backend.onrender.com/api/${ep}`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            const json = await res.json();

            console.log(`--- ${ep} ---`);
            console.log(`Status: ${res.status}`);
            if (Array.isArray(json.data)) {
                console.log(`Structure: Array (Length: ${json.data.length})`);
                if (json.data.length > 0) console.log('Sample:', JSON.stringify(json.data[0]));
            } else {
                console.log(`Structure: Object`);
                console.log(`Keys:`, Object.keys(json.data));
            }
        }

    } catch (e) { console.error(e); }
}

checkWrappers();
