"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitController = exports.GitController = void 0;
const git_service_1 = require("../services/git.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Git Integration Controller (API-based, no local cloning)
 */
class GitController {
    /**
     * POST /git/clone
     * NOW: Import repository metadata from GitHub (no local cloning)
     */
    async cloneRepository(req, res) {
        try {
            const { gitUrl, branch = 'main', projectId } = req.body;
            if (!gitUrl || !projectId) {
                return res.status(400).json({ error: 'Git URL and project ID required' });
            }
            // Import repository using GitHub API
            const importData = await git_service_1.gitService.importRepository(gitUrl, branch);
            if (!importData.success) {
                return res.status(400).json({ error: 'Failed to import repository' });
            }
            // Store branch info
            await prisma.branch.create({
                data: {
                    projectId,
                    name: branch,
                    isMain: branch === 'main' || branch === 'master'
                }
            });
            res.json({
                success: true,
                repository: importData.repository,
                branch: importData.branch,
                lastCommit: importData.lastCommit,
                message: '✅ Repository imported successfully (GitHub API - no local storage)'
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * GET /git/branches/:projectId
     */
    async getBranches(req, res) {
        try {
            const { projectId } = req.params;
            const project = await prisma.project.findUnique({
                where: { id: projectId }
            });
            if (!project?.path) {
                return res.status(404).json({ error: 'Project not found' });
            }
            // Extract owner/repo from GitHub URL
            const urlParts = project.path.split('/').slice(-2);
            const owner = urlParts[0];
            const repo = urlParts[1].replace('.git', '');
            if (!owner || !repo) {
                return res.status(400).json({ error: 'Invalid repository URL' });
            }
            // Fetch branches from GitHub API
            const branches = await git_service_1.gitService.getAllBranches(owner, repo);
            res.json(branches);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /git/checkout
     * Not needed - no local files are checked out
     */
    async checkoutBranch(req, res) {
        try {
            const { branch } = req.body;
            if (!branch) {
                return res.status(400).json({ error: 'Branch required' });
            }
            res.json({
                success: true,
                message: `Branch '${branch}' selected (no local checkout needed - GitHub API based)`
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * GET /git/commits/:projectId
     */
    async getCommitHistory(req, res) {
        try {
            const { projectId } = req.params;
            const { branch = 'main', limit = 30 } = req.query;
            const project = await prisma.project.findUnique({
                where: { id: projectId }
            });
            if (!project?.path) {
                return res.status(404).json({ error: 'Project not found' });
            }
            // Extract owner/repo from GitHub URL
            const urlParts = project.path.split('/').slice(-2);
            const owner = urlParts[0];
            const repo = urlParts[1].replace('.git', '');
            if (!owner || !repo) {
                return res.status(400).json({ error: 'Invalid repository URL' });
            }
            // Fetch commits from GitHub API
            const commits = await git_service_1.gitService.getCommitHistory(owner, repo, branch, parseInt(limit));
            res.json(commits);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /git/pull-requests
     */
    async getPullRequests(req, res) {
        try {
            const { owner, repo, state = 'open', limit = 10 } = req.body;
            if (!owner || !repo) {
                return res.status(400).json({ error: 'Owner and repo required' });
            }
            const prs = await git_service_1.gitService.getPullRequests(owner, repo, state, limit);
            res.json({ pullRequests: prs });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * POST /git/analyze-pr
     * Now uses GitHub API instead of local file analysis
     */
    async analyzePullRequest(req, res) {
        try {
            const { owner, repo, prNumber } = req.body;
            if (!owner || !repo || !prNumber) {
                return res.status(400).json({ error: 'Owner, repo, and PR number required' });
            }
            // Get PR details from GitHub API
            const prs = await git_service_1.gitService.getPullRequests(owner, repo, 'all', 100);
            const pr = prs.find(p => p.number === prNumber);
            if (!pr) {
                return res.status(404).json({ error: 'Pull request not found' });
            }
            res.json({
                pr,
                analysis: {
                    message: 'Pull request retrieved from GitHub API',
                    note: 'Detailed file analysis available via GitHub API endpoints'
                }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * POST /git/cleanup
     * Not needed anymore - no local files are stored
     */
    async cleanupRepository(req, res) {
        try {
            res.json({
                success: true,
                message: 'Cleanup not required - no local repository files are stored'
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.GitController = GitController;
exports.gitController = new GitController();
//# sourceMappingURL=git.controller.js.map