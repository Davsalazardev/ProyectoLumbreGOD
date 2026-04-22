"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    /**
     * Register a new user
     */
    async register(email, password, name, role = 'ANALYST') {
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
    async login(email, password) {
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
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Refresh token
     */
    refreshToken(token) {
        const decoded = this.verifyToken(token);
        return this.generateToken(decoded.id, decoded.email, decoded.role);
    }
    /**
     * Generate JWT token
     */
    generateToken(userId, email, role) {
        return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, data) {
        return prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, name: true, role: true }
        });
    }
    /**
     * Change password
     */
    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid)
            throw new Error('Current password is incorrect');
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
    async deleteUser(requestingUserId, targetUserId, requestingUserRole) {
        if (requestingUserRole !== 'ADMIN' && requestingUserId !== targetUserId) {
            throw new Error('Unauthorized');
        }
        await prisma.user.delete({ where: { id: targetUserId } });
        return { success: true };
    }
    /**
     * List all users (ADMIN only)
     */
    async listUsers(requestingUserRole, skip = 0, take = 20) {
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
    async updateUserRole(requestingUserRole, userId, newRole) {
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
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map