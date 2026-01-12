import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import prisma from './config/database.js';


// Routes imports
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

app.use(helmet());

app.use(cors({
  origin: true, // Allow all origins for local development (Laptop + Tablet)
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);



app.get('/api/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbLatency = null;

  try {
    await prisma.$queryRaw`SELECT 1`; // Simple query to check connection
    dbStatus = 'connected';
    dbLatency = Date.now() - start;
  } catch (e) {
    dbStatus = 'disconnected';
  }

  const memory = process.memoryUsage();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbStatus,
    dbLatency,
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
    },
    nodeVersion: process.version,
    env: config.env
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
  logger.info(`Server running on port ${PORT} in ${config.env} mode`);
});

export default app;
