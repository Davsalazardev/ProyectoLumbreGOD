import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

/**
 * Auth Controller - Handles authentication and user management
 */
export class AuthController {
  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /auth/refresh
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const newToken = authService.refreshToken(token);
      res.json({ token: newToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * GET /auth/me
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // This will be populated by auth middleware
      const userId = (req as any).userId;
      const user = await authService.getUserById(userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /auth/profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, email } = req.body;

      const updatedUser = await authService.updateProfile(userId, { name, email });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /auth/change-password
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords are required' });
      }

      await authService.changePassword(userId, oldPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /auth/users (ADMIN only)
   */
  async listUsers(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const role = (req as any).userRole;
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;

      const users = await authService.listUsers(role, skip, take);
      res.json(users);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }

  /**
   * PUT /auth/users/:userId/role (ADMIN only)
   */
  async updateUserRole(req: Request, res: Response) {
    try {
      const role = (req as any).userRole;
      const { userId } = req.params;
      const { newRole } = req.body;

      const updatedUser = await authService.updateUserRole(role, userId, newRole);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }

  /**
   * DELETE /auth/users/:userId
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const role = (req as any).userRole;
      const { userId: targetUserId } = req.params;

      await authService.deleteUser(userId, targetUserId, role);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
