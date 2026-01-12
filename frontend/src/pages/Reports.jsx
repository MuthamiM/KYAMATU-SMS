import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Download, Award, TrendingUp } from 'lucide-react';

function Reports() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/academic/classes');
      setClasses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchRankings = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const termsRes = await api.get('/academic/terms');
      const termId = termsRes.data.data[0]?.id;

      if (termId) {
        const response = await api.get(`/reports/class/${selectedClass}/rankings`, {
          params: { termId },
        });
        setRankings(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch rankings');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: 'text-success-600 bg-success-50',
      B: 'text-primary-600 bg-primary-50',
      C: 'text-warning-600 bg-warning-50',
      D: 'text-orange-600 bg-orange-50',
      E: 'text-danger-600 bg-danger-50',
    };
    return colors[grade] || 'text-gray-600 bg-gray-50';
  };

  const handleGenerateReport = async (studentId) => {
    try {
      const termsRes = await api.get('/academic/terms');
      const termId = termsRes.data.data[0]?.id;

      if (!termId) {
        toast.error('No active term found');
        return;
      }

      const response = await api.post('/reports/generate', { studentId, termId });
      const report = response.data.data;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Report Card - ${report.student.name}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .school-info { font-size: 14px; color: #666; }
              .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .info-group { margin-bottom: 10px; }
              .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
              .value { font-weight: 500; font-size: 16px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px; background: #f8f9fa; border-bottom: 2px solid #dee2e6; font-size: 12px; text-transform: uppercase; }
              td { padding: 12px; border-bottom: 1px solid #dee2e6; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
              .summary-item { text-align: center; }
              .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
              .summary-value { font-size: 24px; font-weight: bold; }
              .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
              .signature-line { border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">KYAMATU SCHOOL MANAGEMENT SYSTEM</div>
              <div class="school-info">P.O. Box 123, Machakos | Tel: +254 700 000 000 | Email: info@kyamatu.ac.ke</div>
              <div class="school-info" style="margin-top: 10px; font-weight: bold; font-size: 16px;">STUDENT REPORT CARD</div>
            </div>

            <div class="student-info">
              <div>
                <div class="info-group">
                  <div class="label">Student Name</div>
                  <div class="value">${report.student.name}</div>
                </div>
                <div class="info-group">
                  <div class="label">Admission Number</div>
                  <div class="value">${report.student.admissionNumber}</div>
                </div>
              </div>
              <div>
                <div class="info-group">
                  <div class="label">Class</div>
                  <div class="value">${report.student.class}</div>
                </div>
                <div class="info-group">
                  <div class="label">Term / Year</div>
                  <div class="value">${report.term.name} - ${report.term.academicYear}</div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Mid Term</th>
                  <th>End Term</th>
                  <th>Average</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${report.subjects.map(s => `
                  <tr>
                    <td style="font-weight: 500;">${s.subjectName}</td>
                    <td>${s.assessments.find(a => a.name.includes('Mid'))?.percentage || '-'}%</td>
                    <td>${s.assessments.find(a => a.name.includes('End'))?.percentage || '-'}%</td>
                    <td style="font-weight: bold;">${s.average}%</td>
                    <td><span style="font-weight: bold;">${s.grade}</span></td>
                    <td>${s.remark}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-item">
                <div class="summary-label">Total Score</div>
                <div class="summary-value">${report.summary.totalScore}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Average Score</div>
                <div class="summary-value">${report.summary.averageScore}%</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Overall Grade</div>
                <div class="summary-value">${report.summary.overallGrade}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Rank</div>
                <div class="summary-value">${report.summary.rank || '-'} / ${report.summary.outOf}</div>
              </div>
            </div>

            <div class="footer">
              <div class="signature-line">
                Class Teacher's Signature
              </div>
              <div class="signature-line">
                Principal's Signature & Stamp
              </div>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate report cards and view class rankings</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Generate Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-500">Reports Generated</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">68.5%</p>
            <p className="text-sm text-gray-500">School Mean</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">95.2%</p>
            <p className="text-sm text-gray-500">Top Score</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">89</p>
            <p className="text-sm text-gray-500">Downloads</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="label">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchRankings}
            disabled={!selectedClass || loading}
            className="btn btn-primary"
          >
            View Rankings
          </button>
        </div>
      </div>

      {rankings && (
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Class Rankings</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Class Mean: <strong className="text-gray-900">{rankings.classMean}%</strong>
                </span>
                <span className="text-sm text-gray-500">
                  Students: <strong className="text-gray-900">{rankings.totalStudents}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Admission No</th>
                  <th>Average</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.rankings?.map((item) => (
                  <tr key={item.student?.id} className="hover:bg-gray-50">
                    <td>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        item.rank <= 3 ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="font-medium">
                      {item.student?.firstName} {item.student?.lastName}
                    </td>
                    <td className="font-mono text-sm">
                      {item.student?.admissionNumber}
                    </td>
                    <td className="font-semibold">{item.average}%</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full font-bold ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleGenerateReport(item.student?.id)}
                        className="text-primary-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Report Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rankings?.subjectMeans && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Subject Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankings.subjectMeans.map((subject) => (
              <div key={subject.subjectId} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{subject.subjectName}</h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Mean</span>
                  <span className="font-semibold">{subject.mean}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Highest</span>
                  <span className="text-success-600">{subject.highest}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lowest</span>
                  <span className="text-danger-600">{subject.lowest}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
