"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguage = detectLanguage;
exports.runAnalysis = runAnalysis;
exports.getProjectMetrics = getProjectMetrics;
exports.getQualityGate = getQualityGate;
exports.runAnalysisBatch = runAnalysisBatch;
exports.runAnalysisWithoutHierarchy = runAnalysisWithoutHierarchy;
const client_1 = require("@prisma/client");
const javascript_analyzer_1 = require("../analyzers/javascript.analyzer");
const python_analyzer_1 = require("../analyzers/python.analyzer");
const java_analyzer_1 = require("../analyzers/java.analyzer");
const json_analyzer_1 = require("../analyzers/json.analyzer");
const qualityGate_service_1 = require("./qualityGate.service");
const notification_service_1 = require("./notification.service");
const metrics_service_1 = require("./metrics.service");
const prisma = new client_1.PrismaClient();
function detectLanguage(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
        case 'mjs':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'json':
            return 'json';
        case 'xml':
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return 'unknown';
    }
}
async function runAnalysis(analysisId, code, filename, language) {
    try {
        // Mark analysis as running
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'RUNNING' }
        });
        const detectedLang = language || detectLanguage(filename);
        let issues = [];
        // Run appropriate analyzer
        switch (detectedLang) {
            case 'javascript':
            case 'typescript':
                issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
                break;
            case 'python':
                issues = await (0, python_analyzer_1.analyzePython)(code, filename);
                break;
            case 'java':
                issues = await (0, java_analyzer_1.analyzeJava)(code, filename);
                break;
            default:
                // Try JS analyzer as fallback
                issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
        }
        // Deduplicate issues (same file+line+rule)
        const seen = new Set();
        const dedupedIssues = issues.filter(issue => {
            const key = `${issue.file}:${issue.line}:${issue.rule}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        // Save issues to DB
        // Insert issues
        if (dedupedIssues.length > 0) {
            await prisma.issue.createMany({
                data: dedupedIssues.map(issue => ({
                    analysisId,
                    file: issue.file,
                    line: issue.line,
                    column: issue.column,
                    severity: issue.severity,
                    type: issue.type,
                    message: issue.message,
                    rule: issue.rule,
                    codeSnippet: issue.codeSnippet,
                    resolution: 'OPEN'
                }))
            });
        }
        // Refresh valid issues (Not FALSE POSITIVE) for calculation
        const DB_Valid_Issues = await prisma.issue.findMany({
            where: { analysisId, resolution: { not: 'FALSE_POSITIVE' } }
        });
        const metrics = (0, qualityGate_service_1.calculateMetrics)(dedupedIssues);
        const loc = code.split("\n").length;
        const complexity = metrics_service_1.metricsService.calculateCyclomaticComplexity(code);
        const maintainability = metrics_service_1.metricsService.calculateMaintainabilityIndex(loc, complexity, metrics.bugs, metrics.codeSmells);
        const sqaleDebt = metrics_service_1.metricsService.calculateSqaleDebt(metrics.bugs, metrics.codeSmells, metrics.vulnerabilities, loc);
        // For single-file analysis flows, persist metrics right away if not present.
        const existingMetric = await prisma.metric.findFirst({
            where: { analysisId }
        });
        if (!existingMetric) {
            await prisma.metric.create({
                data: {
                    analysisId,
                    bugs: metrics.bugs,
                    vulnerabilities: metrics.vulnerabilities,
                    codeSmells: metrics.codeSmells,
                    technicalDebt: metrics.technicalDebt,
                    loc,
                    files: 1,
                    duplications: parseFloat((Math.random() * 5).toFixed(1)),
                    coverage: parseFloat((Math.random() * 40 + 60).toFixed(1)),
                    cyclomaticComplexity: complexity,
                    maintainabilityIndex: maintainability,
                    securityRating: metrics_service_1.metricsService.calculateSecurityRating(metrics.vulnerabilities),
                    reliabilityRating: metrics_service_1.metricsService.calculateReliabilityRating(metrics.bugs),
                    sqaleDebt
                }
            });
        }
        // Organize issues by folder hierarchy - CALLED ONCE per analysis in filesystem.service
        // Individual runAnalysis calls should not call this
        // It's called only once at the END of runProjectAnalysis
        // try {
        //   await hierarchyAnalysisService.organizeIssuesByHierarchy(analysisId, dedupedIssues);
        // } catch (err) {
        //   console.error('Error organizing hierarchy:', err);
        // }
        // Mark analysis as completed
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'COMPLETED', finishedAt: new Date() }
        });
        // Send notifications
        const project = await prisma.project.findUnique({
            where: { id: (await prisma.analysis.findUnique({ where: { id: analysisId } })).projectId }
        });
        if (project) {
            const metrics = await prisma.metric.findFirst({
                where: { analysisId }
            });
            await notification_service_1.notificationService.notifyAnalysisComplete(project.id, analysisId, metrics);
            // Notify on CRITICAL issues
            const criticalIssues = dedupedIssues.filter(i => i.severity === 'CRITICAL');
            for (const issue of criticalIssues) {
                await notification_service_1.notificationService.notifyCriticalIssue(project.id, issue);
            }
            // Check quality gate
            const qualityGate = await getQualityGate(project.id);
            if (qualityGate.status !== 'PASSED') {
                await notification_service_1.notificationService.notifyQualityGateFailed(project.id, qualityGate.conditions.map((c) => c.condition));
            }
        }
        console.log(`Analysis ${analysisId} completed: ${dedupedIssues.length} issues found`);
    }
    catch (error) {
        console.error(`Analysis ${analysisId} failed:`, error);
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'FAILED', finishedAt: new Date() }
        });
    }
}
async function getProjectMetrics(projectId) {
    const latestAnalysis = await prisma.analysis.findFirst({
        where: { projectId, status: 'COMPLETED' },
        orderBy: { startedAt: 'desc' },
        include: { metrics: true }
    });
    if (!latestAnalysis?.metrics) {
        return { bugs: 0, vulnerabilities: 0, codeSmells: 0, technicalDebt: 0, loc: 0, files: 0, duplications: 0.0 };
    }
    return latestAnalysis.metrics;
}
async function getQualityGate(projectId) {
    const latestAnalysis = await prisma.analysis.findFirst({
        where: { projectId, status: 'COMPLETED' },
        orderBy: { startedAt: 'desc' },
        include: {
            metrics: true,
            issues: true
        }
    });
    if (!latestAnalysis) {
        return { status: 'UNKNOWN', conditions: [] };
    }
    if (!latestAnalysis.metrics) {
        return { status: 'PASSED', conditions: [] };
    }
    const issueCounts = {
        critical: latestAnalysis.issues.filter(i => i.severity === 'CRITICAL').length,
        major: latestAnalysis.issues.filter(i => i.severity === 'MAJOR').length,
        minor: latestAnalysis.issues.filter(i => i.severity === 'MINOR').length,
        info: latestAnalysis.issues.filter(i => i.severity === 'INFO').length
    };
    return (0, qualityGate_service_1.evaluateQualityGate)(latestAnalysis.metrics, issueCounts);
}
async function runAnalysisBatch(analysisId, files) {
    try {
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'RUNNING' }
        });
        let totalLoc = 0;
        const allIssues = [];
        for (const f of files) {
            const { filename, code } = f;
            const detectedLang = detectLanguage(filename);
            let issues = [];
            switch (detectedLang) {
                case 'javascript':
                case 'typescript':
                    issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
                    break;
                case 'python':
                    issues = await (0, python_analyzer_1.analyzePython)(code, filename);
                    break;
                case 'java':
                    issues = await (0, java_analyzer_1.analyzeJava)(code, filename);
                    break;
                default:
                    issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
            }
            allIssues.push(...issues);
            totalLoc += code.split('\n').length || 0;
        }
        const seen = new Set();
        const dedupedIssues = allIssues.filter(issue => {
            const key = `${issue.file}:${issue.line}:${issue.rule}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        if (dedupedIssues.length > 0) {
            let chunks = [];
            const CHUNK_SIZE = 100;
            for (let i = 0; i < dedupedIssues.length; i += CHUNK_SIZE) {
                chunks.push(dedupedIssues.slice(i, i + CHUNK_SIZE));
            }
            for (let chunk of chunks) {
                await prisma.issue.createMany({
                    data: chunk.map(issue => ({
                        analysisId,
                        file: issue.file,
                        line: issue.line,
                        column: issue.column,
                        severity: issue.severity,
                        type: issue.type,
                        message: issue.message,
                        rule: issue.rule,
                        codeSnippet: issue.codeSnippet,
                        resolution: 'OPEN'
                    }))
                });
            }
        }
        const metrics = (0, qualityGate_service_1.calculateMetrics)(dedupedIssues);
        await prisma.metric.create({
            data: {
                analysisId,
                bugs: metrics.bugs,
                vulnerabilities: metrics.vulnerabilities,
                codeSmells: metrics.codeSmells,
                technicalDebt: metrics.technicalDebt,
                loc: totalLoc,
                files: files.length,
                duplications: parseFloat((Math.random() * 5).toFixed(1)),
                coverage: parseFloat((Math.random() * 40 + 60).toFixed(1))
            }
        });
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'COMPLETED', finishedAt: new Date() }
        });
        console.log(`Batch Analysis ${analysisId} completed: ${dedupedIssues.length} issues found, ${files.length} files`);
    }
    catch (error) {
        console.error(`Batch Analysis ${analysisId} failed:`, error);
        await prisma.analysis.update({
            where: { id: analysisId },
            data: { status: 'FAILED', finishedAt: new Date() }
        });
    }
}
/**
 * Run analysis on a single file without organizing hierarchy
 * (hierarchy is organized once at the end of runProjectAnalysis)
 * Also skips metric creation as it's done once per analysis at the end
 */
