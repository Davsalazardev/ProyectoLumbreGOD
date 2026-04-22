import { NormalizedIssue } from '../types';
export declare class HierarchyAnalysisService {
    /**
     * Organize issues by folder and file structure
     */
    organizeIssuesByHierarchy(analysisId: string, issues: NormalizedIssue[]): Promise<void>;
    /**
     * Get folder hierarchy for a project INCLUDING FILES
     */
    getFolderHierarchy(analysisId: string): Promise<any>;
    /**
     * Get issues for a specific folder
     */
    getIssuesByFolder(analysisId: string, folderPath: string): Promise<any>;
    /**
     * Get issues for a specific file
     */
    getIssuesByFile(analysisId: string, filePath: string): Promise<any>;
    /**
     * Get trend data for project metrics over time
     */
    getMetricsTrend(projectId: string, limit?: number): Promise<any[]>;
}
export declare const hierarchyAnalysisService: HierarchyAnalysisService;
//# sourceMappingURL=hierarchyAnalysis.service.d.ts.map