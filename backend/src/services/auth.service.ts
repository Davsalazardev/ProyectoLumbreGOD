import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string, role: string = 'ANALYST') {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh token
   */
  refreshToken(token: string): string {
    const decoded = this.verifyToken(token);
    return this.generateToken(decoded.id, decoded.email, decoded.role);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role } as AuthPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true }
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true };
  }

  /**
   * Delete user (only ADMIN or self)
   */
  async deleteUser(requestingUserId: string, targetUserId: string, requestingUserRole: string) {
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== targetUserId) {
      throw new Error('Unauthorized');
    }

    await prisma.user.delete({ where: { id: targetUserId } });
    return { success: true };
  }

  /**
   * List all users (ADMIN only)
   */
  async listUsers(requestingUserRole: string, skip = 0, take = 20) {
    if (requestingUserRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      skip,
      take
    });
  }

  /**
   * Update user role (ADMIN only)
   */
  async updateUserRole(requestingUserRole: string, userId: string, newRole: string) {
    if (requestingUserRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, role: true }
    });
  }
}

export const authService = new AuthService();
