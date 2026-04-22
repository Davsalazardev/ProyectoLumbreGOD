/**
 * Team Collaboration Service
 * Code reviews, comments, mentions, discussions, and team interactions
 */
export declare const collaborationService: {
    /**
     * Create a code review thread
     */
    createCodeReview(projectId: string, issueId: string, reviewerId: string, comments: string, codeSnippet?: string): Promise<any>;
    /**
     * Extract @mentions from text
     */
    extractMentions(text: string): string[];
    /**
     * Generate automated review suggestions
     */
    generateReviewSuggestions(comments: string, codeSnippet?: string): string[];
    /**
     * Add inline comment to code
     */
    addInlineComment(issueId: string, lineNumber: number, filePath: string, authorId: string, text: string): Promise<any>;
    /**
     * Create a discussion thread
     */
    createDiscussionThread(projectId: string, title: string, authorId: string, content: string): Promise<any>;
    /**
     * Extract tags from content
     */
    extractTags(text: string): string[];
    /**
     * Reply to discussion/comment
     */
    replyToDiscussion(threadId: string, authorId: string, text: string, replyingToId?: string): Promise<any>;
    /**
     * React to comment (emoji reactions)
     */
    reactToComment(commentId: string, userId: string, emoji: string): Promise<any>;
    /**
     * Approve code review
     */
    approveReview(reviewId: string, approverId: string, message?: string): Promise<any>;
    /**
     * Request changes in review
     */
    requestChanges(reviewId: string, reviewerId: string, requestedChanges: string[]): Promise<any>;
    /**
     * Calculate priority of requested changes
     */
    calculateChangePriority(changes: string[]): string;
    /**
     * Create team task/assignment
     */
    createTeamTask(projectId: string, title: string, description: string, assignedTo: string, priority: "low" | "medium" | "high" | "critical", dueDate: Date, relatedIssueIds?: string[]): Promise<any>;
    /**
     * Get team activity feed
     */
    getTeamActivityFeed(projectId: string, limit?: number): Promise<any[]>;
    /**
     * Generate team metrics and analytics
     */
    getTeamMetrics(projectId: string, timeRange?: "week" | "month" | "quarter"): Promise<any>;
    /**
     * Create pull request template
     */
    createPRTemplate(projectId: string): string;
    /**
     * Generate code review checklist
     */
    generateCodeReviewChecklist(language: string): string[];
};
//# sourceMappingURL=collaboration.service.d.ts.map