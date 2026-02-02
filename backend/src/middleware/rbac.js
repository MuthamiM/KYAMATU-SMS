import { AuthorizationError } from '../utils/errors.js';

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 6,
  ADMIN: 5,
  BURSAR: 4,
  TEACHER: 3,
  PARENT: 2,
  STUDENT: 1,
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

export const requireOwnerOrRole = (ownerIdExtractor, ...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const ownerId = ownerIdExtractor(req);

    if (req.user.id === ownerId || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new AuthorizationError('Access denied'));
  };
};

export const isSuperAdmin = requireRole('SUPER_ADMIN');
export const isAdmin = requireRole('SUPER_ADMIN', 'ADMIN');
export const isStaff = requireRole('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'BURSAR');
export const isTeacher = requireRole('SUPER_ADMIN', 'ADMIN', 'TEACHER');
export const isBursar = requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR');
export const isStudent = requireRole('SUPER_ADMIN', 'ADMIN', 'STUDENT');
