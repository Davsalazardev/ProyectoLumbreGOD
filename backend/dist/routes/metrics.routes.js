"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metrics_controller_1 = require("../controllers/metrics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/project/:projectId', (req, res) => metrics_controller_1.metricsController.getProjectMetrics(req, res));
router.get('/project/:projectId/report', (req, res) => metrics_controller_1.metricsController.getQualityReport(req, res));
router.post('/project/:projectId/compare', (req, res) => metrics_controller_1.metricsController.compareAnalyses(req, res));
router.post('/calculate/complexity', (req, res) => metrics_controller_1.metricsController.calculateComplexity(req, res));
router.post('/calculate/maintainability', (req, res) => metrics_controller_1.metricsController.calculateMaintainability(req, res));
router.get('/ratings/security/:vulnerabilityCount', (req, res) => metrics_controller_1.metricsController.getSecurityRating(req, res));
router.get('/ratings/reliability/:bugCount', (req, res) => metrics_controller_1.metricsController.getReliabilityRating(req, res));
exports.default = router;
//# sourceMappingURL=metrics.routes.js.map