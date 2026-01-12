import * as communicationService from './communication.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await communicationService.createAnnouncement(req.body);
    sendCreated(res, announcement, 'Announcement created');
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const { announcements, meta } = await communicationService.getAnnouncements(req.query);
    sendPaginated(res, announcements, meta);
  } catch (error) {
    next(error);
  }
};

export const publishAnnouncement = async (req, res, next) => {
  try {
    const announcement = await communicationService.publishAnnouncement(req.params.id);
    sendSuccess(res, announcement, 'Announcement published');
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await communicationService.deleteAnnouncement(req.params.id);
    sendSuccess(res, null, 'Announcement deleted');
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, subject, content } = req.body;
    const message = await communicationService.sendMessage(req.user.id, receiverId, subject, content);
    sendCreated(res, message, 'Message sent');
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (req, res, next) => {
  try {
    const { messages, meta } = await communicationService.getInbox(req.user.id, req.query);
    sendPaginated(res, messages, meta);
  } catch (error) {
    next(error);
  }
};

export const getSentMessages = async (req, res, next) => {
  try {
    const { messages, meta } = await communicationService.getSentMessages(req.user.id, req.query);
    sendPaginated(res, messages, meta);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const message = await communicationService.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, message, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await communicationService.getUnreadCount(req.user.id);
    sendSuccess(res, { unreadCount: count });
  } catch (error) {
    next(error);
  }
};
