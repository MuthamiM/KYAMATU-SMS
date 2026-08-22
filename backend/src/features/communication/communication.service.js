import prisma from '../../config/database.js';
import { paginationMeta } from '../../utils/helpers.js';

export const createAnnouncement = async (data) => {
  const announcement = await prisma.announcement.create({ data });
  return announcement;
};

export const getAnnouncements = async (filters = {}) => {
  const { targetRole, isPublished } = filters;
  const pageNum = parseInt(filters.page, 10) || 1;
  const limitNum = parseInt(filters.limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (isPublished !== undefined) where.isPublished = isPublished === 'true';
  if (targetRole) where.targetRoles = { has: targetRole };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, meta: paginationMeta(total, pageNum, limitNum) };
};

export const publishAnnouncement = async (id) => {
  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  return announcement;
};

export const deleteAnnouncement = async (id) => {
  await prisma.announcement.delete({ where: { id } });
};

export const sendMessage = async (senderId, receiverId, subject, content) => {
  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      subject,
      content,
    },
    include: {
      sender: { select: { email: true, role: true } },
      receiver: { select: { email: true, role: true } },
    },
  });
  return message;
};

export const getInbox = async (userId, filters = {}) => {
  const { isRead } = filters;
  const pageNum = parseInt(filters.page, 10) || 1;
  const limitNum = parseInt(filters.limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where = { receiverId: userId };
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        sender: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({ where }),
  ]);

  return { messages, meta: paginationMeta(total, pageNum, limitNum) };
};

export const getSentMessages = async (userId, filters = {}) => {
  const pageNum = parseInt(filters.page, 10) || 1;
  const limitNum = parseInt(filters.limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { senderId: userId },
      skip,
      take: limitNum,
      include: {
        receiver: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({ where: { senderId: userId } }),
  ]);

  return { messages, meta: paginationMeta(total, pageNum, limitNum) };
};

export const markAsRead = async (messageId, userId) => {
  const message = await prisma.message.update({
    where: {
      id: messageId,
      receiverId: userId,
    },
    data: { isRead: true },
  });
  return message;
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: { receiverId: userId, isRead: false },
  });
  return count;
};
