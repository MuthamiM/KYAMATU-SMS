import { AuthorizationError } from '../utils/errors.js';

export const restrictToOwnStudent = (req, res, next) => {
    // If user is not valid, let auth middleware handle it (though this should run after auth)
    if (!req.user) {
        return next(new AuthorizationError('Authentication required'));
    }

    // Admins and Staff (Teachers, Bursars) generally have broader access
    // Controlled by other RBAC middleware (isStaff, etc.)
    // If not a student, skip this specific check and let subsequent RBAC handle it
    // OR if we want to enforce that even staff can only see valid students, we'd add logic here.
    // BUT the requirement is "Students can view marks...". Staff access is handled by isStaff/etc.
    if (req.user.role !== 'STUDENT') {
        return next();
    }

    // User is a STUDENT properly
    const student = req.user.student;
    if (!student) {
        return next(new AuthorizationError('Student profile not found'));
    }

    // Identify the target student ID from params, query, or body
    // Priority: params -> query -> body
    const targetStudentId = req.params.studentId || req.query.studentId || req.body.studentId;

    if (!targetStudentId) {
        // If no specific student ID is requested, we might need to enforce defaults in controllers
        // For now, if they are hitting an endpoint that typically requires an ID, and it's missing,
        // the validation layer should catch it.
        // If this middleware is used on a "list" endpoint without ID, we proceed,
        // assuming the controller filters for the current student.
        return next();
    }

    if (targetStudentId !== student.id) {
        return next(new AuthorizationError('You can only access your own records'));
    }

    next();
};
