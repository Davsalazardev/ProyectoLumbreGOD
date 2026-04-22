import { Request, Response } from 'express';
/**
 * Report Controller
 */
export declare class ReportController {
    /**
     * GET /reports/project/:projectId/compliance
     */
    generateComplianceReport(req: Request, res: Response): Promise<void>;
    /**
     * GET /reports/project/:projectId/security-review
     */
    generateSecurityReview(req: Request, res: Response): Promise<void>;
    /**
     * GET /reports/project/:projectId/pdf
     */
    generatePDFReport(req: Request, res: Response): Promise<void>;
    /**
     * GET /reports/project/:projectId
     */
    getProjectReports(req: Request, res: Response): Promise<void>;
    /**
     * GET /reports/:reportId/export
     */
    exportReport(req: Request, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map