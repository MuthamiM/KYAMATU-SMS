import * as reminderService from './reminder.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AuthorizationError } from '../../utils/errors.js';

export const createReminder = async (req, res, next) => {
  try {
    const studentId = req.user.student?.id;
    if (!studentId) {
      throw new AuthorizationError('Only students can create reminders');
    }

    const reminder = await reminderService.createReminder({
      ...req.body,
      studentId,
    });
    sendCreated(res, reminder, 'Reminder created successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyReminders = async (req, res, next) => {
  try {
    const studentId = req.user.student?.id;
    if (!studentId) {
      throw new AuthorizationError('Only students can access their reminders');
    }

    const reminders = await reminderService.getStudentReminders(studentId);
    sendSuccess(res, reminders);
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req, res, next) => {
  try {
    const reminder = await reminderService.updateReminder(req.params.id, req.body);
    sendSuccess(res, reminder, 'Reminder updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req, res, next) => {
  try {
    await reminderService.deleteReminder(req.params.id);
    sendSuccess(res, null, 'Reminder deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const markCompleted = async (req, res, next) => {
  try {
    const reminder = await reminderService.markCompleted(req.params.id, req.body.isCompleted);
    sendSuccess(res, reminder, 'Reminder status updated');
  } catch (error) {
    next(error);
  }
};
