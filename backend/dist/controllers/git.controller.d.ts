import { Request, Response } from 'express';
/**
 * Git Integration Controller (API-based, no local cloning)
 */
export declare class GitController {
    /**
     * POST /git/clone
     * NOW: Import repository metadata from GitHub (no local cloning)
     */
    cloneRepository(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /git/branches/:projectId
     */
    getBranches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /git/checkout
     * Not needed - no local files are checked out
     */
    checkoutBranch(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /git/commits/:projectId
     */
    getCommitHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /git/pull-requests
     */
    getPullRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /git/analyze-pr
     * Now uses GitHub API instead of local file analysis
     */
    analyzePullRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /git/cleanup
     * Not needed anymore - no local files are stored
     */
    cleanupRepository(req: Request, res: Response): Promise<void>;
}
export declare const gitController: GitController;
//# sourceMappingURL=git.controller.d.ts.map