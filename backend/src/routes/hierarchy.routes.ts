import { Router } from 'express';
import {
  getFolderHierarchy,
  getIssuesByFolder,
  getIssuesByFile,
  getMetricsTrend
} from '../controllers/hierarchy.controller';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/:projectId/hierarchy', optionalAuthMiddleware, getFolderHierarchy);
router.get('/:projectId/hierarchy/:folder', optionalAuthMiddleware, getIssuesByFolder);
router.get('/:projectId/file/:filePath', optionalAuthMiddleware, getIssuesByFile);
router.get('/:projectId/trend', optionalAuthMiddleware, getMetricsTrend);

export default router;
