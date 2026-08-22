import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Users, X, UserCog, GraduationCap, Crown, Shield } from 'lucide-react';

function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gradeId: '',
    capacity: 40
  });
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classLoading, setClassLoading] = useState(false);
  const [prefectModal, setPrefectModal] = useState({ open: false, role: '', classId: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, gradesRes, yearRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/grades'),
        api.get('/academic/years/current')
      ]);
      setClasses(classesRes.data.data);
      setGrades(gradesRes.data.data);
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

  const assignPrefect = async (studentId, role) => {
    try {
      await api.put(`/students/${studentId}`, { prefectRole: role });
      toast.success(`${role} assigned successfully!`);
      // Refresh the class details
      if (selectedClass) {
        await openClassDetails(selectedClass.id);
      }
      setPrefectModal({ open: false, role: '', classId: null });
    } catch (error) {
      toast.error('Failed to assign prefect role');
    }
  };

  const removePrefect = async (studentId) => {
    try {
      await api.put(`/students/${studentId}`, { prefectRole: null });
      toast.success('Prefect role removed');
      if (selectedClass) {
        await openClassDetails(selectedClass.id);
      }
    } catch (error) {
      toast.error('Failed to remove prefect role');
    }
  };

  const currentPrefects = selectedClass?.students?.filter(s => s.prefectRole) || [];
  const classPrefect = currentPrefects.find(s => s.prefectRole === 'Class Prefect');
  const deputyPrefect = currentPrefects.find(s => s.prefectRole === 'Deputy Class Prefect');

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
                    {cls.grade?.name}
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

      {/* Add Class Modal */}
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
                setFormData({ name: '', gradeId: '', capacity: 40 });
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create class');
              }
            }} className="space-y-4">
              <div>
                <label className="label">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 1"
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

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedClass.name}</h2>
                <p className="text-sm text-gray-500">{selectedClass.grade?.name}</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Stats */}
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

              {/* Assigned Teachers */}
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

              {/* Class Prefects Section with Assign Buttons */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                  Class Prefects
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Class Prefect Slot */}
                  <div className={`p-4 rounded-xl border-2 ${classPrefect ? 'border-amber-300 bg-amber-50' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Class Prefect</span>
                    </div>
                    {classPrefect ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{classPrefect.firstName} {classPrefect.lastName}</p>
                          <p className="text-xs text-gray-500 font-mono">{classPrefect.admissionNumber}</p>
                        </div>
                        <button
                          onClick={() => removePrefect(classPrefect.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPrefectModal({ open: true, role: 'Class Prefect', classId: selectedClass.id })}
                        className="w-full py-2 text-sm text-amber-700 font-medium hover:bg-amber-100 rounded-lg transition"
                      >
                        + Assign Class Prefect
                      </button>
                    )}
                  </div>

                  {/* Deputy Class Prefect Slot */}
                  <div className={`p-4 rounded-xl border-2 ${deputyPrefect ? 'border-blue-300 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Deputy Prefect</span>
                    </div>
                    {deputyPrefect ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{deputyPrefect.firstName} {deputyPrefect.lastName}</p>
                          <p className="text-xs text-gray-500 font-mono">{deputyPrefect.admissionNumber}</p>
                        </div>
                        <button
                          onClick={() => removePrefect(deputyPrefect.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPrefectModal({ open: true, role: 'Deputy Class Prefect', classId: selectedClass.id })}
                        className="w-full py-2 text-sm text-blue-700 font-medium hover:bg-blue-100 rounded-lg transition"
                      >
                        + Assign Deputy Prefect
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Student List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Students ({selectedClass.students?.length || 0})
                </h3>
                {selectedClass.students?.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                    {selectedClass.students.map((student, idx) => (
                      <div
                        key={student.id || idx}
                        className="p-3 flex items-center justify-between hover:bg-blue-50/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {student.firstName} {student.lastName}
                              {student.prefectRole && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                                  {student.prefectRole === 'Class Prefect' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                  {student.prefectRole}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{student.admissionNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            student.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {student.gender === 'Female' ? 'F' : 'M'}
                          </span>
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic py-2">No students enrolled in this class.</p>
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

      {/* Prefect Assignment Modal */}
      {prefectModal.open && selectedClass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Assign {prefectModal.role}</h3>
                <p className="text-xs text-gray-500">Select a student from {selectedClass.name}</p>
              </div>
              <button
                onClick={() => setPrefectModal({ open: false, role: '', classId: null })}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {selectedClass.students
                ?.filter(s => !s.prefectRole) // Only show students without a role
                .map((student) => (
                  <button
                    key={student.id}
                    onClick={() => assignPrefect(student.id, prefectModal.role)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-amber-50 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500 font-mono">{student.admissionNumber}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;
