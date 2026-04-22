/**
 * CI/CD Integration Service
 * Jenkins, GitHub Actions, GitLab CI, Azure Pipelines, Slack, Discord, Teams
 */
export declare const cicdService: {
    /**
     * Process GitHub Actions workflow results
     */
    processGitHubActionsWebhook(payload: any): Promise<any>;
    /**
     * Fetch GitHub Actions logs
     */
    fetchGitHubActionsLogs(runId: number): Promise<string>;
    /**
     * Process Jenkins build results
     */
    processJenkinsBuild(payload: any): Promise<any>;
    /**
     * Process GitLab CI results
     */
    processGitLabCIPipeline(payload: any): Promise<any>;
    /**
     * Process Azure Pipelines results
     */
    processAzurePipelinesBuild(payload: any): Promise<any>;
    /**
     * Send notification to Slack
     */
    sendSlackNotification(webhookUrl: string, status: "PASSED" | "FAILED" | "IN_PROGRESS", buildInfo: any): Promise<any>;
    /**
     * Send notification to Discord
     */
    sendDiscordNotification(webhookUrl: string, status: "PASSED" | "FAILED" | "IN_PROGRESS", buildInfo: any): Promise<any>;
    /**
     * Send notification to Microsoft Teams
     */
    sendTeamsNotification(webhookUrl: string, status: "PASSED" | "FAILED" | "IN_PROGRESS", buildInfo: any): Promise<any>;
    /**
     * Create deployment pipeline configuration
     */
    generateGitHubActionsYAML(projectName: string): string;
    /**
     * Generate GitLab CI configuration
     */
    generateGitLabCIYAML(projectName: string): string;
    /**
     * Generate Azure Pipelines configuration
     */
    generateAzurePipelinesYAML(projectName: string): string;
    /**
     * Create code coverage badge
     */
    generateCoverageBadge(coverage: number): string;
    /**
     * Get deployment status summary
     */
    getDeploymentSummary(projectId: string): Promise<any>;
};
//# sourceMappingURL=cicd.service.d.ts.map