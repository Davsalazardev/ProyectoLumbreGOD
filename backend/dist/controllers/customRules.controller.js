"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCommentController = exports.customRulesController = exports.IssueCommentController = exports.CustomRulesController = void 0;
const customRules_service_1 = require("../services/customRules.service");
const issueComment_service_1 = require("../services/issueComment.service");
/**
 * Custom Rules Controller
 */
class CustomRulesController {
    /**
     * POST /custom-rules/:projectId
     */
    async createRule(req, res) {
        try {
            const { projectId } = req.params;
            const { name, pattern, severity, type, language } = req.body;
            if (!name || !pattern || !language) {
                return res.status(400).json({ error: 'Name, pattern, and language are required' });
            }
            // Validate pattern
            const validation = customRules_service_1.customRulesService.validatePattern(pattern);
            if (!validation.valid) {
                return res.status(400).json({ error: `Invalid regex pattern: ${validation.error}` });
            }
            const rule = await customRules_service_1.customRulesService.createRule(projectId, {
                name,
                pattern,
                severity: severity || 'MINOR',
                type: type || 'CODE_SMELL',
                language
            });
            res.status(201).json(rule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /custom-rules/:projectId
     */
    async getProjectRules(req, res) {
        try {
            const { projectId } = req.params;
            const language = req.query.language || undefined;
            const rules = await customRules_service_1.customRulesService.getProjectRules(projectId, language);
            res.json(rules);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /custom-rules/:ruleId
     */
    async updateRule(req, res) {
        try {
            const { ruleId } = req.params;
            const { name, pattern, severity, type, enabled } = req.body;
            if (pattern) {
                const validation = customRules_service_1.customRulesService.validatePattern(pattern);
                if (!validation.valid) {
                    return res.status(400).json({ error: `Invalid regex pattern: ${validation.error}` });
                }
            }
            const updatedRule = await customRules_service_1.customRulesService.updateRule(ruleId, {
                name,
                pattern,
                severity,
                type,
                enabled
            });
            res.json(updatedRule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * DELETE /custom-rules/:ruleId
     */
    async deleteRule(req, res) {
        try {
            const { ruleId } = req.params;
            await customRules_service_1.customRulesService.deleteRule(ruleId);
            res.json({ message: 'Rule deleted' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PATCH /custom-rules/:ruleId/toggle
     */
    async toggleRule(req, res) {
        try {
            const { ruleId } = req.params;
            const rule = await customRules_service_1.customRulesService.toggleRule(ruleId);
            res.json(rule);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /custom-rules/:projectId/clone/:sourceProjectId
     */
    async cloneRules(req, res) {
        try {
            const { projectId, sourceProjectId } = req.params;
            const cloned = await customRules_service_1.customRulesService.cloneRules(sourceProjectId, projectId);
            res.status(201).json(cloned);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CustomRulesController = CustomRulesController;
/**
 * Issue Comments Controller
 */
class IssueCommentController {
    /**
     * POST /issues/:issueId/comments
     */
    async addComment(req, res) {
        try {
            const { issueId } = req.params;
            const { text } = req.body;
            const userId = req.userId;
            if (!text) {
                return res.status(400).json({ error: 'Comment text is required' });
            }
            const comment = await issueComment_service_1.issueCommentService.addComment(issueId, userId, text);
            res.status(201).json(comment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /issues/:issueId/comments
     */
    async getIssueComments(req, res) {
        try {
            const { issueId } = req.params;
            const comments = await issueComment_service_1.issueCommentService.getIssueComments(issueId);
            res.json(comments);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * PUT /comments/:commentId
     */
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { text } = req.body;
            const userId = req.userId;
            if (!text) {
                return res.status(400).json({ error: 'Comment text is required' });
            }
            const updated = await issueComment_service_1.issueCommentService.updateComment(commentId, userId, text);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * DELETE /comments/:commentId
     */
    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.userId;
            await issueComment_service_1.issueCommentService.deleteComment(commentId, userId);
            res.json({ message: 'Comment deleted' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * POST /issues/:issueId/mark-fixed
     */
    async markAsFixed(req, res) {
        try {
            const { issueId } = req.params;
            const { comment } = req.body;
            const userId = req.userId;
            const result = await issueComment_service_1.issueCommentService.resolveIssue(issueId, userId, comment || 'Fixed', 'FIXED');
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /issues/:issueId/mark-wont-fix
     */
    async markAsWontFix(req, res) {
        try {
            const { issueId } = req.params;
            const { reason } = req.body;
            const userId = req.userId;
            const result = await issueComment_service_1.issueCommentService.markWontFix(issueId, userId, reason || 'Not applicable');
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /issues/:issueId/mark-false-positive
     */
    async markAsFalsePositive(req, res) {
        try {
            const { issueId } = req.params;
            const { reason } = req.body;
            const userId = req.userId;
            const result = await issueComment_service_1.issueCommentService.markFalsePositive(issueId, userId, reason || 'False positive');
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.IssueCommentController = IssueCommentController;
exports.customRulesController = new CustomRulesController();
exports.issueCommentController = new IssueCommentController();
//# sourceMappingURL=customRules.controller.js.map