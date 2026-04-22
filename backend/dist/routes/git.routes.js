"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const git_controller_1 = require("../controllers/git.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.post('/clone', (req, res) => git_controller_1.gitController.cloneRepository(req, res));
router.get('/branches/:projectId', (req, res) => git_controller_1.gitController.getBranches(req, res));
router.post('/checkout', (req, res) => git_controller_1.gitController.checkoutBranch(req, res));
router.get('/commits/:projectId', (req, res) => git_controller_1.gitController.getCommitHistory(req, res));
router.post('/pull-requests', (req, res) => git_controller_1.gitController.getPullRequests(req, res));
router.post('/analyze-pr', (req, res) => git_controller_1.gitController.analyzePullRequest(req, res));
router.post('/cleanup', (req, res) => git_controller_1.gitController.cleanupRepository(req, res));
exports.default = router;
//# sourceMappingURL=git.routes.js.map