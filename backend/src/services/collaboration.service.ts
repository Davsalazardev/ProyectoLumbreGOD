import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Team Collaboration Service
 * Code reviews, comments, mentions, discussions, and team interactions
 */
export const collaborationService = {
  /**
   * Create a code review thread
   */
  async createCodeReview(
    projectId: string,
    issueId: string,
    reviewerId: string,
    comments: string,
    codeSnippet?: string
  ): Promise<any> {
    // Structured review creation
    const review = {
      projectId,
      issueId,
      reviewerId,
      createdAt: new Date(),
      status: 'pending',
      comments,
      codeSnippet: codeSnippet || null,
      suggestions: this.generateReviewSuggestions(comments, codeSnippet)
    };

    // Extract mentions from comments
    const mentions = this.extractMentions(comments);
    
    return {
      ...review,
      mentions,
      notificationSent: mentions.length > 0
    };
  },

  /**
   * Extract @mentions from text
   */
  extractMentions(text: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  },

  /**
   * Generate automated review suggestions
   */
  generateReviewSuggestions(comments: string, codeSnippet?: string): string[] {
    const suggestions: string[] = [];

    // Common review patterns
    if (comments.toLowerCase().includes('performance')) {
      suggestions.push('💡 Consider caching results to improve performance');
      suggestions.push('💡 Profile the code to identify bottlenecks');
    }

    if (comments.toLowerCase().includes('security')) {
      suggestions.push('🔒 Validate all user inputs');
      suggestions.push('🔒 Sanitize data before database queries');
      suggestions.push('🔒 Use prepared statements for SQL');
    }

    if (comments.toLowerCase().includes('readability')) {
      suggestions.push('📝 Extract magic numbers to named constants');
      suggestions.push('📝 Improve variable naming');
      suggestions.push('📝 Add comments for complex logic');
    }

    if (comments.toLowerCase().includes('test')) {
      suggestions.push('✅ Add unit tests for edge cases');
      suggestions.push('✅ Increase code coverage');
    }

    if (codeSnippet) {
      if (codeSnippet.includes('console.log') || codeSnippet.includes('print(')) {
        suggestions.push('🐛 Remove debug logging before production');
      }

      if ((codeSnippet.match(/for|while/g) || []).length > 2) {
        suggestions.push('🔄 Consider using array methods (map, filter, reduce) instead of loops');
      }

      if (!codeSnippet.includes('try') && !codeSnippet.includes('catch')) {
        suggestions.push('⚠️ Add error handling');
      }
    }

    return suggestions;
  },

  /**
   * Add inline comment to code
   */
  async addInlineComment(
    issueId: string,
    lineNumber: number,
    filePath: string,
    authorId: string,
    text: string
  ): Promise<any> {
    return {
      issueId,
      lineNumber,
      filePath,
      authorId,
      text,
      createdAt: new Date(),
      replies: [],
      resolved: false,
      mentions: this.extractMentions(text)
    };
  },

  /**
   * Create a discussion thread
   */
  async createDiscussionThread(
    projectId: string,
    title: string,
    authorId: string,
    content: string
  ): Promise<any> {
    return {
      id: `discussion-${Date.now()}`,
      projectId,
      title,
      authorId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      participants: [authorId],
      tags: this.extractTags(content),
      mentions: this.extractMentions(content),
      unread: []
    };
  },

  /**
   * Extract tags from content
   */
  extractTags(text: string): string[] {
    const tagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagPattern.exec(text)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  },

  /**
   * Reply to discussion/comment
   */
  async replyToDiscussion(
    threadId: string,
    authorId: string,
    text: string,
    replyingToId?: string
  ): Promise<any> {
    return {
      id: `reply-${Date.now()}`,
      threadId,
      authorId,
      text,
      createdAt: new Date(),
      replyingTo: replyingToId || null,
      mentions: this.extractMentions(text),
      reactions: {}
    };
  },

  /**
   * React to comment (emoji reactions)
   */
  async reactToComment(
    commentId: string,
    userId: string,
    emoji: string
  ): Promise<any> {
    return {
      commentId,
      userId,
      emoji,
      createdAt: new Date()
    };
  },

  /**
   * Approve code review
   */
  async approveReview(
    reviewId: string,
    approverId: string,
    message?: string
  ): Promise<any> {
    return {
      reviewId,
      approverId,
      status: 'approved',
      message: message || '✅ Looks good to me!',
      approvedAt: new Date()
    };
  },

  /**
   * Request changes in review
   */
  async requestChanges(
    reviewId: string,
    reviewerId: string,
    requestedChanges: string[]
  ): Promise<any> {
    return {
      reviewId,
      reviewerId,
      status: 'changes-requested',
      requestedChanges,
      createdAt: new Date(),
      priority: this.calculateChangePriority(requestedChanges)
    };
  },

  /**
   * Calculate priority of requested changes
   */
  calculateChangePriority(changes: string[]): string {
    let criticalCount = 0;
    let importantCount = 0;

    for (const change of changes) {
      if (change.toLowerCase().includes('security') || change.toLowerCase().includes('critical')) {
        criticalCount++;
      } else if (change.toLowerCase().includes('performance') || change.toLowerCase().includes('important')) {
        importantCount++;
      }
    }

    if (criticalCount > 0) return 'critical';
    if (importantCount > 0) return 'high';
    return 'normal';
  },

  /**
   * Create team task/assignment
   */
  async createTeamTask(
    projectId: string,
    title: string,
    description: string,
    assignedTo: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    dueDate: Date,
    relatedIssueIds?: string[]
  ): Promise<any> {
    return {
      id: `task-${Date.now()}`,
      projectId,
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      createdAt: new Date(),
      status: 'open',
      relatedIssues: relatedIssueIds || [],
      comments: [],
      attachments: []
    };
  },

  /**
   * Get team activity feed
   */
  async getTeamActivityFeed(projectId: string, limit: number = 50): Promise<any[]> {
    // Mock activity data structure
    const activities = [
      {
        type: 'code_review',
        user: 'john_doe',
        action: 'approved code review',
        target: 'Feature: User Authentication',
        timestamp: new Date(Date.now() - 3600000),
        icon: '✅'
      },
      {
        type: 'comment',
        user: 'jane_smith',
        action: 'commented on',
        target: 'Issue: Fix login bug',
        timestamp: new Date(Date.now() - 7200000),
        icon: '💬'
      },
      {
        type: 'commit',
        user: 'dev_team',
        action: 'pushed',
        target: '3 commits to main branch',
        timestamp: new Date(Date.now() - 10800000),
        icon: '📝'
      }
    ];

    return activities.slice(0, limit);
  },

  /**
   * Generate team metrics and analytics
   */
  async getTeamMetrics(projectId: string, timeRange: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    return {
      period: timeRange,
      reviewsCompleted: Math.floor(Math.random() * 100) + 50,
      commentsCounted: Math.floor(Math.random() * 500) + 100,
      averageReviewTime: `${Math.floor(Math.random() * 24) + 1}h`,
      teamParticipation: Math.floor(Math.random() * 40) + 60,
      prOpenTime: `${Math.floor(Math.random() * 48) + 12}h`,
      mostActive: 'John Doe',
      topReviewer: 'Jane Smith',
      averageCommentLength: 150,
      reviewsAwaitingAction: Math.floor(Math.random() * 10) + 2
    };
  },

  /**
   * Create pull request template
   */
  createPRTemplate(projectId: string): string {
    return `## Description
Please include a summary of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Fixes # (issue)

## Testing
Please describe the tests that you ran to verify your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests passed locally with my changes`;
  },

  /**
   * Generate code review checklist
   */
  generateCodeReviewChecklist(language: string): string[] {
    const universalChecklist = [
      '✓ Code follows project style guidelines',
      '✓ No hardcoded values or magic numbers',
      '✓ Meaningful variable names used',
      '✓ Functions are appropriately named and documented',
      '✓ Code is DRY (Don\'t Repeat Yourself)',
      '✓ Error handling is present',
      '✓ No debug code left in (console.log, debugger, etc.)',
      '✓ Comments explain "why" not "what"'
    ];

    const languageSpecific: { [key: string]: string[] } = {
      javascript: [
        '✓ Async/await properly used (no unhandled promises)',
        '✓ No var used (use const/let)',
        '✓ Null/undefined checks present'
      ],
      python: [
        '✓ Type hints present where appropriate',
        '✓ Docstrings written for public functions',
        '✓ PEP 8 guidelines followed'
      ],
      java: [
        '✓ Proper access modifiers used',
        '✓ @Override annotations present where needed',
        '✓ Exception handling is appropriate'
      ],
      typescript: [
        '✓ Types fully specified',
        '✓ Strict mode enabled and no any types',
        '✓ Interfaces defined for complex objects'
      ]
    };

    return [
      ...universalChecklist,
      ...(languageSpecific[language] || [])
    ];
  }
};
