import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Protected routes
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
router.put('/profile', authMiddleware, (req, res) => authController.updateProfile(req, res));
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));

// Admin routes
router.get('/users', authMiddleware, adminMiddleware, (req, res) => authController.listUsers(req, res));
router.put('/users/:userId/role', authMiddleware, adminMiddleware, (req, res) => authController.updateUserRole(req, res));
router.delete('/users/:userId', authMiddleware, (req, res) => authController.deleteUser(req, res));

export default router;
