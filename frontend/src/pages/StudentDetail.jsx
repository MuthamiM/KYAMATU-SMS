import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Award, FileText, Wallet, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [academics, setAcademics] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  useEffect(() => {
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === 'academics' && !academics) {
          const res = await api.get(`/assessments/student/${id}/term-performance`);
          setAcademics(res.data.data);
        } else if (activeTab === 'attendance' && !attendance) {
          const res = await api.get(`/attendance/student/${id}`);
          setAttendance(res.data.data.attendances);
        } else if (activeTab === 'fees' && !fees) {
          const res = await api.get(`/fees/student/${id}/invoices`);
          setFees(res.data.data.invoices);
        }
      } catch (error) {
        toast.error(`Failed to fetch ${activeTab} data`);
      } finally {
        setTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab, id]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Link to="/students" className="text-primary-600 hover:underline">
          Back to Students
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/students"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-500">{student.admissionNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 h-fit bg-white">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {student.firstName?.charAt(0)}
                {student.lastName?.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-gray-500">
              {student.class
                ? `${student.class.grade?.name} ${student.class.stream?.name}`
                : 'Not Assigned'}
            </p>
            <span className={`badge mt-2 ${
              student.admissionStatus === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.admissionStatus}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{student.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{student.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{student.gender || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white min-h-[400px]">
            <div className="border-b border-gray-200">
              <nav className="flex gap-4 px-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 relative">
              {tabLoading && (
                 <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-b-xl border border-transparent">
                   <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                 </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-primary-600" /> Academic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Current Class</p>
                        <p className="font-bold text-gray-900">
                          {student.class
                            ? `${student.class.grade?.name} ${student.class.stream?.name}`
                            : 'Not Assigned'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                        <p className="font-bold text-gray-900">
                          {student.class?.academicYear?.name || '2026'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Admission Date</p>
                        <p className="font-bold text-gray-900">
                          {student.admissionDate
                            ? new Date(student.admissionDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Birth Certificate</p>
                        <p className="font-bold text-gray-900">
                          {student.birthCertNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {student.guardians?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Guardians</h3>
                      <div className="space-y-3">
                        {student.guardians.map((g) => (
                          <div
                            key={g.guardianId}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">
                                {g.guardian?.firstName} {g.guardian?.lastName}
                              </p>
                              <p className="text-sm text-gray-500 font-medium">
                                {g.guardian?.relationship}
                              </p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-sm text-gray-700 font-medium">
                                {g.guardian?.user?.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                {g.guardian?.user?.phone}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'academics' && academics && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     <Award className="w-5 h-5 text-primary-600" /> Term Performance
                  </h3>
                  {academics.terms?.length > 0 ? (
                    academics.terms.map((term) => (
                      <div key={term.termId} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6">
                        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                           <h4 className="font-bold text-gray-800">{term.termName}</h4>
                           <div className="flex gap-4 text-sm font-medium">
                              <span className="text-gray-600">Average: <span className="text-gray-900">{term.termAverage}%</span></span>
                              <span className="text-gray-600">Grade: <span className="text-primary-700">{term.termGrade}</span></span>
                           </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                              <tr>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3 text-center">Score</th>
                                <th className="px-6 py-3 text-center">Grade</th>
                                <th className="px-6 py-3">Remark</th>
                              </tr>
                            </thead>
                            <tbody>
                              {term.subjects.map(subj => (
                                <tr key={subj.subjectId} className="border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium text-gray-800">{subj.subjectName}</td>
                                  <td className="px-6 py-4 text-center font-bold text-primary-600">{subj.average}%</td>
                                  <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-gray-100 rounded-md font-bold text-gray-700">{subj.grade}</span></td>
                                  <td className="px-6 py-4 text-gray-500">{subj.remark}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No academic records found for this student.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attendance' && attendance && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                     <Clock className="w-5 h-5 text-primary-600" /> Recent Attendance Log
                  </h3>
                  {attendance.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 bg-white">
                              <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                              <td className="px-6 py-4">
                                {record.status === 'PRESENT' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-xs"><CheckCircle className="w-3.5 h-3.5"/> Present</span>}
                                {record.status === 'ABSENT' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs"><XCircle className="w-3.5 h-3.5"/> Absent</span>}
                                {record.status === 'LATE' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-xs"><Clock className="w-3.5 h-3.5"/> Late</span>}
                                {record.status === 'EXCUSED' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs"><FileText className="w-3.5 h-3.5"/> Excused</span>}
                              </td>
                              <td className="px-6 py-4 text-gray-500">{record.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No attendance records found.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fees' && fees && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                     <Wallet className="w-5 h-5 text-primary-600" /> Fee Invoices
                  </h3>
                  {fees.length > 0 ? (
                    <div className="grid gap-4">
                      {fees.map((invoice) => (
                        <div key={invoice.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-gray-900">{invoice.invoiceNo}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>{invoice.status}</span>
                              </div>
                              <p className="text-sm text-gray-500">Issued: {new Date(invoice.createdAt).toLocaleDateString()} | Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                           </div>
                           <div className="flex items-center gap-6 justify-between md:justify-end">
                              <div className="text-center md:text-right">
                                 <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total</p>
                                 <p className="font-bold text-gray-900">KES {invoice.totalAmount}</p>
                              </div>
                              <div className="text-center md:text-right">
                                 <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Paid</p>
                                 <p className="font-bold text-green-600">KES {invoice.paidAmount}</p>
                              </div>
                              <div className="text-center md:text-right">
                                 <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Balance</p>
                                 <p className={`font-bold ${invoice.balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>KES {invoice.balance}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No fee invoices found for this student.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
