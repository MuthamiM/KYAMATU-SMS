import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import config from '../../config/index.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../../utils/errors.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  
  return { accessToken, refreshToken };
};

const parseExpiry = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return value * multipliers[unit];
};

export const register = async (data) => {
  const { email, phone, password, role = 'STUDENT' } = data;
  
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });
  
  if (existingUser) {
    throw new ConflictError('User with this email or phone already exists');
  }
  
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);
  
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  
  const tokens = generateTokens(user.id);
  
  const expiryMs = parseExpiry(config.jwt.refreshExpiresIn);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + expiryMs),
    },
  });
  
  return { user, ...tokens };
};

export const login = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        isActive: true,
      },
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    const tokens = generateTokens(user.id);
    
    const expiryMs = parseExpiry(config.jwt.refreshExpiresIn);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + expiryMs),
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, ...tokens };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
    
    if (!storedToken.user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }
    
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    
    const tokens = generateTokens(decoded.userId);
    
    const expiryMs = parseExpiry(config.jwt.refreshExpiresIn);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + expiryMs),
      },
    });
    
    return tokens;
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError('Invalid refresh token');
  }
};

export const logout = async (refreshToken) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const logoutAll = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  
  if (!isValidPassword) {
    throw new AuthenticationError('Current password is incorrect');
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.rounds);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          class: {
            select: {
              id: true,
              name: true,
              grade: { select: { name: true } },
              stream: { select: { name: true } },
            },
          },
        },
      },
      staff: {
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          qualification: true,
          specialization: true,
        },
      },
      guardian: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          relationship: true,
          students: {
            select: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  admissionNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  return user;
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staff: true, student: true },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Update phone if provided
  if (data.phone) {
    await prisma.user.update({
      where: { id: userId },
      data: { phone: data.phone },
    });
  }

  // Update staff profile if user is staff
  if (user.staff && (data.firstName || data.lastName || data.qualification || data.specialization)) {
    await prisma.staff.update({
      where: { id: user.staff.id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.qualification && { qualification: data.qualification }),
        ...(data.specialization && { specialization: data.specialization }),
      },
    });
  }

  // Update student profile if user is student
  if (user.student && (data.firstName || data.lastName)) {
    await prisma.student.update({
      where: { id: user.student.id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
      },
    });
  }

  // Return updated profile
  return getProfile(userId);
};
