import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/project/:projectId', (req, res) => metricsController.getProjectMetrics(req, res));
router.get('/project/:projectId/report', (req, res) => metricsController.getQualityReport(req, res));
router.post('/project/:projectId/compare', (req, res) => metricsController.compareAnalyses(req, res));

router.post('/calculate/complexity', (req, res) => metricsController.calculateComplexity(req, res));
router.post('/calculate/maintainability', (req, res) => metricsController.calculateMaintainability(req, res));

router.get('/ratings/security/:vulnerabilityCount', (req, res) => metricsController.getSecurityRating(req, res));
router.get('/ratings/reliability/:bugCount', (req, res) => metricsController.getReliabilityRating(req, res));

export default router;
