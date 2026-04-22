/**
 * Advanced Search Service
 * Full-text search, complex filters, saved searches, search history
 */
export declare const searchService: {
    /**
     * Full-text search across code and issues
     */
    fullTextSearch(query: string, projectId: string, filters?: any): Promise<any[]>;
    /**
     * Search in code files
     */
    searchInCode(query: string, projectId: string): any[];
    /**
     * Search in issues and comments
     */
    searchInIssues(query: string, projectId: string): any[];
    /**
     * Apply complex search filters
     */
    applySearchFilters(results: any[], filters: any): any[];
    /**
     * Save search query
     */
    saveSearch(userId: string, name: string, query: string, filters?: any): Promise<any>;
    /**
     * Get saved searches
     */
    getSavedSearches(userId: string): Promise<any[]>;
    /**
     * Advanced search with operators (AND, OR, NOT)
     */
    advancedSearch(query: string, projectId: string): Promise<any[]>;
    /**
     * Get search suggestions
     */
    getSearchSuggestions(query: string, projectId: string): Promise<string[]>;
    /**
     * Track search history
     */
    recordSearchHistory(userId: string, query: string, projectId: string): Promise<void>;
    /**
     * Get trending searches
     */
    getTrendingSearches(projectId: string): Promise<any[]>;
};
/**
 * Dependency Scanning Service
 * Identify vulnerable packages, supply chain security, license compliance
 */
export declare const dependencyService: {
    /**
     * Scan dependencies for vulnerabilities
     */
    scanDependencies(projectPath: string, language: string): Promise<any>;
    /**
     * Check for known vulnerable packages
     */
    checkVulnerablePackages(projectPath: string, language: string): Promise<any[]>;
    /**
     * Check for outdated packages
     */
    checkOutdatedPackages(projectPath: string, language: string): Promise<any[]>;
    /**
     * Check license compliance
     */
    checkLicenseCompliance(projectPath: string, language: string): Promise<any[]>;
    /**
     * Calculate supply chain risk score
     */
    calculateSupplyChainRisk(vuln: any[], outdated: any[], licenses: any[]): any;
    /**
     * Generate supply chain risk recommendations
     */
    generateSupplyChainRecommendations(riskScore: number): string[];
};
/**
 * Code Review Assistant Service
 * Auto-suggest improvements, detect patterns, enforce best practices
 */
export declare const codeReviewService: {
    /**
     * Generate automatic code review suggestions
     */
    generateReviewSuggestions(code: string, language: string): Promise<any[]>;
    /**
     * Check naming conventions
     */
    checkNamingConventions(code: string, language: string): any[];
    /**
     * Check best practices
     */
    checkBestPractices(code: string, language: string): any[];
    /**
     * Check security patterns
     */
    checkSecurityPatterns(code: string): any[];
    /**
     * Check performance patterns
     */
    checkPerformancePatterns(code: string): any[];
};
//# sourceMappingURL=search.service.d.ts.map