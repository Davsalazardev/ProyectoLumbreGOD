"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/', (req, res) => notification_controller_1.notificationController.getNotifications(req, res));
router.get('/unread-count', (req, res) => notification_controller_1.notificationController.getUnreadCount(req, res));
router.put('/:notificationId/read', (req, res) => notification_controller_1.notificationController.markAsRead(req, res));
router.put('/read-all', (req, res) => notification_controller_1.notificationController.markAllAsRead(req, res));
router.delete('/:notificationId', (req, res) => notification_controller_1.notificationController.deleteNotification(req, res));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map