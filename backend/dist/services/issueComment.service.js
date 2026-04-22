"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCommentService = exports.IssueCommentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Issue Comments Service
 * Allows users to comment on and discuss issues
 */
class IssueCommentService {
    /**
     * Add comment to issue
     */
    async addComment(issueId, userId, text) {
        const issue = await prisma.issue.findUnique({
            where: { id: issueId }
        });
        if (!issue) {
            throw new Error('Issue not found');
        }
        return prisma.comment.create({
            data: {
                issueId,
                userId,
                text
            }
        });
    }
    /**
     * Get issue comments
     */
    async getIssueComments(issueId) {
        return prisma.comment.findMany({
            where: { issueId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    /**
     * Update comment
     */
    async updateComment(commentId, userId, text) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new Error('Unauthorized: Can only edit own comments');
        }
        return prisma.comment.update({
            where: { id: commentId },
            data: { text }
        });
    }
    /**
     * Delete comment
     */
    async deleteComment(commentId, userId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new Error('Unauthorized: Can only delete own comments');
        }
        return prisma.comment.delete({
            where: { id: commentId }
        });
    }
    /**
     * Add resolution comment and mark as fixed
     */
    async resolveIssue(issueId, userId, comment, resolution) {
        // Add resolution comment
        const newComment = await this.addComment(issueId, userId, `Resolution: ${comment}`);
        // Update issue resolution status
        await prisma.issue.update({
            where: { id: issueId },
            data: { resolution }
        });
        return newComment;
    }
    /**
     * Get comment count for issue
     */
    async getCommentCount(issueId) {
        return prisma.comment.count({
            where: { issueId }
        });
    }
    /**
     * Get all comments for analysis
     */
    async getAnalysisComments(analysisId) {
        return prisma.comment.findMany({
            where: {
                issue: {
                    analysisId
                }
            },
            include: {
                issue: {
                    select: {
                        id: true,
                        file: true,
                        line: true,
                        message: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    /**
     * Mark issue as wont fix with comment
     */
    async markWontFix(issueId, userId, reason) {
        return this.resolveIssue(issueId, userId, reason, 'WONT_FIX');
    }
    /**
     * Mark issue as false positive with comment
     */
    async markFalsePositive(issueId, userId, reason) {
        return this.resolveIssue(issueId, userId, reason, 'FALSE_POSITIVE');
    }
}
exports.IssueCommentService = IssueCommentService;
exports.issueCommentService = new IssueCommentService();
//# sourceMappingURL=issueComment.service.js.map