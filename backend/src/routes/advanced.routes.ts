import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { gitService } from '../services/git.service';
import { performanceService } from '../services/performance.service';
import { mlService } from '../services/ml.service';
import { collaborationService } from '../services/collaboration.service';
import { cicdService } from '../services/cicd.service';
import { searchService, dependencyService, codeReviewService } from '../services/search.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * 🔗 GIT INTEGRATION ROUTES
 */

/**
 * POST /repositories/import
 * Import and analyze a Git repository from GitHub (API-based, NO local cloning)
 */
router.post('/repositories/import', async (req, res) => {
  try {
    const { url, branch = 'main', projectName, userId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Repository URL required' });
    }

    // Use provided userId or create with default 'system' user
    let projectUserId = userId || 'system-user';

    // Try to create a system user if it doesn't exist
    try {
      let user = await prisma.user.findUnique({ where: { id: projectUserId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: projectUserId,
            email: `${projectUserId}@codescam.local`,
            password: 'system-hash',
            name: 'System User'
          }
        });
      }
    } catch (err) {
      // User might already exist, continue
    }

    // Import repository using GitHub API (no local file storage)
    console.log(`📥 Starting GitHub API analysis for: ${url}`);
    const importData = await gitService.importRepository(url, branch);

    if (!importData.success) {
      return res.status(400).json({ error: 'Failed to import repository' });
    }

    // Create project entry in database with imported data
    const project = await prisma.project.create({
      data: {
        name: projectName || importData.repository.name || 'Imported Project',
        userId: projectUserId,
        language: importData.repository.language || 'mixed',
        path: url
      }
    });

    // No cleanup needed - data was never stored locally

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        url: importData.repository.url || url,
        branch: importData.branch,
        lastCommit: importData.lastCommit,
        topContributors: importData.topContributors?.slice(0, 5) || [],
        stats: {
          stars: importData.repository.stars,
          forks: importData.repository.forks,
          language: importData.repository.language
        }
      },
      message: `✅ Repository imported and analyzed successfully (GitHub API - no local storage)`
    });
  } catch (error) {
    console.error('Repository import failed:', error);
    res.status(500).json({ error: `Failed to import repository: ${(error as any).message}` });
  }
});

/**
 * GET /repositories/:projectId/branches
 * Get available branches via GitHub API
 */
