import * as feesService from './fees.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createFeeStructure = async (req, res, next) => {
  try {
    const structure = await feesService.createFeeStructure(req.body);
    sendCreated(res, structure, 'Fee structure created');
  } catch (error) {
    next(error);
  }
};

export const getFeeStructures = async (req, res, next) => {
  try {
    const structures = await feesService.getFeeStructures(req.query);
    sendSuccess(res, structures);
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const { studentId, termId, items } = req.body;
    const invoice = await feesService.generateInvoice(studentId, termId, items);
    sendCreated(res, invoice, 'Invoice generated');
  } catch (error) {
    next(error);
  }
};

export const getStudentInvoices = async (req, res, next) => {
  try {
    // Privacy: If student, ensure they only access their own invoices
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== req.params.studentId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to student data' });
      }
    }
    const { invoices, meta } = await feesService.getStudentInvoices(req.params.studentId, req.query);
    sendPaginated(res, invoices, meta);
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await feesService.getInvoiceById(req.params.id);
    sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const payment = await feesService.recordPayment(req.body);
    sendCreated(res, payment, 'Payment recorded');
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { payments, meta } = await feesService.getPayments(req.query);
    sendPaginated(res, payments, meta);
  } catch (error) {
    next(error);
  }
};

export const getStudentBalance = async (req, res, next) => {
  try {
    // Privacy: If student, ensure they only access their own balance
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student || student.id !== req.params.studentId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to student data' });
      }
    }
    const balance = await feesService.getStudentFeeBalance(req.params.studentId);
    sendSuccess(res, balance);
  } catch (error) {
    next(error);
  }
};

export const getFinancialSummary = async (req, res, next) => {
  try {
    const summary = await feesService.getFinancialSummary(req.query.termId);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const exportInvoices = async (req, res, next) => {
  try {
    const csvContent = await feesService.exportInvoicesCSV(req.query.termId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
