import axios from 'axios';
import prisma from '../src/config/database.js';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@kyamatu.ac.ke',
            password: 'Admin@123',
        });
        return res.data.data.accessToken;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

const checkDB = async () => {
    console.log('--- Checking DB directly ---');
    // We can't easily use prisma here if it's not compiled for the script's context or if env vars aren't set.
    // Let's rely on API mostly, but maybe try a simple query if possible.
    // actually, let's just stick to API to avoid env var hell in this script context.
    // We will verify empty vs error via API status codes.
};

const checkEndpoints = async (token) => {
    console.log('--- Checking /timetable/master ---');
    try {
        const res = await axios.get(`${API_URL}/timetable/master`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Master Status: ${res.status}`);
        console.log(`Data Length: ${res.data.data.length}`);
    } catch (error) {
        console.log('Master fetch failed:', error.response?.data || error.message);
    }

    console.log('\n--- Checking /timetable (Class) ---');
    try {
        // First get a class ID
        const classes = await axios.get(`${API_URL}/academic/classes`, { headers: { Authorization: `Bearer ${token}` } });
        if (classes.data.data.length > 0) {
            const classId = classes.data.data[0].id;
            console.log(`Testing with classId: ${classId}`);
            const res = await axios.get(`${API_URL}/timetable?classId=${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Class Timetable Status: ${res.status}`);
            console.log(`Data Length: ${res.data.data.length}`);
        } else {
            console.log('No classes found to test.');
        }
    } catch (error) {
        console.log('Class Timetable fetch failed:', error.response?.data || error.message);
    }
};

const run = async () => {
    const token = await login();
    await checkEndpoints(token);
};

run();
