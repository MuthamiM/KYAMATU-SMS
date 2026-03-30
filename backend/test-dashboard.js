import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

async function test() {
    const tokenRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student1@kyamatu.ac.ke', password: 'Admin@123' })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.data) return;
    const token = tokenData.data.accessToken;

    const dashRes = await fetch('http://localhost:3000/api/dashboard/student', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('STATUS:', dashRes.status);
    console.log(await dashRes.text());
}
test();
