import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  UserCog,
  UserPlus,
  BookOpen,
  CalendarCheck,
  FileText,
  ClipboardList,
  Wallet,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  School,
  Calendar,
  Search,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/assessments', icon: ClipboardList, label: 'Assessments', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { path: '/reports', icon: FileText, label: 'Reports', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR', 'STUDENT'] },
  { path: '/timetable', icon: Calendar, label: 'Timetable', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { path: '/students', icon: Users, label: 'Students', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admissions', icon: UserPlus, label: 'Admissions', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/staff', icon: UserCog, label: 'Staff', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/classes', icon: BookOpen, label: 'Classes', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/fees', icon: Wallet, label: 'Fees', roles: ['SUPER_ADMIN', 'ADMIN', 'BURSAR'] },
  { path: '/announcements', icon: Bell, label: 'Announcements', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR'] },
];

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [announcementsRes, unreadRes] = await Promise.all([
        api.get('/communication/announcements').catch(() => ({ data: { data: [] } })),
        api.get('/communication/messages/unread-count').catch(() => ({ data: { data: { count: 0 } } })),
      ]);

      const announcements = announcementsRes.data.data || [];
      setNotifications(announcements.slice(0, 5));
      setUnreadCount((unreadRes.data.data?.count || 0) + announcements.filter(a => a.isPublished).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    navigate('/announcements');
                    setOpen(false);
                  }}
                >
                  <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/announcements');
                setOpen(false);
              }}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2"
            >
              View All Announcements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex">
      {/* Sidebar - Slim and Teal for Students */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${user?.role === 'STUDENT' ? 'w-20 bg-[#99CBB9]' : 'w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800'} flex flex-col items-center py-6`}
      >
        <div className="mb-10">
          <GraduationCap className={`w-8 h-8 ${user?.role === 'STUDENT' ? 'text-white' : 'text-primary-600'}`} />
        </div>

        <nav className="flex-1 w-full space-y-4 px-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${active
                  ? (user?.role === 'STUDENT' ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600')
                  : (user?.role === 'STUDENT' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-50')
                  }`}
              >
                <Icon className="w-6 h-6" />
                {user?.role !== 'STUDENT' && <span className="text-xs mt-1">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${user?.role === 'STUDENT' ? 'text-white/70 hover:bg-white/10' : 'text-gray-400'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${user?.role === 'STUDENT' ? 'lg:ml-20' : sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 bg-white border-b border-gray-100">
          <div className="flex items-center flex-1 max-w-md bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>

          <div className="flex items-center gap-6">
            <School className="w-5 h-5 text-gray-500 cursor-pointer hover:text-teal-600" />
            <NotificationDropdown />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.staff?.firstName || user?.student?.firstName || user?.email.split('@')[0]}</span>
              <div onClick={handleLogout} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
                <UserCog className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
