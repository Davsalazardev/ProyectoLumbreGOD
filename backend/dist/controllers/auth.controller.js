"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * Auth Controller - Handles authentication and user management
 */
class AuthController {
    /**
     * POST /auth/register
     */
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password, and name are required' });
            }
            const result = await auth_service_1.authService.register(email, password, name);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * POST /auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const result = await auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    /**
     * POST /auth/refresh
     */
    async refreshToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const newToken = auth_service_1.authService.refreshToken(token);
            res.json({ token: newToken });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    /**
     * GET /auth/me
     */
    async getCurrentUser(req, res) {
        try {
            // This will be populated by auth middleware
            const userId = req.userId;
            const user = await auth_service_1.authService.getUserById(userId);
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /auth/profile
     */
    async updateProfile(req, res) {
        try {
            const userId = req.userId;
            const { name, email } = req.body;
            const updatedUser = await auth_service_1.authService.updateProfile(userId, { name, email });
            res.json(updatedUser);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * POST /auth/change-password
     */
    async changePassword(req, res) {
        try {
            const userId = req.userId;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ error: 'Old and new passwords are required' });
            }
            await auth_service_1.authService.changePassword(userId, oldPassword, newPassword);
            res.json({ message: 'Password changed successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * GET /auth/users (ADMIN only)
     */
    async listUsers(req, res) {
        try {
            const userId = req.userId;
            const role = req.userRole;
            const skip = parseInt(req.query.skip) || 0;
            const take = parseInt(req.query.take) || 20;
            const users = await auth_service_1.authService.listUsers(role, skip, take);
            res.json(users);
        }
        catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
    /**
     * PUT /auth/users/:userId/role (ADMIN only)
     */
    async updateUserRole(req, res) {
        try {
            const role = req.userRole;
            const { userId } = req.params;
            const { newRole } = req.body;
            const updatedUser = await auth_service_1.authService.updateUserRole(role, userId, newRole);
            res.json(updatedUser);
        }
        catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
    /**
     * DELETE /auth/users/:userId
     */
    async deleteUser(req, res) {
        try {
            const userId = req.userId;
            const role = req.userRole;
            const { userId: targetUserId } = req.params;
            await auth_service_1.authService.deleteUser(userId, targetUserId, role);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map