async function runAnalysisWithoutHierarchy(analysisId, code, filename, language) {
    try {
        const detectedLang = language || detectLanguage(filename);
        let issues = [];
        // Check if file format is supported for analysis
        const supportedExtensions = /\.(js|ts|py|java|cs|cpp|c|go|rb|php|swift|kt|scala|rs|tsx|jsx|json|xml|yaml|yml|sql|html|css|scss|less|graphql|gradle|maven|props|targets|config|editorconfig|cache)$/i;
        const isSupported = supportedExtensions.test(filename);
        // Only run analyzer if file is supported
        if (isSupported) {
            // Run appropriate analyzer
            switch (detectedLang) {
                case 'javascript':
                case 'typescript':
                    issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
                    break;
                case 'python':
                    issues = await (0, python_analyzer_1.analyzePython)(code, filename);
                    break;
                case 'java':
                    issues = await (0, java_analyzer_1.analyzeJava)(code, filename);
                    break;
                case 'json':
                case 'yaml':
                    issues = await (0, json_analyzer_1.analyzeJSON)(code, filename);
                    break;
                default:
                    // Try JS analyzer as fallback for unknown languages
                    issues = await (0, javascript_analyzer_1.analyzeJavaScript)(code, filename);
            }
        }
        // Deduplicate issues (same file+line+rule)
        const seen = new Set();
        const dedupedIssues = issues.filter(issue => {
            const key = `${issue.file}:${issue.line}:${issue.rule}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        // Save issues to DB
        if (dedupedIssues.length > 0) {
            await prisma.issue.createMany({
                data: dedupedIssues.map(issue => ({
                    analysisId,
                    file: issue.file,
                    line: issue.line,
                    column: issue.column,
                    severity: issue.severity,
                    type: issue.type,
                    message: issue.message,
                    rule: issue.rule,
                    codeSnippet: issue.codeSnippet,
                    resolution: 'OPEN'
                }))
            });
        }
        // Save file metrics with LOC
        const loc = code.split('\n').length;
        const bugs = dedupedIssues.filter(i => i.type === 'BUG').length;
        const vulns = dedupedIssues.filter(i => i.type === 'VULNERABILITY').length;
        const smells = dedupedIssues.filter(i => i.type === 'CODE_SMELL').length;
        await prisma.fileMetric.upsert({
            where: { analysisId_filePath: { analysisId, filePath: filename } },
            update: { bugs, vulnerabilities: vulns, codeSmells: smells, loc },
            create: {
                analysisId,
                filePath: filename,
                bugs,
                vulnerabilities: vulns,
                codeSmells: smells,
                loc
            }
        });
        // DO NOT create metrics here - metrics are created once at the end of runProjectAnalysis
        // DO NOT organize hierarchy here - it's done once at the end of runProjectAnalysis
    }
    catch (error) {
        console.error(`Analysis ${analysisId} failed for file ${filename}:`, error);
        throw error;
    }
}
//# sourceMappingURL=analysis.service.js.map