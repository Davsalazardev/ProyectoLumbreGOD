"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hierarchy_controller_1 = require("../controllers/hierarchy.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/:projectId/hierarchy', auth_middleware_1.optionalAuthMiddleware, hierarchy_controller_1.getFolderHierarchy);
router.get('/:projectId/hierarchy/:folder', auth_middleware_1.optionalAuthMiddleware, hierarchy_controller_1.getIssuesByFolder);
router.get('/:projectId/file/:filePath', auth_middleware_1.optionalAuthMiddleware, hierarchy_controller_1.getIssuesByFile);
router.get('/:projectId/trend', auth_middleware_1.optionalAuthMiddleware, hierarchy_controller_1.getMetricsTrend);
exports.default = router;
//# sourceMappingURL=hierarchy.routes.js.map