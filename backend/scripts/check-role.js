// check_role.js
async function checkRole() {
    try {
        const loginRes = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST', body: JSON.stringify({ email: 'admin@kyamatu.ac.ke', password: 'Admin@123' }), headers: { 'Content-Type': 'application/json' }
        });
        const loginJson = await loginRes.json();
        console.log('User Role:', loginJson.data.user.role);
        console.log('User Keys:', Object.keys(loginJson.data.user));
    } catch (e) { console.error(e); }
}

checkRole();
