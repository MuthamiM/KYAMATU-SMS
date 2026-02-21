import { useState, useEffect } from 'react';
import {
    BookOpen, Calendar as CalendarIcon, Award, Download,
    ChevronRight, ExternalLink, Clock, User, Bell, Search,
    Layout, Book, MessageSquare, Menu, X, Link as LinkIcon,
    FileText, Plus, School, ChevronLeft, Wallet, Receipt, Shield
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
    const [outlineLoading, setOutlineLoading] = useState(false);
    const [selectedOutline, setSelectedOutline] = useState(null);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [expandedLesson, setExpandedLesson] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(0);
    const [currentSubjectId, setCurrentSubjectId] = useState('');
    const [dayOffset, setDayOffset] = useState(0);
    const [weekTimetable, setWeekTimetable] = useState(null);

    // M-Pesa State
    const [showMpesaModal, setShowMpesaModal] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
    const [mpesaAmount, setMpesaAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isPromptSent, setIsPromptSent] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/dashboard/student');
            setData(res.data.data);
        } catch (error) {
            console.error('Error fetching student dashboard:', error);
            toast.error('Using offline preview (Database unreachable)');

            // Mock data fallback for preview
            setData({
                student: { firstName: 'Student', class: { name: 'Grade 4 East' } },
                timetable: [
                    { startTime: '08:00', endTime: '09:00', subject: { name: 'Mathematics', code: 'MAT101' }, teacher: { firstName: 'Teacher', lastName: 'Name' } },
                    { startTime: '09:00', endTime: '10:00', subject: { name: 'English', code: 'ENG101' }, teacher: { firstName: 'Teacher', lastName: 'Name' } }
                ],
                scores: [{ subject: 'Math', assessmentName: 'CAT 1', score: 85, grade: 'A' }],
                courses: [
                    { name: 'Mathematics', code: 'MAT101', hasOutline: true, teacher: { firstName: 'Teacher', lastName: 'Name' } },
                    { name: 'English', code: 'ENG101', hasOutline: true, teacher: { firstName: 'Teacher', lastName: 'Name' } }
                ],
                attendance: { present: 18, absent: 2, late: 1, excused: 0 },
                fees: { balance: 5000 },
                announcements: [
                    { id: '1', title: 'System Maintenance', content: 'Our database connection is currently undergoing maintenance.', publishedAt: new Date().toISOString() }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewOutline = async (course) => {
        const classId = data?.student?.classId;
        if (!classId) {
            toast.error('Could not determine your class. Please refresh the page.');
            return;
        }
        try {
            setOutlineLoading(true);
            setCurrentSubject(course.name);
            setSelectedTeacher(course.teacher);
            const res = await api.get(`/academic/outlines/${classId}/${course.id}`);
            setSelectedOutline(res.data.data);
            setIsOutlineOpen(true);
        } catch (error) {
            console.error('Error loading outline:', error);
            toast.error('Could not load course outline');
        } finally {
            setOutlineLoading(false);
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

    const { student, timetable: todayTimetable, scores, courses, attendance, fees, announcements } = data || {};
    const gpa = (scores?.reduce((acc, s) => acc + s.score, 0) / (scores?.length || 1) / 10).toFixed(1);

    // Day navigation helpers
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const viewDate = new Date();
    viewDate.setDate(viewDate.getDate() + dayOffset);
    const viewDayOfWeek = viewDate.getDay() === 0 ? 7 : viewDate.getDay();
    const viewDayLabel = dayOffset === 0 ? 'TODAY' : dayOffset === 1 ? 'TOMORROW' : dayOffset === -1 ? 'YESTERDAY' : dayNames[viewDate.getDay()]?.toUpperCase();
    const viewDateStr = viewDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Get timetable for the viewed day
    const timetable = dayOffset === 0 ? todayTimetable : (weekTimetable?.filter(s => s.dayOfWeek === viewDayOfWeek) || []);

    const handleDayNav = async (direction) => {
        const newOffset = dayOffset + direction;
        setDayOffset(newOffset);
        setExpandedLesson(null);
        // Fetch full week timetable once if navigating away from today
        if (newOffset !== 0 && !weekTimetable && student?.classId) {
            try {
                const res = await api.get(`/academic/timetable/${student.classId}`);
                setWeekTimetable(res.data.data || []);
            } catch (e) {
                console.error('Could not fetch week timetable');
            }
        }
    };

    // Attendance Rate Calculation
    const { present = 0, absent = 0, late = 0, excused = 0 } = attendance || {};
    const totalAttendance = present + absent + late + excused;
    const attendanceRate = totalAttendance > 0 ? Math.round(((present + late) / totalAttendance) * 100) : 0;

    const handleGenerateReportCard = async () => {
        const studentId = data?.student?.id;
        if (!studentId) { toast.error('Student profile not loaded'); return; }
        try {
            const termsRes = await api.get('/academic/terms');
            const termId = termsRes.data.data[0]?.id;
            if (!termId) { toast.error('No active term found'); return; }
            const response = await api.post('/reports/generate', { studentId, termId });
            const report = response.data.data;
            const win = window.open('', '_blank');
            win.document.write(`<html><head><title>Report Card - ${report.student.name}</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #ddd;text-align:left}th{background:#f8f9fa}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #000;padding-bottom:20px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:20px;background:#f8f9fa;border-radius:8px;margin:20px 0}@media print{body{padding:0}}</style></head><body><div class="header"><h2>KYAMATU PRIMARY SCHOOL</h2><p>STUDENT REPORT CARD</p><p>${report.term.name} - ${report.term.academicYear}</p></div><p><strong>Name:</strong> ${report.student.name} &nbsp;&nbsp; <strong>Adm No:</strong> ${report.student.admissionNumber} &nbsp;&nbsp; <strong>Class:</strong> ${report.student.class}</p><table><thead><tr><th>Subject</th><th>Average</th><th>Grade</th><th>Remark</th></tr></thead><tbody>${report.subjects.map(s => `<tr><td>${s.subjectName}</td><td>${s.average}%</td><td><strong>${s.grade}</strong></td><td>${s.remark}</td></tr>`).join('')}</tbody></table><div class="summary"><div><div>Total Score</div><strong>${report.summary.totalScore}</strong></div><div><div>Average</div><strong>${report.summary.averageScore}%</strong></div><div><div>Grade</div><strong>${report.summary.overallGrade}</strong></div><div><div>Rank</div><strong>${report.summary.rank || '-'}/${report.summary.outOf}</strong></div></div><br/><div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px"><div style="border-top:1px solid #000;padding-top:10px;text-align:center">Class Teacher</div><div style="border-top:1px solid #000;padding-top:10px;text-align:center">Principal</div></div><script>window.onload=function(){window.print()}<\/script></body></html>`);
            win.document.close();
            toast.success('Report card ready — save as PDF from print dialog');
        } catch (e) { toast.error('Failed to generate report card'); }
    };

    const handleGenerateFeeStatement = async () => {
        const studentId = data?.student?.id;
        const student = data?.student;
        if (!studentId) { toast.error('Student profile not loaded'); return; }
        try {
            const invoicesRes = await api.get(`/fees/student/${studentId}/invoices`);
            const invoices = invoicesRes.data.data || [];
            const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
            const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
            const balance = totalBilled - totalPaid;
            const date = new Date().toLocaleDateString('en-GB');
            const win = window.open('', '_blank');
            win.document.write(`<html><head><title>Fee Statement</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #ddd;text-align:left}th{background:#f8f9fa}.header{text-align:center;margin-bottom:30px}.summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px;text-align:center}.box{padding:15px;border-radius:8px}@media print{body{padding:0}}</style></head><body><div class="header"><h2>KYAMATU PRIMARY SCHOOL</h2><h3>FEE STATEMENT</h3></div><p><strong>Name:</strong> ${student?.firstName} ${student?.lastName} &nbsp;&nbsp; <strong>Adm:</strong> ${student?.admissionNumber} &nbsp;&nbsp; <strong>Date:</strong> ${date}</p><table><thead><tr><th>Invoice No</th><th>Term</th><th>Amount</th><th>Paid</th><th>Balance</th></tr></thead><tbody>${invoices.length > 0 ? invoices.map(i => `<tr><td>${i.invoiceNo}</td><td>${i.term?.name || 'N/A'}</td><td>KES ${i.totalAmount.toLocaleString()}</td><td>KES ${i.paidAmount.toLocaleString()}</td><td style="color:${i.balance > 0 ? '#dc2626' : '#16a34a'};font-weight:bold">KES ${i.balance.toLocaleString()}</td></tr>`).join('') : '<tr><td colspan=5>No invoices found</td></tr>'}</tbody></table><div class="summary"><div class="box" style="background:#dbeafe"><div>Total Billed</div><strong>KES ${totalBilled.toLocaleString()}</strong></div><div class="box" style="background:#dcfce7"><div>Total Paid</div><strong>KES ${totalPaid.toLocaleString()}</strong></div><div class="box" style="background:${balance > 0 ? '#fee2e2' : '#dcfce7'}"><div>Balance</div><strong>KES ${balance.toLocaleString()}</strong></div></div><script>window.onload=function(){window.print()}<\/script></body></html>`);
            win.document.close();
            toast.success('Fee statement ready — save as PDF from print dialog');
        } catch (e) { toast.error('Failed to generate fee statement'); }
    };

    const handleGenerateAttendanceCert = () => {
        const student = data?.student;
        if (!student) { toast.error('Student profile not loaded'); return; }
        const date = new Date().toLocaleDateString('en-GB');
        const attendanceRate = data?.attendance ? Math.round((data.attendance.present / (data.attendance.present + data.attendance.absent + data.attendance.late + 1)) * 100) : 94;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Attendance Certificate</title><style>body{font-family:Georgia,serif;padding:60px;max-width:700px;margin:0 auto}.cert{border:8px double #b45309;padding:40px;text-align:center}.title{font-size:28px;font-weight:bold;letter-spacing:3px;margin:20px 0}.name{font-size:32px;font-weight:bold;color:#b45309;border-bottom:2px solid #b45309;display:inline-block;padding:0 20px}.rate{font-size:52px;font-weight:bold;color:#16a34a;margin:20px 0}.sigs{display:flex;justify-content:space-around;margin-top:60px}.sig{border-top:1px solid #000;width:180px;padding-top:10px;font-size:13px}@media print{body{padding:20px}}</style></head><body><div class="cert"><h2>KYAMATU PRIMARY SCHOOL</h2><div class="title">CERTIFICATE OF ATTENDANCE</div><p>This is to certify that</p><div class="name">${student.firstName} ${student.lastName}</div><p>Adm: <strong>${student.admissionNumber}</strong> | Class: <strong>${student.class?.name || 'N/A'}</strong></p><p>Has achieved an attendance rate of</p><div class="rate">${attendanceRate}%</div><p>for Academic Year 2026</p><div class="sigs"><div class="sig">Class Teacher</div><div class="sig">Headteacher</div></div><p style="margin-top:30px;font-size:11px;color:#666">Issued: ${date} | Cert No: ATT-${Date.now().toString().slice(-6)}</p></div><script>window.onload=function(){window.print()}<\/script></body></html>`);
        win.document.close();
        toast.success('Certificate ready — save as PDF from print dialog');
    };

    const handleSTKPush = async (e) => {
        e.preventDefault();

        // Find the active invoice for the student (for simplicity here we use the latest invoice if any, or generate one in the BE if we passed an exact ID. Our API expects invoiceId, but for the dashboard quick-pay we might just grab their first unpaid invoice).
        let targetInvoiceId = null;
        try {
            if (data?.student?.id) {
                const invRes = await api.get(`/fees/student/${data?.student?.id}/invoices`);
                const unpaidInvoices = (invRes.data.data || []).filter(inv => inv.balance > 0);
                if (unpaidInvoices.length > 0) {
                    targetInvoiceId = unpaidInvoices[0].id;
                }
            } else {
                // If offline preview, just provide a mock
                targetInvoiceId = 'mock-inv-123';
            }
        } catch (err) {
            console.error('Could not fetch invoices for STK push, using generic fallback');
            targetInvoiceId = 'fallback-inv-123';
        }

        if (!targetInvoiceId) {
            toast.error('No pending invoice found to pay against.');
            return;
        }

        if (!mpesaPhone || !mpesaAmount || isNaN(mpesaAmount) || Number(mpesaAmount) <= 0) {
            toast.error('Please enter a valid phone number and amount');
            return;
        }

        setIsProcessingPayment(true);

        try {
            await api.post('/fees/mpesa/stkpush', {
                phoneNumber: mpesaPhone,
                amount: Number(mpesaAmount),
                invoiceId: targetInvoiceId
            });
            setIsPromptSent(true);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to initiate STK push');
        } finally {
            setIsProcessingPayment(false);
        }
    };

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
                                <div onClick={() => { if (fees?.balance > 0) { setMpesaAmount(fees.balance); setShowMpesaModal(true); } else { toast.success('Your balance is fully cleared!') } }} className="flex flex-col items-center gap-2 group cursor-pointer relative">
                                    <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#16a34a]/10 transition-all group-hover:border-[#16a34a]/30 group-hover:shadow-md">
                                        <Wallet className="w-6 h-6 text-green-600 transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-green-700 transition-colors">Pay Fees</span>
                                    {fees?.balance > 0 && <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">{fees.balance.toLocaleString()}</span>}
                                </div>
                                <button className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-gray-100 text-gray-300 hover:border-gray-300 hover:text-gray-500 transition-all">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* My Documents */}
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">My Documents</h3>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Click to generate & save as PDF</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={handleGenerateReportCard}
                                className="flex flex-col items-center gap-2 p-3 bg-[#f8fafc] rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                            >
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                    <Award className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Report Card</span>
                            </button>
                            <button
                                onClick={handleGenerateFeeStatement}
                                className="flex flex-col items-center gap-2 p-3 bg-[#f8fafc] rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                    <Receipt className="w-5 h-5 text-green-600 group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Fee Statement</span>
                            </button>
                            <button
                                onClick={handleGenerateAttendanceCert}
                                className="flex flex-col items-center gap-2 p-3 bg-[#f8fafc] rounded-2xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-all group"
                            >
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                                    <Shield className="w-5 h-5 text-amber-600 group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">Attendance Cert</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* My Calendar Card */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">My Calendar</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                        {viewDateStr}
                                        <Menu className="w-4 h-4 rotate-90" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-bold tracking-wider ${dayOffset === 0 ? 'text-teal-600' : 'text-gray-500 cursor-pointer hover:text-teal-600'}`} onClick={() => { setDayOffset(0); setExpandedLesson(null); }}>{viewDayLabel}</span>
                                        <div className="flex gap-4">
                                            <ChevronRight className="w-4 h-4 rotate-180 text-gray-300 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleDayNav(-1)} />
                                            <ChevronRight className="w-4 h-4 text-gray-300 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleDayNav(1)} />
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
                                        <p className="text-xs font-bold text-gray-400 uppercase">{dayOffset === 0 ? 'No more classes today' : `No classes on ${viewDayLabel?.toLowerCase()}`}</p>
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
                                                        disabled={outlineLoading}
                                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> {outlineLoading ? 'Loading...' : 'Syllabus'}
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

            {showMpesaModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        {isPromptSent ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Prompt Sent!</h3>
                                <p className="text-sm text-gray-600">
                                    Please check your phone (<strong>{mpesaPhone}</strong>) to input your M-Pesa PIN and complete the payment.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowMpesaModal(false);
                                        setIsPromptSent(false);
                                        setMpesaAmount('');
                                    }}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-colors mt-6"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            M
                                        </span>
                                        Pay via M-Pesa
                                    </h3>
                                    <button onClick={() => setShowMpesaModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSTKPush} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">M-Pesa Phone Number</label>
                                        <input
                                            type="tel"
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="e.g. 0712345678"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount to Pay (KES)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KSh</span>
                                            <input
                                                type="number"
                                                value={mpesaAmount}
                                                onChange={(e) => setMpesaAmount(e.target.value)}
                                                max={fees?.balance || 0}
                                                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono font-bold text-gray-900"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">Outstanding Balance: KES {fees?.balance?.toLocaleString()}</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessingPayment}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm tracking-wide transition-colors mt-4 flex justify-center items-center gap-2"
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending Prompt...
                                            </>
                                        ) : (
                                            'Send M-Pesa Prompt'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboardRedesigned;
