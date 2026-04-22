import { Request, Response } from 'express';
/**
 * Custom Rules Controller
 */
export declare class CustomRulesController {
    /**
     * POST /custom-rules/:projectId
     */
    createRule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /custom-rules/:projectId
     */
    getProjectRules(req: Request, res: Response): Promise<void>;
    /**
     * PUT /custom-rules/:ruleId
     */
    updateRule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * DELETE /custom-rules/:ruleId
     */
    deleteRule(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /custom-rules/:ruleId/toggle
     */
    toggleRule(req: Request, res: Response): Promise<void>;
    /**
     * POST /custom-rules/:projectId/clone/:sourceProjectId
     */
    cloneRules(req: Request, res: Response): Promise<void>;
}
/**
 * Issue Comments Controller
 */
export declare class IssueCommentController {
    /**
     * POST /issues/:issueId/comments
     */
    addComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /issues/:issueId/comments
     */
    getIssueComments(req: Request, res: Response): Promise<void>;
    /**
     * PUT /comments/:commentId
     */
    updateComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * DELETE /comments/:commentId
     */
    deleteComment(req: Request, res: Response): Promise<void>;
    /**
     * POST /issues/:issueId/mark-fixed
     */
    markAsFixed(req: Request, res: Response): Promise<void>;
    /**
     * POST /issues/:issueId/mark-wont-fix
     */
    markAsWontFix(req: Request, res: Response): Promise<void>;
    /**
     * POST /issues/:issueId/mark-false-positive
     */
    markAsFalsePositive(req: Request, res: Response): Promise<void>;
}
export declare const customRulesController: CustomRulesController;
export declare const issueCommentController: IssueCommentController;
//# sourceMappingURL=customRules.controller.d.ts.map