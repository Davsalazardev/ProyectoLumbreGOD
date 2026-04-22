"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicationService = void 0;
/**
 * Duplication Service
 * Detect duplicate code blocks, refactoring opportunities
 */
exports.duplicationService = {
    /**
     * Detect duplicate code blocks
     */
    async detectDuplicateBlocks(code, minLines = 5) {
        const lines = code.split('\n').filter(l => l.trim().length > 0);
        const blocks = {};
        for (let i = 0; i < lines.length - minLines; i++) {
            const block = lines.slice(i, i + minLines).join('\n');
            const normalized = this.normalizeCode(block);
            if (!blocks[normalized]) {
                blocks[normalized] = [];
            }
            blocks[normalized].push(i);
        }
        return Object.entries(blocks)
            .filter(([_, positions]) => positions.length > 1)
            .map(([code, positions]) => ({
            code: code.substring(0, 100) + '...',
            positions,
            duplicateCount: positions.length,
            lines: minLines
        }));
    },
    /**
     * Normalize code for comparison
     */
    normalizeCode(code) {
        return code
            .replace(/\s+/g, ' ')
            .replace(/['"`]/g, '"')
            .trim();
    },
    /**
     * Calculate code duplication percentage
     */
    async calculateDuplicationPercentage(code) {
        const duplicates = await this.detectDuplicateBlocks(code);
        const totalLines = code.split('\n').length;
        const duplicatedLines = duplicates.reduce((sum, d) => sum + (d.lines * (d.duplicateCount - 1)), 0);
        return (duplicatedLines / totalLines) * 100;
    },
    /**
     * Generate refactoring suggestions
     */
    generateRefactoringSuggestions(duplicates) {
        const suggestions = [];
        for (const dup of duplicates) {
            if (dup.duplicateCount > 5) {
                suggestions.push(`🔴 Extract common pattern found ${dup.duplicateCount} times into a utility function`);
            }
            else if (dup.duplicateCount > 2) {
                suggestions.push(`🟡 Consider extracting duplicate block (found ${dup.duplicateCount} times)`);
            }
        }
        return suggestions;
    }
};
//# sourceMappingURL=duplication.service.js.map