import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Check, X, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

function Admissions() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchPendingAdmissions();
    fetchClasses();
  }, []);

  const fetchPendingAdmissions = async () => {
    try {
      const response = await api.get('/students?admissionStatus=PENDING');
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/academic/classes');
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleApprove = async (studentId) => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    try {
      await api.post(`/students/${studentId}/approve`, { classId: selectedClass });
      toast.success('Admission approved');
      fetchPendingAdmissions();
      setSelectedStudent(null);
      setSelectedClass('');
    } catch (error) {
      toast.error('Failed to approve admission');
    }
  };

  const handleReject = async (studentId) => {
    try {
      await api.post(`/students/${studentId}/reject`);
      toast.success('Admission rejected');
      fetchPendingAdmissions();
    } catch (error) {
      toast.error('Failed to reject admission');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-500">Manage student admissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          New Admission
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Pending Admissions</h2>
          <p className="text-sm text-gray-500">{students.length} students awaiting approval</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No pending admissions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary-600 font-semibold">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.admissionNumber} • {student.gender}
                    </p>
                  </div>
                </div>

                {selectedStudent === student.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="input py-1.5 text-sm"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleApprove(student.id)}
                      className="btn btn-primary py-1.5 px-3"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="btn btn-outline py-1.5 px-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudent(student.id)}
                      className="btn btn-primary py-1.5 px-3 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(student.id)}
                      className="btn btn-outline py-1.5 px-3 text-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAdmissionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchPendingAdmissions();
          }}
        />
      )}
    </div>
  );
}

function AddAdmissionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/students', {
        ...formData,
        password: 'Student@123',
      });
      toast.success('Student admission created');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Admission</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admissions;
