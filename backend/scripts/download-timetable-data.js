import axios from 'axios';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';
// Using the same credentials as seed.js
const EMAIL = 'admin@kyamatu.ac.ke';
const PASSWORD = 'Admin@123';

const downloadData = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.data.accessToken;
        console.log('Logged in. Token received.');

        console.log('Fetching Teachers to get an ID...');
        const teachersRes = await axios.get(`${API_URL}/staff?role=TEACHER`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const teacher = teachersRes.data.data[0];
        console.log(`Testing with Teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.id})`);

        console.log('Fetching Teacher Timetable...');
        const res = await axios.get(`${API_URL}/timetable/teacher/${teacher.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data.data;
        console.log(`Received ${data.length} timetable slots.`);

        if (data.length > 0) {
            console.log('Sample Slot:', JSON.stringify(data[0], null, 2));
            fs.writeFileSync('timetable_dump.json', JSON.stringify(data, null, 2));
            console.log('Data saved to timetable_dump.json');
        } else {
            console.log('Timetable is empty!');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

downloadData();
