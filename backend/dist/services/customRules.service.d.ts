/**
 * Custom Rules Service
 * Allows users to create project-specific analysis rules
 */
export declare class CustomRulesService {
    /**
     * Create custom rule
     */
    createRule(projectId: string, data: {
        name: string;
        pattern: string;
        severity: string;
        type: string;
        language: string;
    }): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }>;
    /**
     * Get project custom rules
     */
    getProjectRules(projectId: string, language?: string): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }[]>;
    /**
     * Update custom rule
     */
    updateRule(ruleId: string, data: Partial<{
        name: string;
        pattern: string;
        severity: string;
        type: string;
        enabled: boolean;
    }>): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }>;
    /**
     * Delete custom rule
     */
    deleteRule(ruleId: string): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }>;
    /**
     * Toggle rule enabled status
     */
    toggleRule(ruleId: string): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }>;
    /**
     * Apply custom rules to code
     */
    applyCustomRules(projectId: string, code: string, language: string): Promise<any[]>;
    /**
     * Validate rule regex pattern
     */
    validatePattern(pattern: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Clone rules from one project to another
     */
    cloneRules(sourceProjectId: string, targetProjectId: string): Promise<{
        name: string;
        id: string;
        type: string;
        createdAt: Date;
        projectId: string;
        language: string;
        severity: string;
        pattern: string;
        enabled: boolean;
    }[]>;
}
export declare const customRulesService: CustomRulesService;
//# sourceMappingURL=customRules.service.d.ts.map