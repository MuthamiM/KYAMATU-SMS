import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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

const createStudent = async (token) => {
    try {
        console.log('Attempting to create student...');
        const payload = {
            firstName: 'Test',
            lastName: 'Student',
            email: `test.student.${Date.now()}@example.com`, // Unique email
            dateOfBirth: '2015-01-01',
            gender: 'Male',
            password: 'Student@123'
        };

        const res = await axios.post(`${API_URL}/students`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Student created successfully:', res.data);
        return res.data.data;
    } catch (error) {
        console.error('Create student failed:', error.response?.data || error.message);
    }
};

const checkPending = async (token) => {
    try {
        console.log('Checking pending admissions...');
        const res = await axios.get(`${API_URL}/students?admissionStatus=PENDING&limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Pending students count:', res.data.data.length);
        const found = res.data.data.find(s => s.firstName === 'Test' && s.lastName === 'Student');
        if (found) {
            console.log('Found created student within pending list!');
        } else {
            console.log('Created student NOT found in pending list.');
        }
    } catch (error) {
        console.error('Check pending failed:', error.response?.data || error.message);
    }
}

const run = async () => {
    const token = await login();
    const student = await createStudent(token);
    if (student) {
        await checkPending(token);
    }
};

run();
