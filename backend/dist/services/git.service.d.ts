/**
 * Lightweight Git service that uses GitHub API - NO LOCAL CLONING
 * Fetches data directly from GitHub without storing files locally
 * Data is temporary and not persisted to disk
 */
export declare class GitService {
    private githubToken;
    /**
     * Parse GitHub URL to get owner and repo
     */
    private parseGitHubUrl;
    /**
     * Make GitHub API request with authentication
     */
    private githubRequest;
    /**
     * Import a repository from GitHub (NO LOCAL CLONING)
     */
    importRepository(url: string, branch?: string): Promise<{
        success: boolean;
        repository: {
            id: any;
            name: any;
            owner: any;
            url: any;
            description: any;
            stars: any;
            forks: any;
            watchers: any;
            language: any;
            languages: any;
            isPublic: boolean;
            createdAt: any;
            updatedAt: any;
            defaultBranch: any;
            topics: any;
            license: any;
            size: any;
            archived: any;
        };
        branch: any;
        lastCommit: any;
        topContributors: any[];
        message: string;
    }>;
    /**
     * Get repository metadata from GitHub API
     */
    getRepositoryMetadata(owner: string, repo: string): Promise<{
        id: any;
        name: any;
        owner: any;
        url: any;
        description: any;
        stars: any;
        forks: any;
        watchers: any;
        language: any;
        languages: any;
        isPublic: boolean;
        createdAt: any;
        updatedAt: any;
        defaultBranch: any;
        topics: any;
        license: any;
        size: any;
        archived: any;
    }>;
    /**
     * Get all branches from repository
     */
    getAllBranches(owner: string, repo: string): Promise<any[]>;
    /**
     * Get commit history without cloning
     */
    getCommitHistory(owner: string, repo: string, branch?: string, limit?: number): Promise<any[]>;
    /**
     * Get pull requests
     */
    getPullRequests(owner: string, repo: string, state?: string, limit?: number): Promise<any[]>;
    /**
     * Get repository contributors
     */
    getContributors(owner: string, repo: string, limit?: number): Promise<any[]>;
    /**
     * Get file content from repository
     */
    getFileContent(owner: string, repo: string, filePath: string, branch?: string): Promise<string>;
    /**
     * Get repository languages from GitHub API
     */
    getRepositoryLanguages(owner: string, repo: string): Promise<any>;
    /**
     * Set up webhook for automatic analysis
     */
    setupWebhook(owner: string, repo: string, webhookUrl: string): Promise<any>;
    /**
     * Get recent release info
     */
    getLatestRelease(owner: string, repo: string): Promise<any>;
    /**
     * Get repository issues (without PRs)
     */
    getIssues(owner: string, repo: string, state?: string, limit?: number): Promise<any[]>;
    /**
     * Get repository releases with download info
     */
    getReleases(owner: string, repo: string, limit?: number): Promise<any[]>;
    /**
     * Get code frequency statistics
     */
    getCodeFrequency(owner: string, repo: string): Promise<any[]>;
    /**
     * Get traffic analytics (views and clones)
     */
    getTraffic(owner: string, repo: string): Promise<any>;
    /**
     * Get commit network graph timeline
     */
    getNetworkData(owner: string, repo: string, branch: string, limit?: number): Promise<any>;
    /**
     * Get README file content
     */
    getReadmeContent(owner: string, repo: string): Promise<string | null>;
    /**
     * Get repository license information
     */
    getLicense(owner: string, repo: string): Promise<string | null>;
    /**
     * Check if repository is archived
     */
    isArchived(owner: string, repo: string): Promise<boolean>;
    /**
     * Get fork information and parent repository details
     */
    getForkInfo(owner: string, repo: string): Promise<any>;
    /**
     * Get all topics/tags for a repository
     */
    getRepositoryTopics(owner: string, repo: string): Promise<string[]>;
    /**
     * Search repositories (using GitHub search API)
     */
    searchRepositories(query: string, limit?: number): Promise<any[]>;
    /**
     * Get repository collaborators
     */
    getCollaborators(owner: string, repo: string, limit?: number): Promise<any[]>;
}
export declare const gitService: GitService;
//# sourceMappingURL=git.service.d.ts.map