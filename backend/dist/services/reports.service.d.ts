/**
 * Reports Service
 * Executive, Technical, Compliance, Remediation reports with export formats
 */
export declare const reportsService: {
    /**
     * Generate executive report
     */
    generateExecutiveReport(projectId: string, analysisData: any): Promise<any>;
    /**
     * Generate technical deep-dive report
     */
    generateTechnicalReport(projectId: string, analysisData: any): Promise<any>;
    /**
     * Generate compliance/security report
     */
    generateComplianceReport(projectId: string): Promise<any>;
    /**
     * Generate remediation roadmap report
     */
    generateRemediationReport(projectId: string, issues: any[]): Promise<any>;
    /**
     * Export report in multiple formats
     */
    exportReport(report: any, format: "JSON" | "PDF" | "HTML" | "DOCX"): Promise<any>;
};
//# sourceMappingURL=reports.service.d.ts.map