import { useState, useEffect } from 'react';
import {
    BookOpen, Calendar as CalendarIcon, Award, Download,
    ChevronRight, ExternalLink, Clock, User, Bell, Search,
    Layout, Book, MessageSquare, Menu, X, Link as LinkIcon,
    FileText, Plus, School, ChevronLeft
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CourseOutlineView from './CourseOutlineView';

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
            // toast.error('Failed to load dashboard data');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#99CBB9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { student, timetable, scores, courses } = data || {};
    const gpa = (scores?.reduce((acc, s) => acc + s.score, 0) / (scores?.length || 1) / 10).toFixed(1);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header GPA Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between">
                            <h3 className="text-sm font-bold text-gray-800 mb-6">Great GPA! keep it up!, {student?.firstName}</h3>
                            <div className="flex justify-around items-end">
                                <CircularProgress value={gpa} max={10} label="Total GPA" sublabel="6.3/7" color="#475569" />
                                <CircularProgress value={72} max={100} label="Completed credits" sublabel="credits" color="#475569" />
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
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#99CBB9]/10 transition-all">
                                        <School className="w-6 h-6 text-indigo-900" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">MyUni</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#99CBB9]/10 transition-all">
                                        <LinkIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Campus</span>
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
                            <div className="space-y-0 relative">
                                {[8, 9, 10, 11, 12].map(time => (
                                    <div key={time} className="relative h-16 border-t border-gray-50 flex items-start pt-2">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase w-12">{time}AM</span>
                                        {timetable?.find(s => parseInt(s.startTime) === time) && (
                                            <div className="absolute left-16 right-0 top-1 p-3 bg-[#f8fafc] rounded-xl border-l-4 border-[#99CBB9] group cursor-pointer hover:shadow-md transition-all">
                                                <p className="text-xs font-bold text-gray-900">{timetable.find(s => parseInt(s.startTime) === time).subject.name}</p>
                                                <p className="text-[10px] text-gray-500">Room 302 | {time}:00 - {time + 1}:00</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* My Courses Card */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-8">My Courses</h3>
                            <div className="space-y-4">
                                {courses?.map((course, i) => (
                                    <div key={i} className="border border-gray-50 rounded-2xl overflow-hidden group">
                                        <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                                            <span className="text-xs font-bold text-gray-700 tracking-tight">{course.code} | {course.name}</span>
                                            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${i === 0 ? 'rotate-90' : ''}`} />
                                        </div>
                                        {i === 0 && (
                                            <div className="p-4 bg-[#f8fafc] border-t border-gray-50 flex gap-3">
                                                <button
                                                    onClick={() => handleViewOutline(course)}
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Syllabus
                                                </button>
                                                <button className="flex-1 bg-[#476C63] hover:bg-[#39564f] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                                    <ExternalLink className="w-3.5 h-3.5" /> Canvas
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Social (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 min-h-[600px]">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-8">My Social</h3>
                        <div className="space-y-8">
                            {[1, 2].map(post => (
                                <div key={post} className="space-y-4 animate-in slide-in-from-right duration-500 delay-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-200">SU</div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold">about 1 week ago</p>
                                                <p className="text-[11px] font-bold text-gray-800">Squiz University</p>
                                            </div>
                                        </div>
                                        <button className="text-[#1DA1F2]"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></button>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {post === 1
                                            ? "Are you feeling ready for the upcoming exams? Our staff is here to help. Whether you need resources or just a pep talk, come see us!"
                                            : "What have been some of your favorite moments on campus this week? Share your thoughts to get a chance to win $500."}
                                    </p>
                                    <button className="text-[11px] font-bold text-gray-900 border-b border-gray-900 pb-0.5 hover:text-[#99CBB9] hover:border-[#99CBB9] transition-all">show more</button>
                                    {post === 1 && (
                                        <div className="rounded-2xl overflow-hidden shadow-md mt-4">
                                            <img src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800" alt="Campus" className="w-full h-40 object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))}
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
