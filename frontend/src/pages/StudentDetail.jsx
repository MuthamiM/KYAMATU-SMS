import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Award, FileText, Wallet } from 'lucide-react';

function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudent();
  }, [id]);

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
        <div className="animate-pulse text-gray-500">Loading...</div>
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
        <div className="card p-6">
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
                ? 'badge-success'
                : 'badge-warning'
            }`}>
              {student.admissionStatus}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{student.user?.email}</span>
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
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="flex gap-4 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
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

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Current Class</p>
                        <p className="font-semibold text-gray-900">
                          {student.class
                            ? `${student.class.grade?.name} ${student.class.stream?.name}`
                            : 'Not Assigned'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Academic Year</p>
                        <p className="font-semibold text-gray-900">
                          {student.class?.academicYear?.name || '2026'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Admission Date</p>
                        <p className="font-semibold text-gray-900">
                          {student.admissionDate
                            ? new Date(student.admissionDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Birth Certificate</p>
                        <p className="font-semibold text-gray-900">
                          {student.birthCertNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {student.guardians?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">
                        Guardians
                      </h3>
                      <div className="space-y-3">
                        {student.guardians.map((g) => (
                          <div
                            key={g.guardianId}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {g.guardian?.firstName} {g.guardian?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {g.guardian?.relationship}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
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

              {activeTab === 'academics' && (
                <div className="text-center py-8 text-gray-500">
                  Academic records will be displayed here
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="text-center py-8 text-gray-500">
                  Attendance records will be displayed here
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="text-center py-8 text-gray-500">
                  Fee records will be displayed here
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
