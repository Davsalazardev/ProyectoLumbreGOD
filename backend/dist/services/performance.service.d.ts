/**
 * Performance Analysis Service
 * Detect memory leaks, concurrency issues, bottlenecks, and profiling data
 */
export declare const performanceService: {
    /**
     * Detect potential memory leaks in code
     */
    analyzeMemoryLeaks(code: string, language: string): any[];
    /**
     * Detect concurrency and race condition issues
     */
    analyzeConcurrencyIssues(code: string, language: string): any[];
    /**
     * Identify CPU-intensive operations
     */
    analyzeCPUIntensive(code: string, language: string): any[];
    /**
     * Analyze I/O operations
     */
    analyzeIOOperations(code: string, language: string): any[];
    /**
     * Generate performance profile report
     */
    generatePerformanceProfile(issues: any[]): any;
    /**
     * Calculate average severity score
     */
    calculateAverageSeverity(bySeverity: any): number;
    /**
     * Generate performance improvement recommendations
     */
    generateRecommendations(byType: any): string[];
    /**
     * Analyze function complexity for performance impact
     */
    analyzeFunctionComplexity(code: string): any[];
    /**
     * Calculate cyclomatic complexity (simplified)
     */
    calculateCycloMaticComplexity(code: string): number;
};
//# sourceMappingURL=performance.service.d.ts.map