import axios from 'axios';

const API_URL = 'https://kyamatu-sms-backend.onrender.com/api';
const SECRET_KEY = 'kyamatu-reseed-2026';

const reseed = async () => {
    console.log('Triggering remote reseed...');
    try {
        const res = await axios.post(`${API_URL}/admin/reseed`, {
            secretKey: SECRET_KEY
        });
        console.log('Reseed successful:', res.data);
    } catch (error) {
        console.error('Reseed failed:', error.response?.data || error.message);
    }
};

reseed();
