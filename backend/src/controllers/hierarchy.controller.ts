import { Request, Response } from 'express';
import { hierarchyAnalysisService } from '../services/hierarchyAnalysis.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFolderHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    // Get latest completed analysis
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { projectId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' }
    });

    if (!latestAnalysis) {
      res.json({ name: 'root', path: '', children: [], bugs: 0, vulnerabilities: 0, codeSmells: 0 });
      return;
    }

    const hierarchy = await hierarchyAnalysisService.getFolderHierarchy(latestAnalysis.id);
    res.json(hierarchy);
  } catch (error) {
    console.error('getFolderHierarchy error:', error);
    res.status(500).json({ error: 'Failed to get folder hierarchy' });
  }
};

export const getIssuesByFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, folder } = req.params;
    const folderPath = folder ? decodeURIComponent(folder) : '';

    // Get latest completed analysis
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { projectId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' }
    });

    if (!latestAnalysis) {
      res.json({ issues: [], total: 0 });
      return;
    }

    const issues = await hierarchyAnalysisService.getIssuesByFolder(latestAnalysis.id, folderPath);
    res.json({ issues, total: issues.length });
  } catch (error) {
    console.error('getIssuesByFolder error:', error);
    res.status(500).json({ error: 'Failed to get folder issues' });
  }
};

export const getIssuesByFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, filePath: encodedFilePath } = req.params;
    const filePath = decodeURIComponent(encodedFilePath);

    // Get latest completed analysis
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { projectId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' }
    });

    if (!latestAnalysis) {
      res.json({ issues: [], total: 0 });
      return;
    }

    const issues = await hierarchyAnalysisService.getIssuesByFile(latestAnalysis.id, filePath);
    res.json({ issues, total: issues.length });
  } catch (error) {
    console.error('getIssuesByFile error:', error);
    res.status(500).json({ error: 'Failed to get file issues' });
  }
};

export const getMetricsTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { limit = '20' } = req.query;

    const trend = await hierarchyAnalysisService.getMetricsTrend(projectId, parseInt(limit as string));
    res.json({ trend });
  } catch (error) {
    console.error('getMetricsTrend error:', error);
    res.status(500).json({ error: 'Failed to get metrics trend' });
  }
};
