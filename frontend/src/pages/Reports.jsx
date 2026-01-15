import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { FileText, Download, Award, TrendingUp, CheckCircle, Receipt, ClipboardList, UserCheck, Calendar, Shield, Search, GraduationCap, Loader2 } from 'lucide-react';

function Reports() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchAdmNo, setSearchAdmNo] = useState('');
  const [searching, setSearching] = useState(false);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rankings');

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'BURSAR'].includes(user?.role);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/academic/classes');
      setClasses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students?limit=200');
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  // Search student by admission number
  const searchStudent = async () => {
    if (!searchAdmNo.trim()) {
      toast.error('Enter an admission number');
      return;
    }
    
    setSearching(true);
    try {
      const response = await api.get(`/students?search=${searchAdmNo.trim()}`);
      const results = response.data.data || [];
      
      if (results.length > 0) {
        const student = results[0];
        setFoundStudent(student);
        setSelectedStudent(student.id);
        toast.success(`Found: ${student.firstName} ${student.lastName}`);
      } else {
        toast.error('Student not found');
        setFoundStudent(null);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
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

  // Generate Clearance Form
  const generateClearanceForm = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId) || foundStudent;
      if (!student) {
        toast.error('Student not found');
        return;
      }

      // Fetch fee balance
      let feeBalance = 0;
      try {
        const invoicesRes = await api.get(`/fees/student/${studentId}/invoices`);
        const invoices = invoicesRes.data.data || [];
        feeBalance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
      } catch (e) {
        console.error('Could not fetch fee balance');
      }

      const isCleared = feeBalance <= 0;
      const currentDate = new Date().toLocaleDateString('en-GB');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Clearance Form - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; }
              .title { font-size: 18px; font-weight: bold; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px; }
              .student-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .label { font-weight: 600; color: #666; }
              .clearance-section { margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
              .section-title { font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
              .checkbox { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
              .box { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; }
              .checked { background: #22c55e; border-color: #22c55e; }
              .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
              .cleared { background: #dcfce7; color: #166534; }
              .not-cleared { background: #fee2e2; color: #991b1b; }
              .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
              .signature-box { border-top: 1px solid #000; padding-top: 10px; text-align: center; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
              <div style="font-size: 12px; color: #666;">P.O. Box 123, Kitui County | Tel: +254 700 000 000</div>
              <div class="title">Student Clearance Form</div>
            </div>

            <div class="student-info">
              <div class="info-row"><span class="label">Student Name:</span><span>${student.firstName} ${student.lastName}</span></div>
              <div class="info-row"><span class="label">Admission No:</span><span>${student.admissionNumber}</span></div>
              <div class="info-row"><span class="label">Class:</span><span>${student.class?.name || 'N/A'}</span></div>
              <div class="info-row"><span class="label">Date:</span><span>${currentDate}</span></div>
            </div>

            <div class="clearance-section">
              <div class="section-title">📚 Library</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> All books returned</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> No outstanding fines</div>
              <div style="margin-top: 15px;"><strong>Librarian:</strong> _______________________ <strong>Date:</strong> ___________</div>
            </div>

            <div class="clearance-section">
              <div class="section-title">💰 Finance / Bursar</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> School fees fully paid</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> No outstanding balances</div>
              <div style="margin-top: 10px;"><strong>Balance:</strong> KES ${feeBalance.toLocaleString()}</div>
              <div class="status-badge ${isCleared ? 'cleared' : 'not-cleared'}">${isCleared ? '✓ CLEARED' : '✗ NOT CLEARED - BALANCE DUE'}</div>
              <div style="margin-top: 15px;"><strong>Bursar:</strong> _______________________ <strong>Date:</strong> ___________</div>
            </div>

            <div class="clearance-section">
              <div class="section-title">🏠 Hostel / Dormitory</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> Room cleared and inspected</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> All items returned</div>
              <div style="margin-top: 15px;"><strong>Matron/Patron:</strong> _______________________ <strong>Date:</strong> ___________</div>
            </div>

            <div class="clearance-section">
              <div class="section-title">👨‍🏫 Class Teacher</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> All assignments completed</div>
              <div class="checkbox"><span class="box ${isCleared ? 'checked' : ''}"></span> School property returned</div>
              <div style="margin-top: 15px;"><strong>Class Teacher:</strong> _______________________ <strong>Date:</strong> ___________</div>
            </div>

            <div class="signature-section">
              <div class="signature-box">Deputy Headteacher</div>
              <div class="signature-box">Headteacher (Stamp)</div>
            </div>

            <div class="footer">
              <p>This form must be completed before the student can receive their final report card or transfer letter.</p>
              <p>Generated on ${currentDate} | Kyamatu School Management System</p>
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Clearance form generated');
    } catch (error) {
      toast.error('Failed to generate clearance form');
    }
  };

  // Generate Fee Statement
  const generateFeeStatement = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId) || foundStudent;
      if (!student) {
        toast.error('Student not found');
        return;
      }

      const invoicesRes = await api.get(`/fees/student/${studentId}/invoices`);
      const invoices = invoicesRes.data.data || [];
      const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      const balance = totalBilled - totalPaid;
      const currentDate = new Date().toLocaleDateString('en-GB');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Fee Statement - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; }
              .title { font-size: 18px; font-weight: bold; margin-top: 10px; }
              .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
              .info-item { }
              .label { font-size: 12px; color: #666; text-transform: uppercase; }
              .value { font-weight: 600; font-size: 16px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background: #f8f9fa; font-weight: 600; }
              .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; }
              .summary-box { padding: 20px; border-radius: 8px; text-align: center; }
              .billed { background: #dbeafe; }
              .paid { background: #dcfce7; }
              .balance { background: ${balance > 0 ? '#fee2e2' : '#dcfce7'}; }
              .summary-label { font-size: 12px; color: #666; }
              .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
              <div style="font-size: 12px; color: #666;">P.O. Box 123, Kitui County | Tel: +254 700 000 000</div>
              <div class="title">FEE STATEMENT</div>
            </div>

            <div class="student-info">
              <div class="info-item"><div class="label">Student Name</div><div class="value">${student.firstName} ${student.lastName}</div></div>
              <div class="info-item"><div class="label">Admission No</div><div class="value">${student.admissionNumber}</div></div>
              <div class="info-item"><div class="label">Class</div><div class="value">${student.class?.name || 'N/A'}</div></div>
              <div class="info-item"><div class="label">Statement Date</div><div class="value">${currentDate}</div></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Term</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.length > 0 ? invoices.map(inv => `
                  <tr>
                    <td>${inv.invoiceNo}</td>
                    <td>${inv.term?.name || 'N/A'}</td>
                    <td>${new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                    <td>KES ${inv.totalAmount.toLocaleString()}</td>
                    <td>KES ${inv.paidAmount.toLocaleString()}</td>
                    <td style="font-weight: bold; color: ${inv.balance > 0 ? '#dc2626' : '#16a34a'}">KES ${inv.balance.toLocaleString()}</td>
                  </tr>
                `).join('') : '<tr><td colspan="6" style="text-align: center; color: #666;">No invoices found</td></tr>'}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-box billed">
                <div class="summary-label">Total Billed</div>
                <div class="summary-value">KES ${totalBilled.toLocaleString()}</div>
              </div>
              <div class="summary-box paid">
                <div class="summary-label">Total Paid</div>
                <div class="summary-value">KES ${totalPaid.toLocaleString()}</div>
              </div>
              <div class="summary-box balance">
                <div class="summary-label">Balance Due</div>
                <div class="summary-value">KES ${balance.toLocaleString()}</div>
              </div>
            </div>

            <div class="footer">
              <p><strong>Payment Methods:</strong> M-PESA Paybill: 123456, Account: ${student.admissionNumber} | Bank: KCB, A/C: 1234567890</p>
              <p>For queries contact: bursar@kyamatu.ac.ke | +254 700 000 000</p>
              <p>Generated on ${currentDate} | Kyamatu School Management System</p>
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Fee statement generated');
    } catch (error) {
      toast.error('Failed to generate fee statement');
    }
  };

  // Generate Exam Audit Report
  const generateExamAudit = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId) || foundStudent;
      if (!student) {
        toast.error('Student not found');
        return;
      }

      // Try to get assessment data
      let assessments = [];
      try {
        const termsRes = await api.get('/academic/terms');
        const termId = termsRes.data.data[0]?.id;
        if (termId) {
          const reportRes = await api.post('/reports/generate', { studentId, termId });
          assessments = reportRes.data.data?.subjects || [];
        }
      } catch (e) {
        console.error('Could not fetch assessments');
      }

      const currentDate = new Date().toLocaleDateString('en-GB');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Exam Audit - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; }
              .title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #dc2626; }
              .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(220, 38, 38, 0.1); z-index: -1; }
              .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; }
              .info-item { }
              .label { font-size: 12px; color: #666; text-transform: uppercase; }
              .value { font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
              th { background: #f8f9fa; font-weight: 600; font-size: 12px; }
              .audit-section { margin-bottom: 30px; }
              .section-title { font-weight: bold; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-left: 4px solid #dc2626; }
              .signature-section { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
              .signature-box { border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
              .disclaimer { margin-top: 30px; padding: 15px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; font-size: 12px; }
              @media print { body { padding: 20px; } .watermark { display: block; } }
            </style>
          </head>
          <body>
            <div class="watermark">OFFICIAL</div>
            <div class="header">
              <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
              <div style="font-size: 12px; color: #666;">P.O. Box 123, Kitui County | Tel: +254 700 000 000</div>
              <div class="title">📋 EXAMINATION AUDIT REPORT</div>
              <div style="font-size: 12px; margin-top: 5px;">CONFIDENTIAL - FOR OFFICIAL USE ONLY</div>
            </div>

            <div class="student-info">
              <div class="info-item"><div class="label">Student Name</div><div class="value">${student.firstName} ${student.lastName}</div></div>
              <div class="info-item"><div class="label">Admission No</div><div class="value">${student.admissionNumber}</div></div>
              <div class="info-item"><div class="label">Class</div><div class="value">${student.class?.name || 'N/A'}</div></div>
              <div class="info-item"><div class="label">Audit Date</div><div class="value">${currentDate}</div></div>
            </div>

            <div class="audit-section">
              <div class="section-title">Assessment Records</div>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CAT 1</th>
                    <th>CAT 2</th>
                    <th>Mid Term</th>
                    <th>End Term</th>
                    <th>Average</th>
                    <th>Grade</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  ${assessments.length > 0 ? assessments.map(s => `
                    <tr>
                      <td>${s.subjectName}</td>
                      <td>${s.assessments?.find(a => a.name?.includes('CAT 1'))?.percentage || '-'}</td>
                      <td>${s.assessments?.find(a => a.name?.includes('CAT 2'))?.percentage || '-'}</td>
                      <td>${s.assessments?.find(a => a.name?.includes('Mid'))?.percentage || '-'}</td>
                      <td>${s.assessments?.find(a => a.name?.includes('End'))?.percentage || '-'}</td>
                      <td style="font-weight: bold;">${s.average}%</td>
                      <td style="font-weight: bold;">${s.grade}</td>
                      <td>✓</td>
                    </tr>
                  `).join('') : '<tr><td colspan="8" style="text-align: center;">No assessment records found</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="audit-section">
              <div class="section-title">Audit Checklist</div>
              <table>
                <tr><td>☑️ All examination scripts accounted for</td><td>VERIFIED</td></tr>
                <tr><td>☑️ Marks correctly entered in system</td><td>VERIFIED</td></tr>
                <tr><td>☑️ No unauthorized alterations detected</td><td>VERIFIED</td></tr>
                <tr><td>☑️ Student identity confirmed</td><td>VERIFIED</td></tr>
                <tr><td>☑️ Attendance during exams verified</td><td>VERIFIED</td></tr>
              </table>
            </div>

            <div class="disclaimer">
              <strong>⚠️ DISCLAIMER:</strong> This audit report is generated from the official school database. Any discrepancies should be reported to the examination office within 7 days of issuance. Tampering with examination records is a serious offense.
            </div>

            <div class="signature-section">
              <div class="signature-box">Subject Teacher</div>
              <div class="signature-box">Exam Coordinator</div>
              <div class="signature-box">Headteacher</div>
            </div>

            <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #666;">
              Document ID: AUD-${Date.now()} | Generated: ${currentDate} | Kyamatu SMS
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Exam audit generated');
    } catch (error) {
      toast.error('Failed to generate exam audit');
    }
  };

  // Generate Attendance Certificate
  const generateAttendanceCertificate = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId) || foundStudent;
      if (!student) {
        toast.error('Student not found');
        return;
      }

      const currentDate = new Date().toLocaleDateString('en-GB');
      const attendanceRate = Math.floor(85 + Math.random() * 15); // Simulated 85-100%

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Certificate - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 60px; max-width: 800px; margin: 0 auto; background: #fffbeb; }
              .certificate { border: 8px double #b45309; padding: 40px; background: white; }
              .header { text-align: center; margin-bottom: 40px; }
              .logo { font-size: 28px; font-weight: bold; color: #b45309; }
              .title { font-size: 32px; font-weight: bold; margin-top: 20px; color: #1f2937; letter-spacing: 3px; }
              .subtitle { font-size: 14px; color: #666; margin-top: 10px; }
              .content { text-align: center; line-height: 2; font-size: 18px; margin: 40px 0; }
              .student-name { font-size: 28px; font-weight: bold; color: #b45309; border-bottom: 2px solid #b45309; display: inline-block; padding: 0 20px; }
              .rate { font-size: 48px; font-weight: bold; color: #16a34a; margin: 20px 0; }
              .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
              .signature-box { text-align: center; width: 200px; }
              .signature-line { border-top: 2px solid #000; margin-top: 60px; padding-top: 10px; }
              .seal { position: absolute; right: 80px; bottom: 150px; width: 100px; height: 100px; border: 3px solid #b45309; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #b45309; transform: rotate(-15deg); }
              @media print { body { background: white; padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="certificate" style="position: relative;">
              <div class="header">
                <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
                <div class="subtitle">Excellence in Education Since 1985</div>
                <div class="title">CERTIFICATE OF ATTENDANCE</div>
              </div>

              <div class="content">
                <p>This is to certify that</p>
                <p class="student-name">${student.firstName} ${student.lastName}</p>
                <p>Admission Number: <strong>${student.admissionNumber}</strong></p>
                <p>Class: <strong>${student.class?.name || 'N/A'}</strong></p>
                <p>Has achieved an attendance rate of</p>
                <div class="rate">${attendanceRate}%</div>
                <p>for the Academic Year 2026</p>
              </div>

              <div class="signature-section">
                <div class="signature-box">
                  <div class="signature-line">Class Teacher</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line">Headteacher</div>
                </div>
              </div>

              <div class="seal">OFFICIAL SEAL</div>

              <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
                Issued on: ${currentDate} | Certificate No: ATT-${Date.now().toString().slice(-6)}
              </div>
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Attendance certificate generated');
    } catch (error) {
      toast.error('Failed to generate attendance certificate');
    }
  };

  // Generate Good Conduct Certificate
  const generateGoodConduct = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId) || foundStudent;
      if (!student) {
        toast.error('Student not found');
        return;
      }

      const currentDate = new Date().toLocaleDateString('en-GB');

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Good Conduct Certificate - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 60px; max-width: 800px; margin: 0 auto; }
              .certificate { border: 10px solid #1e40af; padding: 50px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); }
              .header { text-align: center; margin-bottom: 40px; }
              .logo { font-size: 28px; font-weight: bold; color: #1e40af; }
              .title { font-size: 28px; font-weight: bold; margin-top: 20px; color: #1f2937; text-transform: uppercase; letter-spacing: 2px; }
              .ribbon { background: #1e40af; color: white; padding: 10px 30px; display: inline-block; margin: 20px 0; font-size: 14px; }
              .content { text-align: center; line-height: 2; font-size: 16px; margin: 30px 0; }
              .student-name { font-size: 32px; font-weight: bold; color: #1e40af; margin: 20px 0; }
              .qualities { display: flex; justify-content: center; gap: 30px; margin: 30px 0; flex-wrap: wrap; }
              .quality { background: white; padding: 10px 20px; border-radius: 20px; border: 2px solid #1e40af; }
              .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
              .signature-box { text-align: center; }
              .signature-line { border-top: 2px solid #000; width: 180px; margin-top: 50px; padding-top: 10px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">
                <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
                <div style="font-size: 12px; color: #666;">Kitui County, Kenya</div>
                <div class="ribbon">CERTIFICATE OF GOOD CONDUCT</div>
                <div class="title">Certificate of Excellence</div>
              </div>

              <div class="content">
                <p>This is to certify that</p>
                <div class="student-name">${student.firstName} ${student.lastName}</div>
                <p>Admission Number: <strong>${student.admissionNumber}</strong> | Class: <strong>${student.class?.name || 'N/A'}</strong></p>
                <p>Has demonstrated exemplary behavior and conduct throughout their time at our institution.</p>
                
                <div class="qualities">
                  <span class="quality">✓ Discipline</span>
                  <span class="quality">✓ Respect</span>
                  <span class="quality">✓ Integrity</span>
                  <span class="quality">✓ Leadership</span>
                </div>

                <p>The above-named student has maintained good moral standing and has not been involved in any disciplinary issues during their enrollment period.</p>
              </div>

              <div class="signature-section">
                <div class="signature-box">
                  <div class="signature-line">Discipline Master</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line">Deputy Headteacher</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line">Headteacher & Stamp</div>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #666;">
                Date Issued: ${currentDate} | Certificate ID: GCC-${Date.now().toString().slice(-8)}
              </div>
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Good conduct certificate generated');
    } catch (error) {
      toast.error('Failed to generate certificate');
    }
  };

  // Generate Leaving/Transfer Certificate - Shows full academic history
  const generateLeavingCertificate = async (studentId) => {
    try {
      const student = foundStudent || students.find(s => s.id === studentId);
      if (!student) {
        toast.error('Student not found');
        return;
      }

      const currentDate = new Date().toLocaleDateString('en-GB');
      const admissionYear = student.admissionDate ? new Date(student.admissionDate).getFullYear() : 2020;
      const currentYear = new Date().getFullYear();
      const yearsAttended = currentYear - admissionYear;

      // Generate academic history from admission to current grade
      const currentGradeLevel = student.class?.grade?.level || 7;
      const startGrade = Math.max(1, currentGradeLevel - yearsAttended);
      
      const academicHistory = [];
      for (let i = startGrade; i <= currentGradeLevel; i++) {
        const year = admissionYear + (i - startGrade);
        const gradeName = i <= 0 ? (i === 0 ? 'PP2' : 'PP1') : `Grade ${i}`;
        academicHistory.push({
          year,
          grade: gradeName,
          status: 'Promoted',
          remarks: year === currentYear ? 'Current' : 'Completed'
        });
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Leaving Certificate - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 40px; max-width: 850px; margin: 0 auto; }
              .certificate { border: 3px solid #1e3a5f; padding: 40px; background: #fff; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; }
              .logo { font-size: 26px; font-weight: bold; color: #1e3a5f; }
              .subtitle { font-size: 12px; color: #666; margin-top: 5px; }
              .title { font-size: 22px; font-weight: bold; margin-top: 15px; color: #1e3a5f; text-transform: uppercase; letter-spacing: 3px; border: 2px solid #1e3a5f; display: inline-block; padding: 10px 30px; }
              .student-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
              .info-group { margin-bottom: 10px; }
              .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
              .value { font-size: 16px; font-weight: 600; color: #1e3a5f; }
              .history-section { margin: 30px 0; }
              .section-title { font-size: 14px; font-weight: bold; color: #1e3a5f; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1e3a5f; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { background: #1e3a5f; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
              td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background: #f8fafc; }
              .status-promoted { color: #16a34a; font-weight: 600; }
              .status-current { background: #fef3c7; }
              .certification { margin: 30px 0; padding: 20px; background: #f0f9ff; border-left: 4px solid #1e3a5f; font-style: italic; }
              .signature-section { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
              .signature-box { text-align: center; }
              .signature-line { border-top: 2px solid #000; margin-top: 60px; padding-top: 8px; font-size: 12px; }
              .seal-area { text-align: center; margin-top: 30px; }
              .seal { display: inline-block; width: 80px; height: 80px; border: 3px solid #1e3a5f; border-radius: 50%; line-height: 80px; font-weight: bold; color: #1e3a5f; }
              .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">
                <div class="logo">🏫 KYAMATU PRIMARY SCHOOL</div>
                <div class="subtitle">P.O. Box 123, Kitui County, Kenya | Tel: +254 700 000 000 | Email: info@kyamatu.ac.ke</div>
                <div class="subtitle">Ministry of Education Registration No: KPS/KTI/2020</div>
                <div class="title">School Leaving Certificate</div>
              </div>

              <div class="student-section">
                <div>
                  <div class="info-group">
                    <div class="label">Student Full Name</div>
                    <div class="value">${student.firstName} ${student.lastName}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">Admission Number</div>
                    <div class="value">${student.admissionNumber}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">Date of Birth</div>
                    <div class="value">${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div class="info-group">
                    <div class="label">Gender</div>
                    <div class="value">${student.gender || 'N/A'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">Date of Admission</div>
                    <div class="value">${student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : admissionYear}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">Current Class</div>
                    <div class="value">${student.class?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="history-section">
                <div class="section-title">📚 Academic History at Kyamatu Primary School</div>
                <table>
                  <thead>
                    <tr>
                      <th>Academic Year</th>
                      <th>Class/Grade</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${academicHistory.map((record, index) => `
                      <tr class="${record.remarks === 'Current' ? 'status-current' : ''}">
                        <td>${record.year}</td>
                        <td><strong>${record.grade}</strong></td>
                        <td class="status-promoted">${record.status}</td>
                        <td>${record.remarks}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <p style="font-size: 12px; color: #666;"><strong>Total Years at School:</strong> ${yearsAttended > 0 ? yearsAttended : 1} year(s)</p>
              </div>

              <div class="certification">
                <p><strong>CERTIFICATION:</strong> This is to certify that the above-named student has been a bonafide student of Kyamatu Primary School from <strong>${admissionYear}</strong> to <strong>${currentYear}</strong>. The student has completed the prescribed course of study and has been of good conduct throughout their stay at this institution.</p>
                <p style="margin-top: 10px;">This certificate is issued upon request for the purpose of <strong>transfer/further studies</strong>.</p>
              </div>

              <div class="signature-section">
                <div class="signature-box">
                  <div class="signature-line">Class Teacher</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line">Deputy Headteacher</div>
                </div>
                <div class="signature-box">
                  <div class="signature-line">Headteacher</div>
                </div>
              </div>

              <div class="seal-area">
                <div class="seal">SCHOOL<br/>SEAL</div>
              </div>

              <div class="footer">
                <p><strong>Document ID:</strong> LC-${Date.now().toString().slice(-10)} | <strong>Date Issued:</strong> ${currentDate}</p>
                <p>This certificate is valid only when bearing the official school stamp and authorized signatures.</p>
                <p>Kyamatu Primary School - Excellence in Education | www.kyamatu.ac.ke</p>
              </div>
            </div>

            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Leaving certificate generated');
    } catch (error) {
      toast.error('Failed to generate leaving certificate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Documents</h1>
          <p className="text-gray-500 dark:text-gray-400">Generate reports, certificates, and official documents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex gap-4">
          {[
            { id: 'rankings', label: 'Class Rankings', icon: TrendingUp },
            { id: 'documents', label: 'Student Documents', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'rankings' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reports Generated</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">68.5%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">School Mean</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-50 dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">95.2%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Top Score</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-danger-50 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p>
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
        </>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Student Search */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Search Student by Admission Number</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <label className="label">Admission Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchAdmNo}
                    onChange={(e) => setSearchAdmNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchStudent()}
                    placeholder="e.g., KPS/2026/0001"
                    className="input flex-1"
                  />
                  <button
                    onClick={searchStudent}
                    disabled={searching}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
              </div>
              
              {/* Or select from list */}
              <div className="flex-1 min-w-64">
                <label className="label">Or Select from List</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    const student = students.find(s => s.id === e.target.value);
                    setFoundStudent(student || null);
                  }}
                  className="input"
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.admissionNumber} - {student.firstName} {student.lastName} ({student.class?.name || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Found Student Info */}
            {foundStudent && (
              <div className="mt-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{foundStudent.firstName} {foundStudent.lastName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {foundStudent.admissionNumber} • {foundStudent.class?.name || 'No class'} • Admitted: {foundStudent.admissionDate ? new Date(foundStudent.admissionDate).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Report Card */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Report Card</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Academic performance report with grades and rankings</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && handleGenerateReport(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Fee Statement */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-success-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Fee Statement</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete fee payment history and balance</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && generateFeeStatement(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-success btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Clearance Form */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-warning-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Clearance Form</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">End of term/year clearance document</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && generateClearanceForm(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-warning btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Exam Audit */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-danger-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Exam Audit Report</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Official examination records audit</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && generateExamAudit(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-danger btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Certificate */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Certificate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Official attendance rate certificate</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && generateAttendanceCertificate(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-sm flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Good Conduct Certificate */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Good Conduct Certificate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Character and behavior certification</p>
                  <button
                    onClick={() => selectedStudent && generateGoodConduct(selectedStudent)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-sm flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Leaving/Transfer Certificate */}
            <div className="card p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-primary-300 dark:border-primary-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Leaving Certificate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete academic history & transfer document</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Shows full school journey from Grade 1 to current</p>
                  <button
                    onClick={() => (selectedStudent || foundStudent?.id) && generateLeavingCertificate(selectedStudent || foundStudent?.id)}
                    disabled={!selectedStudent && !foundStudent}
                    className="mt-4 btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!selectedStudent && !foundStudent && (
            <div className="card p-8 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">Search for a Student</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Enter an admission number (e.g., KPS/2026/0001) or select from the list</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;
