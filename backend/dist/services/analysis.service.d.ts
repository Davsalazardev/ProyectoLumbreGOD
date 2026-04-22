import { Language } from '../types';
export declare function detectLanguage(filename: string): Language;
export declare function runAnalysis(analysisId: string, code: string, filename: string, language?: Language): Promise<void>;
export declare function getProjectMetrics(projectId: string): Promise<{
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
} | {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    technicalDebt: number;
    loc: number;
    files: number;
    duplications: number;
}>;
export declare function getQualityGate(projectId: string): Promise<import("../types").QualityGateResult | {
    status: string;
    conditions: never[];
}>;
export declare function runAnalysisBatch(analysisId: string, files: {
    filename: string;
    code: string;
}[]): Promise<void>;
/**
 * Run analysis on a single file without organizing hierarchy
 * (hierarchy is organized once at the end of runProjectAnalysis)
 * Also skips metric creation as it's done once per analysis at the end
 */
export declare function runAnalysisWithoutHierarchy(analysisId: string, code: string, filename: string, language?: Language): Promise<void>;
//# sourceMappingURL=analysis.service.d.ts.map