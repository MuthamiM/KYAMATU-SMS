import axios from 'axios';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';
// Using the same credentials as seed.js
const EMAIL = 'admin@kyamatu.ac.ke';
const PASSWORD = 'Admin@123';

const TIMES = [
    '08:00 - 08:40',
    '08:40 - 09:20',
    '09:20 - 10:00',
    '10:00 - 10:20', // Break
    '10:20 - 11:00',
    '11:00 - 11:40',
    '11:40 - 12:20',
    '12:20 - 13:00', // Lunch
    '14:00 - 14:40',
    '14:40 - 15:20',
    '15:20 - 16:00'
];

const checkPDFData = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.data.accessToken;
        console.log('Logged in. Token received.');

        console.log('Fetching Teachers...');
        const teachersRes = await axios.get(`${API_URL}/staff?role=TEACHER`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const teachers = teachersRes.data.data;
        console.log(`Fetched ${teachers.length} teachers.`);

        console.log('Fetching Master Timetable...');
        const res = await axios.get(`${API_URL}/timetable/master`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const allSlots = res.data.data;
        console.log(`Fetched ${allSlots.length} timetable slots.`);

        console.log('\n--- SIMULATING PDF GENERATION (DAY 1: MONDAY) ---');

        // Headers
        const headerRow = ['Teacher', ...TIMES.map(t => t.split(' - ')[0])];
        console.log(headerRow.join(' | '));
        console.log('-'.repeat(100));

        for (const teacher of teachers) {
            const row = [`${teacher.firstName} ${teacher.lastName}`];

            for (const time of TIMES) {
                const [start] = time.split(' - ');

                if (time.includes('Break') || time.includes('Lunch')) {
                    row.push('---');
                    continue;
                }

                const slot = allSlots.find(s =>
                    s.teacherId === teacher.id &&
                    s.dayOfWeek === 1 && // MONDAY
                    s.startTime === start
                );

                if (slot) {
                    const subject = slot.subject?.code || slot.subject?.name?.substring(0, 3) || '?';
                    const className = `${slot.class?.grade?.name || ''} ${slot.class?.stream?.name || ''}`;
                    row.push(`${subject} (${className})`);
                } else {
                    row.push('.');
                }
            }
            console.log(row.join(' | '));
        }

        console.log('\n--- END SIMULATION ---');
        console.log('If you see a grid above with names and subjects, the PDF WILL work.');

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

checkPDFData();
