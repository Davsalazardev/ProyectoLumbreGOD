export declare const metricsAdvancedService: {
    assignSecurityMappings(analysisId: string): Promise<void>;
    calculateCognitiveComplexity(analysisId: string): Promise<number>;
    calculateTechnicalDebtRatio(analysisId: string): Promise<number>;
    calculateIssueAge(analysisId: string): Promise<{
        newIssues: number;
        oldIssues: number;
        avgAgeInDays: number;
    }>;
    generateCodeDistribution(analysisId: string): Promise<{
        low: number;
        medium: number;
        high: number;
    }>;
    generateTestResults(analysisId: string): Promise<void>;
    generateFileComplexity(analysisId: string): Promise<void>;
    createSecurityHotspots(analysisId: string): Promise<void>;
    updateMetricsWithAdvanced(analysisId: string): Promise<void>;
    recordQualityGateHistory(projectId: string, status: string, reason?: string): Promise<void>;
    recordMetricsEvolution(metricId: string): Promise<void>;
};
//# sourceMappingURL=metricsAdvanced.service.d.ts.map