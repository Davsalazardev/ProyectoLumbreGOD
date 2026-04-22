/**
 * Report generation service
 * Generates PDF, compliance, OWASP, and security reports
 */
export declare class ReportService {
    /**
     * Generate compliance report (OWASP, CWE mappings)
     */
    generateComplianceReport(projectId: string, format?: string): Promise<{
        projectId: string;
        generatedAt: Date;
        summary: {
            totalIssues: number;
            owasp: Record<string, number>;
            cwe: Record<string, number>;
            criticalCount: number;
            recommendations: string[];
        };
    }>;
    /**
     * Generate OWASP Top 10 mapping
     */
    private categorizeOWASP;
    /**
     * Generate CWE mapping
     */
    private categorizeCWE;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Generate PDF report
     */
    generatePDFReport(projectId: string): Promise<Buffer>;
    /**
     * Generate security review
     */
    generateSecurityReview(projectId: string): Promise<{
        projectId: string;
        generatedAt: Date;
        securityScore: number;
        trendAnalysis: string;
        vulnerabilitiesByType: Record<string, number>;
        topVulnerabilities: {
            id: string;
            type: string;
            message: string;
            analysisId: string;
            file: string;
            folder: string | null;
            line: number;
            column: number;
            severity: string;
            rule: string;
            codeSnippet: string | null;
            resolution: string;
            createdDate: Date;
            updatedDate: Date | null;
            owaspCategory: string | null;
            cweId: string | null;
            isSecurityHotspot: boolean;
            hotspotRiskLevel: string | null;
            review: string | null;
        }[];
        remediationSteps: string[];
    }>;
    /**
     * Calculate security score (0-100)
     */
    private calculateSecurityScore;
    /**
     * Analyze trend across analyses
     */
    private analyzeTrend;
    /**
     * Group by type
     */
    private groupByType;
    /**
     * Generate remediation steps
     */
    private generateRemediationSteps;
    /**
     * Get all reports for project
     */
    getProjectReports(projectId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        title: string;
        content: string;
        format: string;
    }[]>;
    /**
     * Export report as JSON
     */
    exportAsJSON(reportId: string): Promise<any>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map