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
  { path: '/students', icon: Users, label: 'Students', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR'] },
  { path: '/admissions', icon: UserPlus, label: 'Admissions', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/staff', icon: UserCog, label: 'Staff', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/classes', icon: BookOpen, label: 'Classes', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/timetable', icon: Calendar, label: 'Timetable', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { path: '/assessments', icon: ClipboardList, label: 'Assessments', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/reports', icon: FileText, label: 'Reports', roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { path: '/fees', icon: Wallet, label: 'Fees', roles: ['SUPER_ADMIN', 'ADMIN', 'BURSAR'] },
  { path: '/announcements', icon: Bell, label: 'Announcements' },
  { path: '/settings', icon: Settings, label: 'Settings' },
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
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } print:hidden`}>
        <div className="flex h-16 items-center justify-center border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl">
            <School className="h-8 w-8 text-secondary-400" />
            <span>Kyamatu SMS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 font-bold text-white">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:pl-64 print:pl-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm print:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
