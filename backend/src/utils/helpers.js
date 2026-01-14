export const generateAdmissionNumber = (prefix = 'KPS') => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}/${year}/${random}`;
};

export const generateEmployeeNumber = (prefix = 'EMP') => {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${random}`;
};

export const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}${random}`;
};

export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateGrade = (percentage) => {
  if (percentage >= 80) return { grade: 'A', remark: 'Excellent' };
  if (percentage >= 70) return { grade: 'B', remark: 'Good' };
  if (percentage >= 60) return { grade: 'C', remark: 'Average' };
  if (percentage >= 50) return { grade: 'D', remark: 'Below Average' };
  return { grade: 'E', remark: 'Poor' };
};

export const mapCBCRating = (percentage) => {
  if (percentage >= 75) return 'EXCEEDING';
  if (percentage >= 50) return 'MEETING';
  if (percentage >= 25) return 'APPROACHING';
  return 'BELOW';
};

export const sanitizeObject = (obj, allowedFields) => {
  const sanitized = {};
  for (const field of allowedFields) {
    if (obj[field] !== undefined) {
      sanitized[field] = obj[field];
    }
  }
  return sanitized;
};

export const paginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization', 'refreshToken'];

export const redactSensitiveFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveFields(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
};

