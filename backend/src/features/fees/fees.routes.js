import { Router } from 'express';
import * as feesController from './fees.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isBursar, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/structures', isAdmin, feesController.createFeeStructure);
router.get('/structures', isStaff, feesController.getFeeStructures);

router.post('/invoices', isBursar, feesController.generateInvoice);
router.get('/invoices/export', isBursar, feesController.exportInvoices);
router.get('/invoices/:id', isStaff, feesController.getInvoice);
router.get('/student/:studentId/invoices', isStaff, feesController.getStudentInvoices);
router.get('/student/:studentId/balance', isStaff, feesController.getStudentBalance);

router.post('/payments', isBursar, feesController.recordPayment);
router.get('/payments', isBursar, feesController.getPayments);

router.get('/summary', isBursar, feesController.getFinancialSummary);

export default router;
