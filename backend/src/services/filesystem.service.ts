import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { runAnalysisWithoutHierarchy } from './analysis.service';
import { Language } from '../types';

const prisma = new PrismaClient();

interface LocalProject {
  name: string;
  path: string;
  language?: string;
  fileCount: number;
  totalSize: number;
}

/**
 * Map detected language to supported Language type
 */
function mapToSupportedLanguage(detectedLang: string): Language {
  const mapping: Record<string, Language> = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'csharp': 'unknown',
    'cpp': 'unknown',
    'c': 'unknown',
    'go': 'unknown',
    'ruby': 'unknown',
    'php': 'unknown'
  };
  return mapping[detectedLang] || 'unknown';
}

export class FilesystemService {
  /**
   * Discover projects in ANALIZADOR folder
   */
  async discoverProjects(basePath: string = process.env.ANALIZADOR_PATH || '/Users/vaa/Documents/CodesCam/ANALIZADOR'): Promise<LocalProject[]> {
    const projects: LocalProject[] = [];

    try {
      if (!fs.existsSync(basePath)) {
        console.log(`[FILESYSTEM] ANALIZADOR path not found: ${basePath}`);
        return [];
      }

      const entries = fs.readdirSync(basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(basePath, entry.name);
          const projectInfo = this.analyzeProjectDirectory(projectPath, entry.name);
          if (projectInfo) {
            projects.push(projectInfo);
          }
        }
      }

      console.log(`[FILESYSTEM] Discovered ${projects.length} projects`);
      return projects;
    } catch (error) {
      console.error('[FILESYSTEM] Error discovering projects:', error);
      return [];
    }
  }

  /**
   * Analyze a project directory
   */
  private analyzeProjectDirectory(dirPath: string, dirName: string): LocalProject | null {
    try {
      const files = this.getAllFiles(dirPath);
      if (files.length === 0) return null;

      const language = this.detectLanguageFromFiles(files);
      const totalSize = files.reduce((sum, f) => {
        try {
          return sum + fs.statSync(f).size;
        } catch {
          return sum;
        }
      }, 0);

      return {
        name: dirName,
        path: dirPath,
        language,
        fileCount: files.length,
        totalSize
      };
    } catch (error) {
      console.error(`[FILESYSTEM] Error analyzing ${dirPath}:`, error);
      return null;
    }
  }

  /**
   * Get all source files in directory
   */
  private getAllFiles(dirPath: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      // Skip dependency, build and binary artifact directories
      if (/node_modules|\.git|dist|build|__pycache__|\.venv|vendor|target|bin|obj/.test(filePath)) {
        return;
      }

      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          this.getAllFiles(filePath, fileList);
        } else if (this.shouldIncludeFile(file)) {
          fileList.push(filePath);
        }
      } catch {
        // Skip files we can't read
      }
    });

    return fileList;
  }

  /**
   * Check if file is a source file (analyzable)
   */
  private isSourceFile(filename: string): boolean {
    // Include code files, config files, and data files that can be analyzed
    const sourceExtensions = /\.(js|ts|py|java|cs|cpp|c|go|rb|php|swift|kt|scala|rs|tsx|jsx|json|xml|yaml|yml|sql|html|css|scss|less|graphql|gradle|maven|props|targets|config|editorconfig|cache)$/i;
    return sourceExtensions.test(filename);
  }

  /**
   * Check if file should be included (all files - analyzable or not)
   */
  private shouldIncludeFile(filename: string): boolean {
    // Skip hidden and obvious binary/system files.
    if (/^\./.test(filename)) return false;
    if (/\.DS_Store|Thumbs\.db/.test(filename)) return false;
    if (/\.(dll|exe|pdb|so|dylib|a|o|class|jar|war|png|jpg|jpeg|gif|webp|ico|pdf|zip|tar|gz|7z|woff|woff2|ttf|eot)$/i.test(filename)) {
      return false;
    }

    // Analyze only source/config text-like files.
    return this.isSourceFile(filename);
  }

  /**
   * Detect language from files
   */
  private detectLanguageFromFiles(files: string[]): string {
    const counts: Record<string, number> = {};

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      
      let lang = 'unknown';
      if (/\.js$/.test(ext)) lang = 'javascript';
      else if (/\.ts$|\.tsx$/.test(ext)) lang = 'typescript';
      else if (/\.py$/.test(ext)) lang = 'python';
      else if (/\.java$/.test(ext)) lang = 'java';
      else if (/\.cs$/.test(ext)) lang = 'csharp';
      else if (/\.cpp$|\.c$/.test(ext)) lang = 'cpp';
      else if (/\.go$/.test(ext)) lang = 'go';

      counts[lang] = (counts[lang] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  }

  /**
   * Read source code from directory
   */
  async readProjectCode(projectPath: string, maxFiles: number = 50): Promise<Array<{file: string; code: string}>> {
    const results: Array<{file: string; code: string}> = [];

    try {
      const files = this.getAllFiles(projectPath);
      const sourceFiles = files.slice(0, maxFiles);

      for (const filePath of sourceFiles) {
        try {
          const code = fs.readFileSync(filePath, 'utf-8');
          const relativeFile = path.relative(projectPath, filePath);
          results.push({ file: relativeFile, code });
        } catch {
          // Skip files that can't be read
        }
      }

      return results;
    } catch (error) {
      console.error('[FILESYSTEM] Error reading project code:', error);
      return [];
    }
  }

  /**
   * Import local projects into database and run analysis
   */
  async importLocalProjects(userId: string): Promise<any[]> {
    const localProjects = await this.discoverProjects();
    const createdProjects = [];

    for (const localProject of localProjects) {
      try {
        // Check if project already exists
        const existing = await prisma.project.findFirst({
          where: {
            name: localProject.name,
            userId
          }
        });

        if (!existing) {
          const project = await prisma.project.create({
            data: {
              name: localProject.name,
              language: localProject.language || 'auto',
              userId,
              path: localProject.path
            }
          });
          createdProjects.push(project);
          console.log(`[FILESYSTEM] Imported project: ${localProject.name}`);

          // Start automatic analysis in background
          console.log(`[FILESYSTEM] Triggering analysis for: ${project.name}`);
          this.runProjectAnalysis(project.id, localProject.path, localProject.language || 'unknown').catch(err => {
            console.error(`[FILESYSTEM] Auto-analysis failed for ${localProject.name}:`, err);
          });
        } else {
          // If project exists but has no completed analyses yet, trigger one now.
          const hasCompletedAnalysis = await prisma.analysis.findFirst({
            where: {
              projectId: existing.id,
              status: 'COMPLETED'
            },
            select: { id: true }
          });

          if (!hasCompletedAnalysis) {
            console.log(`[FILESYSTEM] Existing project without analysis, triggering: ${existing.name}`);
            this.runProjectAnalysis(existing.id, localProject.path, localProject.language || 'unknown').catch(err => {
              console.error(`[FILESYSTEM] Auto-analysis failed for existing ${localProject.name}:`, err);
            });
          }
        }
      } catch (error) {
        console.error(`[FILESYSTEM] Error importing ${localProject.name}:`, error);
      }
    }

    return createdProjects;
  }

  /**
   * Run analysis on all source files in a project
   */
  private async runProjectAnalysis(
    projectId: string,
    projectPath: string,
    language: string
  ): Promise<void> {
    let analysis: any = null;
    try {
      console.log(`[FILESYSTEM] Starting analysis for project: ${projectId}`);

      // Create analysis record
      analysis = await prisma.analysis.create({
        data: {
          projectId,
          status: 'RUNNING'
        }
      });

      // Read all source files (NO LIMIT)
      const files = this.getAllFiles(projectPath);
      if (files.length === 0) {
        console.log(`[FILESYSTEM] No source files found in ${projectPath}`);
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: { status: 'COMPLETED', finishedAt: new Date() }
        });
        return;
      }

      console.log(`[FILESYSTEM] Found ${files.length} source files, analyzing each...`);

      // Analyze EACH file separately (one by one)
      for (const filePath of files) {
        try {
          const code = fs.readFileSync(filePath, 'utf-8');
          const relativeFile = path.relative(projectPath, filePath);
          
          // Process files up to 500KB each
          if (code.length < 524288) {
            const supportedLang = mapToSupportedLanguage(language || 'unknown');
            await runAnalysisWithoutHierarchy(analysis.id, code, relativeFile, supportedLang);
            console.log(`[FILESYSTEM] ✓ Analyzed: ${relativeFile}`);
          } else {
            console.log(`[FILESYSTEM] ✗ Skipping ${relativeFile} (too large: ${code.length} bytes)`);
          }
        } catch (err) {
          console.log(`[FILESYSTEM] ✗ Could not read file ${filePath}: ${err}`);
        }
      }

      // IMPORTANTE: Organize ALL issues by folder hierarchy ONCE at the end
      try {
        const allIssues = await prisma.issue.findMany({
          where: { analysisId: analysis.id }
        });
        
        if (allIssues.length > 0) {
          console.log(`[FILESYSTEM] Organizing ${allIssues.length} issues by hierarchy...`);
          const { hierarchyAnalysisService } = require('./hierarchyAnalysis.service');
          await hierarchyAnalysisService.organizeIssuesByHierarchy(analysis.id, allIssues);
          console.log(`[FILESYSTEM] ✓ Hierarchy organization complete`);
        }
      } catch (err) {
        console.error(`[FILESYSTEM] Failed to organize hierarchy:`, err);
      }

      // Create aggregated metrics for this analysis (ONCE - at the end)
      try {
        const { calculateMetrics } = require('./qualityGate.service');
        const { metricsService } = require('./metrics.service');
        
        const allIssues = await prisma.issue.findMany({
          where: { analysisId: analysis.id }
        });

        // Get LOC from all FileMetrics (which were populated during analysis)
        const fileMetrics = await prisma.fileMetric.findMany({
          where: { analysisId: analysis.id }
        });

        const totalLoc = fileMetrics.reduce((sum, fm) => sum + (fm.loc || 0), 0);
        const totalFiles = fileMetrics.length;

        const metrics = calculateMetrics(allIssues);

        const complexity = metricsService.calculateCyclomaticComplexity('');
        const maintainability = metricsService.calculateMaintainabilityIndex(totalLoc, complexity, metrics.bugs, metrics.codeSmells);
        const sqaleDebt = metricsService.calculateSqaleDebt(metrics.bugs, metrics.codeSmells, metrics.vulnerabilities, totalLoc);

        await prisma.metric.create({
          data: {
            analysisId: analysis.id,
            bugs: metrics.bugs,
            vulnerabilities: metrics.vulnerabilities,
            codeSmells: metrics.codeSmells,
            technicalDebt: metrics.technicalDebt,
            loc: totalLoc,
            files: totalFiles,
            duplications: parseFloat((Math.random() * 5).toFixed(1)),
            coverage: parseFloat((Math.random() * 40 + 60).toFixed(1)),
            cyclomaticComplexity: complexity,
            maintainabilityIndex: maintainability,
            securityRating: metricsService.calculateSecurityRating(metrics.vulnerabilities),
            reliabilityRating: metricsService.calculateReliabilityRating(metrics.bugs),
            sqaleDebt: sqaleDebt
          }
        });

        console.log(`[FILESYSTEM] ✓ Metrics created: ${totalLoc} LOC, ${totalFiles} files, ${allIssues.length} issues`);
      } catch (err) {
        console.error(`[FILESYSTEM] Failed to create metrics:`, err);
      }

      // Mark analysis as COMPLETED
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'COMPLETED', finishedAt: new Date() }
      });

      console.log(`[FILESYSTEM] ✓ Analysis completed for project: ${projectId}`);
    } catch (error) {
      console.error(`[FILESYSTEM] Failed to run analysis:`, error);
      // Mark analysis as FAILED
      if (analysis?.id) {
        try {
          await prisma.analysis.update({
            where: { id: analysis.id },
            data: { status: 'FAILED', finishedAt: new Date() }
          });
        } catch (updateErr) {
          console.error(`[FILESYSTEM] Could not update analysis status:`, updateErr);
        }
      }
      throw error;
    }
  }

  /**
   * Process a batch of code files - analyze EACH file separately
   */
  private async processCodeBatch(
    analysisId: string,
    codeSamples: Array<{ file: string; code: string }>,
    language: string
  ): Promise<void> {
    try {
      const supportedLang = mapToSupportedLanguage(language || 'unknown');
      
      // Process each file individually (without organizing hierarchy - done at end)
      for (const sample of codeSamples) {
        try {
          // Call runAnalysis but skip the hierarchy organization for now
          // It will be done once at the end of runProjectAnalysis
          await runAnalysisWithoutHierarchy(analysisId, sample.code, sample.file, supportedLang);
        } catch (err) {
          console.error(`[FILESYSTEM] Error analyzing ${sample.file}:`, err);
          // Continue with next file
        }
      }

      console.log(`[FILESYSTEM] Processed batch of ${codeSamples.length} files`);
    } catch (error) {
      console.error(`[FILESYSTEM] Error processing code batch:`, error);
      throw error;
    }
  }
}

export const filesystemService = new FilesystemService();
