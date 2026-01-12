import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { generateInvoiceNumber, paginationMeta, formatCurrency } from '../../utils/helpers.js';

export const createFeeStructure = async (data) => {
  const structure = await prisma.feeStructure.create({
    data,
    include: {
      grade: true,
      term: true,
    },
  });
  return structure;
};

export const getFeeStructures = async (filters = {}) => {
  const { gradeId, termId } = filters;
  
  const where = {};
  if (gradeId) where.gradeId = gradeId;
  if (termId) where.termId = termId;
  
  const structures = await prisma.feeStructure.findMany({
    where,
    include: {
      grade: true,
      term: { include: { academicYear: true } },
    },
    orderBy: [{ term: { termNumber: 'asc' } }, { name: 'asc' }],
  });
  
  return structures;
};

export const generateInvoice = async (studentId, termId, items) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: { include: { grade: true } } },
  });
  
  if (!student) {
    throw new NotFoundError('Student');
  }
  
  const existingInvoice = await prisma.studentInvoice.findFirst({
    where: { 
      studentId, 
      termId,
      balance: { gt: 0 }
    },
    include: {
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
      term: { include: { academicYear: true } },
      items: true,
    },
  });
  
  if (existingInvoice) {
    return existingInvoice;
  }
  
  let invoiceItems = items;
  
  if (!items || items.length === 0) {
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        gradeId: student.class.gradeId,
        termId,
      },
    });
    
    invoiceItems = feeStructures.map(fs => ({
      description: fs.name,
      amount: fs.amount,
      feeStructureId: fs.id,
    }));
  }
  
  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  
  const invoice = await prisma.studentInvoice.create({
    data: {
      invoiceNo: generateInvoiceNumber(),
      studentId,
      termId,
      totalAmount,
      balance: totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: {
        create: invoiceItems,
      },
    },
    include: {
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
      term: { include: { academicYear: true } },
      items: true,
    },
  });
  
  return invoice;
};

export const getStudentInvoices = async (studentId, filters = {}) => {
  const { termId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;
  
  const where = { studentId };
  if (termId) where.termId = termId;
  
  const [invoices, total] = await Promise.all([
    prisma.studentInvoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        term: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentInvoice.count({ where }),
  ]);
  
  return { invoices, meta: paginationMeta(total, page, limit) };
};

export const getInvoiceById = async (id) => {
  const invoice = await prisma.studentInvoice.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          class: { include: { grade: true, stream: true } },
          guardians: {
            include: { guardian: { include: { user: true } } },
          },
        },
      },
      term: { include: { academicYear: true } },
      items: { include: { feeStructure: true } },
      payments: true,
    },
  });
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  return invoice;
};

export const recordPayment = async (data) => {
  const { invoiceId, amount, method, transactionRef, mpesaReceiptNo } = data;
  
  const invoice = await prisma.studentInvoice.findUnique({
    where: { id: invoiceId },
  });
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const payment = await prisma.payment.create({
    data: {
      amount,
      method,
      status: 'COMPLETED',
      transactionRef,
      mpesaReceiptNo,
      studentId: invoice.studentId,
      invoiceId,
      paidAt: new Date(),
    },
  });
  
  const newPaidAmount = invoice.paidAmount + amount;
  const newBalance = invoice.totalAmount - newPaidAmount;
  
  await prisma.studentInvoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      balance: Math.max(0, newBalance),
    },
  });
  
  return payment;
};

export const getPayments = async (filters = {}) => {
  const { studentId, invoiceId, method, startDate, endDate } = filters;
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const where = {};
  if (studentId) where.studentId = studentId;
  if (invoiceId) where.invoiceId = invoiceId;
  if (method) where.method = method;
  if (startDate && endDate) {
    where.paidAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
        invoice: { select: { invoiceNo: true } },
      },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);
  
  return { payments, meta: paginationMeta(total, page, limit) };
};

export const getStudentFeeBalance = async (studentId) => {
  const invoices = await prisma.studentInvoice.findMany({
    where: { studentId },
    select: {
      totalAmount: true,
      paidAmount: true,
      balance: true,
    },
  });
  
  const totals = invoices.reduce(
    (acc, inv) => ({
      totalFees: acc.totalFees + inv.totalAmount,
      totalPaid: acc.totalPaid + inv.paidAmount,
      totalBalance: acc.totalBalance + inv.balance,
    }),
    { totalFees: 0, totalPaid: 0, totalBalance: 0 }
  );
  
  return {
    ...totals,
    formatted: {
      totalFees: formatCurrency(totals.totalFees),
      totalPaid: formatCurrency(totals.totalPaid),
      totalBalance: formatCurrency(totals.totalBalance),
    },
  };
};

export const getFinancialSummary = async (termId) => {
  const where = termId ? { termId } : {};
  
  const invoices = await prisma.studentInvoice.aggregate({
    where,
    _sum: {
      totalAmount: true,
      paidAmount: true,
      balance: true,
    },
    _count: true,
  });
  
  const payments = await prisma.payment.aggregate({
    where: termId ? { invoice: { termId } } : {},
    _sum: { amount: true },
    _count: true,
  });
  
  const paymentsByMethod = await prisma.payment.groupBy({
    by: ['method'],
    where: termId ? { invoice: { termId } } : {},
    _sum: { amount: true },
    _count: true,
  });
  
  return {
    invoices: {
      count: invoices._count,
      totalBilled: invoices._sum.totalAmount || 0,
      totalCollected: invoices._sum.paidAmount || 0,
      totalOutstanding: invoices._sum.balance || 0,
    },
    payments: {
      count: payments._count,
      totalAmount: payments._sum.amount || 0,
    },
    byMethod: paymentsByMethod.map(m => ({
      method: m.method,
      count: m._count,
      amount: m._sum.amount || 0,
    })),
  };
};

export const exportInvoicesCSV = async (termId) => {
  const where = termId ? { termId } : {};
  
  const invoices = await prisma.studentInvoice.findMany({
    where,
    include: {
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
      term: { include: { academicYear: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  const headers = ['Invoice No', 'Student Name', 'Admission No', 'Term', 'Total Amount', 'Paid Amount', 'Balance', 'Status', 'Due Date', 'Created Date'];
  
  const rows = invoices.map(inv => [
    inv.invoiceNo,
    `${inv.student.firstName} ${inv.student.lastName}`,
    inv.student.admissionNumber,
    `${inv.term.name} - ${inv.term.academicYear.name}`,
    inv.totalAmount,
    inv.paidAmount,
    inv.balance,
    inv.balance === 0 ? 'PAID' : inv.balance < inv.totalAmount ? 'PARTIAL' : 'UNPAID',
    inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
    inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};
