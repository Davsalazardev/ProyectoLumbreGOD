"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const customRules_controller_1 = require("../controllers/customRules.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Report routes
router.get('/project/:projectId/compliance', (req, res) => report_controller_1.reportController.generateComplianceReport(req, res));
router.get('/project/:projectId/security-review', (req, res) => report_controller_1.reportController.generateSecurityReview(req, res));
router.get('/project/:projectId/pdf', (req, res) => report_controller_1.reportController.generatePDFReport(req, res));
router.get('/project/:projectId', (req, res) => report_controller_1.reportController.getProjectReports(req, res));
router.get('/:reportId/export', (req, res) => report_controller_1.reportController.exportReport(req, res));
// Custom rules routes
router.post('/custom-rules/:projectId', (req, res) => customRules_controller_1.customRulesController.createRule(req, res));
router.get('/custom-rules/:projectId', (req, res) => customRules_controller_1.customRulesController.getProjectRules(req, res));
router.put('/custom-rules/:ruleId', (req, res) => customRules_controller_1.customRulesController.updateRule(req, res));
router.delete('/custom-rules/:ruleId', (req, res) => customRules_controller_1.customRulesController.deleteRule(req, res));
router.patch('/custom-rules/:ruleId/toggle', (req, res) => customRules_controller_1.customRulesController.toggleRule(req, res));
router.post('/custom-rules/:projectId/clone/:sourceProjectId', (req, res) => customRules_controller_1.customRulesController.cloneRules(req, res));
// Issue comment routes
router.post('/issues/:issueId/comments', (req, res) => customRules_controller_1.issueCommentController.addComment(req, res));
router.get('/issues/:issueId/comments', (req, res) => customRules_controller_1.issueCommentController.getIssueComments(req, res));
router.put('/comments/:commentId', (req, res) => customRules_controller_1.issueCommentController.updateComment(req, res));
router.delete('/comments/:commentId', (req, res) => customRules_controller_1.issueCommentController.deleteComment(req, res));
router.post('/issues/:issueId/mark-fixed', (req, res) => customRules_controller_1.issueCommentController.markAsFixed(req, res));
router.post('/issues/:issueId/mark-wont-fix', (req, res) => customRules_controller_1.issueCommentController.markAsWontFix(req, res));
router.post('/issues/:issueId/mark-false-positive', (req, res) => customRules_controller_1.issueCommentController.markAsFalsePositive(req, res));
exports.default = router;
//# sourceMappingURL=reports.routes.js.map