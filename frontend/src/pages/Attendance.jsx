import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { useAuthStore } from '../stores/authStore';

function Attendance() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      fetchClasses();
    } else if (user.role === 'STUDENT') {
      fetchMyStats();
    }
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/academic/classes');
      setClasses(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedClass(response.data.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/class/${selectedClass}`, {
        params: { date: selectedDate },
      });
      setAttendance(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/my-stats');
      setMyStats(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch your attendance stats');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((item) =>
        item.student.id === studentId
          ? { ...item, attendance: { ...item.attendance, status } }
          : item
      )
    );
  };

  const saveAttendance = async () => {
    try {
      const records = attendance.map((item) => ({
        studentId: item.student.id,
        status: item.attendance?.status || 'PRESENT',
      }));

      const currentYear = await api.get('/academic/years/current');
      const terms = await api.get('/academic/terms', {
        params: { academicYearId: currentYear.data.data.id },
      });

      await api.post('/attendance/bulk', {
        classId: selectedClass,
        termId: terms.data.data[0]?.id,
        date: selectedDate,
        records,
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Check className="w-4 h-4 text-success-500" />;
      case 'ABSENT':
        return <X className="w-4 h-4 text-danger-500" />;
      case 'LATE':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'EXCUSED':
        return <AlertCircle className="w-4 h-4 text-primary-500" />;
      default:
        return null;
    }
  };

  const stats = {
    present: attendance.filter((a) => a.attendance?.status === 'PRESENT').length,
    absent: attendance.filter((a) => a.attendance?.status === 'ABSENT').length,
    late: attendance.filter((a) => a.attendance?.status === 'LATE').length,
    total: attendance.length,
  };


  if (user.role === 'STUDENT') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-500">Your attendance record for this term</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading stats...</div>
        ) : myStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 bg-success-50 border-success-200">
              <p className="text-sm text-success-600 font-medium">Present</p>
              <p className="text-2xl font-bold text-success-700">{myStats.present}</p>
            </div>
            <div className="card p-4 bg-danger-50 border-danger-200">
              <p className="text-sm text-danger-600 font-medium">Absent</p>
              <p className="text-2xl font-bold text-danger-700">{myStats.absent}</p>
            </div>
            <div className="card p-4 bg-warning-50 border-warning-200">
              <p className="text-sm text-warning-600 font-medium">Late</p>
              <p className="text-2xl font-bold text-warning-700">{myStats.late}</p>
            </div>
            <div className="card p-4 bg-primary-50 border-primary-200">
              <p className="text-sm text-primary-600 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-primary-700">{myStats.attendanceRate}%</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No attendance records found.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Track daily student attendance</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="label">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="label">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-success-50 border-success-200">
          <p className="text-sm text-success-600 font-medium">Present</p>
          <p className="text-2xl font-bold text-success-700">{stats.present}</p>
        </div>
        <div className="card p-4 bg-danger-50 border-danger-200">
          <p className="text-sm text-danger-600 font-medium">Absent</p>
          <p className="text-2xl font-bold text-danger-700">{stats.absent}</p>
        </div>
        <div className="card p-4 bg-warning-50 border-warning-200">
          <p className="text-sm text-warning-600 font-medium">Late</p>
          <p className="text-2xl font-bold text-warning-700">{stats.late}</p>
        </div>
        <div className="card p-4 bg-primary-50 border-primary-200">
          <p className="text-sm text-primary-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">Loading...</td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                attendance.map((item) => (
                  <tr key={item.student.id} className="hover:bg-gray-50">
                    <td className="font-medium">
                      {item.student.firstName} {item.student.lastName}
                    </td>
                    <td className="font-mono text-sm">
                      {item.student.admissionNumber}
                    </td>
                    <td>
                      <span className={`badge ${item.attendance?.status === 'PRESENT' ? 'badge-success' :
                        item.attendance?.status === 'ABSENT' ? 'badge-danger' :
                          item.attendance?.status === 'LATE' ? 'badge-warning' :
                            'badge-primary'
                        }`}>
                        {item.attendance?.status || 'Not Marked'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(item.student.id, status)}
                            className={`p-2 rounded transition-colors ${item.attendance?.status === status
                              ? 'bg-primary-100 text-primary-600'
                              : 'hover:bg-gray-100 text-gray-500'
                              }`}
                            title={status}
                          >
                            {getStatusIcon(status)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {attendance.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button onClick={saveAttendance} className="btn btn-primary">
              Save Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;
