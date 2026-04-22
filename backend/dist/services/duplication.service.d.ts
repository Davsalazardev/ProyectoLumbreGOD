/**
 * Duplication Service
 * Detect duplicate code blocks, refactoring opportunities
 */
export declare const duplicationService: {
    /**
     * Detect duplicate code blocks
     */
    detectDuplicateBlocks(code: string, minLines?: number): Promise<any[]>;
    /**
     * Normalize code for comparison
     */
    normalizeCode(code: string): string;
    /**
     * Calculate code duplication percentage
     */
    calculateDuplicationPercentage(code: string): Promise<number>;
    /**
     * Generate refactoring suggestions
     */
    generateRefactoringSuggestions(duplicates: any[]): string[];
};
//# sourceMappingURL=duplication.service.d.ts.map