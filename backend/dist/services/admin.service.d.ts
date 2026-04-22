/**
 * Admin Service
 * System management, audit logs, permissions, health monitoring
 */
export declare const adminService: {
    /**
     * Get system statistics
     */
    getSystemStats(): any;
    /**
     * Get audit log
     */
    getAuditLog(limit?: number): any[];
    /**
     * Get system health
     */
    getSystemHealth(): any;
    /**
     * Get project rankings
     */
    getProjectRankings(): any[];
};
//# sourceMappingURL=admin.service.d.ts.map