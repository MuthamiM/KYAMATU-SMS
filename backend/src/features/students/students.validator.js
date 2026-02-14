import { body, param, query } from 'express-validator';

export const createStudentValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('classId').optional().isUUID().withMessage('Valid class ID required'),
];

export const updateStudentValidator = [
  param('id').isUUID().withMessage('Valid student ID required'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('medicalInfo').optional().isString(),
];

export const getStudentsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be 1-1000'),
  query('classId').optional().isUUID().withMessage('Valid class ID required'),
  query('gradeId').optional().isUUID().withMessage('Valid grade ID required'),
  query('admissionStatus').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']),
];

export const admissionValidator = [
  param('id').isUUID().withMessage('Valid student ID required'),
  body('classId').isUUID().withMessage('Valid class ID required'),
];

export const promoteValidator = [
  body('fromClassId').isUUID().withMessage('Valid source class ID required'),
  body('toClassId').isUUID().withMessage('Valid destination class ID required'),
];

export const guardianLinkValidator = [
  param('id').isUUID().withMessage('Valid student ID required'),
  body('guardianId').isUUID().withMessage('Valid guardian ID required'),
  body('isPrimary').optional().isBoolean(),
];
