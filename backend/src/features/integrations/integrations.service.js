import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import prisma from '../../config/database.js';
import config from '../../config/index.js';

const googleConfig = config.integrations.google;
const microsoftConfig = config.integrations.microsoft;

// Google Auth Helper
const createGoogleAuthClient = () => {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
};

export const getGoogleAuthUrl = () => {
  const client = createGoogleAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent'
  });
};

export const saveGoogleToken = async (studentId, code) => {
  const client = createGoogleAuthClient();
  const { tokens } = await client.getToken(code);
  
  await prisma.student.update({
    where: { id: studentId },
    data: { googleRefreshToken: tokens.refresh_token }
  });
  
  return tokens;
};

// Microsoft Auth Helper
export const getMicrosoftAuthUrl = () => {
  const scopes = ['Tasks.ReadWrite', 'offline_access'];
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${microsoftConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(microsoftConfig.redirectUri)}&response_mode=query&scope=${encodeURIComponent(scopes.join(' '))}`;
  return url;
};

export const saveMicrosoftToken = async (studentId, code) => {
  const params = new URLSearchParams({
    client_id: microsoftConfig.clientId,
    client_secret: microsoftConfig.clientSecret,
    code,
    redirect_uri: microsoftConfig.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error_description || data.error);

  await prisma.student.update({
    where: { id: studentId },
    data: { microsoftRefreshToken: data.refresh_token }
  });

  return data;
};

// Sync Logic
export const syncToExternalServices = async (studentId, reminder) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { googleRefreshToken: true, microsoftRefreshToken: true }
  });

  if (student.googleRefreshToken) {
    await syncToGoogleCalendar(student.googleRefreshToken, reminder);
  }

  if (student.microsoftRefreshToken) {
    await syncToMicrosoftTodo(student.microsoftRefreshToken, reminder);
  }
};

const syncToGoogleCalendar = async (refreshToken, reminder) => {
  try {
    const client = createGoogleAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: client });

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: reminder.title,
        description: reminder.description || 'Kyamatu SMS Reminder',
        start: { dateTime: new Date(reminder.remindAt).toISOString() },
        end: { dateTime: new Date(new Date(reminder.remindAt).getTime() + 30 * 60 * 1000).toISOString() },
      },
    });

    // Save the event ID
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { googleEventId: res.data.id }
    });
  } catch (error) {
    console.error('Google Sync Error:', error.message);
  }
};

const syncToMicrosoftTodo = async (refreshToken, reminder) => {
  try {
    const params = new URLSearchParams({
      client_id: microsoftConfig.clientId,
      client_secret: microsoftConfig.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const tokenData = await tokenRes.json();
    const client = Client.init({
      authProvider: (done) => done(null, tokenData.access_token)
    });

    const res = await client.api('/me/todo/lists/tasks').post({
      title: reminder.title,
      body: { content: reminder.description || 'Kyamatu SMS Reminder', contentType: 'text' },
      dueDateTime: { dateTime: new Date(reminder.remindAt).toISOString(), timeZone: 'UTC' }
    });

    // Save the task ID
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { microsoftTaskId: res.id }
    });
  } catch (error) {
    console.error('Microsoft Sync Error:', error.message);
  }
};

export const deleteFromExternalServices = async (studentId, reminder) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { googleRefreshToken: true, microsoftRefreshToken: true }
  });

  if (student.googleRefreshToken && reminder.googleEventId) {
    try {
      const client = createGoogleAuthClient();
      client.setCredentials({ refresh_token: student.googleRefreshToken });
      const calendar = google.calendar({ version: 'v3', auth: client });
      await calendar.events.delete({ calendarId: 'primary', eventId: reminder.googleEventId });
    } catch (e) { console.error('Google Delete Error:', e.message); }
  }

  if (student.microsoftRefreshToken && reminder.microsoftTaskId) {
    try {
      const params = new URLSearchParams({
        client_id: microsoftConfig.clientId,
        client_secret: microsoftConfig.clientSecret,
        refresh_token: student.microsoftRefreshToken,
        grant_type: 'refresh_token',
      });
      const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const tokenData = await tokenRes.json();
      const client = Client.init({ authProvider: (done) => done(null, tokenData.access_token) });
      await client.api(`/me/todo/lists/tasks/${reminder.microsoftTaskId}`).delete();
    } catch (e) { console.error('Microsoft Delete Error:', e.message); }
  }
};

export const syncHistoricalReminders = async (studentId) => {
  const reminders = await prisma.reminder.findMany({
    where: { studentId, isCompleted: false },
  });

  for (const reminder of reminders) {
    await syncToExternalServices(studentId, reminder);
  }
};

export const updateExternalStatus = async (studentId, reminder) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { microsoftRefreshToken: true }
  });

  if (student.microsoftRefreshToken && reminder.microsoftTaskId) {
    try {
      const params = new URLSearchParams({
        client_id: microsoftConfig.clientId,
        client_secret: microsoftConfig.clientSecret,
        refresh_token: student.microsoftRefreshToken,
        grant_type: 'refresh_token',
      });
      const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const tokenData = await tokenRes.json();
      const client = Client.init({ authProvider: (done) => done(null, tokenData.access_token) });
      
      await client.api(`/me/todo/lists/tasks/${reminder.microsoftTaskId}`).update({
        status: reminder.isCompleted ? 'completed' : 'notStarted'
      });
    } catch (e) { console.error('Microsoft Update Status Error:', e.message); }
  }
};
