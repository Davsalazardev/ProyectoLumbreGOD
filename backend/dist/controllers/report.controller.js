"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
/**
 * Report Controller
 */
class ReportController {
    /**
     * GET /reports/project/:projectId/compliance
     */
    async generateComplianceReport(req, res) {
        try {
            const { projectId } = req.params;
            const format = req.query.format || 'json';
            const report = await report_service_1.reportService.generateComplianceReport(projectId, format);
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /reports/project/:projectId/security-review
     */
    async generateSecurityReview(req, res) {
        try {
            const { projectId } = req.params;
            const review = await report_service_1.reportService.generateSecurityReview(projectId);
            res.json(review);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /reports/project/:projectId/pdf
     */
    async generatePDFReport(req, res) {
        try {
            const { projectId } = req.params;
            const pdfBuffer = await report_service_1.reportService.generatePDFReport(projectId);
            res.contentType('application/pdf');
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /reports/project/:projectId
     */
    async getProjectReports(req, res) {
        try {
            const { projectId } = req.params;
            const reports = await report_service_1.reportService.getProjectReports(projectId);
            res.json(reports);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * GET /reports/:reportId/export
     */
    async exportReport(req, res) {
        try {
            const { reportId } = req.params;
            const format = req.query.format || 'json';
            const report = await report_service_1.reportService.exportAsJSON(reportId);
            if (format === 'csv') {
                res.contentType('text/csv');
                res.send(JSON.stringify(report, null, 2));
            }
            else {
                res.json(report);
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map