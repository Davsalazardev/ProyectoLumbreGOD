interface LocalProject {
    name: string;
    path: string;
    language?: string;
    fileCount: number;
    totalSize: number;
}
export declare class FilesystemService {
    /**
     * Discover projects in ANALIZADOR folder
     */
    discoverProjects(basePath?: string): Promise<LocalProject[]>;
    /**
     * Analyze a project directory
     */
    private analyzeProjectDirectory;
    /**
     * Get all source files in directory
     */
    private getAllFiles;
    /**
     * Check if file is a source file (analyzable)
     */
    private isSourceFile;
    /**
     * Check if file should be included (all files - analyzable or not)
     */
    private shouldIncludeFile;
    /**
     * Detect language from files
     */
    private detectLanguageFromFiles;
    /**
     * Read source code from directory
     */
    readProjectCode(projectPath: string, maxFiles?: number): Promise<Array<{
        file: string;
        code: string;
    }>>;
    /**
     * Import local projects into database and run analysis
     */
    importLocalProjects(userId: string): Promise<any[]>;
    /**
     * Run analysis on all source files in a project
     */
    private runProjectAnalysis;
    /**
     * Process a batch of code files - analyze EACH file separately
     */
    private processCodeBatch;
}
export declare const filesystemService: FilesystemService;
export {};
//# sourceMappingURL=filesystem.service.d.ts.map