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
    let studentId = null;

    if (invoiceId === 'mock-inv-123' || invoiceId === 'fallback-inv-123') {
      accountReference = 'TEST-INVOICE';
    } else {
      const invoice = await feesService.getInvoiceById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      accountReference = invoice.invoiceNo;
      studentId = invoice.studentId;
    }
    const response = await mpesaService.initiateSTKPush(phoneNumber, amount, accountReference);

    if (studentId && response.CheckoutRequestID) {
      await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          method: 'MPESA',
          status: 'PENDING',
          transactionRef: response.CheckoutRequestID,
          studentId: studentId,
          invoiceId: invoiceId
        }
      });
    }

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
      console.log(`Payment of ${result.amount} received from ${result.phoneNumber}. Receipt: ${result.mpesaReceiptNumber}`);

      const pendingPayment = await prisma.payment.findUnique({
        where: { transactionRef: result.checkoutRequestID }
      });

      if (pendingPayment && pendingPayment.status === 'PENDING') {
        const invoice = await prisma.studentInvoice.findUnique({
          where: { id: pendingPayment.invoiceId }
        });

        if (invoice) {
          // Update payment
          await prisma.payment.update({
            where: { id: pendingPayment.id },
            data: {
              status: 'COMPLETED',
              mpesaReceiptNo: result.mpesaReceiptNumber,
              paidAt: new Date(),
              amount: parseFloat(result.amount) // Use actual amount paid
            }
          });

          // Update invoice balance
          const newPaidAmount = invoice.paidAmount + parseFloat(result.amount);
          const newBalance = invoice.totalAmount - newPaidAmount;
          await prisma.studentInvoice.update({
            where: { id: invoice.id },
            data: {
              paidAmount: newPaidAmount,
              balance: Math.max(0, newBalance)
            }
          });
          console.log(`Successfully updated invoice ${invoice.invoiceNo} balance.`);
        }
      }
    } else {
      console.warn(`STK Push Failed or Cancelled: ${result.resultDesc}`);
      // Find and mark as failed if exists
      if (result.checkoutRequestID) {
        const pendingPayment = await prisma.payment.findUnique({
          where: { transactionRef: result.checkoutRequestID }
        });
        if (pendingPayment && pendingPayment.status === 'PENDING') {
          await prisma.payment.update({
            where: { id: pendingPayment.id },
            data: { status: 'FAILED' }
          });
        }
      }
    }

    // Always respond with 200 OK so Safaricom doesn't retry
    res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('Callback parsing error:', error.message);
    res.status(200).json({ success: false, message: 'Error processing callback, but acknowledged' });
  }
};

export const getDefaulters = async (req, res, next) => {
  try {
    const defaulters = await feesService.getDefaulters();
    sendSuccess(res, defaulters);
  } catch (error) {
    next(error);
  }
};
