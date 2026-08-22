import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Wallet, CreditCard, Receipt, Download } from 'lucide-react';

function Fees() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [terms, setTerms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Invoice Form State
  const [invoiceMode, setInvoiceMode] = useState('GRADE'); // 'GRADE' or 'STUDENT'
  const [selectedInvoiceGrade, setSelectedInvoiceGrade] = useState('');
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    gradeId: '',
    termId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Payment Form State
  const [paymentGradeFilter, setPaymentGradeFilter] = useState('ALL');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    invoiceId: '',
    amount: '',
    method: 'CASH',
    transactionRef: '',
    mpesaReceiptNo: '',
  });

  const [studentInvoices, setStudentInvoices] = useState([]);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, paymentsRes, defaultersRes] = await Promise.all([
        api.get('/fees/summary'),
        api.get('/fees/payments?limit=10'),
        api.get('/fees/defaulters')
      ]);
      setSummary(summaryRes?.data?.data || null);
      setPayments(paymentsRes?.data?.data || []);
      setDefaulters(defaultersRes?.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch fee data');
      setSummary(null);
      setPayments([]);
      setDefaulters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [studentsRes, termsRes, gradesRes] = await Promise.all([
        api.get('/students?limit=1000'), // Fetch all students for dropdown
        api.get('/academic/terms'),
        api.get('/academic/grades'),
      ]);
      setStudents(studentsRes?.data?.data || []);
      setTerms(termsRes?.data?.data || []);
      setGrades(gradesRes?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch dependencies');
      setStudents([]);
      setTerms([]);
      setGrades([]);
    }
  };

  const fetchStudentInvoices = async (studentId) => {
    if (!studentId) return;
    try {
      const response = await api.get(`/fees/student/${studentId}/invoices`);
      setStudentInvoices(response?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch student invoices');
      setStudentInvoices([]);
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (invoiceMode === 'GRADE') {
        if (!invoiceForm.gradeId) {
          toast.error('Please select a Grade');
          return;
        }
        const res = await api.post('/fees/invoices/grade', {
          gradeId: invoiceForm.gradeId,
          termId: invoiceForm.termId,
          dueDate: invoiceForm.dueDate,
        });
        toast.success(res.data.message || 'Invoices generated for grade');
      } else {
        if (!invoiceForm.studentId) {
          toast.error('Please select a student');
          return;
        }
        await api.post('/fees/invoices', {
          studentId: invoiceForm.studentId,
          termId: invoiceForm.termId,
          dueDate: invoiceForm.dueDate,
        });
        toast.success('Invoice generated successfully');
      }
      setShowInvoiceModal(false);
      fetchData();
      setInvoiceForm({ ...invoiceForm, studentId: '', gradeId: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/payments', {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      fetchData();
      setPaymentForm({
        studentId: '',
        invoiceId: '',
        amount: '',
        method: 'CASH',
        transactionRef: '',
        mpesaReceiptNo: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'MPESA':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-600 font-bold text-xs">M</span></div>;
      case 'BANK_TRANSFER':
        return <CreditCard className="w-5 h-5 text-primary-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-500">Track invoices, payments, and balances</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                const response = await api.get('/fees/invoices/export', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'invoices.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Invoices exported successfully');
              } catch (error) {
                toast.error('Failed to export invoices');
              }
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Generate Invoice
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Total Billed</p>
              <p className="text-2xl font-bold mt-1">
                {loading ? '-' : formatCurrency(summary?.invoices?.totalBilled || 0)}
              </p>
            </div>
            <Receipt className="w-10 h-10 text-primary-200" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100">Collected</p>
              <p className="text-2xl font-bold mt-1">
                {loading ? '-' : formatCurrency(summary?.invoices?.totalCollected || 0)}
              </p>
            </div>
            <Wallet className="w-10 h-10 text-success-200" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warning-100">Outstanding</p>
              <p className="text-2xl font-bold mt-1">
                {loading ? '-' : formatCurrency(summary?.invoices?.totalOutstanding || 0)}
              </p>
            </div>
            <Wallet className="w-10 h-10 text-warning-200" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-gray-700 to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Transactions</p>
              <p className="text-2xl font-bold mt-1">
                {loading ? '-' : summary?.payments?.count || 0}
              </p>
            </div>
            <CreditCard className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>

      {summary?.byMethod && Array.isArray(summary.byMethod) && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.byMethod.map((method) => (
              <div key={method.method} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                {getMethodIcon(method.method)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{method.method}</p>
                  <p className="text-sm text-gray-500">{method.count} transactions</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(method.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <button
            onClick={() => setActiveTab('payments')}
            className={`font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'payments' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Payments
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'balances' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Student Balances
          </button>
        </div>
        <div className="table-container">
          <table className="table">
            {activeTab === 'payments' ? (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Invoice</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">Loading...</td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td>{new Date(payment.paidAt).toLocaleDateString()}</td>
                        <td className="font-medium">
                          {payment.student?.firstName} {payment.student?.lastName}
                        </td>
                        <td className="font-mono text-sm">{payment.invoice?.invoiceNo}</td>
                        <td>
                          <span className="badge badge-primary">{payment.method}</span>
                        </td>
                        <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                        <td>
                          <span className="badge badge-success">{payment.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Adm No.</th>
                    <th>Invoices</th>
                    <th>Total Balance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">Loading...</td>
                    </tr>
                  ) : defaulters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No outstanding balances found
                      </td>
                    </tr>
                  ) : (
                    defaulters.map((d, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="font-medium">
                          {d.student?.firstName} {d.student?.lastName}
                        </td>
                        <td className="font-mono text-sm">{d.student?.admissionNumber}</td>
                        <td className="text-sm text-gray-500">
                          {d.invoices.map(inv => (
                            <div key={inv.invoiceNo}>{inv.term}: {formatCurrency(inv.balance)}</div>
                          ))}
                        </td>
                        <td className="font-semibold text-danger-600">
                          {formatCurrency(d.totalBalance)}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedStudent(d.student?.id);
                              setPaymentForm({ ...paymentForm, studentId: d.student?.id });
                              fetchStudentInvoices(d.student?.id);
                              setShowPaymentModal(true);
                            }}
                            className="text-primary-600 hover:underline text-sm font-medium"
                          >
                            Add Payment
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generate Fee Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  invoiceMode === 'GRADE' ? 'bg-white shadow text-primary-700' : 'text-gray-600'
                }`}
                onClick={() => setInvoiceMode('GRADE')}
              >
                🏫 Bulk by Grade
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  invoiceMode === 'STUDENT' ? 'bg-white shadow text-primary-700' : 'text-gray-600'
                }`}
                onClick={() => setInvoiceMode('STUDENT')}
              >
                👤 Individual Student
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              {invoiceMode === 'GRADE' ? (
                <div>
                  <label className="label font-medium text-gray-700">Select Grade (Class Level)</label>
                  <select
                    required
                    className="input"
                    value={invoiceForm.gradeId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, gradeId: e.target.value })}
                  >
                    <option value="">-- Choose Grade --</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name || `Grade ${g.level}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Generates official term invoices for all enrolled learners in this grade.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="label font-medium text-gray-700">Filter by Grade</label>
                    <select
                      className="input"
                      value={selectedInvoiceGrade}
                      onChange={(e) => setSelectedInvoiceGrade(e.target.value)}
                    >
                      <option value="">All Grades</option>
                      {grades.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label font-medium text-gray-700">Select Student</label>
                    <select
                      required
                      className="input"
                      value={invoiceForm.studentId}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                    >
                      <option value="">-- Choose Student --</option>
                      {students
                        .filter((s) => !selectedInvoiceGrade || s.class?.grade?.name === selectedInvoiceGrade || s.class?.name === selectedInvoiceGrade)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({s.admissionNumber}) - {s.class?.name || s.class?.grade?.name || 'No Class'}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="label font-medium text-gray-700">Academic Term</label>
                <select
                  required
                  className="input"
                  value={invoiceForm.termId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, termId: e.target.value })}
                >
                  <option value="">-- Select Term --</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.year || t.academicYear?.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {invoiceMode === 'GRADE' ? 'Generate Grade Invoices' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Record Fee Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Grade Filter for Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <div>
                  <label className="text-xs font-semibold text-blue-900 uppercase">1. Filter by Grade</label>
                  <select
                    className="input text-sm mt-1 bg-white"
                    value={paymentGradeFilter}
                    onChange={(e) => setPaymentGradeFilter(e.target.value)}
                  >
                    <option value="ALL">All Grades (1-9)</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-900 uppercase">Quick Search</label>
                  <input
                    type="text"
                    placeholder="Search name / adm..."
                    className="input text-sm mt-1 bg-white"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label font-medium text-gray-700">2. Select Student</label>
                <select
                  required
                  className="input"
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, studentId: e.target.value, invoiceId: '' });
                    fetchStudentInvoices(e.target.value);
                  }}
                >
                  <option value="">-- Choose Student ({
                    students.filter((s) => {
                      const matchGrade = paymentGradeFilter === 'ALL' || s.class?.grade?.name === paymentGradeFilter || s.class?.name === paymentGradeFilter;
                      const q = paymentSearch.toLowerCase().trim();
                      const matchSearch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
                      return matchGrade && matchSearch;
                    }).length
                  } learners) --</option>
                  {students
                    .filter((s) => {
                      const matchGrade = paymentGradeFilter === 'ALL' || s.class?.grade?.name === paymentGradeFilter || s.class?.name === paymentGradeFilter;
                      const q = paymentSearch.toLowerCase().trim();
                      const matchSearch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
                      return matchGrade && matchSearch;
                    })
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber}) - {s.class?.name || s.class?.grade?.name || 'No Grade'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="label font-medium text-gray-700">3. Select Invoice</label>
                <select
                  required
                  className="input"
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  disabled={!paymentForm.studentId}
                >
                  <option value="">Select Invoice</option>
                  {studentInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo} ({inv.term?.name || 'Term'}) - Bal: {formatCurrency(inv.balance)}
                    </option>
                  ))}
                </select>
                {paymentForm.studentId && studentInvoices.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No unpaid invoices found for this student. Please generate an invoice first.</p>
                )}
              </div>

              <div>
                <label className="label font-medium text-gray-700">Amount (KES)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  className="input"
                  placeholder="e.g. 5000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="label font-medium text-gray-700">Payment Method</label>
                <select
                  required
                  className="input"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              {(paymentForm.method === 'MPESA' || paymentForm.method === 'BANK_TRANSFER') && (
                <div>
                  <label className="label font-medium text-gray-700">Transaction Ref / Receipt No</label>
                  <input
                    type="text"
                    required
                    placeholder={paymentForm.method === 'MPESA' ? 'e.g. QHX4829910' : 'e.g. TR-2026-9901'}
                    className="input"
                    value={paymentForm.method === 'MPESA' ? paymentForm.mpesaReceiptNo : paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ 
                      ...paymentForm, 
                      mpesaReceiptNo: e.target.value,
                      transactionRef: e.target.value 
                    })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fees;
