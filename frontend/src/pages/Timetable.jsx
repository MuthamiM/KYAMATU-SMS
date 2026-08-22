import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { Calendar, Clock, Plus, Trash2, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [viewMode, setViewMode] = useState(user?.role === 'TEACHER' ? 'teacher' : 'class');
  const [selectedTeacherId, setSelectedTeacherId] = useState(user?.role === 'TEACHER' ? user.staff?.id : ''); // Default to self

  useEffect(() => {
    if (!user) return;

    if (user.role === 'STUDENT') {
      fetchStudentTimetable();
    } else if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      fetchClasses();
      fetchTeachers();
    } else if (user.role === 'TEACHER' && user.staff?.id) {
      setSelectedTeacherId(user.staff.id);
    }
  }, [user]);

  const fetchStudentTimetable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/timetable/my-class');
      setTimetable(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch your timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role === 'STUDENT') return; // Student timetable already fetched or user not loaded
    // Clear data when switching views to prevent state leakage
    setTimetable([]);
    if (viewMode === 'class') {
      if (selectedClassId) fetchTimetable();
    } else if (viewMode === 'teacher') {
      if (selectedTeacherId) fetchTimetable();
    } else if (viewMode === 'master') {
      // Master view handled by its own effect
    }
  }, [selectedClassId, selectedTeacherId, viewMode]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academic/classes');
      const loadedClasses = res.data.data || [];
      setClasses(loadedClasses);
      if (loadedClasses.length > 0) {
        const initialClassId = selectedClassId || loadedClasses[0].id;
        setSelectedClassId(initialClassId);
        fetchSubjects(initialClassId);
        if (viewMode === 'class') {
          fetchTimetable(initialClassId);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/staff?role=TEACHER&limit=100');
      const loadedTeachers = res.data.data || [];
      setTeachers(loadedTeachers);
      if (loadedTeachers.length > 0 && viewMode === 'teacher' && !selectedTeacherId) {
        setSelectedTeacherId(loadedTeachers[0].id);
        fetchTimetable(undefined, loadedTeachers[0].id);
      }
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
    }
  };

  const fetchTimetable = async (classIdOverride, teacherIdOverride) => {
    const targetClassId = classIdOverride || selectedClassId;
    const targetTeacherId = teacherIdOverride || selectedTeacherId;

    if (!targetClassId && viewMode === 'class') {
      return;
    }
    if (!targetTeacherId && viewMode === 'teacher') {
      return;
    }

    setLoading(true);
    try {
      let res;
      if (viewMode === 'class' && targetClassId) {
        res = await api.get(`/timetable?classId=${targetClassId}`);
      } else if (viewMode === 'teacher' && targetTeacherId) {
        res = await api.get(`/timetable/teacher/${targetTeacherId}`);
      }
      setTimetable(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMaster = async () => {
    try {
      toast.loading("Generating Master Timetable...");
      const res = await api.get('/timetable/master');
      const allSlots = res.data.data;

      const doc = new jsPDF('l', 'mm', 'a4');

      const timeHeaders = TIMES.map(t => {
        const [start] = t.split(' - ');
        return start;
      });
      const headers = ['Teacher', ...timeHeaders];

      for (let i = 0; i < DAYS.length; i++) {
        if (i > 0) doc.addPage();

        const dayName = DAYS[i];
        doc.setFontSize(16);
        doc.text(`${dayName} - Master Timetable`, 14, 15);

        const body = [];
        // Ensure teachers are sorted
        const sortedTeachers = [...teachers].sort((a, b) => a.firstName.localeCompare(b.firstName));

        for (const teacher of sortedTeachers) {
          const row = [`${teacher.firstName} ${teacher.lastName}`];
          for (const time of TIMES) {
            const [start] = time.split(' - ');

            // Check for break/lunch
            if (time.includes('Break') || time.includes('Lunch')) {
              row.push('---');
              continue;
            }

            const slot = allSlots.find(s =>
              s.teacherId === teacher.id &&
              s.dayOfWeek === i + 1 &&
              s.startTime === start
            );

            if (slot) {
              const subject = slot.subject?.code || slot.subject?.name?.substring(0, 3) || '?';
              const className = slot.class?.name || slot.class?.grade?.name || '';
              row.push(`${subject}\n(${className})`);
            } else {
              row.push('');
            }
          }
          body.push(row);
        }

        autoTable(doc, {
          head: [headers],
          body: body,
          startY: 20,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
          headStyles: { fillColor: [66, 133, 244], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold' } // Teacher column
          }
        });
      }

      doc.save('Master_Timetable_Grid.pdf');
      toast.dismiss();
      toast.success('Download ready');
    } catch (err) {
      toast.dismiss();
      toast.error(`Download failed: ${err.message}`);
      console.error(err);
    }
  };

  const handleGenerateTimetable = async () => {
    if (!window.confirm('Are you sure you want to auto-generate the complete school timetable? This will balance teacher workloads and subject periods across all grades.')) {
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Generating balanced school timetable...');
    try {
      const res = await api.post('/timetable/generate');
      toast.dismiss(toastId);
      toast.success(res.data?.message || `Successfully generated ${res.data?.data?.generated || 'all'} timetable lessons!`);
      fetchTimetable();
      if (viewMode === 'master') fetchMasterTimetable();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to auto-generate timetable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
    fetchSubjects(selectedClassId || classes[0]?.id);
    setSelectedSlot({
      day: DAYS[0],
      startTime: TIMES[0].split(' - ')[0],
      endTime: TIMES[0].split(' - ')[1],
    });
    setFormData({ subjectId: '', teacherId: '' });
    setShowModal(true);
  };

  const handleSlotClick = (day, timeRange) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    const [start, end] = timeRange.split(' - ');
    setSelectedSlot({ day, startTime: start, endTime: end });
    fetchSubjects(selectedClassId);

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
    if (!selectedClassId) {
      toast.error('Please select a class first');
      return;
    }
    try {
      await api.post('/timetable', {
        classId: selectedClassId,
        dayOfWeek: DAYS.indexOf(selectedSlot.day) + 1,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId || null
      });
      toast.success('Timetable lesson saved successfully');
      setShowModal(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lesson');
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
          {viewMode === 'teacher'
            ? (slot.class?.name || slot.class?.grade?.name || '')
            : `${slot.teacher?.firstName || slot.teacher?.user?.firstName || 'No Teacher'} ${slot.teacher?.lastName || slot.teacher?.user?.lastName || ''}`
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
        <div className="text-gray-600">{slot.class?.name || slot.class?.grade?.name}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === 'STUDENT' ? 'My Class Schedule' : user?.role === 'TEACHER' ? 'My Schedule' : 'Manage Class Schedules'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
          {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
            <>
              <button
                onClick={handleGenerateTimetable}
                className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                title="Automatically create complete balanced timetable for all classes"
              >
                <Plus className="w-4 h-4" />
                <span>Auto-Generate Timetable</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="btn btn-secondary flex items-center gap-2"
                title="Create a single lesson slot"
              >
                <Clock className="w-4 h-4 text-primary-600" />
                <span>Add Lesson</span>
              </button>

              <button
                onClick={handleDownloadMaster}
                className="btn btn-secondary flex items-center gap-2"
                title="Export Master Timetable PDF"
              >
                <Download className="w-4 h-4" />
                Master PDF
              </button>
            </>
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

          {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
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
                      {c.name || c.grade?.name}
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

      {/* Create / Edit Slot Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {timetable.some(t => t.dayOfWeek === DAYS.indexOf(selectedSlot.day) + 1 && t.startTime === selectedSlot.startTime) ? 'Edit Lesson Slot' : 'Add New Lesson'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label font-medium text-gray-700 dark:text-gray-300">Class / Grade</label>
                <select
                  className="input"
                  required
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    fetchSubjects(e.target.value);
                  }}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.grade?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label font-medium text-gray-700 dark:text-gray-300">Day of Week</label>
                  <select
                    className="input"
                    value={selectedSlot.day}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, day: e.target.value })}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label font-medium text-gray-700 dark:text-gray-300">Period / Time</label>
                  <select
                    className="input"
                    value={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
                    onChange={(e) => {
                      const [start, end] = e.target.value.split(' - ');
                      setSelectedSlot({ ...selectedSlot, startTime: start, endTime: end });
                    }}
                  >
                    {TIMES.filter(t => !isBreak(t)).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label font-medium text-gray-700 dark:text-gray-300">Subject</label>
                <select
                  className="input"
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label font-medium text-gray-700 dark:text-gray-300">Teacher (Optional)</label>
                <select
                  className="input"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">-- Assign Teacher (Optional) --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-2">
                {timetable.some(t => t.dayOfWeek === DAYS.indexOf(selectedSlot.day) + 1 && t.startTime === selectedSlot.startTime) ? (
                  <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Remove Slot
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Lesson</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="text-center text-xs text-gray-400 mt-8">
        Timetable Module v1.1 (Grid View & Fixes)
      </div>
    </div>
  );
}

export default Timetable;
