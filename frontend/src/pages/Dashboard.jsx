import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import {
  Users,
  UserCog,
  BookOpen,
  Wallet,
  Calendar,
  Award,
  ClipboardList,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Bell,
  UserPlus,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import StudentDashboardRedesigned from '../components/dashboard/StudentDashboardRedesigned';

// Stat Card Component - Modern Design
function StatCard({ label, value, icon: Icon, color, bgColor, badge, badgeColor, subtitle, onClick }) {
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
          {badge && (
            <div className="mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor || 'bg-blue-50 text-blue-700'}`}>
                {badge}
              </span>
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
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Progress Ring Component
function ProgressRing({ percentage, size = 120, strokeWidth = 12, color = '#3b82f6' }) {
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safePercentage / 100) * circumference;

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
        <span className="text-2xl font-bold text-gray-900">{safePercentage}%</span>
        <span className="text-xs text-gray-500">Attendance</span>
      </div>
    </div>
  );
}

function AdminDashboard({ stats, loading, termInfo }) {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    monthlyAdmissions: [],
    feeCollection: [],
    gradeDistribution: [],
    attendanceData: [],
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentAnnouncement, setRecentAnnouncement] = useState(null);
  const [feeSummary, setFeeSummary] = useState({ collected: 0, pending: 0, total: 0 });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const [classesRes, studentGrowthRes, feeTrendsRes, attendanceDistRes, studentsRes, summaryRes, announcementsRes] = await Promise.all([
        api.get('/academic/classes').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/charts/students').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/charts/fees').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/charts/attendance').catch(() => ({ data: { data: [] } })),
        api.get('/students?limit=5').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/summary').catch(() => ({ data: { data: {} } })),
        api.get('/communication/announcements?limit=1').catch(() => ({ data: { data: [] } })),
      ]);

      const recentList = Array.isArray(studentsRes.data?.data) ? studentsRes.data.data : [];
      setRecentStudents(recentList);

      const announcementsList = Array.isArray(announcementsRes.data?.data) ? announcementsRes.data.data : [];
      if (announcementsList.length > 0) {
        setRecentAnnouncement(announcementsList[0]);
      }

      if (summaryRes.data?.data?.fees) {
        setFeeSummary(summaryRes.data.data.fees);
      }

      const classes = classesRes.data?.data || [];

      // Grade distribution from classes
      const gradeMap = {};
      classes.forEach(cls => {
        const gradeName = cls.grade?.name || cls.name || 'Unknown';
        if (!gradeMap[gradeName]) gradeMap[gradeName] = 0;
        gradeMap[gradeName] += cls._count?.students || cls.students?.length || 0;
      });

      const gradeDistribution = Object.entries(gradeMap).map(([name, students]) => ({
        name: name.replace('Grade ', 'G'),
        students,
        fullName: name,
      }));

      // Student growth from API
      const rawGrowth = Array.isArray(studentGrowthRes.data?.data) ? studentGrowthRes.data.data : [];
      const monthlyAdmissions = rawGrowth.map(item => ({
        month: item.year?.toString() || '',
        students: item.count,
      }));

      // Fee collection from API
      const rawFees = Array.isArray(feeTrendsRes.data?.data?.collectionTrend) 
        ? feeTrendsRes.data.data.collectionTrend 
        : (Array.isArray(feeTrendsRes.data?.data) ? feeTrendsRes.data.data : []);
      const feeCollection = rawFees.map(item => ({
        month: item.month,
        collected: item.amount,
      }));

      // Attendance distribution from API
      const rawAttendance = Array.isArray(attendanceDistRes.data?.data?.distribution) 
        ? attendanceDistRes.data.data.distribution 
        : (Array.isArray(attendanceDistRes.data?.data) ? attendanceDistRes.data.data : []);
      const attendanceData = rawAttendance.length > 0
        ? rawAttendance.map(item => ({
          name: item.name,
          value: item.value,
          color: item.name === 'Present' ? '#22c55e' : item.name === 'Absent' ? '#ef4444' : '#f59e0b',
        }))
        : [
          { name: 'Present', value: 0, color: '#22c55e' },
          { name: 'Absent', value: 0, color: '#ef4444' },
          { name: 'Late', value: 0, color: '#f59e0b' },
        ];

      setChartData({ monthlyAdmissions, feeCollection, gradeDistribution, attendanceData });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '...' : (stats?.totalStudents || 0).toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badge: 'Active Enrollment',
      badgeColor: 'bg-blue-50 text-blue-700',
      subtitle: 'CBC Registered Learners',
      onClick: () => navigate('/students')
    },
    {
      label: 'Total Staff',
      value: loading ? '...' : (stats?.totalStaff || 0).toLocaleString(),
      icon: UserCog,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badge: 'Active Staff',
      badgeColor: 'bg-green-50 text-green-700',
      subtitle: 'Teaching & Administration',
      onClick: () => navigate('/staff')
    },
    {
      label: 'Active Classes',
      value: loading ? '...' : (stats?.totalClasses || 0).toLocaleString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      badge: termInfo?.academicYear ? `AY ${termInfo.academicYear}` : 'Current Year',
      badgeColor: 'bg-purple-50 text-purple-700',
      subtitle: 'Grades 1 through 9',
      onClick: () => navigate('/classes')
    },
    {
      label: 'Pending Admissions',
      value: loading ? '...' : (stats?.pendingAdmissions || 0).toLocaleString(),
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      badge: stats?.pendingAdmissions > 0 ? 'Requires Action' : 'All Processed',
      badgeColor: stats?.pendingAdmissions > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600',
      subtitle: 'Applicant Queue',
      onClick: () => navigate('/admissions')
    },
  ];

  const quickStats = [
    { label: 'Total Revenue', value: `KES ${(feeSummary.collected || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Attendance Rate', value: `${stats?.attendanceRate ?? 0}%`, icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Pending Fees', value: `KES ${(feeSummary.pending || 0).toLocaleString()}`, icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Active Term', value: termInfo?.term && termInfo?.academicYear ? `${termInfo.term}, ${termInfo.academicYear}` : 'Term 1, 2026', icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <>
      {/* Dynamic Announcement / Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{recentAnnouncement?.title || `Matundu Primary School — ${termInfo?.term || 'Term 1'} ${termInfo?.academicYear || '2026'}`}</p>
            <p className="text-sm text-blue-100">
              {recentAnnouncement?.content || 'School management portal is active. Learner registry and class streams are up to date.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/students')}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
        >
          View Students
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
              <h2 className="text-lg font-semibold text-gray-900">Learners per Grade</h2>
              <p className="text-sm text-gray-500">Live enrollment across all CBC grade levels</p>
            </div>
            <button onClick={() => navigate('/classes')} className="p-2 hover:bg-gray-100 rounded-lg transition" title="View Classes">
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
                  formatter={(value, name, props) => [`${value} Learners`, props.payload.fullName]}
                />
                <Bar
                  dataKey="students"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
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
              <p className="text-sm text-gray-500">Daily verification status</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing percentage={stats?.attendanceRate ?? (chartData.attendanceData.find(d => d.name === 'Present')?.value || 0)} size={160} strokeWidth={16} color="#22c55e" />
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
              <h2 className="text-lg font-semibold text-gray-900">Fee Collection Trend</h2>
              <p className="text-sm text-gray-500">Monthly completed collections</p>
            </div>
            <button onClick={() => navigate('/fees')} className="text-blue-600 text-sm font-medium hover:underline">Fee Records</button>
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
                  tickFormatter={(value) => `KES ${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [`KES ${value.toLocaleString()}`, 'Collected']}
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

        {/* Admissions History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admissions Growth</h2>
              <p className="text-sm text-gray-500">Cumulative student enrollment by year</p>
            </div>
            <button onClick={() => navigate('/students')} className="text-blue-600 text-sm font-medium hover:underline">All Students</button>
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
                  formatter={(value) => [`${value} Students`, 'Total Enrolled']}
                />
                <Bar dataKey="students" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Assessments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assessments & Rankings</h2>
              <p className="text-sm text-gray-500">{termInfo?.term || 'Active Term'} Evaluations</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> CBC Grading
            </span>
          </div>
          <div className="text-center py-6 text-gray-500 space-y-2">
            <Award className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-700">Continuous Assessment Tracker</p>
            <p className="text-xs text-gray-400">Assessments and rubrics recorded under CBC Subjects populate rankings automatically.</p>
            <button
              onClick={() => navigate('/assessments')}
              className="mt-2 inline-flex items-center text-xs text-blue-600 font-semibold hover:underline"
            >
              Open Assessments →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Enrolments</h2>
              <p className="text-sm text-gray-500">Newly registered learners</p>
            </div>
            <button onClick={() => navigate('/students')} className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-3">
            {recentStudents.length > 0 ? (
              recentStudents.slice(0, 4).map((student, index) => (
                <div
                  key={student.id || index}
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.admissionNumber} • {student.class?.name || 'Class Assigned'}
                      {student.upiNumber ? ` • UPI: ${student.upiNumber}` : ''}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-medium">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No students enrolled yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Shortcuts</h2>
              <p className="text-sm text-gray-500">School operations</p>
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

function TeacherDashboard({ user, termInfo }) {
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
        setNextLesson(lessonRes.data?.data || null);

        const assignments = classesRes.data?.data || [];
        const classMap = {};
        assignments.forEach(a => {
          const cls = a.class;
          if (cls && !classMap[cls.id]) {
            classMap[cls.id] = cls;
          }
        });
        setMyClasses(Object.values(classMap));
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const quickStats = [
    {
      label: 'Next Scheduled Lesson',
      value: nextLesson ? `${nextLesson.subject?.name || 'Lesson'}` : 'No lessons',
      subtitle: nextLesson ? `${nextLesson.class?.name || nextLesson.class?.grade?.name || ''} @ ${nextLesson.startTime}` : 'Timetable Free',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: () => navigate('/timetable')
    },
    { 
      label: 'Assigned Classes', 
      value: loading ? '...' : myClasses.length, 
      icon: BookOpen, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100', 
      subtitle: termInfo?.academicYear ? `AY ${termInfo.academicYear}` : 'Active Classes',
      onClick: () => navigate('/classes') 
    },
    { 
      label: "Today's Attendance", 
      value: 'Mark Now', 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      subtitle: 'Daily Register',
      onClick: () => navigate('/attendance') 
    },
    { 
      label: 'Academic Term', 
      value: termInfo?.term || 'Term 1', 
      icon: Calendar, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      subtitle: termInfo?.academicYear || '2026'
    },
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Teacher Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Calendar, label: 'Take Attendance', color: 'bg-blue-500', path: '/attendance' },
              { icon: BookOpen, label: 'Course Planner', color: 'bg-indigo-500', path: '/course-planner' },
              { icon: FileText, label: 'Study Resources', color: 'bg-teal-500', path: '/course-resources' },
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
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading classes...</div>
            ) : myClasses.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No classes assigned yet. Contact administrator.</div>
            ) : (
              myClasses.map((cls, index) => (
                <div
                  key={cls.id || index}
                  onClick={() => navigate('/classes')}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cls.name || cls.grade?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{cls.students?.length || cls._count?.students || 0}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function BursarDashboard({ termInfo }) {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, collected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBursarData = async () => {
      try {
        const [sumRes, payRes] = await Promise.all([
          api.get('/dashboard/summary').catch(() => ({ data: { data: {} } })),
          api.get('/fees/payments?limit=5').catch(() => ({ data: { data: [] } })),
        ]);
        if (sumRes.data?.data?.fees) {
          setSummary(sumRes.data.data.fees);
        }
        setPayments(Array.isArray(payRes.data?.data) ? payRes.data.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBursarData();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Invoiced" value={`KES ${(summary.total || 0).toLocaleString()}`} icon={DollarSign} color="text-blue-600" bgColor="bg-blue-100" subtitle={termInfo?.academicYear ? `AY ${termInfo.academicYear}` : 'Billed'} />
        <StatCard label="Total Collected" value={`KES ${(summary.collected || 0).toLocaleString()}`} icon={DollarSign} color="text-green-600" bgColor="bg-green-100" subtitle="Paid Amount" />
        <StatCard label="Outstanding Balance" value={`KES ${(summary.pending || 0).toLocaleString()}`} icon={Wallet} color="text-red-600" bgColor="bg-red-100" subtitle="Pending Fee Collection" />
        <StatCard label="Recent Payments" value={payments.length} icon={Clock} color="text-orange-600" bgColor="bg-orange-100" subtitle="Latest Transactions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: 'Record Payment', color: 'bg-green-500', path: '/fees' },
              { icon: FileText, label: 'Fee Structures', color: 'bg-blue-500', path: '/fees' },
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payment Receipts</h2>
            <button onClick={() => navigate('/fees')} className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-6">Loading payments...</p>
            ) : payments.length > 0 ? (
              payments.map((payment, index) => (
                <div
                  key={payment.id || index}
                  onClick={() => navigate('/fees')}
                  className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.student?.firstName} {payment.student?.lastName}</p>
                      <p className="text-xs text-gray-500">{payment.method} • {payment.transactionRef || 'Direct'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">KES {(payment.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No payments recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [termInfo, setTermInfo] = useState({ academicYear: '2026', term: 'Term 1' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, staffRes, classesRes, pendingRes, attendanceDistRes, termRes] = await Promise.all([
        api.get('/students?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/staff?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/academic/classes?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/students?admissionStatus=PENDING&limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        api.get('/dashboard/charts/attendance').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/current-term').catch(() => ({ data: { data: { academicYear: '2026', term: 'Term 1' } } })),
      ]);

      if (termRes.data?.data) {
        setTermInfo(termRes.data.data);
      }

      const rawAttendance = Array.isArray(attendanceDistRes.data?.data?.distribution)
        ? attendanceDistRes.data.data.distribution
        : (Array.isArray(attendanceDistRes.data?.data) ? attendanceDistRes.data.data : []);
      const presentItem = rawAttendance.find(item => item.name === 'Present');
      const realAttendanceRate = presentItem ? presentItem.value : 0;

      setStats({
        totalStudents: studentsRes.data?.meta?.total || 0,
        totalStaff: staffRes.data?.meta?.total || 0,
        totalClasses: classesRes.data?.meta?.total || 0,
        pendingAdmissions: pendingRes.data?.meta?.total || 0,
        attendanceRate: realAttendanceRate,
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
        return <AdminDashboard stats={stats} loading={loading} termInfo={termInfo} />;
      case 'TEACHER':
        return <TeacherDashboard user={user} termInfo={termInfo} />;
      case 'BURSAR':
        return <BursarDashboard termInfo={termInfo} />;
      case 'STUDENT':
      case 'PARENT':
        return <StudentDashboardRedesigned user={user} />;
      default:
        return <AdminDashboard stats={stats} loading={loading} termInfo={termInfo} />;
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
              {(user?.student?.firstName || user?.staff?.firstName || user?.name || user?.email?.split('@')[0])?.replace(/Student$|Teacher$|Bursar$|Admin$|Staff$|SuperAdmin$/i, '').trim()}
            </span>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {getRoleLabel(user?.role)}
            </span>
          </p>
        </div>
        <div className="text-right bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Academic Year</p>
          <p className="font-bold text-gray-900">{termInfo.academicYear} — {termInfo.term}</p>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

export default Dashboard;
