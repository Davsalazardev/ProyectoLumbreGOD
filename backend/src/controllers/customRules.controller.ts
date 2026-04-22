import { Request, Response } from 'express';
import { customRulesService } from '../services/customRules.service';
import { issueCommentService } from '../services/issueComment.service';

/**
 * Custom Rules Controller
 */
export class CustomRulesController {
  /**
   * POST /custom-rules/:projectId
   */
  async createRule(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { name, pattern, severity, type, language } = req.body;

      if (!name || !pattern || !language) {
        return res.status(400).json({ error: 'Name, pattern, and language are required' });
      }

      // Validate pattern
      const validation = customRulesService.validatePattern(pattern);
      if (!validation.valid) {
        return res.status(400).json({ error: `Invalid regex pattern: ${validation.error}` });
      }

      const rule = await customRulesService.createRule(projectId, {
        name,
        pattern,
        severity: severity || 'MINOR',
        type: type || 'CODE_SMELL',
        language
      });

      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /custom-rules/:projectId
   */
  async getProjectRules(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const language = (req.query.language as string) || undefined;

      const rules = await customRulesService.getProjectRules(projectId, language);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /custom-rules/:ruleId
   */
  async updateRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      const { name, pattern, severity, type, enabled } = req.body;

      if (pattern) {
        const validation = customRulesService.validatePattern(pattern);
        if (!validation.valid) {
          return res.status(400).json({ error: `Invalid regex pattern: ${validation.error}` });
        }
      }

      const updatedRule = await customRulesService.updateRule(ruleId, {
        name,
        pattern,
        severity,
        type,
        enabled
      });

      res.json(updatedRule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /custom-rules/:ruleId
   */
  async deleteRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      await customRulesService.deleteRule(ruleId);
      res.json({ message: 'Rule deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PATCH /custom-rules/:ruleId/toggle
   */
  async toggleRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      const rule = await customRulesService.toggleRule(ruleId);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /custom-rules/:projectId/clone/:sourceProjectId
   */
  async cloneRules(req: Request, res: Response) {
    try {
      const { projectId, sourceProjectId } = req.params;
      const cloned = await customRulesService.cloneRules(sourceProjectId, projectId);
      res.status(201).json(cloned);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Issue Comments Controller
 */
export class IssueCommentController {
  /**
   * POST /issues/:issueId/comments
   */
  async addComment(req: Request, res: Response) {
    try {
      const { issueId } = req.params;
      const { text } = req.body;
      const userId = (req as any).userId;

      if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const comment = await issueCommentService.addComment(issueId, userId, text);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /issues/:issueId/comments
   */
  async getIssueComments(req: Request, res: Response) {
    try {
      const { issueId } = req.params;
      const comments = await issueCommentService.getIssueComments(issueId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /comments/:commentId
   */
  async updateComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { text } = req.body;
      const userId = (req as any).userId;

      if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const updated = await issueCommentService.updateComment(commentId, userId, text);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * DELETE /comments/:commentId
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = (req as any).userId;

      await issueCommentService.deleteComment(commentId, userId);
      res.json({ message: 'Comment deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /issues/:issueId/mark-fixed
   */
  async markAsFixed(req: Request, res: Response) {
    try {
      const { issueId } = req.params;
      const { comment } = req.body;
      const userId = (req as any).userId;

      const result = await issueCommentService.resolveIssue(issueId, userId, comment || 'Fixed', 'FIXED');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /issues/:issueId/mark-wont-fix
   */
  async markAsWontFix(req: Request, res: Response) {
    try {
      const { issueId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).userId;

      const result = await issueCommentService.markWontFix(issueId, userId, reason || 'Not applicable');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /issues/:issueId/mark-false-positive
   */
  async markAsFalsePositive(req: Request, res: Response) {
    try {
      const { issueId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).userId;

      const result = await issueCommentService.markFalsePositive(issueId, userId, reason || 'False positive');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const customRulesController = new CustomRulesController();
export const issueCommentController = new IssueCommentController();