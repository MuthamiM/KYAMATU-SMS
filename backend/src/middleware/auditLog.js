import logger from '../config/logger.js';

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization', 'refreshToken', 'currentPassword', 'newPassword'];

const redactSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
};

const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const auditLog = (req, res, next) => {
  if (!AUDITED_METHODS.includes(req.method)) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      userId: req.user?.id || 'anonymous',
      userRole: req.user?.role || 'none',
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 400) {
      auditEntry.body = redactSensitive(req.body);
    }

    logger.info({ audit: auditEntry });
  });

  next();
};

export { redactSensitive };
