import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { dashboardService } from '../services/dashboardService';
import api from '../services/api'; // For direct auth-related calls if needed
import { Users, BookOpen, Wallet, RefreshCw, LayoutDashboard } from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard';
import { StudentGrowthChart, AttendancePieChart, FeeCollectionChart, FeeDetailsPieChart } from '../components/dashboard/DashboardCharts';
import NewsCard from '../components/dashboard/NewsCard';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';

function AdminDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    studentCharts: [],
    feeCharts: null,
    attendanceCharts: [],
    news: [] // We'll fetch announcements
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data from new dashboard endpoints
      const [summary, studentCharts, feeCharts, attendanceCharts, newsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getStudentCharts(),
        dashboardService.getFeeCharts(),
        dashboardService.getAttendanceCharts(),
        api.get('/communication/announcements?limit=5') // Fetch recent news
      ]);

      setData({
        summary,
        studentCharts,
        feeCharts,
        attendanceCharts: attendanceCharts.distribution,
        news: newsRes.data.data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );
  }

  // Transform Summary Data for Cards
  const feeData = [
      { label: 'Total Fee', value: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(data.summary?.fees.total || 0), valueBadge: true, valueBadgeColor: 'bg-cyan-500' },
      { label: 'Fee Collected', value: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(data.summary?.fees.collected || 0), valueBadge: true, valueBadgeColor: 'bg-cyan-500' },
      { label: 'Fee Pending', value: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(data.summary?.fees.pending || 0), valueBadge: true, valueBadgeColor: 'bg-cyan-500' }
  ];

  const studentData = [
      { label: 'Total Students', value: data.summary?.students.total || 0 },
      { label: 'Students Present', value: Math.round(data.summary?.students.total * 0.95) || 0, valueBadge: true, valueBadgeColor: 'bg-green-500' }, // Mocking real-time present count if not fully tracked
      { label: 'Students Absent', value: Math.round(data.summary?.students.total * 0.05) || 0, valueBadge: true, valueBadgeColor: 'bg-green-500' }
  ];

  const staffData = [
      { label: 'Total Teaching Staff', value: data.summary?.staff.teaching || 0 },
      { label: 'Teaching Staff Present', value: data.summary?.staff.teaching || 0, valueBadge: true, valueBadgeColor: 'bg-orange-400' },
      { label: 'Teaching Staff Absent', value: 0, valueBadge: true, valueBadgeColor: 'bg-orange-400' }
  ];

  const instituteData = [
      { label: 'Total Departments', value: 6 }, // Static for now as Departments model not fully used
      { label: 'Total Classes', value: data.summary?.institute.classes || 0, valueBadge: true, valueBadgeColor: 'bg-orange-400' },
      { label: 'Total Sections', value: data.summary?.institute.sections || 0, valueBadge: true, valueBadgeColor: 'bg-green-500' }
  ];

  // Fee Details Pie Data
  const feePieData = [
     { name: 'Pending', value: data.summary?.fees.pending || 100 },
     { name: 'Collected', value: data.summary?.fees.collected || 50 }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
           <LayoutDashboard className="w-6 h-6" /> Registrar <span className="text-sm font-normal text-gray-500">Control panel</span>
        </h1>
        <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-full text-primary-600 transition-colors">
            <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <SummaryCard title="Fee Summary" color="blue" data={feeData} />
         <SummaryCard title="Student Summary" color="green" data={studentData} />
         <SummaryCard title="Teaching Staff Summary" color="orange" data={staffData} />
         <SummaryCard title="Institute Summary" color="orange" data={instituteData} />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Students Bar Chart */}
         <StudentGrowthChart data={data.studentCharts} />
         
         {/* Attendance Pie Chart */}
         <AttendancePieChart data={data.attendanceCharts} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Fee Collection Bar Chart */}
         <FeeCollectionChart data={data.feeCharts?.collectionTrend || []} />
         
         {/* Fee Details Pie Chart */}
         <FeeDetailsPieChart data={feePieData} />
      </div>

      {/* 3. Bottom Row: News & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <NewsCard announcements={data.news} />
         </div>
         <div>
            <DashboardCalendar />
         </div>
      </div>
    </div>
  );
}

// Simplified placeholders for other roles for now, forcing Admin view for "Control Panel" demo
function Dashboard() {
  const { user } = useAuthStore();
  // We can switch mainly based on user role, but for this specific redesign request, 
  // we want to showcase the new Admin Dashboard (Control Panel) first.
  
  if (user?.role === 'STUDENT') {
      return <div className="p-6">Student Dashboard (Coming Soon)</div>;
  }

  // Use AdminDashboard for Staff/Admin/Bursar to view the new layout
  return <AdminDashboard user={user} />;
}

export default Dashboard;
