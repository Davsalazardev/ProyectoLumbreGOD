"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Performance Analysis Service
 * Detect memory leaks, concurrency issues, bottlenecks, and profiling data
 */
exports.performanceService = {
    /**
     * Detect potential memory leaks in code
     */
    analyzeMemoryLeaks(code, language) {
        const patterns = {
            javascript: [
                /setTimeout\s*\([^,]*,\s*\d+\s*\)\s*;/g, // Unused timeouts
                /setInterval\s*\([^,]*,\s*\d+\s*\)\s*;/g, // Unterminated intervals
                /addEventListener\s*\([^,]*\)\s*;/g, // Event listeners without removal
                /\[.*\]\s*=\s*new\s+\w+/g, // Array growing unbounded
                /Object\..*\s*=\s*\{\}/g, // Circular references
            ],
            python: [
                /def\s+\w+\s*\(.*\):\s*\n\s*global\s+\w+/g, // Global state
                /\.append\s*\(.*\)\s*\n\s*\.append/g, // Growing lists
                /cache\s*\[\w+\]\s*=/g, // Unbounded caches
                /listener\s*\(\)/g, // Listener without cleanup
            ],
            java: [
                /new\s+Thread/g, // Threads without termination
                /Collections\.synchronizedMap/g, // Synchronized collections leak memory
                /AsyncTask.*execute/g, // Async tasks without cleanup
            ],
        };
        const issues = [];
        const regexes = patterns[language] || [];
        for (const regex of regexes) {
            let match;
            while ((match = regex.exec(code)) !== null) {
                issues.push({
                    line: code.substring(0, match.index).split('\n').length,
                    pattern: match[0],
                    severity: 'high',
                    type: 'MEMORY_LEAK'
                });
            }
        }
        return issues;
    },
    /**
     * Detect concurrency and race condition issues
     */
    analyzeConcurrencyIssues(code, language) {
        const patterns = {
            javascript: [
                /await\s+Promise\.all\s*\(\[\]/g, // Empty Promise.all
                /new\s+Promise\s*\(\s*\(resolve\s*,\s*reject\s*\)\s*=>/g, // Unresolved promises
                /\.then\s*\(.*\)\.then/g, // Promise chains without error handling
            ],
            python: [
                /threading\.Thread\([^)]*daemon=False/g, // Non-daemon threads
                /lock\s*=\s*threading\.Lock/g, // Lock without context manager
                /asyncio\.create_task/g, // Tasks without tracking
            ],
            java: [
                /synchronized\s+\(/g, // Potential deadlock
                /Thread\.start\s*\(\)/g, // Thread without join
                /ReentrantLock/g, // Complex locking
            ],
        };
        const issues = [];
        const regexes = patterns[language] || [];
        for (const regex of regexes) {
            let match;
            while ((match = regex.exec(code)) !== null) {
                issues.push({
                    line: code.substring(0, match.index).split('\n').length,
                    pattern: match[0],
                    severity: 'critical',
                    type: 'RACE_CONDITION'
                });
            }
        }
        return issues;
    },
    /**
     * Identify CPU-intensive operations
     */
    analyzeCPUIntensive(code, language) {
        const patterns = {
            javascript: [
                /for\s*\(\s*let\s+\w+\s*=\s*0;.*\.length.*\+\+\s*\)\s*\{[\s\S]*for/g, // Nested loops
                /JSON\.stringify\s*\(/g, // Serialization
                /eval\s*\(/g, // Dynamic evaluation
                /new\s+RegExp\s*\(/g, // Regex compilation in loop
            ],
            python: [
                /for\s+\w+\s+in\s+range\([0-9]+\).*:\s*\n.*for\s+\w+\s+in/g, // Nested loops
                /pickle\.dumps/g, // Serialization
                /eval\s*\(/g, // Dynamic evaluation
                /\.sort\(\)/g, // Sorting operations
            ],
            java: [
                /for\s*\(\s*int.*\.length.*\).*\{[\s\S]*for/g, // Nested loops
                /Stream\..*\.sorted\(\)/g, // Stream sorting
                /ObjectInputStream/g, // Deserialization
            ],
        };
        const issues = [];
        const regexes = patterns[language] || [];
        for (const regex of regexes) {
            let match;
            while ((match = regex.exec(code)) !== null) {
                issues.push({
                    line: code.substring(0, match.index).split('\n').length,
                    pattern: match[0],
                    severity: 'medium',
                    type: 'CPU_INTENSIVE'
                });
            }
        }
        return issues;
    },
    /**
     * Analyze I/O operations
     */
    analyzeIOOperations(code, language) {
        const patterns = {
            javascript: [
                /fs\.(readFile|writeFile|readSync|writeSync)/g, // Blocking or unoptimized I/O
                /fetch\s*\(/g, // Network requests
                /new\s+XMLHttpRequest/g, // Legacy HTTP
            ],
            python: [
                /open\s*\(/g, // File operations
                /requests\.(get|post|put|delete)/g, // HTTP requests
                /\.read\(\)/g, // File reads
            ],
            java: [
                /new\s+(FileInputStream|FileOutputStream|BufferedReader)/g, // File I/O
                /HttpClient/g, // HTTP operations
                /\.read\(\)/g, // I/O reads
            ],
        };
        const issues = [];
        const regexes = patterns[language] || [];
        for (const regex of regexes) {
            let match;
            while ((match = regex.exec(code)) !== null) {
                issues.push({
                    line: code.substring(0, match.index).split('\n').length,
                    pattern: match[0],
                    severity: 'medium',
                    type: 'IO_OPERATION'
                });
            }
        }
        return issues;
    },
    /**
     * Generate performance profile report
     */
    generatePerformanceProfile(issues) {
        const byType = issues.reduce((acc, issue) => {
            acc[issue.type] = (acc[issue.type] || 0) + 1;
            return acc;
        }, {});
        const bySeverity = issues.reduce((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] || 0) + 1;
            return acc;
        }, {});
        return {
            totalIssues: issues.length,
            byType,
            bySeverity,
            averageSeverity: this.calculateAverageSeverity(bySeverity),
            recommendations: this.generateRecommendations(byType)
        };
    },
    /**
     * Calculate average severity score
     */
    calculateAverageSeverity(bySeverity) {
        const severityScores = {
            critical: 10,
            high: 7,
            medium: 5,
            low: 2
        };
        let totalScore = 0;
        let totalCount = 0;
        for (const [severity, count] of Object.entries(bySeverity)) {
            totalScore += (severityScores[severity] || 0) * count;
            totalCount += count;
        }
        return totalCount > 0 ? totalScore / totalCount : 0;
    },
    /**
     * Generate performance improvement recommendations
     */
    generateRecommendations(byType) {
        const recommendations = [];
        if (byType.MEMORY_LEAK && byType.MEMORY_LEAK > 0) {
            recommendations.push('🔴 Review memory management patterns and add garbage collection hooks');
            recommendations.push('   Use profiling tools (Chrome DevTools, Valgrind) to track memory usage');
        }
        if (byType.RACE_CONDITION && byType.RACE_CONDITION > 0) {
            recommendations.push('🔴 Use proper synchronization mechanisms (locks, semaphores)');
            recommendations.push('   Add unit tests with concurrent execution');
        }
        if (byType.CPU_INTENSIVE && byType.CPU_INTENSIVE > 0) {
            recommendations.push('🟡 Break up CPU-intensive operations with yields/delays');
            recommendations.push('   Consider worker threads or async processing');
        }
        if (byType.IO_OPERATION && byType.IO_OPERATION > 0) {
            recommendations.push('🟡 Batch I/O operations and implement caching');
            recommendations.push('   Use connection pooling for network requests');
        }
        if (recommendations.length === 0) {
            recommendations.push('✅ Code appears to follow performance best practices');
        }
        return recommendations;
    },
    /**
     * Analyze function complexity for performance impact
     */
    analyzeFunctionComplexity(code) {
        const functionRegex = /(?:function|async function|\w+\s*=>)\s*\(?([^)]*)\)?\s*[\{:]|def\s+(\w+)\s*\(.*\):|public\s+(?:static)?\s+\w+\s+(\w+)\s*\(/g;
        const functions = [];
        let match;
        const lines = code.split('\n');
        while ((match = functionRegex.exec(code)) !== null) {
            const lineNum = code.substring(0, match.index).split('\n').length;
            const complexity = this.calculateCycloMaticComplexity(code.substring(match.index, match.index + 2000));
            functions.push({
                name: match[1] || match[2] || match[3] || 'anonymous',
                line: lineNum,
                complexity,
                severity: complexity > 10 ? 'high' : complexity > 5 ? 'medium' : 'low'
            });
        }
        return functions;
    },
    /**
     * Calculate cyclomatic complexity (simplified)
     */
    calculateCycloMaticComplexity(code) {
        let complexity = 1;
        complexity += (code.match(/\bif\b/g) || []).length;
        complexity += (code.match(/\belse\s+if\b/g) || []).length;
        complexity += (code.match(/\belse\b/g) || []).length;
        complexity += (code.match(/\bfor\b/g) || []).length;
        complexity += (code.match(/\bwhile\b/g) || []).length;
        complexity += (code.match(/\bcase\b/g) || []).length;
        complexity += (code.match(/\bcatch\b/g) || []).length;
        complexity += (code.match(/\?\s*:/g) || []).length;
        return complexity;
    }
};
//# sourceMappingURL=performance.service.js.map