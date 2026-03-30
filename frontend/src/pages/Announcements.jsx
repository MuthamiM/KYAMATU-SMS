import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { Plus, Bell, Send, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';

function Announcements() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('readAnnouncementIds') || '[]');
    } catch { return []; }
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRoles: [],
    isPublished: false,
  });

  const roles = ['STUDENT', 'TEACHER', 'PARENT', 'BURSAR'];
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/communication/announcements');
      setAnnouncements(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('readAnnouncementIds', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = announcements.map(a => a.id);
    const updated = [...new Set([...readIds, ...allIds])];
    setReadIds(updated);
    localStorage.setItem('readAnnouncementIds', JSON.stringify(updated));
    toast.success('All announcements marked as read');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/communication/announcements', formData);
      toast.success('Announcement created successfully');
      setShowModal(false);
      fetchAnnouncements();
      setFormData({
        title: '',
        content: '',
        targetRoles: [],
        isPublished: false,
      });
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/communication/announcements/${id}/publish`);
      toast.success('Announcement published');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to publish announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/communication/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  // Filter announcements based on active tab (for students/non-admin)
  const filteredAnnouncements = announcements.filter(a => {
    // Non-admin only sees published announcements
    const visible = isAdmin ? true : a.isPublished;
    if (!visible) return false;

    if (activeTab === 'unread') return !readIds.includes(a.id);
    if (activeTab === 'read') return readIds.includes(a.id);
    return true; // 'all'
  });

  const unreadCount = announcements.filter(a => (isAdmin || a.isPublished) && !readIds.includes(a.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">
            {isAdmin ? 'Manage school-wide announcements and notices' : 'School announcements and notices'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Tabs for All / Unread / Read */}
      {!isAdmin && (
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="card p-8 text-center">Loading...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'unread' ? 'No unread announcements' :
               activeTab === 'read' ? 'No read announcements' :
               isAdmin ? 'No announcements yet' : 'No announcements to display'}
            </p>
            {isAdmin && activeTab === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary mt-4"
              >
                Create First Announcement
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const isRead = readIds.includes(announcement.id);
            return (
              <div
                key={announcement.id}
                className={`card p-6 transition-all ${!isRead && !isAdmin ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
                onClick={() => { if (!isAdmin) markAsRead(announcement.id); }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      {isAdmin && (
                        announcement.isPublished ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )
                      )}
                      {!isAdmin && !isRead && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <p className="text-gray-600">{announcement.content}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {announcement.publishedAt
                          ? new Date(announcement.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(announcement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {isAdmin && (
                        <span>
                          Target: {announcement.targetRoles?.join(', ') || 'All'}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      {!announcement.isPublished && (
                        <button
                          onClick={() => handlePublish(announcement.id)}
                          className="btn btn-success btn-sm flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-danger-500 hover:bg-danger-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal - Admin Only */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Term Dates Update"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Content</label>
                <textarea
                  required
                  className="input min-h-[100px]"
                  placeholder="Write your announcement here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div>
                <label className="label mb-2">Target Roles</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.targetRoles.includes(role)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to target everyone</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish"
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label htmlFor="publish" className="text-sm text-gray-700">
                  Publish immediately
                </label>
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
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
