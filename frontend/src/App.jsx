import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Staff from './pages/Staff';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Assessments from './pages/Assessments';
import Reports from './pages/Reports';
import Fees from './pages/Fees';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import Admissions from './pages/Admissions';
import Timetable from './pages/Timetable';
import SystemStatus from './pages/SystemStatus';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();

  // Initialize theme on app load
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR']}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route
          path="admissions"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <Admissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="classes"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
              <Classes />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="assessments"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
              <Assessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BURSAR']}>
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route path="announcements" element={<Announcements />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="timetable"
          element={
             <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
               <Timetable />
             </ProtectedRoute>
          }
        />
        <Route
          path="system-status"
          element={
             <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
               <SystemStatus />
             </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
