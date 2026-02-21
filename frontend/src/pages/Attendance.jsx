import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Check, X, Clock, AlertCircle, QrCode, Scan, Copy, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

import { useAuthStore } from '../stores/authStore';

// Simple QR code token display component (shows a large styled code)
function QRTokenDisplay({ token, className: cls, expiresAt, onRefreshRequired }) {
  const [scannedCount, setScannedCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    const checkSession = async () => {
      try {
        const res = await api.get(`/attendance/qr/session/${token}`);
        if (res.data.success && res.data.data) {
          const newCount = res.data.data.totalScanned;
          setScannedCount(prev => {
            if (newCount > prev) {
              if (onRefreshRequired) onRefreshRequired();
            }
            return newCount;
          });
        }
      } catch (err) {
        // Ignore errors, could be expired
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [token, onRefreshRequired]);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast.success('Code copied to clipboard!');
  };

  const timeLeft = expiresAt ? Math.max(0, Math.round((new Date(expiresAt) - new Date()) / 60000)) : 0;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
      <div className="flex items-center gap-2 text-blue-600">
        <QrCode className="w-6 h-6" />
        <span className="font-semibold text-lg">QR Attendance Code</span>
      </div>

      <div className="flex flex-wrap gap-6 items-center w-full justify-center">
        <div className="bg-white p-6 rounded-xl shadow-inner border border-blue-100 flex-1 max-w-[300px] text-center">
          <p className="text-4xl font-mono font-bold tracking-[0.3em] text-gray-900 select-all">{token}</p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-white/60 border border-blue-200 rounded-xl min-w-[120px]">
          <span className="text-4xl font-bold text-blue-700">{scannedCount}</span>
          <span className="text-sm font-semibold text-blue-600 uppercase mt-1">Scanned</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 mt-2">
        <p className="text-sm text-gray-600">Class: <span className="font-semibold">{cls}</span></p>
        <p className="text-sm text-gray-500">
          Expires in <span className="font-semibold text-orange-600">{timeLeft} minutes</span>
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={copyToken} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
          <Copy className="w-4 h-4" /> Copy Code
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center max-w-xs mt-2">
        Share this code with students. They enter it on their Attendance page to mark themselves present.
      </p>
    </div>
  );
}

function Attendance() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(false);
  // QR state
  const [qrToken, setQrToken] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [scanToken, setScanToken] = useState('');
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    if (['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
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

  // QR Attendance: Generate session
  const generateQRCode = async () => {
    if (!selectedClass) {
      toast.error('Select a class first');
      return;
    }
    setQrLoading(true);
    try {
      const termsRes = await api.get('/academic/terms');
      const termId = termsRes.data.data[0]?.id;
      if (!termId) { toast.error('No active term'); return; }

      const res = await api.post('/attendance/qr/generate', { classId: selectedClass, termId });
      setQrToken(res.data.data);
      toast.success('QR attendance code generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // QR Attendance: Student scans token
  const submitQRScan = async () => {
    if (!scanToken.trim()) {
      toast.error('Enter the attendance code');
      return;
    }
    setScanLoading(true);
    try {
      const res = await api.post('/attendance/qr/scan', { token: scanToken.trim().toUpperCase() });
      toast.success(`Attendance marked! Welcome ${res.data.data.studentName}`);
      setScanToken('');
      fetchMyStats(); // refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setScanLoading(false);
    }
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

        {/* Student QR Scan Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Check-In (QR Code)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Enter the attendance code shared by your teacher to mark yourself present.</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter code (e.g. A3F2B1C09D4E)"
              value={scanToken}
              onChange={(e) => setScanToken(e.target.value.toUpperCase())}
              className="input flex-1 font-mono text-lg tracking-wider uppercase"
              maxLength={12}
            />
            <button
              onClick={submitQRScan}
              disabled={scanLoading || !scanToken.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              {scanLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Mark Present
            </button>
          </div>
        </div>
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
        {['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
          <button
            onClick={generateQRCode}
            disabled={qrLoading || !selectedClass}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-sm"
          >
            {qrLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            Generate QR Code
          </button>
        )}
      </div>

      {/* QR Token Display (shown after generating) */}
      {qrToken && (
        <QRTokenDisplay
          token={qrToken.token}
          className={qrToken.className}
          expiresAt={qrToken.expiresAt}
          onRefreshRequired={fetchAttendance}
        />
      )}

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
