"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = exports.MetricsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Advanced SonarQube-like metrics calculations
 */
class MetricsService {
    /**
     * Calculate cyclomatic complexity from code
     * Based on: if, for, while, case, catch, &&, ||, ternary operators
     */
    calculateCyclomaticComplexity(code) {
        let complexity = 1; // Base complexity
        const patterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bfor\s*\(/g,
            /\bwhile\s*\(/g,
            /\bcase\s+/g,
            /\bcatch\s*\(/g,
            /\?\s*.*?\s*:/g, // Ternary operator
            /&&/g,
            /\|\|/g
        ];
        for (const pattern of patterns) {
            const matches = code.match(pattern) || [];
            complexity += matches.length;
        }
        return Math.round(complexity * 100) / 100;
    }
    /**
     * Calculate maintainability index (0-100 scale)
     * Based on: LOC, cyclomatic complexity, Halstead metrics
     * Formula: 171 - 5.2 * ln(maintainability) - 0.23 * complexity - 16.2 * ln(lines)
     */
    calculateMaintainabilityIndex(loc, complexity, bugs, codeSmells) {
        const issueCount = bugs + codeSmells;
        let index = 171 - 5.2 * Math.log(Math.max(1, complexity)) - 0.23 * complexity - 16.2 * Math.log(Math.max(1, loc));
        // Penalize for issues
        index -= issueCount * 2;
        // Clamp to 0-100 range
        return Math.max(0, Math.min(100, index));
    }
    /**
     * Determine security rating based on vulnerabilities (A-E scale)
     * A = No vulnerabilities
     * B = 1-5 vulnerabilities
     * C = 6-15 vulnerabilities
     * D = 16-50 vulnerabilities
     * E = 50+ vulnerabilities
     */
    calculateSecurityRating(vulnerabilityCount) {
        if (vulnerabilityCount === 0)
            return 'A';
        if (vulnerabilityCount <= 5)
            return 'B';
        if (vulnerabilityCount <= 15)
            return 'C';
        if (vulnerabilityCount <= 50)
            return 'D';
        return 'E';
    }
    /**
     * Determine reliability rating based on bugs (A-E scale)
     */
    calculateReliabilityRating(bugCount) {
        if (bugCount === 0)
            return 'A';
        if (bugCount <= 3)
            return 'B';
        if (bugCount <= 10)
            return 'C';
        if (bugCount <= 20)
            return 'D';
        return 'E';
    }
    /**
     * Calculate technical debt in minutes
     * Formula: (bugs * 10 + codeSmells * 2 + vulnerabilities * 15) * average_fix_time
     */
    calculateTechnicalDebt(bugs, codeSmells, vulnerabilities) {
        const bugDebt = bugs * 10;
        const smellDebt = codeSmells * 2;
        const vulnDebt = vulnerabilities * 15;
        return bugDebt + smellDebt + vulnDebt;
    }
    /**
     * Calculate SQALE debt (SonarQube's technical debt metric)
     */
    calculateSqaleDebt(bugs, codeSmells, vulnerabilities, loc) {
        // SQALE Technical Debt in minutes of remediation
        // Bugs: 20 minutes each
        // Code Smells: 5 minutes each
        // Vulnerabilities: 40 minutes each
        return (bugs * 20) + (codeSmells * 5) + (vulnerabilities * 40);
    }
    /**
     * Get metrics history for a project (last N analyses)
     */
    async getProjectMetricsHistory(projectId, limit = 10) {
        return prisma.analysis.findMany({
            where: { projectId, status: 'COMPLETED' },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: { metrics: true }
        });
    }
    /**
     * Calculate trend: increasing or decreasing issues
     */
    calculateTrend(current, previous) {
        if (current > previous)
            return 'up';
        if (current < previous)
            return 'down';
        return 'stable';
    }
    /**
     * Generate quality metrics report
     */
    async generateQualityReport(projectId) {
        const latestAnalysis = await prisma.analysis.findFirst({
            where: { projectId, status: 'COMPLETED' },
            orderBy: { startedAt: 'desc' },
            include: {
                metrics: true,
                issues: true
            }
        });
        if (!latestAnalysis?.metrics) {
            throw new Error('No completed analysis found');
        }
        const metrics = latestAnalysis.metrics;
        const issuesByType = {
            bugs: latestAnalysis.issues.filter(i => i.type === 'BUG').length,
            vulnerabilities: latestAnalysis.issues.filter(i => i.type === 'VULNERABILITY').length,
            codeSmells: latestAnalysis.issues.filter(i => i.type === 'CODE_SMELL').length
        };
        const issueBySeverity = {
            CRITICAL: latestAnalysis.issues.filter(i => i.severity === 'CRITICAL').length,
            MAJOR: latestAnalysis.issues.filter(i => i.severity === 'MAJOR').length,
            MINOR: latestAnalysis.issues.filter(i => i.severity === 'MINOR').length,
            INFO: latestAnalysis.issues.filter(i => i.severity === 'INFO').length
        };
        return {
            analysisId: latestAnalysis.id,
            timestamp: latestAnalysis.startedAt,
            metrics,
            issues: {
                byType: issuesByType,
                bySeverity: issueBySeverity,
                total: latestAnalysis.issues.length
            },
            quality: {
                securityRating: this.calculateSecurityRating(issuesByType.vulnerabilities),
                reliabilityRating: this.calculateReliabilityRating(issuesByType.bugs),
                maintainabilityIndex: this.calculateMaintainabilityIndex(metrics.loc, metrics.cyclomaticComplexity, issuesByType.bugs, issuesByType.codeSmells)
            }
        };
    }
    /**
     * Compare two analyses for regression/improvement
     */
    async compareAnalyses(analysisId1, analysisId2) {
        const analysis1 = await prisma.analysis.findUnique({
            where: { id: analysisId1 },
            include: { metrics: true, issues: true }
        });
        const analysis2 = await prisma.analysis.findUnique({
            where: { id: analysisId2 },
            include: { metrics: true, issues: true }
        });
        if (!analysis1?.metrics || !analysis2?.metrics) {
            throw new Error('One or both analyses not found');
        }
        return {
            bugs: {
                previous: analysis1.metrics.bugs,
                current: analysis2.metrics.bugs,
                trend: this.calculateTrend(analysis2.metrics.bugs, analysis1.metrics.bugs)
            },
            vulnerabilities: {
                previous: analysis1.metrics.vulnerabilities,
                current: analysis2.metrics.vulnerabilities,
                trend: this.calculateTrend(analysis2.metrics.vulnerabilities, analysis1.metrics.vulnerabilities)
            },
            codeSmells: {
                previous: analysis1.metrics.codeSmells,
                current: analysis2.metrics.codeSmells,
                trend: this.calculateTrend(analysis2.metrics.codeSmells, analysis1.metrics.codeSmells)
            },
            loc: {
                previous: analysis1.metrics.loc,
                current: analysis2.metrics.loc,
                change: analysis2.metrics.loc - analysis1.metrics.loc
            },
            technicalDebt: {
                previous: analysis1.metrics.technicalDebt,
                current: analysis2.metrics.technicalDebt,
                trend: this.calculateTrend(analysis2.metrics.technicalDebt, analysis1.metrics.technicalDebt)
            }
        };
    }
}
exports.MetricsService = MetricsService;
exports.metricsService = new MetricsService();
//# sourceMappingURL=metrics.service.js.map