router.get('/repositories/:projectId/branches', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project?.path) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Extract owner/repo from GitHub URL
    const urlParts = project.path.split('/').slice(-2);
    const owner = urlParts[0];
    const repo = urlParts[1].replace('.git', '');

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository URL format' });
    }

    const branches = await gitService.getAllBranches(owner, repo);

    res.json({ branches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

/**
 * GET /repositories/:projectId/commits
 * Get recent commits via GitHub API
 */
router.get('/repositories/:projectId/commits', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branch = 'main', limit = 20 } = req.query;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project?.path) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Extract owner/repo from GitHub URL
    const urlParts = project.path.split('/').slice(-2);
    const owner = urlParts[0];
    const repo = urlParts[1].replace('.git', '');

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository URL format' });
    }

    // Use GitHub API to fetch commits
    const commits = await gitService.getCommitHistory(
      owner,
      repo,
      branch as string,
      parseInt(limit as string)
    );

    res.json({ commits, branch });
  } catch (error) {
    console.error('Commit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

/**
 * POST /repositories/:projectId/webhook
 * Setup webhook for automatic analysis
 */
router.post('/repositories/:projectId/webhook', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project?.path) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const [owner, repo] = [
      project.path.split('/')[3],
      project.path.split('/')[4].replace('.git', '')
    ];

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository format' });
    }

    const webhookUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/webhooks/github`;
    const webhook = await gitService.setupWebhook(owner, repo, webhookUrl);

    res.json({
      success: true,
      webhook,
      message: '✅ Webhook setup successful'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to setup webhook' });
  }
});

/**
 * 📊 PERFORMANCE ANALYSIS ROUTES
 */

/**
 * POST /analysis/:projectId/performance
 * Analyze code for performance issues
 */
router.post('/analysis/:projectId/performance', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { code, language = 'javascript' } = req.body;

    const memoryLeaks = performanceService.analyzeMemoryLeaks(code, language);
    const concurrencyIssues = performanceService.analyzeConcurrencyIssues(code, language);
    const cpuIntensive = performanceService.analyzeCPUIntensive(code, language);
    const ioOperations = performanceService.analyzeIOOperations(code, language);

    const allIssues = [...memoryLeaks, ...concurrencyIssues, ...cpuIntensive, ...ioOperations];
    const profile = performanceService.generatePerformanceProfile(allIssues);

    res.json({
      memoryLeaks: { count: memoryLeaks.length, details: memoryLeaks.slice(0, 5) },
      concurrencyIssues: { count: concurrencyIssues.length, details: concurrencyIssues.slice(0, 5) },
      cpuIntensive: { count: cpuIntensive.length, details: cpuIntensive.slice(0, 5) },
      ioOperations: { count: ioOperations.length, details: ioOperations.slice(0, 5) },
      profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Performance analysis failed' });
  }
});

/**
 * 🤖 MACHINE LEARNING ROUTES
 */

/**
 * POST /analysis/:projectId/ml/predict-bugs
 * Predict bugs using ML model
 */
router.post('/analysis/:projectId/ml/predict-bugs', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { code, language = 'javascript' } = req.body;

    const prediction = await mlService.predictBugProbability(code, language);
    const anomalies = await mlService.detectAnomalies(code, language);
    const refactoringPlan = await mlService.generateRefactoringPlan(code, language);

    res.json({
      bugPrediction: prediction,
      anomalies,
      refactoringPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'ML analysis failed' });
  }
});

/**
 * 👥 COLLABORATION ROUTES
 */

/**
 * POST /projects/:projectId/code-reviews
 * Create code review
 */
router.post('/projects/:projectId/code-reviews', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { issueId, reviewerId, comments, codeSnippet } = req.body;

    const review = await collaborationService.createCodeReview(
      projectId,
      issueId,
      reviewerId,
      comments,
      codeSnippet
    );

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create code review' });
  }
});

/**
 * POST /projects/:projectId/discussions
 * Create discussion thread
 */
router.post('/projects/:projectId/discussions', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content, authorId } = req.body;

    const discussion = await collaborationService.createDiscussionThread(
      projectId,
      title,
      authorId,
      content
    );

    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

/**
 * GET /projects/:projectId/activity-feed
 * Get team activity feed
 */
router.get('/projects/:projectId/activity-feed', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await collaborationService.getTeamActivityFeed(
      projectId,
      parseInt(limit as string)
    );

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

/**
 * 🔄 CI/CD ROUTES
 */

/**
 * POST /webhooks/github
 * GitHub webhook receiver
 */
router.post('/webhooks/github', async (req, res) => {
  try {
    const payload = req.body;
    const event = req.headers['x-github-event'];

    if (event === 'workflow_run') {
      const result = await cicdService.processGitHubActionsWebhook(payload);
      console.log('GitHub Actions result:', result);
    } else if (event === 'push') {
      console.log('Push event received');
    } else if (event === 'pull_request') {
      console.log('PR event received');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * 🔍 SEARCH ROUTES
 */

/**
 * GET /search
 * Full-text search
 */
router.get('/search', async (req, res) => {
  try {
    const { q, projectId, type, severity, dateFrom, dateTo } = req.query;

    if (!q || !projectId) {
      return res.status(400).json({ error: 'Query and projectId required' });
    }

    const filters = {
      type: type || undefined,
      severity: severity || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    };

    const results = await searchService.fullTextSearch(q as string, projectId as string, filters);

    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /search/save
 * Save search query
 */
router.post('/search/save', async (req, res) => {
  try {
    const { userId, name, query, filters } = req.body;

    const savedSearch = await searchService.saveSearch(userId, name, query, filters);

    res.json({ success: true, savedSearch });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search' });
  }
});

/**
 * 📦 DEPENDENCY SCANNING ROUTES
 */

/**
 * POST /projects/:projectId/scan-dependencies
 * Scan dependencies for vulnerabilities
 */
router.post('/projects/:projectId/scan-dependencies', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { language = 'javascript' } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project?.path) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const scanResults = await dependencyService.scanDependencies(project.path, language);

    res.json(scanResults);
  } catch (error) {
    res.status(500).json({ error: 'Dependency scan failed' });
  }
});

/**
 * 💬 CODE REVIEW ASSISTANT ROUTES
 */

/**
 * POST /code-review/suggestions
 * Get automatic code review suggestions
 */
router.post('/code-review/suggestions', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    const suggestions = await codeReviewService.generateReviewSuggestions(code, language);

    res.json({
      suggestions,
      count: suggestions.length,
      summary: {
        critical: suggestions.filter(s => s.priority >= 9).length,
        high: suggestions.filter(s => s.priority >= 7 && s.priority < 9).length,
        medium: suggestions.filter(s => s.priority >= 5 && s.priority < 7).length,
        low: suggestions.filter(s => s.priority < 5).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

export default router;
