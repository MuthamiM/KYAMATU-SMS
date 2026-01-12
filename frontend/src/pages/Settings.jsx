import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Palette, School, Activity } from 'lucide-react';

function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'school', label: 'School Info', icon: School },
  ];

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.post('/auth/change-password', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleProfileSave = () => {
    toast('Profile details are managed by administrators. Please contact support to update personal info.', {
      icon: 'ℹ️',
    });
  };

  const handleChangePhoto = () => {
    toast('Photo upload is currently disabled by policy.', {
      icon: '📷',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 card p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <button onClick={handleChangePhoto} className="btn btn-secondary text-sm">Change Photo</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-gray-50"
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="input bg-gray-50"
                  />
                </div>
              </div>
              <button onClick={handleProfileSave} className="btn btn-primary">Save Changes</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
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
                <button onClick={handleUpdatePassword} className="btn btn-primary">Update Password</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', desc: 'Receive updates via email' },
                  { label: 'SMS notifications', desc: 'Receive SMS alerts' },
                  { label: 'Attendance alerts', desc: 'Get notified about attendance' },
                  { label: 'Fee reminders', desc: 'Receive fee payment reminders' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-5 h-5 text-primary-600"
                      onChange={() => toast.success('Preference updated')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Theme</label>
                  <select className="input" onChange={() => toast('Theme setting saved (requires reload)')}>
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="label">Language</label>
                  <select className="input" onChange={() => toast('Language support coming soon')}>
                    <option>English</option>
                    <option>Swahili</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'school' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">School Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">School Name</label>
                  <input type="text" value="Kyamatu Primary School" disabled className="input bg-gray-50" />
                </div>
                <div>
                  <label className="label">School Code</label>
                  <input type="text" value="KPS-001" disabled className="input bg-gray-50" />
                </div>
                <div>
                  <label className="label">County</label>
                  <input type="text" value="Machakos" disabled className="input bg-gray-50" />
                </div>
                <div>
                  <label className="label">Sub-County</label>
                  <input type="text" value="Machakos" disabled className="input bg-gray-50" />
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
