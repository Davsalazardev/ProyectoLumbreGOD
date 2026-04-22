"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsTrend = exports.getIssuesByFile = exports.getIssuesByFolder = exports.getFolderHierarchy = void 0;
const hierarchyAnalysis_service_1 = require("../services/hierarchyAnalysis.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFolderHierarchy = async (req, res) => {
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
        const hierarchy = await hierarchyAnalysis_service_1.hierarchyAnalysisService.getFolderHierarchy(latestAnalysis.id);
        res.json(hierarchy);
    }
    catch (error) {
        console.error('getFolderHierarchy error:', error);
        res.status(500).json({ error: 'Failed to get folder hierarchy' });
    }
};
exports.getFolderHierarchy = getFolderHierarchy;
const getIssuesByFolder = async (req, res) => {
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
        const issues = await hierarchyAnalysis_service_1.hierarchyAnalysisService.getIssuesByFolder(latestAnalysis.id, folderPath);
        res.json({ issues, total: issues.length });
    }
    catch (error) {
        console.error('getIssuesByFolder error:', error);
        res.status(500).json({ error: 'Failed to get folder issues' });
    }
};
exports.getIssuesByFolder = getIssuesByFolder;
const getIssuesByFile = async (req, res) => {
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
        const issues = await hierarchyAnalysis_service_1.hierarchyAnalysisService.getIssuesByFile(latestAnalysis.id, filePath);
        res.json({ issues, total: issues.length });
    }
    catch (error) {
        console.error('getIssuesByFile error:', error);
        res.status(500).json({ error: 'Failed to get file issues' });
    }
};
exports.getIssuesByFile = getIssuesByFile;
const getMetricsTrend = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = '20' } = req.query;
        const trend = await hierarchyAnalysis_service_1.hierarchyAnalysisService.getMetricsTrend(projectId, parseInt(limit));
        res.json({ trend });
    }
    catch (error) {
        console.error('getMetricsTrend error:', error);
        res.status(500).json({ error: 'Failed to get metrics trend' });
    }
};
exports.getMetricsTrend = getMetricsTrend;
//# sourceMappingURL=hierarchy.controller.js.map