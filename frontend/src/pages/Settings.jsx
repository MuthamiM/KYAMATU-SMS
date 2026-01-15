import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Bell, School, Activity, Save, Loader2, Camera } from 'lucide-react';

function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    qualification: '',
    specialization: '',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'school', label: 'School Info', icon: School },
  ];

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      const data = res.data.data;
      setProfile(data);
      
      // Populate form based on user type
      if (data.staff) {
        setProfileForm({
          firstName: data.staff.firstName || '',
          lastName: data.staff.lastName || '',
          phone: data.phone || '',
          qualification: data.staff.qualification || '',
          specialization: data.staff.specialization || '',
        });
      } else if (data.student) {
        setProfileForm({
          firstName: data.student.firstName || '',
          lastName: data.student.lastName || '',
          phone: data.phone || '',
          qualification: '',
          specialization: '',
        });
      } else {
        setProfileForm({
          firstName: '',
          lastName: '',
          phone: data.phone || '',
          qualification: '',
          specialization: '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setChangingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated successfully');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhoto = () => {
    toast('Photo upload coming soon!', { icon: '📷' });
  };

  const getDisplayName = () => {
    if (profile?.staff) {
      return `${profile.staff.firstName} ${profile.staff.lastName}`;
    }
    if (profile?.student) {
      return `${profile.student.firstName} ${profile.student.lastName}`;
    }
    if (profile?.guardian) {
      return `${profile.guardian.firstName} ${profile.guardian.lastName}`;
    }
    return profile?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    if (profile?.staff) {
      return `${profile.staff.firstName?.[0] || ''}${profile.staff.lastName?.[0] || ''}`.toUpperCase();
    }
    if (profile?.student) {
      return `${profile.student.firstName?.[0] || ''}${profile.student.lastName?.[0] || ''}`.toUpperCase();
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'bg-red-100 text-red-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      TEACHER: 'bg-blue-100 text-blue-700',
      BURSAR: 'bg-green-100 text-green-700',
      STUDENT: 'bg-yellow-100 text-yellow-700',
      PARENT: 'bg-orange-100 text-orange-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-4">
          {/* Profile Summary */}
          <div className="text-center pb-4 mb-4 border-b border-gray-200 dark:border-slate-600">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{getInitials()}</span>
              </div>
              <button 
                onClick={handleChangePhoto}
                className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition"
              >
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mt-3">{getDisplayName()}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile?.role)}`}>
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 card p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Staff/Student specific info */}
              {profile?.staff && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Employee ID:</strong> {profile.staff.employeeNumber}
                  </p>
                </div>
              )}

              {profile?.student && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Admission No:</strong> {profile.student.admissionNumber}
                    {profile.student.class && (
                      <> • <strong>Class:</strong> {profile.student.class.grade?.name} {profile.student.class.stream?.name}</>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="input"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="input"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>

                {/* Staff-specific fields */}
                {profile?.staff && (
                  <>
                    <div>
                      <label className="label">Qualification</label>
                      <input
                        type="text"
                        value={profileForm.qualification}
                        onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                        className="input"
                        placeholder="e.g., B.Ed, M.Ed"
                      />
                    </div>
                    <div>
                      <label className="label">Specialization</label>
                      <input
                        type="text"
                        value={profileForm.specialization}
                        onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                        className="input"
                        placeholder="e.g., Mathematics, Science"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={profile?.role?.replace('_', ' ') || ''}
                    disabled
                    className="input bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="label">Account Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button 
                  onClick={handleProfileSave} 
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Min 8 chars with uppercase, lowercase & number (e.g., Admin@123)</p>
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleUpdatePassword} 
                  className="btn btn-primary flex items-center gap-2"
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">This device • Active now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', desc: 'Receive updates via email', defaultChecked: true },
                  { label: 'SMS notifications', desc: 'Receive SMS alerts', defaultChecked: false },
                  { label: 'Attendance alerts', desc: 'Get notified about attendance', defaultChecked: true },
                  { label: 'Fee reminders', desc: 'Receive fee payment reminders', defaultChecked: true },
                  { label: 'Exam results', desc: 'Get notified when results are published', defaultChecked: true },
                  { label: 'Announcements', desc: 'Receive school announcements', defaultChecked: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={item.defaultChecked}
                        className="sr-only peer"
                        onChange={() => toast.success('Preference updated')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'school' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">School Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">School Name</label>
                  <input type="text" value="Kyamatu Primary School" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
                <div>
                  <label className="label">School Code</label>
                  <input type="text" value="KPS-001" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
                <div>
                  <label className="label">County</label>
                  <input type="text" value="Kitui" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
                <div>
                  <label className="label">Sub-County</label>
                  <input type="text" value="Kitui Central" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
                <div>
                  <label className="label">Current Term</label>
                  <input type="text" value="Term 1, 2026" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
                <div>
                  <label className="label">Academic Year</label>
                  <input type="text" value="2026" disabled className="input bg-gray-50 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Health Status Footer */}
      {['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && <HealthStatusFooter />}
    </div>
  );
}

function HealthStatusFooter() {
  const [status, setStatus] = useState('checking');
  const [timestamp, setTimestamp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); 
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      if (res.data.status === 'ok') {
         setStatus('online');
         setTimestamp(new Date(res.data.timestamp).toLocaleString());
      } else {
         setStatus('error');
      }
    } catch {
      setStatus('offline');
    }
  };

  return (
    <div 
      onClick={() => navigate('/system-status')}
      className="card p-4 border-l-4 border-l-primary-600 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
      title="Click for detailed system status"
    >
       <div className="flex items-center gap-3">
         <Activity className={`w-5 h-5 ${status === 'online' ? 'text-green-600' : 'text-red-600'}`} />
         <div>
           <h3 className="font-semibold text-gray-900">System Status</h3>
           <p className="text-xs text-gray-500">
             {status === 'checking' && 'Checking status...'}
             {status === 'online' && `Online • Last checked: ${timestamp}`}
             {status === 'offline' && 'System Offline - Check server logs'}
             {status === 'error' && 'System Error - Degraded performance'}
           </p>
         </div>
       </div>
       <div>
         <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
             status === 'online' ? 'bg-green-100 text-green-700' : 
             status === 'checking' ? 'bg-gray-100 text-gray-700' :
             'bg-red-100 text-red-700'
         }`}>
           {status}
         </span>
       </div>
    </div>
  );
}

export default Settings;
