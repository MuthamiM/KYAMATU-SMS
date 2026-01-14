import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import prisma from './config/database.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { requestId } from './middleware/requestId.js';
import { auditLog } from './middleware/auditLog.js';

import authRoutes from './features/auth/auth.routes.js';
import studentsRoutes from './features/students/students.routes.js';
import staffRoutes from './features/staff/staff.routes.js';
import academicRoutes from './features/academic/academic.routes.js';
import attendanceRoutes from './features/attendance/attendance.routes.js';
import assessmentsRoutes from './features/assessments/assessments.routes.js';
import reportsRoutes from './features/reports/reports.routes.js';
import feesRoutes from './features/fees/fees.routes.js';
import communicationRoutes from './features/communication/communication.routes.js';
import timetableRoutes from './features/academic/timetable.routes.js';

const app = express();

app.use(requestId);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

app.use(cors({
  origin: config.env === 'production' ? config.cors.origin : true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(sanitizeInputs);

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ requestId: req.id, ip: req.ip, path: req.path, message: 'Rate limit exceeded' });
    res.status(429).json({ success: false, message: 'Too many requests, please try again later' });
  },
});

const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn({ requestId: req.id, ip: req.ip, message: 'Auth rate limit exceeded' });
    res.status(429).json({ success: false, message: 'Too many login attempts, please try again later' });
  },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

app.use(auditLog);

// Root routes for health checks and status
app.get('/', (req, res) => {
  res.json({ 
    message: 'KYAMATU-SMS API is running', 
    version: '1.0.0',
    status: 'ok',
    requestId: req.id 
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'KYAMATU-SMS API Base Endpoint',
    docs: '/api/docs', // if any
    health: '/api/health',
    status: 'ok',
    requestId: req.id 
  });
});

app.get('/api/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbLatency = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbLatency = Date.now() - start;
  } catch (e) {
    dbStatus = 'disconnected';
  }

  const memory = process.memoryUsage();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    requestId: req.id,
    dbStatus,
    dbLatency,
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/timetable', timetableRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info({ message: `Server running on port ${PORT}`, env: config.env });
});

export default app;

