import { useState, useEffect } from 'react';
import {
    BookOpen, Calendar as CalendarIcon, Award, Download,
    ChevronRight, ExternalLink, Clock, User, Bell, Search,
    Layout, Book, MessageSquare, Menu, X, Link as LinkIcon,
    FileText
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CourseOutlineView from './CourseOutlineView';

const StudentDashboardRedesigned = ({ user }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOutline, setSelectedOutline] = useState(null);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/dashboard/student');
            setData(res.data.data);
        } catch (error) {
            console.error('Error fetching student dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOutline = async (course) => {
        try {
            setLoading(true);
            setCurrentSubject(course.name);
            const res = await api.get(`/academic/outlines/${data.student.classId}/${course.id}`);
            setSelectedOutline(res.data.data);
            setIsOutlineOpen(true);
        } catch (error) {
            console.error('Error loading outline:', error);
            toast.error('Could not load course outline');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        try {
            const termRes = await api.get('/academic/terms');
            const termId = termRes.data.data[0]?.id;
            if (!termId) return toast.error('No active term');

            const res = await api.post('/reports/generate', { studentId: data.student.id, termId });
            const report = res.data.data;

            const win = window.open('', '_blank');
            // Simplified version of the Reports.jsx template
            win.document.write(`
        <html>
          <head><title>Report - ${data.student.firstName}</title>
          <style>body{font-family:sans-serif;padding:40px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f4f4f4}</style>
          </head>
          <body>
            <h1>Report Card: ${data.student.firstName} ${data.student.lastName}</h1>
            <p>Class: ${data.student.class.name} | Term: ${report.term.name}</p>
            <table>
              <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remarks</th></tr></thead>
              <tbody>
                ${report.subjects.map(s => `<tr><td>${s.subjectName}</td><td>${s.average}%</td><td>${s.grade}</td><td>${s.remark}</td></tr>`).join('')}
              </tbody>
            </table>
            <h3>Average: ${report.summary.averageScore}% | Rank: ${report.summary.rank || '-'} / ${report.summary.outOf}</h3>
            <script>window.onload = () => window.print()</script>
          </body>
        </html>
      `);
            win.document.close();
        } catch (e) { toast.error('Report generation failed'); }
    };

    const generateExamAudit = async () => {
        // Similar to generateReport but with more detail
        toast.success('Generating official audit...');
        generateReport(); // For now, reusing report card as "Audit"
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { student, timetable, scores, fees, attendance, courses } = data || {};

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Header Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-4xl">🎓</span>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Great Progress, {student?.firstName}!</h1>
                        <p className="text-gray-500 text-lg mb-6">Stay focused and keep achieving your goals. You're doing excellent!</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-blue-50 px-4 py-2 rounded-xl">
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Academic Year</p>
                                <p className="text-lg font-bold text-blue-900">2026</p>
                            </div>
                            <div className="bg-purple-50 px-4 py-2 rounded-xl">
                                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Class</p>
                                <p className="text-lg font-bold text-purple-900">{student?.class?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-600 rounded-3xl p-8 shadow-lg text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-1 opacity-90">Term 1 Fees</h3>
                        <p className="text-3xl font-bold">KES {fees?.balance.toLocaleString()}</p>
                        <p className="text-sm opacity-75 mt-2">Outstanding balance</p>
                    </div>
                    <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-semibold transition-all border border-white/20">
                        View Statement
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Calendar & Downloads */}
                <div className="lg:col-span-4 space-y-6">
                    {/* My Calendar Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Calendar</h2>
                            <button className="text-primary-600 text-sm font-semibold hover:underline">Today</button>
                        </div>
                        <div className="space-y-4">
                            {timetable?.length > 0 ? (
                                timetable
                                    .filter(slot => slot.dayOfWeek === new Date().getDay() || 1) // Default to Monday for demo
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map((slot, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs font-bold text-gray-400 w-12">{slot.startTime}</div>
                                                <div className="w-0.5 h-full bg-gray-100 mt-2 rounded-full relative">
                                                    <div className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full bg-primary-400 ring-4 ring-white"></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors border border-transparent group-hover:border-primary-100">
                                                    <p className="text-sm font-bold text-gray-900">{slot.subject.name}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <User className="w-3 h-3" />
                                                        <span>{slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName}` : 'TBA'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No classes scheduled for today.</p>
                            )}
                        </div>
                    </div>

                    {/* Downloads Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Documents</h2>
                        <div className="space-y-3">
                            <button
                                onClick={generateReport}
                                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-blue-900">Report Card</p>
                                        <p className="text-[10px] text-blue-600 font-medium">Term 1 2026</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                            </button>

                            <button
                                onClick={generateExamAudit}
                                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-purple-900">Exam Audit</p>
                                        <p className="text-[10px] text-purple-600 font-medium">Official Transcripts</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Social</h2>
                        <div className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Science Fair</p>
                                <p className="text-[10px] text-gray-500 mt-1">Don't forget to submit your projects by Friday!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Courses & Performance */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all"><Layout className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses?.map((course, i) => (
                                <div key={i} className="p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{course.code}</h4>
                                            <p className="text-xs text-gray-500 truncate w-40">{course.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewOutline(course)}
                                            className="flex-1 py-2 rounded-lg bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-3 h-3" /> Outline
                                        </button>
                                        <button className="flex-1 py-2 rounded-lg bg-primary-600 text-xs font-bold text-white hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                                            <ExternalLink className="w-3 h-3" /> Portal
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exam Audit Chart */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Audit</h2>
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={scores || []}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>


            <CourseOutlineView
                isOpen={isOutlineOpen}
                onClose={() => setIsOutlineOpen(false)}
                outline={selectedOutline}
                subjectName={currentSubject}
            />
        </div>
    );
};

export default StudentDashboardRedesigned;
