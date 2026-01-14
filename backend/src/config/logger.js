import winston from 'winston';
import config from './index.js';

const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /apikey/i,
  /api_key/i,
];

const redactValue = (key, value) => {
  if (typeof value !== 'string') return value;
  if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
    return '[REDACTED]';
  }
  return value;
};

const redactObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => redactObject(item));
  
  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      redacted[key] = redactObject(value);
    } else {
      redacted[key] = redactValue(key, value);
    }
  }
  return redacted;
};

const secureFormat = winston.format((info) => {
  return redactObject(info);
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    secureFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;

