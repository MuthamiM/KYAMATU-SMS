// check_dependencies.js
async function checkDependencies() {
    try {
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const token = (await loginRes.json()).data.accessToken;

        const endpoints = [
            'students', // Check the student list structure again
            'academic/classes',
            'academic/grades',
            'academic/streams'
        ];

        for (const ep of endpoints) {
            console.log(`Checking ${ep}...`);
            const res = await fetch(`https://kyamatu-sms-backend.onrender.com/api/${ep}`, {
                headers: { Authorization: 'Bearer ' + token }
            });

            const json = await res.json();

            if (ep === 'students') {
                // Special check for the structure
                const isWrapped = json.data && json.data.students && Array.isArray(json.data.students);
                console.log('Students Wrapper Applied?', isWrapped ? 'YES' : 'NO (Still Old Code)');
            }

            console.log(`${ep} Status: ${res.status}`);
            if (!res.ok) console.log(`Error:`, JSON.stringify(json, null, 2));
        }

    } catch (e) { console.error(e); }
}

checkDependencies();
