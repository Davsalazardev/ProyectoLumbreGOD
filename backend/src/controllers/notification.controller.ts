import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

/**
 * Notification Controller
 */
export class NotificationController {
  /**
   * GET /notifications
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await notificationService.getUserNotifications(userId, skip, take, unreadOnly);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /notifications/unread-count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /notifications/:notificationId/read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(notificationId);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      await notificationService.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /notifications/:notificationId
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId);
      res.json({ message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const notificationController = new NotificationController();
