import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { Calendar, Clock, Plus, Trash2, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
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

function Timetable() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Selection for adding slot
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, startTime, endTime }
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: ''
  });

  const [viewMode, setViewMode] = useState(user.role === 'TEACHER' ? 'teacher' : 'class');
  const [selectedTeacherId, setSelectedTeacherId] = useState(user.role === 'TEACHER' ? user.staff?.id : ''); // Default to self

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    if (user.role === 'TEACHER' && user.staff?.id) {
      setSelectedTeacherId(user.staff.id); // Default to self
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'class' && selectedClassId) {
      fetchTimetable();
      fetchSubjects(selectedClassId);
    } else if (viewMode === 'teacher' && selectedTeacherId) {
      fetchTimetable();
    } else if (viewMode === 'master') {
      // Master view handled by its own effect/logic
    }
  }, [selectedClassId, selectedTeacherId, viewMode]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academic/classes');
      setClasses(res.data.data);
      if (res.data.data.length > 0 && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        setSelectedClassId(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/staff?role=TEACHER&limit=100');
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchSubjects = async (classId) => {
    if (!classId) return;
    try {
      const res = await api.get(`/academic/subjects?classId=${classId}`);
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
      // toast.error('Failed to fetch subjects'); // Optional: don't spam if it fails often
    }
  };

  const handleDownloadMaster = async () => {
    try {
      toast.loading("Generating Master Timetable...");
      const res = await api.get('/timetable/master');
      const allSlots = res.data.data;

      const doc = new jsPDF('l', 'mm', 'a4');

      for (let i = 0; i < DAYS.length; i++) {
        if (i > 0) doc.addPage();

        const dayName = DAYS[i];
        doc.setFontSize(16);
        doc.text(`${dayName} - Master Timetable`, 14, 15);

        const daySlots = allSlots.filter(s => s.dayOfWeek === i + 1);

        const tableData = daySlots.map(s => [
          `${s.startTime} - ${s.endTime}`,
          `${s.class.grade.name} ${s.class.stream.name}`,
          s.subject.name,
          `${s.teacher?.user?.firstName || 'Unknown'} ${s.teacher?.user?.lastName || ''}`
        ]);

        tableData.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

        doc.autoTable({
          head: [['Time', 'Class', 'Subject', 'Teacher']],
          body: tableData,
          startY: 20,
          theme: 'striped'
        });
      }

      doc.save('Master_Timetable.pdf');
      toast.dismiss();
      toast.success('Download ready');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download master timetable');
      console.error(err);
    }
  };

  const handleSlotClick = (day, timeRange) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    const [start, end] = timeRange.split(' - ');
    setSelectedSlot({ day, startTime: start, endTime: end });

    const existing = timetable.find(t => t.dayOfWeek === DAYS.indexOf(day) + 1 && t.startTime === start);
    if (existing) {
      setFormData({
        subjectId: existing.subjectId,
        teacherId: existing.teacherId || ''
      });
    } else {
      setFormData({ subjectId: '', teacherId: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetable', {
        classId: selectedClassId,
        dayOfWeek: DAYS.indexOf(selectedSlot.day) + 1,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId || null
      });
      toast.success('Slot saved');
      setShowModal(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this lesson?")) return;
    const existing = timetable.find(t => t.dayOfWeek === DAYS.indexOf(selectedSlot.day) + 1 && t.startTime === selectedSlot.startTime);
    if (existing) {
      try {
        await api.delete(`/timetable/${existing.id}`);
        toast.success("Lesson removed");
        setShowModal(false);
        fetchTimetable();
      } catch (e) { toast.error("Failed to delete"); }
    }
  };

  // Helper to find slot content
  const getSlotContent = (day, timeRange) => {
    const [start] = timeRange.split(' - ');
    const dayIndex = DAYS.indexOf(day) + 1;
    const slot = timetable.find(t => t.dayOfWeek === dayIndex && t.startTime === start);

    if (!slot) return null;
    return (
      <div className="text-xs">
        <div className="font-bold text-primary-700">{slot.subject?.name}</div>
        <div className="text-gray-500 truncate">
          {(viewMode === 'teacher' || user.role === 'TEACHER')
            ? `${slot.class?.grade?.name} ${slot.class?.stream?.name}`
            : `${slot.teacher?.user?.firstName || ''} ${slot.teacher?.user?.lastName || ''}`
          }
        </div>
      </div>
    );
  };

  const isBreak = (time) => time.includes('Break') || time.includes('Lunch');


  // Master View Helpers
  const [masterTimetable, setMasterTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // Default to current day or Monday

  const fetchMasterTimetable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timetable/master');
      setMasterTimetable(res.data.data);
    } catch (err) {
      toast.error('Failed to load master timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'master') {
      fetchMasterTimetable();
    }
  }, [viewMode]);

  const getMasterSlot = (teacherId, timeRange) => {
    const [start] = timeRange.split(' - ');
    const slot = masterTimetable.find(t =>
      t.teacherId === teacherId &&
      t.dayOfWeek === selectedDay &&
      t.startTime === start
    );

    if (!slot) return null;
    return (
      <div className="text-xs p-1 bg-primary-50 rounded border border-primary-100">
        <div className="font-bold text-primary-700">{slot.subject?.code || slot.subject?.name}</div>
        <div className="text-gray-600">{slot.class?.grade?.name} {slot.class?.stream?.name}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user.role === 'TEACHER' ? 'My Schedule' : 'Manage Class Schedules'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
          {['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(user.role) && (
            <button
              onClick={handleDownloadMaster}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Master PDF
            </button>
          )}

          {timetable.length > 0 && (
            <button
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}

          {['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(user.role) && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'class' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  onClick={() => setViewMode('class')}
                >
                  By Class
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'teacher' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  onClick={() => setViewMode('teacher')}
                >
                  By Teacher
                </button>
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'master' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setViewMode('master')}
                  >
                    Master View
                  </button>
                )}
              </div>

              {viewMode === 'class' && (
                <select
                  className="input w-full sm:w-64"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.grade.name} {c.stream.name}
                    </option>
                  ))}
                </select>
              )}

              {viewMode === 'teacher' && (
                <select
                  className="input w-full sm:w-64"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              )}

              {viewMode === 'master' && (
                <select
                  className="input w-full sm:w-64"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                >
                  {DAYS.map((day, index) => (
                    <option key={day} value={index + 1}>{day}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'master' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 border dark:border-slate-700 sticky left-0 bg-gray-50 dark:bg-slate-800 z-10">
                    Teacher
                  </th>
                  {TIMES.filter(t => !isBreak(t)).map(time => (
                    <th key={time} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border dark:border-slate-700 min-w-[120px]">
                      {time.split(' - ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-900 z-10">
                      {teacher.firstName} {teacher.lastName}
                    </td>
                    {TIMES.filter(t => !isBreak(t)).map((time) => (
                      <td key={`${teacher.id}-${time}`} className="px-2 py-2 border dark:border-slate-700 relative h-16 align-top">
                        {getMasterSlot(teacher.id, time)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {timetable.length === 0 && !loading && (selectedClassId || selectedTeacherId) && (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-center border border-yellow-200">
              No lessons scheduled.
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 border dark:border-slate-700">
                      Time
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border dark:border-slate-700">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {TIMES.map((time) => (
                    <tr key={time} className={isBreak(time) ? 'bg-gray-50 dark:bg-slate-800' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white border dark:border-slate-700">
                        {time.replace('Break', '').replace('Lunch', '')}
                        {isBreak(time) && <span className="block text-gray-400 font-normal italic">{time.includes('Break') ? 'Break' : 'Lunch'}</span>}
                      </td>
                      {DAYS.map(day => (
                        <td
                          key={`${day}-${time}`}
                          className={`px-2 py-2 border dark:border-slate-700 relative h-16 align-top transition-colors ${!isBreak(time) && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && viewMode === 'class' ? 'hover:bg-primary-50 dark:hover:bg-slate-800 cursor-pointer' : ''
                            }`}
                          onClick={() => !isBreak(time) && viewMode === 'class' && handleSlotClick(day, time)}
                        >
                          {!isBreak(time) && getSlotContent(day, time)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Slot Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              {selectedSlot.day} @ {selectedSlot.startTime}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Subject</label>
                <select
                  className="input"
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Teacher</label>
                <select
                  className="input"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between mt-6">
                {/* Only show delete if slot exists */}
                <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timetable;
