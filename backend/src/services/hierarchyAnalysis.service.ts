import { PrismaClient } from '@prisma/client';
import path from 'path';
import { NormalizedIssue } from '../types';

const prisma = new PrismaClient();

export class HierarchyAnalysisService {
  /**
   * Organize issues by folder and file structure
   */
  async organizeIssuesByHierarchy(analysisId: string, issues: NormalizedIssue[]): Promise<void> {
    try {
      // Group issues by folder
      const folderMap: Record<string, NormalizedIssue[]> = {};
      const fileMap: Record<string, NormalizedIssue[]> = {};

      for (const issue of issues) {
        const filePath = issue.file;
        const folderPath = path.dirname(filePath);

        // Group by folder
        if (!folderMap[folderPath]) {
          folderMap[folderPath] = [];
        }
        folderMap[folderPath].push(issue);

        // Group by file
        if (!fileMap[filePath]) {
          fileMap[filePath] = [];
        }
        fileMap[filePath].push(issue);
      }

      // Create folder metrics
      for (const [folderPath, folderIssues] of Object.entries(folderMap)) {
        const bugs = folderIssues.filter(i => i.type === 'BUG').length;
        const vulns = folderIssues.filter(i => i.type === 'VULNERABILITY').length;
        const smells = folderIssues.filter(i => i.type === 'CODE_SMELL').length;

        await prisma.folderMetric.upsert({
          where: { analysisId_folderPath: { analysisId, folderPath } },
          update: {
            bugs,
            vulnerabilities: vulns,
            codeSmells: smells,
            files: new Set(folderIssues.map(i => i.file)).size
          },
          create: {
            analysisId,
            folderPath,
            bugs,
            vulnerabilities: vulns,
            codeSmells: smells,
            files: new Set(folderIssues.map(i => i.file)).size
          }
        });
      }

      // Create file metrics
      for (const [filePath, fileIssues] of Object.entries(fileMap)) {
        const bugs = fileIssues.filter(i => i.type === 'BUG').length;
        const vulns = fileIssues.filter(i => i.type === 'VULNERABILITY').length;
        const smells = fileIssues.filter(i => i.type === 'CODE_SMELL').length;

        await prisma.fileMetric.upsert({
          where: { analysisId_filePath: { analysisId, filePath } },
          update: {
            bugs,
            vulnerabilities: vulns,
            codeSmells: smells
          },
          create: {
            analysisId,
            filePath,
            bugs,
            vulnerabilities: vulns,
            codeSmells: smells,
            loc: 0 // Will be updated by analysis service
          }
        });
      }

      // Update issues with folder path
      await prisma.issue.updateMany({
        where: { analysisId },
        data: {
          folder: undefined // Will be set correctly on next query
        }
      });

      console.log(`[HIERARCHY] Organized ${issues.length} issues into folder/file structure`);
    } catch (error) {
      console.error('[HIERARCHY] Error organizing issues:', error);
      throw error;
    }
  }

