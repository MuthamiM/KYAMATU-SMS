import * as staffService from './staff.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createStaff = async (req, res, next) => {
  try {
    const staff = await staffService.createStaff(req.body);
    sendCreated(res, staff, 'Staff member created successfully');
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const { staff, meta } = await staffService.getStaff(req.query);
    sendPaginated(res, staff, meta);
  } catch (error) {
    next(error);
  }
};

export const getStaffMember = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    sendSuccess(res, staff);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    sendSuccess(res, staff, 'Staff member updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id);
    sendSuccess(res, null, 'Staff member deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignTeacher = async (req, res, next) => {
  try {
    const assignment = await staffService.assignTeacher(req.body);
    sendCreated(res, assignment, 'Teacher assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const removeAssignment = async (req, res, next) => {
  try {
    await staffService.removeTeacherAssignment(req.params.id);
    sendSuccess(res, null, 'Assignment removed');
  } catch (error) {
    next(error);
  }
};

export const getMyClasses = async (req, res, next) => {
  try {
    const classes = await staffService.getTeacherClasses(req.user.staff.id);
    sendSuccess(res, classes);
  } catch (error) {
    next(error);
  }
};
