import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import {
  Users,
  UserCog,
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  ClipboardList,
  GraduationCap,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  UserPlus,
  CreditCard,
  FileText,
  Activity,
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import StudentDashboardRedesigned from '../components/dashboard/StudentDashboardRedesigned';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Stat Card Component - Modern Design
function StatCard({ label, value, icon: Icon, color, bgColor, change, changeType, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {change && (
            <div className={`flex items-center mt-3 text-sm ${changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : changeType === 'down' ? (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              ) : null}
              <span className="font-medium">{change}</span>
              <span className="text-gray-400 ml-1">vs last term</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-2xl`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// Mini Stat Card
function MiniStatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Progress Ring Component
function ProgressRing({ percentage, size = 120, strokeWidth = 12, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
}

function AdminDashboard({ stats, loading }) {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    monthlyAdmissions: [],
    feeCollection: [],
    gradeDistribution: [],
    attendanceData: [],
  });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Fetch grade distribution from classes
      const classesRes = await api.get('/academic/classes').catch(() => ({ data: { data: [] } }));
      const classes = classesRes.data.data || [];

      // Group by grade
      const gradeMap = {};
      classes.forEach(cls => {
        const gradeName = cls.grade?.name || 'Unknown';
        if (!gradeMap[gradeName]) {
          gradeMap[gradeName] = 0;
        }
        gradeMap[gradeName] += cls._count?.students || cls.students?.length || 0;
      });

      const gradeDistribution = Object.entries(gradeMap).map(([name, students]) => ({
        name: name.replace('Grade ', 'G'),
        students,
        fullName: name,
      }));

      // Monthly data simulation based on stats
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();

      const monthlyAdmissions = months.slice(0, currentMonth + 1).map((month, idx) => ({
        month,
        students: Math.floor(Math.random() * 15) + 5,
        target: 12,
      }));

      const feeCollection = months.slice(0, currentMonth + 1).map((month, idx) => ({
        month,
        collected: Math.floor(Math.random() * 500000) + 200000,
        expected: 600000,
      }));

      setChartData({
        monthlyAdmissions,
        feeCollection,
        gradeDistribution,
        attendanceData: [
          { name: 'Present', value: 94, color: '#22c55e' },
          { name: 'Absent', value: 4, color: '#ef4444' },
          { name: 'Late', value: 2, color: '#f59e0b' },
        ],
      });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '...' : stats?.totalStudents?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'up',
      subtitle: 'Active enrollment',
      onClick: () => navigate('/students')
    },
    {
      label: 'Total Staff',
      value: loading ? '...' : stats?.totalStaff || '0',
      icon: UserCog,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+3%',
      changeType: 'up',
      subtitle: 'Teaching & Non-teaching',
      onClick: () => navigate('/staff')
    },
    {
      label: 'Active Classes',
      value: loading ? '...' : stats?.totalClasses || '0',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '0%',
      changeType: 'neutral',
      subtitle: 'This academic year',
      onClick: () => navigate('/classes')
    },
    {
      label: 'Pending Admissions',
      value: loading ? '...' : stats?.pendingAdmissions || '0',
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'New',
      changeType: 'neutral',
      subtitle: 'Awaiting approval',
      onClick: () => navigate('/admissions')
    },
  ];

  const quickStats = [
    { label: 'Daily Revenue', value: 'KES 45K', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Attendance Rate', value: '94%', icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Due Payments', value: '23', icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Events Today', value: '3', icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <>
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">Term 1 Progress Report</p>
            <p className="text-sm text-blue-100">Report cards are ready for Grade 4-6. Click to review and publish.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
        >
          View Reports
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <MiniStatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students per Grade - Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Students per Grade</h2>
              <p className="text-sm text-gray-500">Distribution across all grades</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.gradeDistribution} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Bar
                  dataKey="students"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Attendance Today</h2>
              <p className="text-sm text-gray-500">Real-time status</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing percentage={94} size={160} strokeWidth={16} color="#22c55e" />
            <div className="mt-6 w-full space-y-3">
              {chartData.attendanceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fee Collection</h2>
              <p className="text-sm text-gray-500">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-gray-600">Expected</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.feeCollection}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [`KES ${value.toLocaleString()}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Admissions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Monthly Admissions</h2>
              <p className="text-sm text-gray-500">New students enrolled</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              +18% this term
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyAdmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="students" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="target" fill="#e5e7eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              <p className="text-sm text-gray-500">This Term</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Award className="w-4 h-4" /> Best
            </span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Alice Wanjiku', score: 95, class: 'Grade 4 East', rank: 1 },
              { name: 'Brian Ochieng', score: 92, class: 'Grade 4 East', rank: 2 },
              { name: 'Carol Muthoni', score: 90, class: 'Grade 4 East', rank: 3 },
              { name: 'David Kamau', score: 88, class: 'Grade 5 East', rank: 4 },
            ].map((student, index) => (
              <div
                key={index}
                onClick={() => navigate('/students')}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                  }`}>
                  {student.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{student.name}</p>
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

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500">Latest updates</p>
            </div>
            <button onClick={() => navigate('/reports')} className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { icon: UserPlus, action: 'New student admitted', detail: 'Eva Akinyi - Grade 4 East', time: '2h ago', color: 'bg-green-100 text-green-600' },
              { icon: FileText, action: 'Assessment created', detail: 'Mathematics CAT 1', time: '5h ago', color: 'bg-blue-100 text-blue-600' },
              { icon: CreditCard, action: 'Fee payment received', detail: 'KES 15,000 - Alice Wanjiku', time: '1d ago', color: 'bg-purple-100 text-purple-600' },
              { icon: Award, action: 'Report cards generated', detail: 'Grade 4 - Term 1', time: '2d ago', color: 'bg-yellow-100 text-yellow-600' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Shortcuts</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: UserPlus, label: 'Add Student', color: 'bg-blue-500', path: '/admissions' },
              { icon: Calendar, label: 'Attendance', color: 'bg-green-500', path: '/attendance' },
              { icon: ClipboardList, label: 'Assessment', color: 'bg-purple-500', path: '/assessments' },
              { icon: DollarSign, label: 'Collect Fee', color: 'bg-orange-500', path: '/fees' },
              { icon: FileText, label: 'Reports', color: 'bg-pink-500', path: '/reports' },
              { icon: Bell, label: 'Announce', color: 'bg-indigo-500', path: '/announcements' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition group"
              >
                <div className={`${action.color} p-3 rounded-xl group-hover:scale-110 transition`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const [nextLesson, setNextLesson] = useState(null);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonRes, classesRes] = await Promise.all([
          api.get('/timetable/next-lesson').catch(() => ({ data: { data: null } })),
          api.get('/staff/my-classes').catch(() => ({ data: { data: [] } }))
        ]);
        setNextLesson(lessonRes.data.data);
        setMyClasses(classesRes.data.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const quickStats = [
    {
      label: 'Next Lesson',
      value: nextLesson ? `${nextLesson.subject.name}` : 'No lessons',
      subtitle: nextLesson ? `${nextLesson.class.grade.name} ${nextLesson.class.stream.name} @ ${nextLesson.startTime}` : 'Relax!',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: () => navigate('/timetable')
    },
    { label: 'My Classes', value: loading ? '...' : myClasses.length, icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100', onClick: () => navigate('/classes') },
    { label: 'Today\'s Attendance', value: 'Mark Now', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', onClick: () => navigate('/attendance') },
    { label: 'Pending Tasks', value: '2', icon: ClipboardList, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Take Attendance', color: 'bg-blue-500', path: '/attendance' },
              { icon: BookOpen, label: 'Course Planner', color: 'bg-indigo-500', path: '/course-planner' },
              { icon: ClipboardList, label: 'Enter Scores', color: 'bg-green-500', path: '/assessments' },
              { icon: Users, label: 'View Students', color: 'bg-purple-500', path: '/students' },
              { icon: Award, label: 'Generate Reports', color: 'bg-orange-500', path: '/reports' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className={`${action.color} p-3 rounded-xl`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Classes</h2>
          <div className="space-y-3">
            {loading ? <div className="p-4 text-center text-gray-500">Loading classes...</div> :
              myClasses.length === 0 ? <div className="p-4 text-center text-gray-500">No classes assigned.</div> :
                myClasses.map((cls, index) => (
                  <div
                    key={index}
                    onClick={() => navigate('/classes')} // Or specific class view
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cls.grade.name} {cls.stream.name}</p>
                        {/* Assuming backend returns subject or we fetch it? getMyClasses in controller returns classes. */}
                        {/* We might need to adjust getMyClasses to include subject info if derived from assignments */}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{cls._count?.students || 0}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}

function BursarDashboard() {
  const navigate = useNavigate();
  const feeData = [
    { month: 'Jan', collected: 450000, pending: 150000 },
    { month: 'Feb', collected: 380000, pending: 120000 },
    { month: 'Mar', collected: 520000, pending: 80000 },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Collections" value="KES 2.5M" icon={DollarSign} color="text-green-600" bgColor="bg-green-100" change="+15%" changeType="up" />
        <StatCard label="Outstanding Fees" value="KES 850K" icon={Wallet} color="text-red-600" bgColor="bg-red-100" change="-8%" changeType="down" />
        <StatCard label="Students Cleared" value="245" icon={CheckCircle} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard label="Pending Payments" value="52" icon={Clock} color="text-orange-600" bgColor="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: 'Record Payment', color: 'bg-green-500', path: '/fees' },
              { icon: FileText, label: 'Generate Invoice', color: 'bg-blue-500', path: '/fees' },
              { icon: AlertCircle, label: 'Fee Defaulters', color: 'bg-red-500', path: '/fees' },
              { icon: Award, label: 'Fee Reports', color: 'bg-purple-500', path: '/reports' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className={`${action.color} p-3 rounded-xl`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Payments</h2>
          <div className="space-y-3">
            {[
              { name: 'Alice Wanjiku', amount: 'KES 15,000', method: 'M-PESA', time: '2 hours ago' },
              { name: 'Brian Ochieng', amount: 'KES 22,000', method: 'Bank Transfer', time: '5 hours ago' },
              { name: 'Carol Muthoni', amount: 'KES 18,500', method: 'M-PESA', time: '1 day ago' },
            ].map((payment, index) => (
              <div
                key={index}
                onClick={() => navigate('/fees')}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-sm text-gray-500">{payment.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{payment.amount}</p>
                  <p className="text-xs text-gray-500">{payment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StudentDashboard({ user }) {
  const subjectScores = [
    { subject: 'Math', score: 88 },
    { subject: 'Eng', score: 82 },
    { subject: 'Sci', score: 90 },
    { subject: 'SST', score: 78 },
    { subject: 'Kis', score: 85 },
    { subject: 'Art', score: 92 },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="My Average" value="85%" icon={Award} color="text-blue-600" bgColor="bg-blue-100" change="+5%" changeType="up" />
        <StatCard label="Attendance" value="94%" icon={CheckCircle} color="text-green-600" bgColor="bg-green-100" />
        <StatCard label="Class Rank" value="#5" icon={GraduationCap} color="text-purple-600" bgColor="bg-purple-100" change="+2" changeType="up" />
        <StatCard label="Fee Balance" value="KES 5K" icon={Wallet} color="text-orange-600" bgColor="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Subject Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
*/}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Subjects</h2>
          <div className="space-y-3">
            {[
              { name: 'Mathematics', score: 88, grade: 'A' },
              { name: 'English', score: 82, grade: 'B+' },
              { name: 'Science', score: 90, grade: 'A' },
              { name: 'Social Studies', score: 78, grade: 'B' },
            ].map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-500">Term 1 Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{subject.score}%</p>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{subject.grade}</span>
                </div>
              </div>
            ))}
          </div>
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
    if (user?.role !== 'STUDENT' && user?.role !== 'PARENT') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

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
        return <StudentDashboardRedesigned user={user} />;
      case 'PARENT':
        return <StudentDashboardRedesigned user={user} />;
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}! 👋</h1>
          <p className="text-gray-500">
            Welcome back, <span className="font-medium text-gray-700">
              {user?.student?.firstName || user?.staff?.firstName || user?.name?.replace(/Student$|Teacher$|Bursar$|Admin$/i, '').trim() || user?.email?.split('@')[0]}
            </span>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {getRoleLabel(user?.role)}
            </span>
          </p>
        </div>
        <div className="text-right bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Academic Year</p>
          <p className="font-bold text-gray-900">2026 - Term 1</p>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

export default Dashboard;