  /**
   * Get folder hierarchy for a project INCLUDING FILES
   */
  async getFolderHierarchy(analysisId: string): Promise<any> {
    try {
      const folderMetrics = await prisma.folderMetric.findMany({
        where: { analysisId },
        orderBy: { folderPath: 'asc' }
      });

      const fileMetrics = await prisma.fileMetric.findMany({
        where: { analysisId },
        orderBy: { filePath: 'asc' }
      });

      // Build tree structure with both folders and files
      const tree: Record<string, any> = {
        name: 'root',
        path: '',
        children: [],
        isFolder: true,
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 0,
        files: 0
      };

      // First, create folder structure (skip "." - root level folders)
      for (const metric of folderMetrics) {
        // Skip root-level folders (folderPath = "." or empty)
        if (metric.folderPath === '.' || metric.folderPath === '' || metric.folderPath === '/') {
          continue;
        }

        const parts = metric.folderPath.split(path.sep).filter(p => p && p !== '.');
        let current = tree;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const fullPath = parts.slice(0, i + 1).join(path.sep);

          let child = current.children?.find((c: any) => c.name === part && c.isFolder);
          if (!child) {
            child = {
              name: part,
              path: fullPath,
              isFolder: true,
              children: [],
              bugs: 0,
              vulnerabilities: 0,
              codeSmells: 0,
              files: 0
            };
            if (!current.children) current.children = [];
            current.children.push(child);
          }

          // Update metrics at this level
          const matchingMetric = folderMetrics.find(m => m.folderPath === fullPath);
          if (matchingMetric) {
            child.bugs = matchingMetric.bugs;
            child.vulnerabilities = matchingMetric.vulnerabilities;
            child.codeSmells = matchingMetric.codeSmells;
            child.files = matchingMetric.files;
          }

          current = child;
        }
      }

      // Then, add files to the tree
      for (const fileMetric of fileMetrics) {
        const filePath = fileMetric.filePath;
        let dirPath = path.dirname(filePath);
        const fileName = path.basename(filePath);

        // Handle root-level files (dirPath is "." or empty)
        if (dirPath === '.' || dirPath === '' || dirPath === '/') {
          // Add directly to root
          const fileNode = {
            name: fileName,
            path: filePath,
            isFolder: false,
            bugs: fileMetric.bugs,
            vulnerabilities: fileMetric.vulnerabilities,
            codeSmells: fileMetric.codeSmells,
            loc: fileMetric.loc,
            children: []
          };
          if (!tree.children) tree.children = [];
          tree.children.push(fileNode);
          continue;
        }

        // Find or create the folder containing this file
        const dirParts = dirPath.split(path.sep).filter(p => p && p !== '.');
        let current = tree;

        // Navigate to the correct folder, calculating the correct path at each level
        for (let i = 0; i < dirParts.length; i++) {
          const part = dirParts[i];
          // Reconstruct path up to this point
          const pathUpToHere = dirParts.slice(0, i + 1).join(path.sep);
          
          let child = current.children?.find((c: any) => c.name === part && c.isFolder);
          if (!child) {
            child = {
              name: part,
              path: pathUpToHere,  // Correct path for this level
              isFolder: true,
              children: [],
              bugs: 0,
              vulnerabilities: 0,
              codeSmells: 0,
              files: 0
            };
            if (!current.children) current.children = [];
            current.children.push(child);
          }
          current = child;
        }

        // Add file to the folder
        const fileNode = {
          name: fileName,
          path: filePath,
          isFolder: false,
          bugs: fileMetric.bugs,
          vulnerabilities: fileMetric.vulnerabilities,
          codeSmells: fileMetric.codeSmells,
          loc: fileMetric.loc,
          children: []
        };

        if (!current.children) current.children = [];
        current.children.push(fileNode);
      }

      // Sort children: folders first, then files
      const sortTree = (node: any) => {
        if (!node.children) return;
        node.children.sort((a: any, b: any) => {
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        for (const child of node.children) {
          sortTree(child);
        }
      };
      sortTree(tree);

      return tree;
    } catch (error) {
      console.error('[HIERARCHY] Error getting folder hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get issues for a specific folder
   */
  async getIssuesByFolder(analysisId: string, folderPath: string): Promise<any> {
    try {
      const issues = await prisma.issue.findMany({
        where: {
          analysisId,
          file: {
            startsWith: folderPath
          }
        },
        orderBy: [
          { severity: 'asc' },
          { file: 'asc' },
          { line: 'asc' }
        ]
      });

      return issues;
    } catch (error) {
      console.error('[HIERARCHY] Error getting folder issues:', error);
      throw error;
    }
  }

  /**
   * Get issues for a specific file
   */
  async getIssuesByFile(analysisId: string, filePath: string): Promise<any> {
    try {
      const issues = await prisma.issue.findMany({
        where: {
          analysisId,
          file: filePath
        },
        orderBy: [
          { severity: 'asc' },
          { line: 'asc' }
        ],
        include: {
          comments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return issues;
    } catch (error) {
      console.error('[HIERARCHY] Error getting file issues:', error);
      throw error;
    }
  }

  /**
   * Get trend data for project metrics over time
   */
  async getMetricsTrend(projectId: string, limit: number = 20): Promise<any[]> {
    try {
      const analyses = await prisma.analysis.findMany({
        where: {
          projectId,
          status: 'COMPLETED',
          metrics: {
            isNot: null
          }
        },
        orderBy: { startedAt: 'asc' },
        take: limit,
        include: {
          metrics: true
        }
      });

      return analyses.map(a => ({
        date: a.startedAt,
        bugs: a.metrics?.bugs || 0,
        vulnerabilities: a.metrics?.vulnerabilities || 0,
        codeSmells: a.metrics?.codeSmells || 0,
        technicalDebt: a.metrics?.technicalDebt || 0,
        coverage: a.metrics?.coverage || 0,
        maintainability: a.metrics?.maintainabilityIndex || 0
      }));
    } catch (error) {
      console.error('[HIERARCHY] Error getting trend data:', error);
      throw error;
    }
  }
}

export const hierarchyAnalysisService = new HierarchyAnalysisService();
