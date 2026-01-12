import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Users, X, UserCog, GraduationCap } from 'lucide-react';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gradeId: '',
    streamId: '',
    capacity: 40
  });
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classLoading, setClassLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, gradesRes, streamsRes, yearRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/grades'),
        api.get('/academic/streams'),
        api.get('/academic/years/current')
      ]);
      setClasses(classesRes.data.data);
      setGrades(gradesRes.data.data);
      setStreams(streamsRes.data.data);
      setCurrentYear(yearRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const openClassDetails = async (classId) => {
    try {
      setClassLoading(true);
      const response = await api.get(`/academic/classes/${classId}`);
      setSelectedClass(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch class details');
    } finally {
      setClassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500">Manage class structure and assignments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No classes found
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">
                    {cls.grade?.name} - {cls.stream?.name}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {cls._count?.students || 0}
                  </p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {cls.capacity}
                  </p>
                  <p className="text-xs text-gray-500">Capacity</p>
                </div>
              </div>
              <button 
                onClick={() => openClassDetails(cls.id)}
                className="mt-4 w-full btn btn-secondary text-sm"
              >
                View Class
              </button>
            </div>
          ))
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Grade Levels</h2>
        <div className="flex flex-wrap gap-2">
          {grades.map((grade) => (
            <span
              key={grade.id}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              {grade.name}
            </span>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Add New Class</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!currentYear) {
                  toast.error('No active academic year found');
                  return;
                }
                const payload = {
                  ...formData,
                  capacity: parseInt(formData.capacity),
                  academicYearId: currentYear.id
                };
                await api.post('/academic/classes', payload);
                toast.success('Class created successfully');
                setShowModal(false);
                fetchData();
                setFormData({ name: '', gradeId: '', streamId: '', capacity: 40 });
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create class');
              }
            }} className="space-y-4">
              <div>
                <label className="label">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 1 East"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Grade</label>
                <select
                  required
                  className="input"
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                >
                  <option value="">Select Grade</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Stream</label>
                <select
                  required
                  className="input"
                  value={formData.streamId}
                  onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
                >
                  <option value="">Select Stream</option>
                  {streams.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedClass.name}</h2>
                <p className="text-sm text-gray-500">{selectedClass.grade?.name} - {selectedClass.stream?.name}</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-primary-600">Total Students</p>
                  <p className="text-2xl font-bold text-primary-700">{selectedClass.students?.length || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedClass.capacity || 40}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-primary-600" />
                  Assigned Teachers
                </h3>
                {selectedClass.teacherAssignments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClass.teacherAssignments.map((ta, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {ta.staff?.firstName?.[0]}{ta.staff?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {ta.staff?.firstName} {ta.staff?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{ta.subject?.name}</p>
                          </div>
                        </div>
                        {ta.isClassTeacher && (
                          <span className="badge badge-primary">Class Teacher</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No teachers assigned yet</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-warning-600" />
                  Class Prefects
                </h3>
                {selectedClass.students?.filter(s => s.prefectRole).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedClass.students.filter(s => s.prefectRole).map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 bg-warning-50 rounded-lg border border-warning-100">
                        <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center text-warning-700 font-bold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <span className="badge badge-warning text-xs">{student.prefectRole}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No prefects assigned</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-success-600" />
                  Students ({selectedClass.students?.length || 0})
                </h3>
                {selectedClass.students?.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {selectedClass.students.slice(0, 20).map((student) => (
                      <div key={student.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                        </div>
                      </div>
                    ))}
                    {selectedClass.students.length > 20 && (
                      <div className="p-3 text-center text-sm text-gray-500">
                        + {selectedClass.students.length - 20} more students
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No students enrolled</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <button onClick={() => setSelectedClass(null)} className="btn btn-secondary w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;
