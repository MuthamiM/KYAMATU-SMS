// No import needed for Node 18+
async function testLogin() {
    try {
        console.log('Testing login...');
        const response = await fetch('https://kyamatu-sms-backend.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@kyamatu.ac.ke',
                password: 'Admin@123'
            })
        });

        const data = await response.json();
        console.log('Login Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL! The database is seeded.');
        } else {
            console.log('❌ LOGIN FAILED. The database might be empty or credentials wrong.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
