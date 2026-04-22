"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsController = exports.MetricsController = void 0;
const metrics_service_1 = require("../services/metrics.service");
/**
 * Metrics Controller - Advanced metric calculations and reporting
 */
class MetricsController {
    /**
     * GET /metrics/project/:projectId
     */
    async getProjectMetrics(req, res) {
        try {
            const { projectId } = req.params;
            const history = await metrics_service_1.metricsService.getProjectMetricsHistory(projectId, 10);
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /metrics/project/:projectId/report
     */
    async getQualityReport(req, res) {
        try {
            const { projectId } = req.params;
            const report = await metrics_service_1.metricsService.generateQualityReport(projectId);
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /metrics/project/:projectId/compare
     */
    async compareAnalyses(req, res) {
        try {
            const { projectId } = req.params;
            const { analysisId1, analysisId2 } = req.body;
            if (!analysisId1 || !analysisId2) {
                return res.status(400).json({ error: 'Both analysis IDs are required' });
            }
            const comparison = await metrics_service_1.metricsService.compareAnalyses(analysisId1, analysisId2);
            res.json(comparison);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /metrics/calculate/complexity
     */
    async calculateComplexity(req, res) {
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ error: 'Code is required' });
            }
            const complexity = metrics_service_1.metricsService.calculateCyclomaticComplexity(code);
            res.json({ complexity });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /metrics/calculate/maintainability
     */
    async calculateMaintainability(req, res) {
        try {
            const { loc, complexity, bugs, codeSmells } = req.body;
            if (loc === undefined || complexity === undefined || bugs === undefined || codeSmells === undefined) {
                return res.status(400).json({ error: 'All parameters required' });
            }
            const index = metrics_service_1.metricsService.calculateMaintainabilityIndex(loc, complexity, bugs, codeSmells);
            res.json({ maintainabilityIndex: index });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /metrics/ratings/security/:vulnerabilityCount
     */
    async getSecurityRating(req, res) {
        try {
            const count = parseInt(req.params.vulnerabilityCount);
            const rating = metrics_service_1.metricsService.calculateSecurityRating(count);
            res.json({ rating });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /metrics/ratings/reliability/:bugCount
     */
    async getReliabilityRating(req, res) {
        try {
            const count = parseInt(req.params.bugCount);
            const rating = metrics_service_1.metricsService.calculateReliabilityRating(count);
            res.json({ rating });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MetricsController = MetricsController;
exports.metricsController = new MetricsController();
//# sourceMappingURL=metrics.controller.js.map