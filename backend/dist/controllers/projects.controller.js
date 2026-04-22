"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverLocalProjects = exports.importLocalProjects = exports.generateBadge = exports.resolveIssue = exports.getQualityGateStatus = exports.getMetrics = exports.getIssues = exports.getAnalysisStatus = exports.analyzeProjectBatch = exports.analyzeProject = exports.getProject = exports.listProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const analysis_service_1 = require("../services/analysis.service");
const filesystem_service_1 = require("../services/filesystem.service");
const prisma = new client_1.PrismaClient();
const createProject = async (req, res) => {
    try {
        const { name, language } = req.body;
        const userId = req.userId;
        if (!name) {
            res.status(400).json({ error: 'Project name is required' });
            return;
        }
        const project = await prisma.project.create({
            data: {
                name,
                language: language || 'auto',
                userId
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('createProject error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};
exports.createProject = createProject;
const listProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                analyses: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    include: { metrics: true }
                }
            }
        });
        // Enrich with quality gate status
        const enriched = await Promise.all(projects.map(async (project) => {
            const qg = await (0, analysis_service_1.getQualityGate)(project.id);
            const latestAnalysis = project.analyses[0];
            return {
                ...project,
                latestAnalysis: latestAnalysis || null,
                metrics: latestAnalysis?.metrics || null,
                qualityGate: qg
            };
        }));
        res.json(enriched);
    }
    catch (error) {
        console.error('listProjects error:', error);
        res.status(500).json({ error: 'Failed to list projects' });
    }
};
exports.listProjects = listProjects;
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                analyses: {
                    orderBy: { startedAt: 'desc' },
                    take: 5
                }
            }
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const metrics = await (0, analysis_service_1.getProjectMetrics)(id);
        const qualityGate = await (0, analysis_service_1.getQualityGate)(id);
        res.json({ ...project, metrics, qualityGate });
    }
    catch (error) {
        console.error('getProject error:', error);
        res.status(500).json({ error: 'Failed to get project' });
    }
};
exports.getProject = getProject;
const analyzeProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, filename } = req.body;
        if (!code || !filename) {
            res.status(400).json({ error: 'code and filename are required' });
            return;
        }
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        // Create analysis record
        const analysis = await prisma.analysis.create({
            data: {
                projectId: id,
                status: 'PENDING'
            }
        });
        // Update project language if auto
        const detectedLang = (0, analysis_service_1.detectLanguage)(filename);
        if (project.language === 'auto' && detectedLang !== 'unknown') {
            await prisma.project.update({
                where: { id },
                data: { language: detectedLang }
            });
        }
        // Run analysis asynchronously
        (0, analysis_service_1.runAnalysis)(analysis.id, code, filename).catch(err => {
            console.error('Async analysis error:', err);
        });
        res.status(202).json({
            analysisId: analysis.id,
            status: 'PENDING',
            message: 'Analysis started. Poll /api/projects/:id/analyses/:analysisId for status.'
        });
    }
    catch (error) {
        console.error('analyzeProject error:', error);
        res.status(500).json({ error: 'Failed to start analysis' });
    }
};
exports.analyzeProject = analyzeProject;
const analyzeProjectBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { files } = req.body;
        if (!files || !Array.isArray(files)) {
            res.status(400).json({ error: 'files array is required' });
            return;
        }
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const analysis = await prisma.analysis.create({
            data: {
                projectId: id,
                status: 'PENDING'
            }
        });
        (0, analysis_service_1.runAnalysisBatch)(analysis.id, files).catch(err => console.error('Batch analysis failed:', err));
        res.status(202).json({
            message: 'Batch analysis started',
            analysisId: analysis.id
        });
    }
    catch (error) {
        console.error('analyzeBatch error:', error);
        res.status(500).json({ error: 'Failed to start batch analysis' });
    }
};
exports.analyzeProjectBatch = analyzeProjectBatch;
const getAnalysisStatus = async (req, res) => {
    try {
        const { id, analysisId } = req.params;
        const analysis = await prisma.analysis.findFirst({
            where: { id: analysisId, projectId: id }
        });
        if (!analysis) {
            res.status(404).json({ error: 'Analysis not found' });
            return;
        }
        res.json(analysis);
    }
    catch (error) {
        console.error('getAnalysisStatus error:', error);
        res.status(500).json({ error: 'Failed to get analysis status' });
    }
};
exports.getAnalysisStatus = getAnalysisStatus;
const getIssues = async (req, res) => {
    try {
        const { id } = req.params;
        const { severity, type, file, page = '1', limit = '50' } = req.query;
        const latestAnalysis = await prisma.analysis.findFirst({
            where: { projectId: id, status: 'COMPLETED' },
            orderBy: { startedAt: 'desc' }
        });
        if (!latestAnalysis) {
            res.json({ issues: [], total: 0, page: 1, limit: 50 });
            return;
        }
        const where = { analysisId: latestAnalysis.id };
        if (severity)
            where.severity = severity;
        if (type)
            where.type = type;
        if (file)
            where.file = { contains: file };
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [issues, total] = await Promise.all([
            prisma.issue.findMany({
                where,
                orderBy: [
                    { severity: 'asc' }, // CRITICAL first
                    { file: 'asc' },
                    { line: 'asc' }
                ],
                skip,
                take: limitNum
            }),
            prisma.issue.count({ where })
        ]);
        // Sort by severity priority
        const severityOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
        const sorted = issues.sort((a, b) => (severityOrder[a.severity] || 3)
            - (severityOrder[b.severity] || 3));
        res.json({
            issues: sorted,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        });
    }
    catch (error) {
        console.error('getIssues error:', error);
        res.status(500).json({ error: 'Failed to get issues' });
    }
};
exports.getIssues = getIssues;
const getMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        const metrics = await (0, analysis_service_1.getProjectMetrics)(id);
        res.json(metrics);
    }
    catch (error) {
        console.error('getMetrics error:', error);
        res.status(500).json({ error: 'Failed to get metrics' });
    }
};
exports.getMetrics = getMetrics;
const getQualityGateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const qg = await (0, analysis_service_1.getQualityGate)(id);
        res.json(qg);
    }
    catch (error) {
        console.error('getQualityGate error:', error);
        res.status(500).json({ error: 'Failed to get quality gate' });
    }
};
exports.getQualityGateStatus = getQualityGateStatus;
const resolveIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { resolution } = req.body; // FALSE_POSITIVE, FIXED, OPEN
        const issue = await prisma.issue.update({
            where: { id: issueId },
            data: { resolution }
        });
        res.json(issue);
    }
    catch (error) {
        console.error('resolveIssue error:', error);
        res.status(500).json({ error: 'Failed to resolve issue' });
    }
};
exports.resolveIssue = resolveIssue;
const generateBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const { metric } = req.query; // e.g., 'bugs', 'qualitygate'
        const metrics = await (0, analysis_service_1.getProjectMetrics)(id);
        const qg = await (0, analysis_service_1.getQualityGate)(id);
        let left = 'sonar';
        let right = '';
        let color = 'lightgrey';
        if (metric === 'qualitygate') {
            left = 'Quality Gate';
            right = qg.status === 'PASSED' ? 'APROBADO' : (qg.status === 'UNKNOWN' ? 'N/A' : 'FALLIDO');
            color = qg.status === 'PASSED' ? 'brightgreen' : (qg.status === 'UNKNOWN' ? 'grey' : 'red');
        }
        else if (metric === 'bugs') {
            left = 'Bugs';
            right = metrics?.bugs?.toString() || '0';
            color = metrics?.bugs === 0 ? 'brightgreen' : 'orange';
        }
        else if (metric === 'coverage') {
            left = 'Coverage';
            right = '85%'; // Mocked to represent test coverage demo
            color = 'yellow';
        }
        else {
            left = 'Status';
            right = 'Unknown';
        }
        // A very simple SVG badge generator inline
        const wL = left.length * 7 + 10;
        const wR = right.length * 7 + 10;
        const w = wL + wR;
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="${w}" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h${wL}v20H0z"/>
    <path fill="${color === 'brightgreen' ? '#4c1' : color === 'red' ? '#e05d44' : color === 'orange' ? '#fe7d37' : '#dfb317'}" d="M${wL} 0h${wR}v20H${wL}z"/>
    <path fill="url(#b)" d="M0 0h${w}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${wL / 2}" y="15" fill="#010101" fill-opacity=".3">${left}</text>
    <text x="${wL / 2}" y="14">${left}</text>
    <text x="${wL + wR / 2}" y="15" fill="#010101" fill-opacity=".3">${right}</text>
    <text x="${wL + wR / 2}" y="14">${right}</text>
  </g>
</svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg.trim());
    }
    catch (error) {
        res.status(500).send('Error generating badge');
    }
};
exports.generateBadge = generateBadge;
/**
 * Discover and import projects from ANALIZADOR folder
 */
const importLocalProjects = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const imported = await filesystem_service_1.filesystemService.importLocalProjects(userId);
        res.json({
            message: 'Projects import complete',
            imported: imported.length,
            projects: imported
        });
    }
    catch (error) {
        console.error('importLocalProjects error:', error);
        res.status(500).json({ error: 'Failed to import projects' });
    }
};
exports.importLocalProjects = importLocalProjects;
/**
 * List available projects from ANALIZADOR folder (no import)
 */
const discoverLocalProjects = async (req, res) => {
    try {
        const projects = await filesystem_service_1.filesystemService.discoverProjects();
        res.json({
            message: 'Projects discovered',
            count: projects.length,
            projects
        });
    }
    catch (error) {
        console.error('discoverLocalProjects error:', error);
        res.status(500).json({ error: 'Failed to discover projects' });
    }
};
exports.discoverLocalProjects = discoverLocalProjects;
//# sourceMappingURL=projects.controller.js.map