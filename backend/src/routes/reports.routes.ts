import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { customRulesController, issueCommentController } from '../controllers/customRules.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Report routes
router.get('/project/:projectId/compliance', (req, res) => reportController.generateComplianceReport(req, res));
router.get('/project/:projectId/security-review', (req, res) => reportController.generateSecurityReview(req, res));
router.get('/project/:projectId/pdf', (req, res) => reportController.generatePDFReport(req, res));
router.get('/project/:projectId', (req, res) => reportController.getProjectReports(req, res));
router.get('/:reportId/export', (req, res) => reportController.exportReport(req, res));

// Custom rules routes
router.post('/custom-rules/:projectId', (req, res) => customRulesController.createRule(req, res));
router.get('/custom-rules/:projectId', (req, res) => customRulesController.getProjectRules(req, res));
router.put('/custom-rules/:ruleId', (req, res) => customRulesController.updateRule(req, res));
router.delete('/custom-rules/:ruleId', (req, res) => customRulesController.deleteRule(req, res));
router.patch('/custom-rules/:ruleId/toggle', (req, res) => customRulesController.toggleRule(req, res));
router.post('/custom-rules/:projectId/clone/:sourceProjectId', (req, res) => customRulesController.cloneRules(req, res));

// Issue comment routes
router.post('/issues/:issueId/comments', (req, res) => issueCommentController.addComment(req, res));
router.get('/issues/:issueId/comments', (req, res) => issueCommentController.getIssueComments(req, res));
router.put('/comments/:commentId', (req, res) => issueCommentController.updateComment(req, res));
router.delete('/comments/:commentId', (req, res) => issueCommentController.deleteComment(req, res));
router.post('/issues/:issueId/mark-fixed', (req, res) => issueCommentController.markAsFixed(req, res));
router.post('/issues/:issueId/mark-wont-fix', (req, res) => issueCommentController.markAsWontFix(req, res));
router.post('/issues/:issueId/mark-false-positive', (req, res) => issueCommentController.markAsFalsePositive(req, res));

export default router;
