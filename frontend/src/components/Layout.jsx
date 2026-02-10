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
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/students', icon: Users, label: 'Students', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admissions', icon: UserPlus, label: 'Admissions', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/staff', icon: UserCog, label: 'Staff', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/classes', icon: BookOpen, label: 'Classes', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/timetable', icon: Calendar, label: 'Timetable', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/assessments', icon: ClipboardList, label: 'Assessments', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { path: '/reports', icon: FileText, label: 'Reports', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR', 'STUDENT'] },
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden flex flex-col`}>
        <div className="flex h-20 items-center px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
            <School className="h-8 w-8 text-primary-600" />
            <span>SchoolHub</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full ml-1 font-medium">V 1.0</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          <ul className="space-y-1 mb-8">
            {filteredNavItems.filter(item => !['Settings'].includes(item.label)).map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Other
          </div>
          <ul className="space-y-1">
            <li key="profile">
              <Link
                to="/profile"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/profile'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
              >
                <UserCog className={`h-5 w-5 ${location.pathname === '/profile' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                Profile
              </Link>
            </li>
            {filteredNavItems.filter(item => ['Settings'].includes(item.label)).map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex min-h-screen flex-col transition-all duration-200 ease-in-out ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} print:pl-0`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm print:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
