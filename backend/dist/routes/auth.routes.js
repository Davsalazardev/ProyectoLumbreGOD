"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (req, res) => auth_controller_1.authController.register(req, res));
router.post('/login', (req, res) => auth_controller_1.authController.login(req, res));
// Protected routes
router.post('/refresh', (req, res) => auth_controller_1.authController.refreshToken(req, res));
router.get('/me', auth_middleware_1.authMiddleware, (req, res) => auth_controller_1.authController.getCurrentUser(req, res));
router.put('/profile', auth_middleware_1.authMiddleware, (req, res) => auth_controller_1.authController.updateProfile(req, res));
router.post('/change-password', auth_middleware_1.authMiddleware, (req, res) => auth_controller_1.authController.changePassword(req, res));
// Admin routes
router.get('/users', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (req, res) => auth_controller_1.authController.listUsers(req, res));
router.put('/users/:userId/role', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (req, res) => auth_controller_1.authController.updateUserRole(req, res));
router.delete('/users/:userId', auth_middleware_1.authMiddleware, (req, res) => auth_controller_1.authController.deleteUser(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map