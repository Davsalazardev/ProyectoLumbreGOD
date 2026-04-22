/**
 * Machine Learning Service
 * Bug prediction, anomaly detection, pattern recognition, and intelligent insights
 */
export declare const mlService: {
    /**
     * Predict bug probability in code based on patterns
     */
    predictBugProbability(code: string, language: string): Promise<any>;
    /**
     * Extract code patterns that correlate with bugs
     */
    extractPatterns(code: string, language: string): any;
    /**
     * Count null/undefined checks
     */
    countNullChecks(code: string, language: string): number;
    /**
     * Count error handling (try-catch, error handling patterns)
     */
    countErrorHandling(code: string, language: string): number;
    /**
     * Estimate test coverage by finding test keywords
     */
    estimateTestCoverage(code: string, language: string): number;
    /**
     * Analyze code complexity metrics
     */
    analyzeComplexity(code: string): any;
    /**
     * Detect common code smells
     */
    detectCodeSmells(code: string, language: string): string[];
    /**
     * Calculate comment ratio
     */
    calculateCommentRatio(code: string): number;
    /**
     * Analyze variable naming quality
     */
    analyzeVariableNaming(code: string): any;
    /**
     * Detect magic numbers (hardcoded constants)
     */
    detectMagicNumbers(code: string): number;
    /**
     * Detect duplicate code patterns
     */
    detectDuplicatePatterns(code: string): number;
    /**
     * Check type safety (TypeScript/Java specific)
     */
    checkTypeSafety(code: string, language: string): number;
    /**
     * Calculate risk factors from patterns
     */
    calculateRiskFactors(patterns: any): any;
    /**
     * Calculate overall bug probability score (0-100)
     */
    calculateBugScore(riskFactors: any): number;
    /**
     * Generate specific bug predictions
     */
    generateBugPredictions(riskFactors: any, code: string): string[];
    /**
     * Calculate confidence score for predictions
     */
    calculateConfidence(patterns: any): number;
    /**
     * Detect anomalies in code patterns
     */
    detectAnomalies(code: string, language: string): Promise<any[]>;
    /**
     * Suggest refactoring improvements based on ML model
     */
    generateRefactoringPlan(code: string, language: string): Promise<any>;
};
//# sourceMappingURL=ml.service.d.ts.map