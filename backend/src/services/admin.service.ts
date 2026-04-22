/**
 * Admin Service
 * System management, audit logs, permissions, health monitoring
 */
export const adminService = {
  /**
   * Get system statistics
   */
  getSystemStats(): any {
    return {
      totalProjects: 42,
      totalUsers: 15,
      totalIssues: 1234,
      totalAnalyses: 5678,
      uptime: 99.95,
      avgResponseTime: 245
    };
  },

  /**
   * Get audit log
   */
  getAuditLog(limit: number = 50): any[] {
    return [
      { action: 'PROJECT_CREATED', user: 'john_doe', timestamp: new Date(Date.now() - 3600000) },
      { action: 'ANALYSIS_RUN', user: 'jane_smith', timestamp: new Date(Date.now() - 7200000) },
      { action: 'REPORT_GENERATED', user: 'admin', timestamp: new Date(Date.now() - 10800000) }
    ];
  },

  /**
   * Get system health
   */
  getSystemHealth(): any {
    return {
      status: 'HEALTHY',
      database: {
        status: 'OK',
        responseTime: 45
      },
      cache: {
        status: 'OK',
        hitRate: 87.5
      },
      queue: {
        status: 'OK',
        pending: 12
      }
    };
  },

  /**
   * Get project rankings
   */
  getProjectRankings(): any[] {
    return [
      { rank: 1, name: 'Project A', score: 95 },
      { rank: 2, name: 'Project B', score: 88 },
      { rank: 3, name: 'Project C', score: 82 }
    ];
  }
};
