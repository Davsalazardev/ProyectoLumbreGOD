import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  analyzeProject,
  analyzeProjectBatch,
  getAnalysisStatus,
  getIssues,
  getMetrics,
  getQualityGateStatus,
  generateBadge,
  resolveIssue,
  importLocalProjects,
  discoverLocalProjects
} from '../controllers/projects.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createProject);
router.get('/', optionalAuthMiddleware, listProjects);
router.get('/discover', discoverLocalProjects);
router.post('/import', authMiddleware, importLocalProjects);
router.get('/:id', optionalAuthMiddleware, getProject);

router.post('/:id/analyze', authMiddleware, analyzeProject);
router.post('/:id/analyze-batch', authMiddleware, analyzeProjectBatch);
router.get('/:id/analyses/:analysisId', optionalAuthMiddleware, getAnalysisStatus);

router.get('/:id/issues', optionalAuthMiddleware, getIssues);
router.patch('/issues/:issueId/resolve', authMiddleware, resolveIssue);

router.get('/:id/metrics', optionalAuthMiddleware, getMetrics);
router.get('/:id/quality-gate', optionalAuthMiddleware, getQualityGateStatus);
router.get('/:id/badge', generateBadge);

export default router;
