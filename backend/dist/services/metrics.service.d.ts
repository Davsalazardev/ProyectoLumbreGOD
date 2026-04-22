/**
 * Advanced SonarQube-like metrics calculations
 */
export declare class MetricsService {
    /**
     * Calculate cyclomatic complexity from code
     * Based on: if, for, while, case, catch, &&, ||, ternary operators
     */
    calculateCyclomaticComplexity(code: string): number;
    /**
     * Calculate maintainability index (0-100 scale)
     * Based on: LOC, cyclomatic complexity, Halstead metrics
     * Formula: 171 - 5.2 * ln(maintainability) - 0.23 * complexity - 16.2 * ln(lines)
     */
    calculateMaintainabilityIndex(loc: number, complexity: number, bugs: number, codeSmells: number): number;
    /**
     * Determine security rating based on vulnerabilities (A-E scale)
     * A = No vulnerabilities
     * B = 1-5 vulnerabilities
     * C = 6-15 vulnerabilities
     * D = 16-50 vulnerabilities
     * E = 50+ vulnerabilities
     */
    calculateSecurityRating(vulnerabilityCount: number): string;
    /**
     * Determine reliability rating based on bugs (A-E scale)
     */
    calculateReliabilityRating(bugCount: number): string;
    /**
     * Calculate technical debt in minutes
     * Formula: (bugs * 10 + codeSmells * 2 + vulnerabilities * 15) * average_fix_time
     */
    calculateTechnicalDebt(bugs: number, codeSmells: number, vulnerabilities: number): number;
    /**
     * Calculate SQALE debt (SonarQube's technical debt metric)
     */
    calculateSqaleDebt(bugs: number, codeSmells: number, vulnerabilities: number, loc: number): number;
    /**
     * Get metrics history for a project (last N analyses)
     */
    getProjectMetricsHistory(projectId: string, limit?: number): Promise<({
        metrics: {
            id: string;
            analysisId: string;
            bugs: number;
            vulnerabilities: number;
            codeSmells: number;
            technicalDebt: number;
            loc: number;
            files: number;
            duplications: number;
            coverage: number;
            cyclomaticComplexity: number;
            cognitiveComplexity: number;
            maintainabilityIndex: number;
            maintainabilityRating: string;
            securityRating: string;
            reliabilityRating: string;
            sqaleDebt: number;
            technicalDebtRatio: number;
            newIssues: number;
            resolvedIssues: number;
            reopenedIssues: number;
            testCoverage: number;
            testExecutionTime: number;
            failedTests: number;
            owaspA1Issues: number;
            cweIssuesCount: number;
            securityHotspots: number;
            codeDistributionLow: number;
            codeDistributionMedium: number;
            codeDistributionHigh: number;
            rulesMetadata: string;
        } | null;
    } & {
        id: string;
        projectId: string;
        status: string;
        startedAt: Date;
        finishedAt: Date | null;
        branchId: string | null;
    })[]>;
    /**
     * Calculate trend: increasing or decreasing issues
     */
    calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable';
    /**
     * Generate quality metrics report
     */
    generateQualityReport(projectId: string): Promise<{
        analysisId: string;
        timestamp: Date;
        metrics: {
            id: string;
            analysisId: string;
            bugs: number;
            vulnerabilities: number;
            codeSmells: number;
            technicalDebt: number;
            loc: number;
            files: number;
            duplications: number;
            coverage: number;
            cyclomaticComplexity: number;
            cognitiveComplexity: number;
            maintainabilityIndex: number;
            maintainabilityRating: string;
            securityRating: string;
            reliabilityRating: string;
            sqaleDebt: number;
            technicalDebtRatio: number;
            newIssues: number;
            resolvedIssues: number;
            reopenedIssues: number;
            testCoverage: number;
            testExecutionTime: number;
            failedTests: number;
            owaspA1Issues: number;
            cweIssuesCount: number;
            securityHotspots: number;
            codeDistributionLow: number;
            codeDistributionMedium: number;
            codeDistributionHigh: number;
            rulesMetadata: string;
        };
        issues: {
            byType: {
                bugs: number;
                vulnerabilities: number;
                codeSmells: number;
            };
            bySeverity: {
                CRITICAL: number;
                MAJOR: number;
                MINOR: number;
                INFO: number;
            };
            total: number;
        };
        quality: {
            securityRating: string;
            reliabilityRating: string;
            maintainabilityIndex: number;
        };
    }>;
    /**
     * Compare two analyses for regression/improvement
     */
    compareAnalyses(analysisId1: string, analysisId2: string): Promise<{
        bugs: {
            previous: number;
            current: number;
            trend: "up" | "down" | "stable";
        };
        vulnerabilities: {
            previous: number;
            current: number;
            trend: "up" | "down" | "stable";
        };
        codeSmells: {
            previous: number;
            current: number;
            trend: "up" | "down" | "stable";
        };
        loc: {
            previous: number;
            current: number;
            change: number;
        };
        technicalDebt: {
            previous: number;
            current: number;
            trend: "up" | "down" | "stable";
        };
    }>;
}
export declare const metricsService: MetricsService;
//# sourceMappingURL=metrics.service.d.ts.map