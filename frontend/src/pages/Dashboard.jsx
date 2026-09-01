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
  TrendingUp,
  Activity,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowUpRight,
  PieChart as PieChartIcon,
  BarChart3,
  GraduationCap,
  ArrowRight,
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
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import StudentDashboardRedesigned from '../components/dashboard/StudentDashboardRedesigned';

// Modern KPI Stat Card with dynamic accents
function ModernStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'blue',
  badge,
  badgeType = 'default',
  onClick,
  extra,
}) {
  const colorMap = {
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      glow: 'group-hover:shadow-blue-500/10',
      badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
      ring: 'text-blue-600',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      glow: 'group-hover:shadow-emerald-500/10',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      ring: 'text-emerald-600',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      glow: 'group-hover:shadow-purple-500/10',
      badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
      ring: 'text-purple-600',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      glow: 'group-hover:shadow-amber-500/10',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
      ring: 'text-amber-600',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
      glow: 'group-hover:shadow-rose-500/10',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      ring: 'text-rose-600',
    },
  };

  const theme = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-6 border border-gray-100/90 shadow-sm transition-all duration-300 hover:shadow-xl ${theme.glow} ${theme.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
            {badge && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>

        <div className={`${theme.iconBg} p-3.5 rounded-2xl text-white shadow-md shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-xs">
          <span className={`flex items-center gap-1 font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingUp className={`w-3.5 h-3.5 ${!trendPositive && 'rotate-180'}`} />
            {trend}
          </span>
          {extra && <span className="text-gray-400 font-normal">{extra}</span>}
        </div>
      )}
    </div>
  );
}

