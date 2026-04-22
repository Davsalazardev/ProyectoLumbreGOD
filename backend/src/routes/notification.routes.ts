import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => notificationController.getNotifications(req, res));
router.get('/unread-count', (req, res) => notificationController.getUnreadCount(req, res));
router.put('/:notificationId/read', (req, res) => notificationController.markAsRead(req, res));
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));
router.delete('/:notificationId', (req, res) => notificationController.deleteNotification(req, res));

export default router;
