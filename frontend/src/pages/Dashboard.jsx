import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import {
  Users,
  UserCog,
  BookOpen,
  Wallet,
  TrendingUp,
  Calendar,
  Award,
  ClipboardList,
  GraduationCap,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function AdminDashboard({ stats, loading }) {
  const gradeDistribution = [
    { name: 'Grade 1', students: 45 },
    { name: 'Grade 2', students: 52 },
    { name: 'Grade 3', students: 48 },
    { name: 'Grade 4', students: 55 },
    { name: 'Grade 5', students: 50 },
    { name: 'Grade 6', students: 47 },
  ];

  const genderData = [
    { name: 'Male', value: 48 },
    { name: 'Female', value: 52 },
  ];

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Staff', value: stats?.totalStaff || 0, icon: UserCog, color: 'bg-green-500', change: '+3%' },
    { label: 'Active Classes', value: stats?.totalClasses || 0, icon: BookOpen, color: 'bg-purple-500', change: '0%' },
    { label: 'Pending Admissions', value: stats?.pendingAdmissions || 0, icon: ClipboardList, color: 'bg-orange-500', change: 'New' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '-' : stat.value}
                </p>
                <span className="inline-flex items-center text-xs text-green-600 mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Students per Grade</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Gender Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Performers</h2>
            <span className="badge badge-primary">This Term</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Alice Wanjiku', score: 95, class: 'Grade 4 East' },
              { name: 'Brian Ochieng', score: 92, class: 'Grade 4 East' },
              { name: 'Carol Muthoni', score: 90, class: 'Grade 4 East' },
            ].map((student, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.class}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{student.score}%</p>
                  <p className="text-xs text-gray-500">Average</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {[
              { action: 'New student admitted', detail: 'Eva Akinyi - Grade 4 East', time: '2 hours ago' },
              { action: 'Assessment created', detail: 'Mathematics CAT 1', time: '5 hours ago' },
              { action: 'Fee payment received', detail: 'KES 15,000 - Alice Wanjiku', time: '1 day ago' },
              { action: 'Report cards generated', detail: 'Grade 4 - Term 1', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TeacherDashboard({ user }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">My Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">120</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">95%</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Assessments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-xl">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <Calendar className="w-6 h-6" />
            <span>Take Attendance</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <ClipboardList className="w-6 h-6" />
            <span>Enter Scores</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <Users className="w-6 h-6" />
            <span>View Students</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <Award className="w-6 h-6" />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">My Classes</h2>
        <div className="space-y-3">
          {[
            { name: 'Grade 4 East', subject: 'Mathematics', students: 40 },
            { name: 'Grade 4 West', subject: 'Mathematics', students: 38 },
            { name: 'Grade 5 East', subject: 'Mathematics', students: 42 },
          ].map((cls, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{cls.name}</p>
                <p className="text-sm text-gray-500">{cls.subject}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{cls.students}</p>
                <p className="text-xs text-gray-500">students</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function BursarDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collections</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">KES 2.5M</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">KES 850K</p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Students Cleared</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">245</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">52</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-xl">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <DollarSign className="w-6 h-6" />
            <span>Record Payment</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <ClipboardList className="w-6 h-6" />
            <span>Generate Invoice</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <Users className="w-6 h-6" />
            <span>Fee Defaulters</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center gap-2 py-4">
            <Award className="w-6 h-6" />
            <span>Fee Reports</span>
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Payments</h2>
        <div className="space-y-3">
          {[
            { name: 'Alice Wanjiku', amount: 'KES 15,000', method: 'M-PESA', time: '2 hours ago' },
            { name: 'Brian Ochieng', amount: 'KES 22,000', method: 'Bank Transfer', time: '5 hours ago' },
            { name: 'Carol Muthoni', amount: 'KES 18,500', method: 'M-PESA', time: '1 day ago' },
          ].map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payment.name}</p>
                <p className="text-sm text-gray-500">{payment.method}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{payment.amount}</p>
                <p className="text-xs text-gray-500">{payment.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StudentDashboard({ user }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">My Average</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">85%</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">94%</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Class Rank</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">#5</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Fee Balance</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">KES 5K</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">My Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Mathematics', score: 88, grade: 'A' },
            { name: 'English', score: 82, grade: 'B+' },
            { name: 'Science', score: 90, grade: 'A' },
            { name: 'Social Studies', score: 78, grade: 'B' },
            { name: 'Kiswahili', score: 85, grade: 'A-' },
            { name: 'Creative Arts', score: 92, grade: 'A' },
          ].map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{subject.name}</p>
                <p className="text-sm text-gray-500">Term 1 Score</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{subject.score}%</p>
                <span className="badge badge-primary">{subject.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, staffRes, classesRes] = await Promise.all([
        api.get('/students?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/staff?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/academic/classes?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
      ]);

      const pendingRes = await api.get('/students?admissionStatus=PENDING&limit=1').catch(() => ({ data: { meta: { total: 0 } } }));

      setStats({
        totalStudents: studentsRes.data.meta?.total || 0,
        totalStaff: staffRes.data.meta?.total || 0,
        totalClasses: classesRes.data.meta?.total || 0,
        pendingAdmissions: pendingRes.data.meta?.total || 0,
        attendanceRate: 94.5,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    const role = user?.role;

    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return <AdminDashboard stats={stats} loading={loading} />;
      case 'TEACHER':
        return <TeacherDashboard user={user} />;
      case 'BURSAR':
        return <BursarDashboard />;
      case 'STUDENT':
        return <StudentDashboard user={user} />;
      case 'PARENT':
        return <StudentDashboard user={user} />;
      default:
        return <AdminDashboard stats={stats} loading={loading} />;
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Administrator',
      TEACHER: 'Teacher',
      BURSAR: 'Bursar',
      STUDENT: 'Student',
      PARENT: 'Parent',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {user?.email?.split('@')[0]}!
            <span className="ml-2 badge badge-primary">{getRoleLabel(user?.role)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Academic Year</p>
          <p className="font-semibold text-gray-900">2026 - Term 1</p>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

export default Dashboard;
