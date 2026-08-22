import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, X, UserCog, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

function Staff() {
  const { user: currentUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    isSupport: false,
    qualification: '',
    specialization: '',
  });

  // Edit Form Data
  const [editingStaff, setEditingStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    isSupport: false,
    qualification: '',
    specialization: '',
    employeeNumber: '',
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff?limit=100');
      setStaff(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', {
        ...formData,
        isActive: !formData.isSupport,
        password: 'Admin@123',
      });
      toast.success('Staff member added successfully');
      setShowModal(false);
      fetchStaff();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        isSupport: false,
        qualification: '',
        specialization: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleOpenEdit = (member) => {
    setEditingStaff(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.user?.email || '',
      phone: member.user?.phone || '',
      role: member.user?.role || 'TEACHER',
      isSupport: member.user?.isActive === false,
      qualification: member.qualification || '',
      specialization: member.specialization || '',
      employeeNumber: member.employeeNumber || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      await api.put(`/staff/${editingStaff.id}`, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phone: editFormData.phone,
        role: editFormData.role,
        isActive: !editFormData.isSupport,
        qualification: editFormData.qualification,
        specialization: editFormData.specialization,
        employeeNumber: editFormData.employeeNumber,
      });
      toast.success('Staff details updated successfully');
      setShowEditModal(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff details');
    }
  };

  const handleDeleteStaff = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/staff/${member.id}`);
      toast.success('Staff member removed successfully');
      fetchStaff();
      if (selectedStaff?.id === member.id) setSelectedStaff(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove staff member');
    }
  };

  const filteredStaff = staff.filter((m) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    const empNo = (m.employeeNumber || '').toLowerCase();
    const email = (m.user?.email || '').toLowerCase();
    const role = (m.user?.role || '').toLowerCase();
    const spec = (m.specialization || '').toLowerCase();
    return name.includes(q) || empNo.includes(q) || email.includes(q) || role.includes(q) || spec.includes(q);
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & Teachers</h1>
          <p className="text-gray-500">Manage teachers, administrators, and school staff records</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, employee number, email, role, or specialization..."
            className="input pl-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Specialization</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">Loading staff records...</td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="font-mono text-sm font-bold text-gray-700">{member.employeeNumber}</td>
                    <td className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="text-gray-600 text-sm">{member.user?.email}</td>
                    <td className="text-gray-600 text-sm">{member.user?.phone || '-'}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`badge ${
                          member.user?.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                          member.user?.role === 'ADMIN' ? 'badge-purple' :
                          member.user?.role === 'BURSAR' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {member.user?.role}
                        </span>
                        {member.user?.isActive === false && (
                          <span className="badge badge-gray text-xs">Support</span>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-600 text-sm">{member.specialization || member.qualification || '-'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedStaff(member)}
                          className="p-1 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isSuperAdmin && (
                          <>
                            <button 
                              onClick={() => handleOpenEdit(member)}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                              title="Edit Teacher / Staff"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {member.user?.role !== 'SUPER_ADMIN' && (
                              <button 
                                onClick={() => handleDeleteStaff(member)}
                                className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                                title="Delete Staff"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Mutua"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="e.g. teacher@matundu.ac.ke"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="e.g. +254712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    className="input"
                    value={formData.isSupport ? 'SUPPORT' : formData.role}
                    onChange={(e) => {
                      if (e.target.value === 'SUPPORT') {
                        setFormData({ ...formData, role: 'TEACHER', isSupport: true });
                      } else {
                        setFormData({ ...formData, role: e.target.value, isSupport: false });
                      }
                    }}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BURSAR">Bursar</option>
                    <option value="SUPPORT">Support Staff (Non-Login)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Qualification</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. B.Ed Arts, P1 Diploma"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Specialization / Subjects</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Mathematics & Science"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal (SuperAdmin / Admin) */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Teacher / Staff: {editingStaff.firstName} {editingStaff.lastName}
                </h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee Number / TSC No</label>
                  <input
                    type="text"
                    required
                    className="input font-mono"
                    value={editFormData.employeeNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, employeeNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    className="input"
                    value={editFormData.isSupport ? 'SUPPORT' : editFormData.role}
                    onChange={(e) => {
                      if (e.target.value === 'SUPPORT') {
                        setEditFormData({ ...editFormData, role: 'TEACHER', isSupport: true });
                      } else {
                        setEditFormData({ ...editFormData, role: e.target.value, isSupport: false });
                      }
                    }}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="BURSAR">Bursar</option>
                    <option value="SUPPORT">Support Staff (Non-Login)</option>
                  </select>
                </div>
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Qualification</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. B.Ed Science"
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Specialization</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Mathematics, English"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Staff Profile</h2>
              <button onClick={() => setSelectedStaff(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
                  {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="badge badge-primary">{selectedStaff.user?.role}</span>
                    {selectedStaff.user?.isActive === false && (
                      <span className="badge badge-gray">Support</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Employee / TSC No</label>
                  <p className="font-mono font-bold text-gray-800">{selectedStaff.employeeNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                  <p className="font-medium text-gray-800">{selectedStaff.user?.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                  <p className="font-medium text-gray-800">{selectedStaff.user?.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Qualification</label>
                  <p className="font-medium text-gray-800">{selectedStaff.qualification || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Specialization</label>
                  <p className="font-medium text-gray-800">{selectedStaff.specialization || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              {isSuperAdmin ? (
                <button
                  onClick={() => {
                    const member = selectedStaff;
                    setSelectedStaff(null);
                    handleOpenEdit(member);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Details
                </button>
              ) : <div />}
              
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
