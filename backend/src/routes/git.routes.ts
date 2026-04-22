import { Router } from 'express';
import { gitController } from '../controllers/git.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/clone', (req, res) => gitController.cloneRepository(req, res));
router.get('/branches/:projectId', (req, res) => gitController.getBranches(req, res));
router.post('/checkout', (req, res) => gitController.checkoutBranch(req, res));
router.get('/commits/:projectId', (req, res) => gitController.getCommitHistory(req, res));
router.post('/pull-requests', (req, res) => gitController.getPullRequests(req, res));
router.post('/analyze-pr', (req, res) => gitController.analyzePullRequest(req, res));
router.post('/cleanup', (req, res) => gitController.cleanupRepository(req, res));

export default router;
