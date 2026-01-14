import logger from '../config/logger.js';
import config from '../config/index.js';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  const errorLog = {
    requestId: req.id,
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    code: err.code,
  };

  if (config.env === 'development') {
    errorLog.stack = err.stack;
  }

  logger.error(errorLog);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors || undefined,
      requestId: req.id,
    });
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      code: 'UNIQUE_CONSTRAINT',
      requestId: req.id,
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
      code: 'NOT_FOUND',
      requestId: req.id,
    });
  }
  
  const statusCode = err.statusCode || 500;
  const message = err.message; // Temporarily exposing for debugging
  
  return res.status(statusCode).json({
    success: false,
    message,
    code: 'SERVER_ERROR',
    requestId: req.id,
  });
};

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
    requestId: req.id,
  });
};

