import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

function Students() {
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [meta, setMeta] = useState(null);

  // Edit & Delete State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', classId: '' });
  const [classes, setClasses] = useState([]); // Need classes for dropdown

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: { search, page, limit: 10 },
      });
      setStudents(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academic/classes');
      setClasses(res.data.data || []);
    } catch (e) { console.error('Failed to load classes'); }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.class?.id || ''
    });
    fetchClasses();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/students/${editingStudent.id}`, editForm);
      toast.success('Student updated successfully');
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: 'badge-success',
      PENDING: 'badge-warning',
      REJECTED: 'badge-danger',
    };
    return `badge ${styles[status] || 'badge-primary'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500">Manage student records and admissions</p>
        </div>
        <Link
          to="/admissions"
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or admission number..."
              className="input pl-10"
            />
          </div>
          <button type="button" className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="animate-pulse">Loading students...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="font-mono text-sm">{student.admissionNumber}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {student.firstName?.charAt(0)}
                            {student.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {student.class
                        ? `${student.class.grade?.name} ${student.class.stream?.name}`
                        : '-'}
                    </td>
                    <td>{student.gender || '-'}</td>
                    <td>
                      <span className={getStatusBadge(student.admissionStatus)}>
                        {student.admissionStatus}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-danger-500 hover:bg-danger-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {students.length} of {meta.total} students
            </p>
            <div className="flex gap-2">
              <button
                disabled={!meta.hasPrev}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-secondary text-sm"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNext}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Class</label>
                <select
                  className="input"
                  value={editForm.classId}
                  onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade?.name} {c.stream?.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
