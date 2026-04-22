"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mlService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Machine Learning Service
 * Bug prediction, anomaly detection, pattern recognition, and intelligent insights
 */
exports.mlService = {
    /**
     * Predict bug probability in code based on patterns
     */
    async predictBugProbability(code, language) {
        const patterns = this.extractPatterns(code, language);
        const riskFactors = this.calculateRiskFactors(patterns);
        return {
            bugProbability: this.calculateBugScore(riskFactors),
            riskFactors,
            predictions: this.generateBugPredictions(riskFactors, code),
            confidence: this.calculateConfidence(patterns)
        };
    },
    /**
     * Extract code patterns that correlate with bugs
     */
    extractPatterns(code, language) {
        return {
            nullChecks: this.countNullChecks(code, language),
            errorHandling: this.countErrorHandling(code, language),
            testCoverage: this.estimateTestCoverage(code, language),
            complexity: this.analyzeComplexity(code),
            codeSmells: this.detectCodeSmells(code, language),
            commentRatio: this.calculateCommentRatio(code),
            variableNaming: this.analyzeVariableNaming(code),
            magicNumbers: this.detectMagicNumbers(code),
            duplicateCode: this.detectDuplicatePatterns(code),
            typeSafety: this.checkTypeSafety(code, language)
        };
    },
    /**
     * Count null/undefined checks
     */
    countNullChecks(code, language) {
        const patterns = {
            javascript: /(\bif\s*\(\s*(?:\w+\s*)?[!=]{2}=?\s*(?:null|undefined))|(\?\.|\.optional\(\))/gi,
            python: /(\bif\s+\w+\s+is\s+None)|(\w+\s+or\s+)/gi,
            java: /(\bif\s*\(\s*\w+\s*!=\s*null)|(@Nullable|@NotNull)/gi,
            typescript: /(\bif\s*\(\s*(?:\w+\s*)?[!=]{2}=?\s*(?:null|undefined|void))|(\?\.|!\.)/gi,
        };
        const pattern = patterns[language] || /null|undefined/gi;
        return (code.match(pattern) || []).length;
    },
    /**
     * Count error handling (try-catch, error handling patterns)
     */
    countErrorHandling(code, language) {
        const patterns = {
            javascript: /(\btry\s*\{)|(\bcatch\s*\()|(\bthrow\s+new\s+Error)/gi,
            python: /(\btry\s*:)|(\bexcept\s+)|(raise\s+)/gi,
            java: /(\btry\s*\{)|(\bcatch\s*\()|(\bthrows\s+)/gi,
        };
        const pattern = patterns[language] || /try|catch|throw|except|raise/gi;
        return (code.match(pattern) || []).length;
    },
    /**
     * Estimate test coverage by finding test keywords
     */
    estimateTestCoverage(code, language) {
        const testKeywords = ['describe', 'it(', 'test(', '@Test', 'def test_', 'assert', 'expect', 'assertEqual', 'assertTrue'];
        const matches = testKeywords.filter(kw => code.includes(kw)).length;
        return Math.min(matches * 10, 100);
    },
    /**
     * Analyze code complexity metrics
     */
    analyzeComplexity(code) {
        const lines = code.split('\n');
        const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
        let cyclomaticComplexity = 1;
        cyclomaticComplexity += (code.match(/\bif\b/g) || []).length;
        cyclomaticComplexity += (code.match(/\bfor\b/g) || []).length;
        cyclomaticComplexity += (code.match(/\bwhile\b/g) || []).length;
        cyclomaticComplexity += (code.match(/\bcase\b/g) || []).length;
        cyclomaticComplexity += (code.match(/\bcatch\b/g) || []).length;
        return {
            lines: nonEmptyLines,
            cyclomatic: cyclomaticComplexity,
            avgComplexity: cyclomaticComplexity / Math.max(1, nonEmptyLines / 10)
        };
    },
    /**
     * Detect common code smells
     */
    detectCodeSmells(code, language) {
        const smells = [];
        // Long functions
        const functionLengths = code.match(/(?:function|def|public)[\s\S]{0,5000}/g) || [];
        functionLengths.forEach((func, idx) => {
            if (func.length > 3000) {
                smells.push(`Function ${idx + 1} is too long (${func.length} chars)`);
            }
        });
        // Duplicate code
        if (this.detectDuplicatePatterns(code) > 5) {
            smells.push('High code duplication detected');
        }
        // Many parameters
        if ((code.match(/\(\s*\w+.*,.*,.*,.*,.*,/g) || []).length > 0) {
            smells.push('Functions with 5+ parameters detected');
        }
        // Deep nesting
        if ((code.match(/\{\s*\{\s*\{\s*\{/g) || []).length > 0) {
            smells.push('Deep nesting detected (4+ levels)');
        }
        // Magic numbers
        if (this.detectMagicNumbers(code) > 5) {
            smells.push('Multiple magic numbers detected');
        }
        return smells;
    },
    /**
     * Calculate comment ratio
     */
    calculateCommentRatio(code) {
        const totalLines = code.split('\n').length;
        const commentLines = (code.match(/\/\//g) || []).length + (code.match(/\/\*/g) || []).length;
        return (commentLines / Math.max(1, totalLines)) * 100;
    },
    /**
     * Analyze variable naming quality
     */
    analyzeVariableNaming(code) {
        const singleLetterVars = (code.match(/\b[a-z]\s*[=:]/g) || []).length;
        const descriptiveVars = (code.match(/\b[a-z][a-z0-9_]{3,}\s*[=:]/g) || []).length;
        return {
            singleLetterCount: singleLetterVars,
            descriptiveCount: descriptiveVars,
            qualityScore: Math.min((descriptiveVars / Math.max(1, singleLetterVars + descriptiveVars)) * 100, 100)
        };
    },
    /**
     * Detect magic numbers (hardcoded constants)
     */
    detectMagicNumbers(code) {
        const magicNumberPattern = /(?<![a-zA-Z_])\d{2,}(?![a-zA-Z_])/g;
        return (code.match(magicNumberPattern) || []).length;
    },
    /**
     * Detect duplicate code patterns
     */
    detectDuplicatePatterns(code) {
        const lines = code.split('\n');
        const duplicates = {};
        for (const line of lines) {
            const normalized = line.replace(/\s+/g, ' ').trim();
            if (normalized.length > 10) {
                duplicates[normalized] = (duplicates[normalized] || 0) + 1;
            }
        }
        return Object.values(duplicates).filter(count => count > 1).length;
    },
    /**
     * Check type safety (TypeScript/Java specific)
     */
    checkTypeSafety(code, language) {
        if (!['typescript', 'java'].includes(language))
            return 50;
        let typedVars = 0;
        let totalVars = 0;
        if (language === 'typescript') {
            totalVars = (code.match(/:\s*\w+/g) || []).length;
            typedVars = (code.match(/:\s*(?:string|number|boolean|any|void|null|undefined)/gi) || []).length;
        }
        else if (language === 'java') {
            totalVars = (code.match(/(?:int|String|boolean|double|List|Map)\s+\w+/g) || []).length;
        }
        return totalVars > 0 ? (typedVars / totalVars) * 100 : 75;
    },
    /**
     * Calculate risk factors from patterns
     */
    calculateRiskFactors(patterns) {
        const riskFactors = {};
        // Low null checks = higher risk
        riskFactors.nullCheckRisk = patterns.nullChecks < 2 ? 8 : 3;
        // Low error handling = higher risk
        riskFactors.errorHandlingRisk = patterns.errorHandling < 2 ? 7 : 2;
        // Low test coverage = higher risk
        riskFactors.testCoverageRisk = patterns.testCoverage < 30 ? 6 : 1;
        // High complexity = higher risk
        riskFactors.complexityRisk = patterns.complexity.cyclomatic > 10 ? 7 : patterns.complexity.cyclomatic > 5 ? 4 : 1;
        // Code smells = higher risk
        riskFactors.codeSmellRisk = Math.min(patterns.codeSmells.length * 2, 10);
        // Low comments = higher risk
        riskFactors.documentationRisk = patterns.commentRatio < 10 ? 4 : 1;
        // Poor naming = higher risk
        riskFactors.namingRisk = patterns.variableNaming.singleLetterCount > 5 ? 5 : 1;
        // Magic numbers = higher risk
        riskFactors.magicNumberRisk = patterns.magicNumbers > 10 ? 5 : 1;
        // Duplicate code = higher risk
        riskFactors.duplicationRisk = patterns.duplicateCode > 5 ? 6 : 1;
        // Low type safety = higher risk
        riskFactors.typeSafetyRisk = patterns.typeSafety < 50 ? 5 : 1;
        return riskFactors;
    },
    /**
     * Calculate overall bug probability score (0-100)
     */
    calculateBugScore(riskFactors) {
        const factors = Object.values(riskFactors);
        const avgRisk = factors.reduce((a, b) => a + b, 0) / factors.length;
        return Math.round(Math.min((avgRisk / 10) * 100, 100));
    },
    /**
     * Generate specific bug predictions
     */
    generateBugPredictions(riskFactors, code) {
        const predictions = [];
        if (riskFactors.nullCheckRisk > 5) {
            predictions.push('🔴 High risk: Potential null/undefined reference errors');
        }
        if (riskFactors.errorHandlingRisk > 5) {
            predictions.push('🔴 High risk: Unhandled exceptions may crash the application');
        }
        if (riskFactors.complexityRisk > 5) {
            predictions.push('🟡 Medium risk: Complex logic is error-prone');
        }
        if (riskFactors.testCoverageRisk > 5) {
            predictions.push('🟠 Risk: Insufficient test coverage');
        }
        if (riskFactors.codeSmellRisk > 5) {
            predictions.push('🟡 Medium risk: Multiple code smells indicate poor quality');
        }
        if (predictions.length === 0) {
            predictions.push('✅ Code appears well-structured with low bug probability');
        }
        return predictions;
    },
    /**
     * Calculate confidence score for predictions
     */
    calculateConfidence(patterns) {
        let score = 50;
        if (patterns.complexity.lines > 100)
            score += 15; // More data = better prediction
        if (patterns.errorHandling > 2)
            score += 10; // More test patterns
        if (patterns.commentRatio > 15)
            score += 10; // Well documented code
        if (patterns.typeSafety > 70)
            score += 15; // Typed code is more predictable
        return Math.min(score, 95);
    },
    /**
     * Detect anomalies in code patterns
     */
    async detectAnomalies(code, language) {
        const patterns = this.extractPatterns(code, language);
        const anomalies = [];
        // Check for unusual patterns
        if (patterns.complexity.avgComplexity > 5) {
            anomalies.push({
                type: 'COMPLEXITY_ANOMALY',
                severity: 'high',
                description: 'Unusually high code complexity detected'
            });
        }
        if (patterns.commentRatio > 80) {
            anomalies.push({
                type: 'OVER_DOCUMENTATION_ANOMALY',
                severity: 'low',
                description: 'Code is over-documented (more comments than code)'
            });
        }
        if (patterns.duplicateCode > 20) {
            anomalies.push({
                type: 'DUPLICATION_ANOMALY',
                severity: 'medium',
                description: 'Excessive code duplication detected'
            });
        }
        if (patterns.nullChecks === 0 && patterns.errorHandling === 0) {
            anomalies.push({
                type: 'NO_DEFENSIVE_PROGRAMMING_ANOMALY',
                severity: 'critical',
                description: 'No null checks or error handling found'
            });
        }
        return anomalies;
    },
    /**
     * Suggest refactoring improvements based on ML model
     */
    async generateRefactoringPlan(code, language) {
        const patterns = this.extractPatterns(code, language);
        const suggestions = [];
        if (patterns.complexity.cyclomatic > 10) {
            suggestions.push('🔄 Break down complex functions into smaller, focused functions');
            suggestions.push('🔄 Extract conditional logic into separate helper functions');
        }
        if (patterns.duplicateCode > 5) {
            suggestions.push('🔄 Extract duplicate code into reusable functions');
            suggestions.push('🔄 Create utility libraries for common patterns');
        }
        if (patterns.nullChecks === 0) {
            suggestions.push('🔄 Add null/undefined checks at function entry points');
            suggestions.push('🔄 Use optional chaining and nullish coalescing operators');
        }
        if (patterns.variableNaming.singleLetterCount > 3) {
            suggestions.push('🔄 Rename single-letter variables to be more descriptive');
        }
        if (patterns.commentRatio < 5) {
            suggestions.push('🔄 Add more comments explaining complex business logic');
        }
        return {
            priorityScore: this.calculateBugScore(this.calculateRiskFactors(patterns)),
            suggestions,
            estimatedEffort: suggestions.length > 3 ? 'high' : suggestions.length > 1 ? 'medium' : 'low'
        };
    }
};
//# sourceMappingURL=ml.service.js.map