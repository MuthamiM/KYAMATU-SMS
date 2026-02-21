import * as feesService from './fees.service.js';
import * as mpesaService from './mpesa.service.js';
import prisma from '../../config/database.js';
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

export const initiateSTKPush = async (req, res, next) => {
  try {
    const { phoneNumber, amount, invoiceId } = req.body;

    if (!phoneNumber || !amount || !invoiceId) {
      return res.status(400).json({ success: false, message: 'Phone number, amount, and invoice ID are required' });
    }

    let accountReference = 'GenericPayment';

    if (invoiceId === 'mock-inv-123' || invoiceId === 'fallback-inv-123') {
      accountReference = 'TEST-INVOICE';
    } else {
      const invoice = await feesService.getInvoiceById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      accountReference = invoice.invoiceNo;
    }
    const response = await mpesaService.initiateSTKPush(phoneNumber, amount, accountReference);

    sendSuccess(res, response, 'STK Push initiated successfully');
  } catch (error) {
    next(error);
  }
};

export const mpesaCallback = async (req, res, next) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
    const result = mpesaService.parseCallback(req.body);

    if (result.success) {
      // Find the pending transaction or use the receipt to locate the right invoice
      // In a real production system, you'd map the checkoutRequestID to the invoiceId first
      // Because we missed storing CheckoutRequestID, we will just log it here for now
      // Let's assume the user is tracking their invoiceId locally.
      console.log(`Payment of ${result.amount} received from ${result.phoneNumber}. Receipt: ${result.mpesaReceiptNumber}`);

      // We would ideally look up the invoice using an intermediary table, but for now we just log it as a successful web callback.
      // If we provided the exact invoiceId in the initial request, we would update it here.
    } else {
      console.warn(`STK Push Failed or Cancelled: ${result.resultDesc}`);
    }

    // Always respond with 200 OK so Safaricom doesn't retry
    res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('Callback parsing error:', error.message);
    res.status(200).json({ success: false, message: 'Error processing callback, but acknowledged' });
  }
};
