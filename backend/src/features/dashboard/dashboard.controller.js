import * as dashboardService from './dashboard.service.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummaryStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getStudentCharts = async (req, res, next) => {
  try {
    const data = await dashboardService.getStudentGrowth();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFeeCharts = async (req, res, next) => {
  try {
    const collectionTrend = await dashboardService.getFeeCollectionTrends();
    res.json({ success: true, data: { collectionTrend } });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceCharts = async (req, res, next) => {
  try {
    const distribution = await dashboardService.getAttendanceDistribution();
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getStudentDashboardData(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

