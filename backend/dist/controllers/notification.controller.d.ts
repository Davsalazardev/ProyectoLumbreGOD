import { Request, Response } from 'express';
/**
 * Notification Controller
 */
export declare class NotificationController {
    /**
     * GET /notifications
     */
    getNotifications(req: Request, res: Response): Promise<void>;
    /**
     * GET /notifications/unread-count
     */
    getUnreadCount(req: Request, res: Response): Promise<void>;
    /**
     * PUT /notifications/:notificationId/read
     */
    markAsRead(req: Request, res: Response): Promise<void>;
    /**
     * PUT /notifications/read-all
     */
    markAllAsRead(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /notifications/:notificationId
     */
    deleteNotification(req: Request, res: Response): Promise<void>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map