import * as authService from './auth.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { clearRateLimit, clearAllRateLimits as clearAllLimits } from '../../config/redis.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    sendSuccess(res, null, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// Admin: Clear rate limit for a specific IP
export const clearRateLimitByIp = async (req, res, next) => {
  try {
    const { ip } = req.params;
    const cleared = await clearRateLimit(ip);
    if (cleared) {
      sendSuccess(res, null, `Rate limit cleared for IP: ${ip}`);
    } else {
      sendSuccess(res, null, 'No rate limit found for this IP or Redis not configured');
    }
  } catch (error) {
    next(error);
  }
};

// Admin: Clear all rate limits
export const clearAllRateLimits = async (req, res, next) => {
  try {
    const cleared = await clearAllLimits();
    if (cleared) {
      sendSuccess(res, null, 'All rate limits cleared');
    } else {
      sendSuccess(res, null, 'No rate limits found or Redis not configured');
    }
  } catch (error) {
    next(error);
  }
};
