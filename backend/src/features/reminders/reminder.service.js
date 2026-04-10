import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import * as integrationsService from '../integrations/integrations.service.js';

export const createReminder = async (data) => {
  const reminder = await prisma.reminder.create({
    data: {
      ...data,
      remindAt: new Date(data.remindAt),
    },
  });

  // Sync to external services
  await integrationsService.syncToExternalServices(data.studentId, reminder);

  return reminder;
};

export const getStudentReminders = async (studentId) => {
  const reminders = await prisma.reminder.findMany({
    where: { studentId },
    orderBy: { remindAt: 'asc' },
  });
  return reminders;
};

export const updateReminder = async (id, data) => {
  if (data.remindAt) data.remindAt = new Date(data.remindAt);
  
  const reminder = await prisma.reminder.update({
    where: { id },
    data,
  });
  return reminder;
};

export const deleteReminder = async (id) => {
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (reminder) {
    await integrationsService.deleteFromExternalServices(reminder.studentId, reminder);
  }
  await prisma.reminder.delete({
    where: { id },
  });
};

export const markCompleted = async (id, isCompleted = true) => {
  const reminder = await prisma.reminder.update({
    where: { id },
    data: { isCompleted },
  });

  await integrationsService.updateExternalStatus(reminder.studentId, reminder);

  return reminder;
};
