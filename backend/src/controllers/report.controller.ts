import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

/**
 * Report Controller
 */
export class ReportController {
  /**
   * GET /reports/project/:projectId/compliance
   */
  async generateComplianceReport(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const format = (req.query.format as string) || 'json';

      const report = await reportService.generateComplianceReport(projectId, format);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /reports/project/:projectId/security-review
   */
  async generateSecurityReview(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const review = await reportService.generateSecurityReview(projectId);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /reports/project/:projectId/pdf
   */
  async generatePDFReport(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const pdfBuffer = await reportService.generatePDFReport(projectId);

      res.contentType('application/pdf');
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /reports/project/:projectId
   */
  async getProjectReports(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const reports = await reportService.getProjectReports(projectId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /reports/:reportId/export
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const format = (req.query.format as string) || 'json';

      const report = await reportService.exportAsJSON(reportId);

      if (format === 'csv') {
        res.contentType('text/csv');
        res.send(JSON.stringify(report, null, 2));
      } else {
        res.json(report);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const reportController = new ReportController();
