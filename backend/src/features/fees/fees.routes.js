import { Router } from 'express';
import * as feesController from './fees.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isBursar, isStaff, requireRole } from '../../middleware/rbac.js';

const router = Router();

// Public M-Pesa Callback (Safaricom hits this, no auth)
router.post('/mpesa/callback', feesController.mpesaCallback);

router.use(authenticate);

router.post('/mpesa/stkpush', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR', 'TEACHER', 'STUDENT'), feesController.initiateSTKPush);

router.post('/structures', isAdmin, feesController.createFeeStructure);
router.get('/structures', isBursar, feesController.getFeeStructures);

router.post('/invoices', isBursar, feesController.generateInvoice);
router.get('/invoices/export', isBursar, feesController.exportInvoices);
router.get('/invoices/:id', isBursar, feesController.getInvoice);

// Student invoice/balance: accessible by bursar, admin, teacher, AND the student themselves
const canViewStudentFees = requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR', 'TEACHER', 'STUDENT');
router.get('/student/:studentId/invoices', canViewStudentFees, feesController.getStudentInvoices);
router.get('/student/:studentId/balance', canViewStudentFees, feesController.getStudentBalance);

router.post('/payments', isBursar, feesController.recordPayment);
router.get('/payments', isBursar, feesController.getPayments);

router.get('/summary', isBursar, feesController.getFinancialSummary);

export default router;
