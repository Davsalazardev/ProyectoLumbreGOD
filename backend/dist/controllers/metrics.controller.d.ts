import { Request, Response } from 'express';
/**
 * Metrics Controller - Advanced metric calculations and reporting
 */
export declare class MetricsController {
    /**
     * GET /metrics/project/:projectId
     */
    getProjectMetrics(req: Request, res: Response): Promise<void>;
    /**
     * GET /metrics/project/:projectId/report
     */
    getQualityReport(req: Request, res: Response): Promise<void>;
    /**
     * POST /metrics/project/:projectId/compare
     */
    compareAnalyses(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /metrics/calculate/complexity
     */
    calculateComplexity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /metrics/calculate/maintainability
     */
    calculateMaintainability(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /metrics/ratings/security/:vulnerabilityCount
     */
    getSecurityRating(req: Request, res: Response): Promise<void>;
    /**
     * GET /metrics/ratings/reliability/:bugCount
     */
    getReliabilityRating(req: Request, res: Response): Promise<void>;
}
export declare const metricsController: MetricsController;
//# sourceMappingURL=metrics.controller.d.ts.map