/**
 * Issue Comments Service
 * Allows users to comment on and discuss issues
 */
export declare class IssueCommentService {
    /**
     * Add comment to issue
     */
    addComment(issueId: string, userId: string, text: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
    /**
     * Get issue comments
     */
    getIssueComments(issueId: string): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    })[]>;
    /**
     * Update comment
     */
    updateComment(commentId: string, userId: string, text: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
    /**
     * Delete comment
     */
    deleteComment(commentId: string, userId: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
    /**
     * Add resolution comment and mark as fixed
     */
    resolveIssue(issueId: string, userId: string, comment: string, resolution: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
    /**
     * Get comment count for issue
     */
    getCommentCount(issueId: string): Promise<number>;
    /**
     * Get all comments for analysis
     */
    getAnalysisComments(analysisId: string): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
        };
        issue: {
            id: string;
            message: string;
            file: string;
            line: number;
        };
    } & {
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    })[]>;
    /**
     * Mark issue as wont fix with comment
     */
    markWontFix(issueId: string, userId: string, reason: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
    /**
     * Mark issue as false positive with comment
     */
    markFalsePositive(issueId: string, userId: string, reason: string): Promise<{
        text: string;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        issueId: string;
    }>;
}
export declare const issueCommentService: IssueCommentService;
//# sourceMappingURL=issueComment.service.d.ts.map