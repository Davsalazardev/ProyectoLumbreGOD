import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Issue Comments Service
 * Allows users to comment on and discuss issues
 */
export class IssueCommentService {
  /**
   * Add comment to issue
   */
  async addComment(issueId: string, userId: string, text: string) {
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
  async getIssueComments(issueId: string) {
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
  async updateComment(commentId: string, userId: string, text: string) {
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
  async deleteComment(commentId: string, userId: string) {
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
  async resolveIssue(issueId: string, userId: string, comment: string, resolution: string) {
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
  async getCommentCount(issueId: string): Promise<number> {
    return prisma.comment.count({
      where: { issueId }
    });
  }

  /**
   * Get all comments for analysis
   */
  async getAnalysisComments(analysisId: string) {
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
  async markWontFix(issueId: string, userId: string, reason: string) {
    return this.resolveIssue(issueId, userId, reason, 'WONT_FIX');
  }

  /**
   * Mark issue as false positive with comment
   */
  async markFalsePositive(issueId: string, userId: string, reason: string) {
    return this.resolveIssue(issueId, userId, reason, 'FALSE_POSITIVE');
  }
}

export const issueCommentService = new IssueCommentService();
