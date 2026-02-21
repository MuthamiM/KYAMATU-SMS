import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { isTeacher, isStudent } from '../../middleware/rbac.js';
import * as qrService from './qr.service.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

router.use(authenticate);

// Teacher generates a QR session for a class
router.post('/generate', isTeacher, async (req, res, next) => {
    try {
        const { classId, termId } = req.body;

        if (!classId || !termId) {
            return res.status(400).json({
                success: false,
                message: 'classId and termId are required',
            });
        }

        const session = await qrService.generateQRSession(classId, termId, req.user.id);
        sendSuccess(res, session, 'QR attendance session created');
    } catch (error) {
        next(error);
    }
});

// Student submits QR token to mark attendance
router.post('/scan', isStudent, async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'QR token is required',
            });
        }

        const studentId = req.user.student?.id;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student profile not found',
            });
        }

        const result = await qrService.verifyQRAttendance(token, studentId);
        sendSuccess(res, result, 'Attendance marked successfully');
    } catch (error) {
        next(error);
    }
});

// Get session status (teacher check)
router.get('/session/:token', isTeacher, async (req, res, next) => {
    try {
        const info = qrService.getSessionInfo(req.params.token);
        if (!info) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or expired',
            });
        }
        sendSuccess(res, info);
    } catch (error) {
        next(error);
    }
});

export default router;
