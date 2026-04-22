"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
/**
 * Notification Controller
 */
class NotificationController {
    /**
     * GET /notifications
     */
    async getNotifications(req, res) {
        try {
            const userId = req.userId;
            const skip = parseInt(req.query.skip) || 0;
            const take = parseInt(req.query.take) || 20;
            const unreadOnly = req.query.unreadOnly === 'true';
            const notifications = await notification_service_1.notificationService.getUserNotifications(userId, skip, take, unreadOnly);
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /notifications/unread-count
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.userId;
            const count = await notification_service_1.notificationService.getUnreadCount(userId);
            res.json({ count });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /notifications/:notificationId/read
     */
    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notification_service_1.notificationService.markAsRead(notificationId);
            res.json(notification);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /notifications/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.userId;
            await notification_service_1.notificationService.markAllAsRead(userId);
            res.json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * DELETE /notifications/:notificationId
     */
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            await notification_service_1.notificationService.deleteNotification(notificationId);
            res.json({ message: 'Notification deleted' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map