import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data.data;
  },
  
  getStudentCharts: async () => {
    const response = await api.get('/dashboard/charts/students');
    return response.data.data;
  },

  getFeeCharts: async () => {
    const response = await api.get('/dashboard/charts/fees');
    return response.data.data;
  },

  getAttendanceCharts: async () => {
    const response = await api.get('/dashboard/charts/attendance');
    return response.data.data;
  },
};
