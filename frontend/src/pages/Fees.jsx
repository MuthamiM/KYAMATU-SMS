import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Wallet, CreditCard, Receipt, Download } from 'lucide-react';

function Fees() {
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    termId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

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
      const [summaryRes, paymentsRes] = await Promise.all([
        api.get('/fees/summary'),
        api.get('/fees/payments?limit=10'),
      ]);
      setSummary(summaryRes?.data?.data || null);
      setPayments(paymentsRes?.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch fee data');
      setSummary(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [studentsRes, termsRes] = await Promise.all([
        api.get('/students?limit=100'), // Fetch all for dropdown
        api.get('/academic/terms'),
      ]);
      setStudents(studentsRes?.data?.data || []);
      setTerms(termsRes?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch dependencies');
      setStudents([]);
      setTerms([]);
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
      await api.post('/fees/invoices', invoiceForm);
      toast.success('Invoice generated successfully');
      setShowInvoiceModal(false);
      fetchData();
      setInvoiceForm({ ...invoiceForm, studentId: '' });
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
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Payments</h2>
        </div>
        <div className="table-container">
          <table className="table">
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
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Generate Invoice</h2>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="label">Student</label>
                <select
                  required
                  className="input"
                  value={invoiceForm.studentId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Term</label>
                <select
                  required
                  className="input"
                  value={invoiceForm.termId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, termId: e.target.value })}
                >
                  <option value="">Select Term</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Due Date</label>
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
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="label">Student</label>
                <select
                  required
                  className="input"
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, studentId: e.target.value });
                    fetchStudentInvoices(e.target.value);
                  }}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Invoice</label>
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
                      {inv.invoiceNo} - Bal: {formatCurrency(inv.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Payment Method</label>
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
                  <label className="label">Transaction Ref / Receipt No</label>
                  <input
                    type="text"
                    required
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
