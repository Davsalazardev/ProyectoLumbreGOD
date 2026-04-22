/**
 * Email and in-app notification service
 */
export declare class NotificationService {
    private transporter;
    constructor();
    private initializeEmailTransport;
    /**
     * Send email notification
     */
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    /**
     * Create in-app notification
     */
    createNotification(userId: string, projectId: string, type: string, message: string): Promise<{
        id: string;
        type: string;
        message: string;
        read: boolean;
        createdAt: Date;
        userId: string;
        projectId: string;
    }>;
    /**
     * Notify on analysis complete
     */
    notifyAnalysisComplete(projectId: string, analysisId: string, metrics: any): Promise<void>;
    /**
     * Notify on quality gate failure
     */
    notifyQualityGateFailed(projectId: string, failedConditions: string[]): Promise<void>;
    /**
     * Notify on critical issue found
     */
    notifyCriticalIssue(projectId: string, issue: any): Promise<void>;
    /**
     * Get user notifications
     */
    getUserNotifications(userId: string, skip?: number, take?: number, unreadOnly?: boolean): Promise<{
        id: string;
        type: string;
        message: string;
        read: boolean;
        createdAt: Date;
        userId: string;
        projectId: string;
    }[]>;
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): Promise<{
        id: string;
        type: string;
        message: string;
        read: boolean;
        createdAt: Date;
        userId: string;
        projectId: string;
    }>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Delete notification
     */
    deleteNotification(notificationId: string): Promise<{
        id: string;
        type: string;
        message: string;
        read: boolean;
        createdAt: Date;
        userId: string;
        projectId: string;
    }>;
    /**
     * Get unread count
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Send weekly digest
     */
    sendWeeklyDigest(userId: string): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map