"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRulesService = exports.CustomRulesService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Custom Rules Service
 * Allows users to create project-specific analysis rules
 */
class CustomRulesService {
    /**
     * Create custom rule
     */
    async createRule(projectId, data) {
        return prisma.customRule.create({
            data: {
                projectId,
                ...data
            }
        });
    }
    /**
     * Get project custom rules
     */
    async getProjectRules(projectId, language) {
        return prisma.customRule.findMany({
            where: {
                projectId,
                enabled: true,
                ...(language && { language })
            }
        });
    }
    /**
     * Update custom rule
     */
    async updateRule(ruleId, data) {
        return prisma.customRule.update({
            where: { id: ruleId },
            data
        });
    }
    /**
     * Delete custom rule
     */
    async deleteRule(ruleId) {
        return prisma.customRule.delete({
            where: { id: ruleId }
        });
    }
    /**
     * Toggle rule enabled status
     */
    async toggleRule(ruleId) {
        const rule = await prisma.customRule.findUnique({ where: { id: ruleId } });
        if (!rule)
            throw new Error('Rule not found');
        return prisma.customRule.update({
            where: { id: ruleId },
            data: { enabled: !rule.enabled }
        });
    }
    /**
     * Apply custom rules to code
     */
    async applyCustomRules(projectId, code, language) {
        const rules = await this.getProjectRules(projectId, language);
        const matches = [];
        for (const rule of rules) {
            try {
                const regex = new RegExp(rule.pattern, 'gm');
                let match;
                while ((match = regex.exec(code)) !== null) {
                    const lineNumber = code.substring(0, match.index).split('\n').length;
                    matches.push({
                        file: 'custom-rule',
                        line: lineNumber,
                        column: match.index,
                        severity: rule.severity,
                        type: rule.type,
                        message: `Custom rule: ${rule.name}`,
                        rule: rule.name,
                        codeSnippet: match[0]
                    });
                }
            }
            catch (error) {
                console.error(`Error applying rule ${rule.name}:`, error);
            }
        }
        return matches;
    }
    /**
     * Validate rule regex pattern
     */
    validatePattern(pattern) {
        try {
            new RegExp(pattern);
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
    /**
     * Clone rules from one project to another
     */
    async cloneRules(sourceProjectId, targetProjectId) {
        const rules = await prisma.customRule.findMany({
            where: { projectId: sourceProjectId }
        });
        const cloned = [];
        for (const rule of rules) {
            cloned.push(await this.createRule(targetProjectId, {
                name: rule.name,
                pattern: rule.pattern,
                severity: rule.severity,
                type: rule.type,
                language: rule.language
            }));
        }
        return cloned;
    }
}
exports.CustomRulesService = CustomRulesService;
exports.customRulesService = new CustomRulesService();
//# sourceMappingURL=customRules.service.js.map