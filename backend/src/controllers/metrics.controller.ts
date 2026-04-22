import { Request, Response } from 'express';
import { metricsService } from '../services/metrics.service';

/**
 * Metrics Controller - Advanced metric calculations and reporting
 */
export class MetricsController {
  /**
   * GET /metrics/project/:projectId
   */
  async getProjectMetrics(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const history = await metricsService.getProjectMetricsHistory(projectId, 10);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /metrics/project/:projectId/report
   */
  async getQualityReport(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const report = await metricsService.generateQualityReport(projectId);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /metrics/project/:projectId/compare
   */
  async compareAnalyses(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { analysisId1, analysisId2 } = req.body;

      if (!analysisId1 || !analysisId2) {
        return res.status(400).json({ error: 'Both analysis IDs are required' });
      }

      const comparison = await metricsService.compareAnalyses(analysisId1, analysisId2);
      res.json(comparison);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /metrics/calculate/complexity
   */
  async calculateComplexity(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const complexity = metricsService.calculateCyclomaticComplexity(code);
      res.json({ complexity });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /metrics/calculate/maintainability
   */
  async calculateMaintainability(req: Request, res: Response) {
    try {
      const { loc, complexity, bugs, codeSmells } = req.body;

      if (loc === undefined || complexity === undefined || bugs === undefined || codeSmells === undefined) {
        return res.status(400).json({ error: 'All parameters required' });
      }

      const index = metricsService.calculateMaintainabilityIndex(loc, complexity, bugs, codeSmells);
      res.json({ maintainabilityIndex: index });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /metrics/ratings/security/:vulnerabilityCount
   */
  async getSecurityRating(req: Request, res: Response) {
    try {
      const count = parseInt(req.params.vulnerabilityCount);
      const rating = metricsService.calculateSecurityRating(count);
      res.json({ rating });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /metrics/ratings/reliability/:bugCount
   */
  async getReliabilityRating(req: Request, res: Response) {
    try {
      const count = parseInt(req.params.bugCount);
      const rating = metricsService.calculateReliabilityRating(count);
      res.json({ rating });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const metricsController = new MetricsController();
