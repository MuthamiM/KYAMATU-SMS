import { useState, useEffect } from 'react';
import {
    BookOpen, Calendar as CalendarIcon, Award, Download,
    ChevronRight, ExternalLink, Clock, User, Bell, Search,
    Layout, Book, MessageSquare, Menu, X, Link as LinkIcon,
    FileText, Plus, School, ChevronLeft, Wallet
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CourseOutlineView from './CourseOutlineView';
import CourseResourcesView from './CourseResourcesView';

const CircularProgress = ({ value, max, label, sublabel, color = '#99CBB9' }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{value}</span>
                </div>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{label}</p>
                <p className="text-[10px] text-gray-400 leading-none">{sublabel}</p>
            </div>
        </div>
    );
};

const StudentDashboardRedesigned = ({ user }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOutline, setSelectedOutline] = useState(null);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [expandedLesson, setExpandedLesson] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(0);
    const [currentSubjectId, setCurrentSubjectId] = useState('');


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/dashboard/student');
            setData(res.data.data);
        } catch (error) {
            console.error('Error fetching student dashboard:', error);
            // toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOutline = async (course) => {
        try {
            setLoading(true);
            setCurrentSubject(course.name);
            setSelectedTeacher(course.teacher);
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

    const handleViewResources = (course) => {
        setCurrentSubject(course.name);
        setSelectedTeacher(course.teacher);
        setCurrentSubjectId(course.id);
        setIsResourcesOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#99CBB9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { student, timetable, scores, courses, attendance, fees, announcements } = data || {};
    const gpa = (scores?.reduce((acc, s) => acc + s.score, 0) / (scores?.length || 1) / 10).toFixed(1);

    // Attendance Rate Calculation
    const { present = 0, absent = 0, late = 0, excused = 0 } = attendance || {};
    const totalAttendance = present + absent + late + excused;
    const attendanceRate = totalAttendance > 0 ? Math.round(((present + late) / totalAttendance) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header GPA Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Great GPA! keep it up!, {(student?.firstName || student?.name)?.replace(/Student$|Teacher$|Bursar$|Admin$|Staff$|SuperAdmin$/i, '').trim()}</h3>
                                    {data?.classTeacher && (
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            Class Teacher: {data.classTeacher.firstName} {data.classTeacher.lastName}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Class</p>
                                    <p className="text-xs font-bold text-gray-900">{student?.class?.name}</p>
                                </div>
                            </div>
                            <div className="flex justify-around items-end">
                                <CircularProgress value={gpa} max={10} label="Total GPA" sublabel={`${gpa}/10`} color="#475569" />
                                <CircularProgress value={attendanceRate} max={100} label="Attendance Rate" sublabel={`${attendanceRate}%`} color="#475569" />
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-gray-800">My Bookmarks</h3>
                                <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                                    <X className="w-4 h-4 rotate-45" />
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <a href="/timetable" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#99CBB9]/10 transition-all">
                                        <CalendarIcon className="w-6 h-6 text-indigo-900" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Timetable</span>
                                </a>
                                <a href="/reports" className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#99CBB9]/10 transition-all">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Reports</span>
                                </a>
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#99CBB9]/10 transition-all">
                                        <Wallet className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Bal: {fees?.balance?.toLocaleString()}</span>
                                </div>
                                <button className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-100 text-gray-300 hover:border-gray-300 hover:text-gray-500 transition-all">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* My Calendar & My Courses Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* My Calendar Card */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">My Calendar</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        <Menu className="w-4 h-4 rotate-90" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-teal-600 tracking-wider">TODAY</span>
                                        <div className="flex gap-4">
                                            <ChevronRight className="w-4 h-4 rotate-180 text-gray-300 cursor-pointer hover:text-gray-600" />
                                            <ChevronRight className="w-4 h-4 text-gray-300 cursor-pointer hover:text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {timetable?.length > 0 ? (
                                    timetable.map((slot, idx) => {
                                        const isExpanded = expandedLesson === idx;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setExpandedLesson(isExpanded ? null : idx)}
                                                className="flex flex-col p-4 bg-[#f8fafc] rounded-2xl border-l-4 border-[#99CBB9] group cursor-pointer hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start gap-4 w-full">
                                                    <div className="w-12 pt-1">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">{slot.startTime}</p>
                                                        <p className="text-[8px] text-gray-300 uppercase mt-0.5">{slot.endTime}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-900">{slot.subject.name}</p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName}` : 'TBA'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-teal-600 self-center transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                </div>
                                                {isExpanded && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top duration-300">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-[8px] font-bold text-gray-400 uppercase">Room</p>
                                                                <p className="text-[10px] font-bold text-gray-700">{slot.room || 'Room TBA'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] font-bold text-gray-400 uppercase">Subject Code</p>
                                                                <p className="text-[10px] font-bold text-gray-700">{slot.subject.code}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-2xl">
                                        <CalendarIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-400 uppercase">No more classes today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* My Courses Card */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-8">My Courses</h3>
                            <div className="space-y-4">
                                {courses?.map((course, i) => {
                                    const isExpanded = expandedCourse === i;
                                    return (
                                        <div key={i} className="border border-gray-50 rounded-2xl overflow-hidden group">
                                            <div
                                                onClick={() => setExpandedCourse(isExpanded ? null : i)}
                                                className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 tracking-tight">{course.code} | {course.name}</span>
                                                    {course.teacher && (
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                                            Teacher: {course.teacher.firstName} {course.teacher.lastName}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                            {isExpanded && (
                                                <div className="p-4 bg-[#f8fafc] border-t border-gray-50 flex gap-3 animate-in slide-in-from-top duration-300">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewOutline(course); }}
                                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> Syllabus
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewResources(course); }}
                                                        className="flex-1 bg-[#476C63] hover:bg-[#39564f] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" /> Resources
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Social (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 min-h-[600px]">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-8">My Social</h3>
                        <div className="space-y-8">
                            {announcements?.length > 0 ? (
                                announcements.map((ann, idx) => (
                                    <div key={ann.id} className="space-y-4 animate-in slide-in-from-right duration-500 delay-150 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#476C63] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-teal-100">KY</div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-gray-800">Kyamatu Institute</p>
                                                </div>
                                            </div>
                                            <button className="text-[#1DA1F2] hover:scale-110 transition-transform"><MessageSquare className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-gray-900">{ann.title}</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                                {ann.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-gray-50 rounded-3xl">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No New Announcements</p>
                                </div>
                            )}
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
            <CourseResourcesView
                isOpen={isResourcesOpen}
                onClose={() => setIsResourcesOpen(false)}
                subjectName={currentSubject}
                teacher={selectedTeacher}
                classId={data?.student?.classId}
                subjectId={currentSubjectId}
            />
        </div>
    );
};

export default StudentDashboardRedesigned;