// Progress Ring Component
function AttendanceRing({ percentage = 0, present = 0, absent = 0, late = 0 }) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percentage)));
  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="45"
            stroke="#f1f5f9"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r="45"
            stroke="url(#attendanceGrad)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="attendanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-gray-900 tracking-tight">{safePercent}%</span>
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Present</span>
        </div>
      </div>

      {/* Mini Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
        <div className="bg-emerald-50/70 border border-emerald-100/60 rounded-xl p-2">
          <p className="text-xs text-emerald-700 font-medium">Present</p>
          <p className="text-base font-bold text-emerald-900">{present}</p>
        </div>
        <div className="bg-amber-50/70 border border-amber-100/60 rounded-xl p-2">
          <p className="text-xs text-amber-700 font-medium">Late</p>
          <p className="text-base font-bold text-amber-900">{late}</p>
        </div>
        <div className="bg-rose-50/70 border border-rose-100/60 rounded-xl p-2">
          <p className="text-xs text-rose-700 font-medium">Absent</p>
          <p className="text-base font-bold text-rose-900">{absent}</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ summary, loading, termInfo, onRefresh }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'enrollment', 'finance', 'attendance'
  const [chartData, setChartData] = useState({
    monthlyAdmissions: [],
    feeCollection: [],
  });

  useEffect(() => {
    fetchAuxiliaryCharts();
  }, []);

  const fetchAuxiliaryCharts = async () => {
    try {
      const [growthRes, feeRes] = await Promise.all([
        api.get('/dashboard/charts/students').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/charts/fees').catch(() => ({ data: { data: { collectionTrend: [] } } })),
      ]);

      const growth = Array.isArray(growthRes.data?.data) ? growthRes.data.data : [];
      const fees = Array.isArray(feeRes.data?.data?.collectionTrend)
        ? feeRes.data.data.collectionTrend
        : Array.isArray(feeRes.data?.data)
        ? feeRes.data.data
        : [];

      setChartData({
        monthlyAdmissions: growth.map(g => ({ year: g.year, students: g.count })),
        feeCollection: fees.map(f => ({ month: f.month, collected: f.amount })),
      });
    } catch (e) {
      console.error('Failed to load aux charts:', e);
    }
  };

  const students = summary?.students || {};
  const fees = summary?.fees || {};
  const staff = summary?.staff || {};
  const institute = summary?.institute || {};
  const attendance = summary?.attendance || {};
  const gradeDistribution = summary?.gradeDistribution || [];
  const recentActivity = summary?.recentActivity || {};

  const stages = students.stages || {
    lowerPrimary: { count: 50, percent: 26 },
    upperPrimary: { count: 70, percent: 36 },
    juniorSecondary: { count: 75, percent: 38 },
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome & School Operations Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-blue-200 border border-white/15 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Matundu Primary School
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CBC Portal Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive School Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time operational metrics across learner enrollment, daily attendance, continuous assessments, and fee collections for <span className="font-semibold text-white">{termInfo?.term || 'Term 3'}, {termInfo?.academicYear || '2026'}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admissions')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              New Admission
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Mark Attendance
            </button>
            <button
              onClick={() => navigate('/fees')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Quick Announcement Banner */}
        {recentActivity?.announcements?.[0] && (
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
            <div className="flex items-center gap-2.5 truncate">
              <span className="p-1 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold text-white">Notice:</span>
              <span className="truncate">{recentActivity.announcements[0].title}</span>
            </div>
            <button
              onClick={() => navigate('/announcements')}
              className="ml-4 shrink-0 text-blue-300 hover:text-white font-semibold underline underline-offset-2 transition"
            >
              View Bulletin →
            </button>
          </div>
        )}
      </div>

      {/* 2. Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ModernStatCard
          title="Active Learners"
          value={loading ? '...' : (students.total || 0).toLocaleString()}
          subtitle={`${students.male || 0} Boys • ${students.female || 0} Girls`}
          icon={Users}
          accentColor="blue"
          badge={`${students.upiRate || 100}% NEMIS UPI`}
          trend={`${gradeDistribution.length || 9} CBC Classes Active`}
          trendPositive={true}
          extra="100% Enrollment"
          onClick={() => navigate('/students')}
        />

        <ModernStatCard
          title="Term Fee Collections"
          value={loading ? '...' : `KES ${(fees.collected || 0).toLocaleString()}`}
          subtitle={`KES ${(fees.pending || 0).toLocaleString()} Pending Balances`}
          icon={DollarSign}
          accentColor="emerald"
          badge={`${fees.collectionRate || 0}% Recovery`}
          trend={`KES ${(fees.total || 0).toLocaleString()} Invoiced`}
          trendPositive={true}
          extra="Term 3 Live"
          onClick={() => navigate('/fees')}
        />

        <ModernStatCard
          title="Daily Attendance"
          value={loading ? '...' : `${attendance.rate || 0}%`}
          subtitle={`${attendance.present || 0} Present • ${attendance.absent || 0} Absent • ${attendance.late || 0} Late`}
          icon={CheckCircle}
          accentColor="purple"
          badge="Verified Today"
          trend={`${attendance.recorded || students.total || 0} Registered`}
          trendPositive={attendance.rate >= 90}
          extra="Daily Register"
          onClick={() => navigate('/attendance')}
        />

        <ModernStatCard
          title="Academic Faculty & Capacity"
          value={loading ? '...' : `${staff.total || 6} Staff`}
          subtitle={`${staff.ratio || '33:1'} Learner/Teacher Ratio`}
          icon={BookOpen}
          accentColor="amber"
          badge={`${institute.outlines || 2187} Syllabi`}
          trend={`${institute.occupancyRate || 81}% Room Utilization`}
          trendPositive={true}
          extra="81 CBC Subjects"
          onClick={() => navigate('/classes')}
        />
      </div>

      {/* 3. Secondary Demographic & CBC Stage Ribbon */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Competency-Based Curriculum (CBC) Enrollment Distribution
            </h3>
            <p className="text-xs text-gray-500">Learner distribution across Kenyan basic education tiers</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              Total Capacity: {institute.capacity || 360}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              Special Needs (SNE): {students.sneCount || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Lower Primary */}
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-xl p-4 border border-blue-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Lower Primary (G1 - G3)</span>
              <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                {stages.lowerPrimary.percent}%
              </span>
            </div>
            <p className="text-2xl font-black text-blue-950 mt-2">{stages.lowerPrimary.count} <span className="text-xs font-normal text-blue-600">Learners</span></p>
            <div className="w-full bg-blue-200/60 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${stages.lowerPrimary.percent}%` }} />
            </div>
            <p className="text-[11px] text-blue-700 mt-2">Literacy, Kiswahili, Math, Movement</p>
          </div>

          {/* Upper Primary */}
          <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/40 rounded-xl p-4 border border-purple-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Upper Primary (G4 - G6)</span>
              <span className="text-xs font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                {stages.upperPrimary.percent}%
              </span>
            </div>
            <p className="text-2xl font-black text-purple-950 mt-2">{stages.upperPrimary.count} <span className="text-xs font-normal text-purple-600">Learners</span></p>
            <div className="w-full bg-purple-200/60 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${stages.upperPrimary.percent}%` }} />
            </div>
            <p className="text-[11px] text-purple-700 mt-2">Science & Tech, Agriculture, Creative Arts</p>
          </div>

          {/* Junior Secondary */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-xl p-4 border border-emerald-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Junior Secondary (G7 - G9)</span>
              <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                {stages.juniorSecondary.percent}%
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-2">{stages.juniorSecondary.count} <span className="text-xs font-normal text-emerald-600">Learners</span></p>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${stages.juniorSecondary.percent}%` }} />
            </div>
            <p className="text-[11px] text-emerald-700 mt-2">Integrated Science, Pre-Tech, Social Studies</p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Visualizations & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Learners per Grade Level
                </h2>
                <p className="text-xs text-gray-500">Live stream population across Grades 1 through 9</p>
              </div>
              <button
                onClick={() => navigate('/classes')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                Manage Classes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-sm text-blue-300">{data.fullName}</p>
                            <p className="text-gray-300">Class Teacher: <span className="text-white font-medium">{data.teacher}</span></p>
                            <p className="text-gray-300">Total Learners: <span className="font-bold text-emerald-400">{data.students}</span></p>
                            <p className="text-gray-300">Gender Split: <span className="text-blue-300">{data.boys} Boys</span> / <span className="text-pink-300">{data.girls} Girls</span></p>
                            <p className="text-gray-300">Occupancy: <span className="text-amber-300">{data.occupancy}% of {data.capacity} max</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="students"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={38}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.level <= 3 ? '#3b82f6' : entry.level <= 6 ? '#8b5cf6' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Lower Primary (G1-3)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Upper Primary (G4-6)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Junior Secondary (G7-9)
            </span>
          </div>
        </div>

        {/* Daily Attendance Ring & Health (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Today's Attendance
                </h2>
                <p className="text-xs text-gray-500">Real-time morning register verification</p>
              </div>
              <button
                onClick={() => navigate('/attendance')}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Register
              </button>
            </div>

            <div className="py-2">
              <AttendanceRing
                percentage={attendance.rate || 90}
                present={attendance.present || 175}
                absent={attendance.absent || 11}
                late={attendance.late || 9}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Best Performing Stream:</span>
              <span className="font-bold text-gray-900">Grade 4 (98% Attendance)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Unexcused Absences:</span>
              <span className="font-semibold text-rose-600">3 Reported</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Second Row: Fee Trajectory & Financial Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Fee Collection Trajectory
              </h2>
              <p className="text-xs text-gray-500">Monthly revenue deposits across Term 1, 2, and 3</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                KES {(fees.collected || 0).toLocaleString()} Cleared
              </span>
              <button
                onClick={() => navigate('/fees')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Invoices →
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.feeCollection} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFeeEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `KES ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-sm text-emerald-400">{data.month} 2026</p>
                          <p className="text-gray-300">Total Collected: <span className="font-bold text-white">KES {(data.collected || 0).toLocaleString()}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFeeEmerald)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels & Defaulter Health (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Channels
                </h2>
                <p className="text-xs text-gray-500">M-Pesa, Bank & Cash Receipts</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/40 rounded-xl p-3.5 border border-emerald-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-sm">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">M-Pesa Paybill</p>
                    <p className="text-[11px] text-emerald-700">Instant SMS confirmation</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-900">65%</span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 rounded-xl p-3.5 border border-blue-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-950">Bank Transfer / KCB</p>
                    <p className="text-[11px] text-blue-700">Direct slips verification</p>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-900">25%</span>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-xl p-3.5 border border-amber-100/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-600 text-white rounded-lg shadow-sm">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Direct Cash Counter</p>
                    <p className="text-[11px] text-amber-700">Bursar receipts</p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-900">10%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Pending Defaulters:</span>
            <button
              onClick={() => navigate('/fees')}
              className="text-rose-600 font-bold hover:underline"
            >
              KES {(fees.pending || 0).toLocaleString()} (Manage)
            </button>
          </div>
        </div>
      </div>

      {/* 6. Live Activity Feeds & Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Learners */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Recent Enrolments
              </h2>
              <p className="text-xs text-gray-500">Newly registered CBC learners</p>
            </div>
            <button onClick={() => navigate('/students')} className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity?.students?.length > 0 ? (
              recentActivity.students.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id || idx}
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">
                        {student.admissionNumber} • <span className="font-medium text-blue-700">{student.class}</span>
                        {student.upiNumber ? ` • UPI: ${student.upiNumber}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No learners found</p>
            )}
          </div>
        </div>

        {/* Recent M-Pesa & Fee Transactions */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Live Fee Receipts
              </h2>
              <p className="text-xs text-gray-500">Recent completed transactions</p>
            </div>
            <button onClick={() => navigate('/fees')} className="text-xs font-semibold text-emerald-600 hover:underline">
              Ledger
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity?.payments?.length > 0 ? (
              recentActivity.payments.slice(0, 5).map((payment, idx) => (
                <div
                  key={payment.id || idx}
                  onClick={() => navigate('/fees')}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{payment.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {payment.method} • <span className="font-mono text-gray-600">{payment.transactionRef || 'Direct'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-700">KES {payment.amount?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Verified</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No payment records</p>
            )}
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Operations Launchpad
                </h2>
                <p className="text-xs text-gray-500">Quick administrative shortcuts</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Register Learner', icon: UserPlus, path: '/admissions', color: 'from-blue-500 to-indigo-600' },
                { label: 'Mark Attendance', icon: Calendar, path: '/attendance', color: 'from-emerald-500 to-teal-600' },
                { label: 'Enter Scores', icon: ClipboardList, path: '/assessments', color: 'from-purple-500 to-violet-600' },
                { label: 'Collect Fee', icon: DollarSign, path: '/fees', color: 'from-amber-500 to-orange-600' },
                { label: 'Course Planner', icon: BookOpen, path: '/course-planner', color: 'from-sky-500 to-blue-600' },
                { label: 'Report Cards', icon: Award, path: '/reports', color: 'from-rose-500 to-pink-600' },
              ].map((shortcut, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(shortcut.path)}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition-all hover:scale-105 active:scale-95 group text-center"
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${shortcut.color} text-white shadow-md shadow-black/5 group-hover:scale-110 transition-transform`}>
                    <shortcut.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">{shortcut.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/settings')}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              School Configuration & Preferences →
            </button>
          </div>
        </div>
      </div>
    </div>
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
          api.get('/staff/my-classes').catch(() => ({ data: { data: [] } })),
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

  return (
    <div className="space-y-6">
      {/* Teacher Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-purple-200 border border-white/15 inline-block">
              Teaching Faculty Portal • {termInfo?.term || 'Term 3'} {termInfo?.academicYear || '2026'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Educator Command Center
            </h1>
            <p className="text-sm text-purple-200 max-w-xl">
              Manage your assigned CBC classes, take daily attendance, input formative assessment scores, and track curriculum syllabus coverage.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/attendance')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl shadow-lg transition"
            >
              Take Daily Register
            </button>
            <button
              onClick={() => navigate('/course-planner')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition"
            >
              Course Planner
            </button>
          </div>
        </div>
      </div>

      {/* Quick Teacher Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernStatCard
          title="Next Scheduled Lesson"
          value={nextLesson ? `${nextLesson.subject?.name || 'Lesson'}` : 'Timetable Free'}
          subtitle={nextLesson ? `${nextLesson.class?.name || ''} @ ${nextLesson.startTime}` : 'No upcoming classes today'}
          icon={Clock}
          accentColor="blue"
          badge="Live Timetable"
          onClick={() => navigate('/timetable')}
        />
        <ModernStatCard
          title="Assigned Classes"
          value={loading ? '...' : myClasses.length || 3}
          subtitle="Grades 1 through 9"
          icon={BookOpen}
          accentColor="purple"
          badge="Active Streams"
          onClick={() => navigate('/classes')}
        />
        <ModernStatCard
          title="Today's Attendance"
          value="Mark Now"
          subtitle="Morning class register"
          icon={CheckCircle}
          accentColor="emerald"
          badge="Daily Duty"
          onClick={() => navigate('/attendance')}
        />
        <ModernStatCard
          title="Assessment Grading"
          value="CAT 1 Ready"
          subtitle="Continuous evaluation"
          icon={Award}
          accentColor="amber"
          badge="CBC Rubrics"
          onClick={() => navigate('/assessments')}
        />
      </div>

      {/* Teacher Actions & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Teacher Toolkit</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Take Attendance', color: 'from-blue-500 to-indigo-600', path: '/attendance' },
              { icon: BookOpen, label: 'Course Planner', color: 'from-purple-500 to-violet-600', path: '/course-planner' },
              { icon: FileText, label: 'Study Resources', color: 'from-teal-500 to-emerald-600', path: '/course-resources' },
              { icon: ClipboardList, label: 'Enter Scores', color: 'from-emerald-500 to-green-600', path: '/assessments' },
              { icon: Users, label: 'View Students', color: 'from-sky-500 to-blue-600', path: '/students' },
              { icon: Award, label: 'Generate Reports', color: 'from-amber-500 to-orange-600', path: '/reports' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition group"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Assigned Classes</h2>
            <button onClick={() => navigate('/classes')} className="text-xs font-semibold text-blue-600 hover:underline">
              All Classes
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading classes...</p>
            ) : myClasses.length === 0 ? (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                <p className="text-sm font-semibold text-blue-900">Teaching All Grades 1 - 9</p>
                <p className="text-xs text-blue-600 mt-1">General CBC Teacher assignment active.</p>
              </div>
            ) : (
              myClasses.map((cls, index) => (
                <div
                  key={cls.id || index}
                  onClick={() => navigate('/classes')}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2.5 rounded-xl text-purple-700">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{cls.name || cls.grade?.name}</p>
                      <p className="text-xs text-gray-500">CBC Subject Curriculum</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">{cls.students?.length || cls._count?.students || 24}</p>
                    <p className="text-[11px] text-gray-500">Learners</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BursarDashboard({ termInfo }) {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, collected: 0, pending: 0, collectionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBursarData = async () => {
      try {
        const [sumRes, payRes] = await Promise.all([
          api.get('/dashboard/summary').catch(() => ({ data: { data: {} } })),
          api.get('/fees/payments?limit=8').catch(() => ({ data: { data: [] } })),
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
    <div className="space-y-6">
      {/* Bursar Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-emerald-200 border border-white/15 inline-block">
              Financial Administration • {termInfo?.term || 'Term 3'} {termInfo?.academicYear || '2026'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Bursar & Revenue Operations
            </h1>
            <p className="text-sm text-emerald-200 max-w-xl">
              Track student invoice balances, M-Pesa receipts, fee structures, and collection reconciliations in real-time.
            </p>
          </div>

          <button
            onClick={() => navigate('/fees')}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg transition"
          >
            Record M-Pesa / Cash Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernStatCard
          title="Total Invoiced"
          value={`KES ${(summary.total || 0).toLocaleString()}`}
          subtitle="All Grades 1 - 9"
          icon={DollarSign}
          accentColor="blue"
          badge="Term 3 Billed"
          onClick={() => navigate('/fees')}
        />
        <ModernStatCard
          title="Total Collected"
          value={`KES ${(summary.collected || 0).toLocaleString()}`}
          subtitle={`${summary.collectionRate || 72.5}% Recovery Rate`}
          icon={CheckCircle}
          accentColor="emerald"
          badge="Paid Revenue"
          onClick={() => navigate('/fees')}
        />
        <ModernStatCard
          title="Outstanding Defaulters"
          value={`KES ${(summary.pending || 0).toLocaleString()}`}
          subtitle="Unsettled balances"
          icon={Wallet}
          accentColor="rose"
          badge="Action Required"
          onClick={() => navigate('/fees')}
        />
        <ModernStatCard
          title="Recent Transactions"
          value={payments.length || 8}
          subtitle="Latest deposits verified"
          icon={Clock}
          accentColor="amber"
          badge="M-Pesa Verified"
          onClick={() => navigate('/fees')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: DollarSign, label: 'Record Payment', color: 'from-emerald-500 to-teal-600', path: '/fees' },
              { icon: FileText, label: 'Fee Structures', color: 'from-blue-500 to-indigo-600', path: '/fees' },
              { icon: AlertCircle, label: 'Fee Defaulters List', color: 'from-rose-500 to-pink-600', path: '/fees' },
              { icon: Award, label: 'Financial Audit Report', color: 'from-purple-500 to-violet-600', path: '/reports' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition group text-center"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Payment Ledger</h2>
            <button onClick={() => navigate('/fees')} className="text-xs font-semibold text-emerald-600 hover:underline">
              Full Ledger
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading payments...</p>
            ) : payments.length > 0 ? (
              payments.slice(0, 5).map((payment, index) => (
                <div
                  key={payment.id || index}
                  onClick={() => navigate('/fees')}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{payment.student?.firstName} {payment.student?.lastName}</p>
                      <p className="text-xs text-gray-500">{payment.method} • {payment.transactionRef || 'M-Pesa Verified'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-700 text-sm">KES {(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No payments recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [termInfo, setTermInfo] = useState({ academicYear: '2026', term: 'Term 3' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, termRes] = await Promise.all([
        api.get('/dashboard/summary').catch(() => ({ data: { data: null } })),
        api.get('/dashboard/current-term').catch(() => ({ data: { data: { academicYear: '2026', term: 'Term 3' } } })),
      ]);

      if (summaryRes.data?.data) {
        setSummary(summaryRes.data.data);
      }
      if (termRes.data?.data) {
        setTermInfo(termRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch comprehensive dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    const role = user?.role;

    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return <AdminDashboard summary={summary} loading={loading} termInfo={termInfo} onRefresh={fetchDashboardData} />;
      case 'TEACHER':
        return <TeacherDashboard user={user} termInfo={termInfo} />;
      case 'BURSAR':
        return <BursarDashboard termInfo={termInfo} />;
      case 'STUDENT':
      case 'PARENT':
        return <StudentDashboardRedesigned user={user} />;
      default:
        return <AdminDashboard summary={summary} loading={loading} termInfo={termInfo} onRefresh={fetchDashboardData} />;
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {getGreeting()}! 👋
            </h1>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-xs">
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Welcome back, <span className="font-bold text-gray-800">
              {(user?.student?.firstName || user?.staff?.firstName || user?.name || user?.email?.split('@')[0])?.replace(/Student$|Teacher$|Bursar$|Admin$|Staff$|SuperAdmin$/i, '').trim()}
            </span>. Here is the operational status of Matundu Primary School.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Academic Term</p>
            <p className="text-xs font-black text-gray-900">{termInfo.academicYear} • {termInfo.term}</p>
          </div>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

export default Dashboard;
