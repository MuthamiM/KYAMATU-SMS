import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';

function Staff() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'TEACHER', // Default
    isSupport: false,
    qualification: '',
    specialization: '',
  });
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data.data);
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
        isActive: !formData.isSupport, // Inactive if support staff
        password: 'Admin@123', // Standardized default password
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500">Manage teachers and staff members</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Specialization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">Loading...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No staff found
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="font-mono text-sm">{member.employeeNumber}</td>
                    <td className="font-medium">
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.user?.email}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          member.user?.role === 'ADMIN' ? 'badge-purple' :
                          member.user?.role === 'BURSAR' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {member.user?.role}
                        </span>
                        {member.user?.isActive === false && (
                          <span className="badge badge-gray">Support Staff</span>
                        )}
                      </div>
                    </td>
                    <td>{member.specialization || '-'}</td>
                    <td>
                      <button 
                        onClick={() => setSelectedStaff(member)}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    required
                    className="input"
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
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    required
                    className="input"
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
                    placeholder="e.g. Bed. Arts"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Specialization</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Mathematics & Physics"
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
                  Add Staff
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
            <h2 className="text-xl font-bold mb-6">Staff Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
                  {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                  <div className="flex gap-2">
                    <span className="badge badge-primary">{selectedStaff.user?.role}</span>
                    {selectedStaff.user?.isActive === false && (
                      <span className="badge badge-gray">Support</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Employee No</label>
                  <p className="font-medium">{selectedStaff.employeeNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{selectedStaff.user?.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedStaff.user?.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Specialization</label>
                  <p className="font-medium">{selectedStaff.specialization || '-'}</p>
                </div>
                 <div className="col-span-2">
                  <label className="text-sm text-gray-500">Qualification</label>
                  <p className="font-medium">{selectedStaff.qualification || '-'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
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
