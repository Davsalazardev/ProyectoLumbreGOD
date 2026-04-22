import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Advanced Search Service
 * Full-text search, complex filters, saved searches, search history
 */
export const searchService = {
  /**
   * Full-text search across code and issues
   */
  async fullTextSearch(query: string, projectId: string, filters?: any): Promise<any[]> {
    const results: any[] = [];
    
    // Normalize query
    const normalizedQuery = query.toLowerCase();
    const terms = normalizedQuery.split(/\s+/);

    // Search in code (simulated)
    const codeMatches = this.searchInCode(normalizedQuery, projectId);
    const issueMatches = this.searchInIssues(normalizedQuery, projectId);

    results.push(...codeMatches, ...issueMatches);

    // Apply filters if provided
    if (filters) {
      return this.applySearchFilters(results, filters);
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  },

  /**
   * Search in code files
   */
  searchInCode(query: string, projectId: string): any[] {
    // Mock implementation
    return [
      {
        type: 'code',
        file: 'src/services/auth.ts',
        line: 42,
        content: `const authenticate = async (${query}) => { ... }`,
        relevance: 0.95
      },
      {
        type: 'code',
        file: 'src/routes/api.ts',
        line: 156,
        content: `app.post('/api/${query}', handler);`,
        relevance: 0.85
      }
    ];
  },

  /**
   * Search in issues and comments
   */
  searchInIssues(query: string, projectId: string): any[] {
    // Mock implementation
    return [
      {
        type: 'issue',
        id: 'ISSUE-123',
        title: `Fix ${query} bug`,
        description: `This issue is about ${query} functionality`,
        severity: 'high',
        relevance: 0.88
      }
    ];
  },

  /**
   * Apply complex search filters
   */
  applySearchFilters(results: any[], filters: any): any[] {
    let filtered = results;

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(r => r.severity === filters.severity);
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(r => {
        const date = new Date(r.date);
        return date >= new Date(filters.dateFrom) && date <= new Date(filters.dateTo);
      });
    }

    // Filter by file type
    if (filters.fileType) {
      filtered = filtered.filter(r => r.file?.endsWith(filters.fileType));
    }

    // Boolean operations
    if (filters.mustHave) {
      filtered = filtered.filter(r => 
        filters.mustHave.every((term: string) => 
          JSON.stringify(r).toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    if (filters.exclude) {
      filtered = filtered.filter(r =>
        !filters.exclude.some((term: string) =>
          JSON.stringify(r).toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    return filtered;
  },

  /**
   * Save search query
   */
  async saveSearch(userId: string, name: string, query: string, filters?: any): Promise<any> {
    return {
      id: `search-${Date.now()}`,
      userId,
      name,
      query,
      filters: filters || {},
      createdAt: new Date(),
      lastUsed: new Date(),
      results: 0
    };
  },

  /**
   * Get saved searches
   */
  async getSavedSearches(userId: string): Promise<any[]> {
    return [
      {
        id: 'search-1',
        name: 'High Priority Issues',
        query: 'severity:high OR severity:critical',
        filters: { severity: 'high' },
        results: 24,
        lastUsed: new Date(Date.now() - 86400000)
      },
      {
        id: 'search-2',
        name: 'Security Vulnerabilities',
        query: 'type:security',
        filters: { type: 'security' },
        results: 12,
        lastUsed: new Date(Date.now() - 172800000)
      }
    ];
  },

  /**
   * Advanced search with operators (AND, OR, NOT)
   */
  async advancedSearch(query: string, projectId: string): Promise<any[]> {
    // Parse complex query with operators
    const orQueries = query.split(/\s+OR\s+/i);
    let results: any[] = [];

    for (const orPart of orQueries) {
      const andQueries = orPart.split(/\s+AND\s+/i);
      let subResults = this.searchInCode(andQueries[0], projectId);

      for (let i = 1; i < andQueries.length; i++) {
        subResults = subResults.filter(r =>
          JSON.stringify(r).toLowerCase().includes(andQueries[i].toLowerCase())
        );
      }

      results.push(...subResults);
    }

    // Remove duplicates
    return Array.from(new Map(results.map(r => [r.id, r])).values());
  },

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, projectId: string): Promise<string[]> {
    const commonSearches = [
      'security vulnerability',
      'performance issue',
      'memory leak',
      'null pointer exception',
      'code duplication',
      'high complexity',
      'uncovered code',
      'deprecated method'
    ];

    return commonSearches.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Track search history
   */
  async recordSearchHistory(userId: string, query: string, projectId: string): Promise<void> {
    // Record for analytics
    console.log(`[Search] User ${userId} searched for: ${query}`);
  },

  /**
   * Get trending searches
   */
  async getTrendingSearches(projectId: string): Promise<any[]> {
    return [
      { query: 'security', count: 156 },
      { query: 'performance', count: 124 },
      { query: 'bug', count: 98 },
      { query: 'memory leak', count: 87 },
      { query: 'complexity', count: 76 }
    ];
  }
};

/**
 * Dependency Scanning Service
 * Identify vulnerable packages, supply chain security, license compliance
 */
export const dependencyService = {
  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies(projectPath: string, language: string): Promise<any> {
    const vulnerabilities = await this.checkVulnerablePackages(projectPath, language);
    const outdated = await this.checkOutdatedPackages(projectPath, language);
    const licenses = await this.checkLicenseCompliance(projectPath, language);

    return {
      vulnerabilities: {
        critical: vulnerabilities.filter((v: any) => v.severity === 'critical').length,
        high: vulnerabilities.filter((v: any) => v.severity === 'high').length,
        medium: vulnerabilities.filter((v: any) => v.severity === 'medium').length,
        low: vulnerabilities.filter((v: any) => v.severity === 'low').length,
        details: vulnerabilities
      },
      outdated: {
        total: outdated.length,
        details: outdated
      },
      licenses: {
        compliant: licenses.filter((l: any) => l.compliant).length,
        nonCompliant: licenses.filter((l: any) => !l.compliant).length,
        details: licenses
      },
      supplyChainRisk: this.calculateSupplyChainRisk(vulnerabilities, outdated, licenses)
    };
  },

  /**
   * Check for known vulnerable packages
   */
  async checkVulnerablePackages(projectPath: string, language: string): Promise<any[]> {
    // Mock vulnerable packages database
    const vulnDb: { [key: string]: any[] } = {
      npm: [
        { name: 'lodash', version: '4.17.19', severity: 'high', cve: 'CVE-2019-1010266', fix: '4.17.20' },
        { name: 'request', version: '2.88.0', severity: 'critical', cve: 'CVE-2020-8251', fix: 'Use axios instead' }
      ],
      pip: [
        { name: 'requests', version: '2.6.0', severity: 'high', cve: 'CVE-2015-7465', fix: '2.7.0' },
        { name: 'django', version: '1.11.0', severity: 'medium', cve: 'CVE-2019-14234', fix: '2.2.0' }
      ]
    };

    return vulnDb[language === 'javascript' ? 'npm' : language === 'python' ? 'pip' : ''] || [];
  },

  /**
   * Check for outdated packages
   */
  async checkOutdatedPackages(projectPath: string, language: string): Promise<any[]> {
    return [
      { name: 'react', current: '17.0.0', latest: '18.2.0', daysOld: 450 },
      { name: 'typescript', current: '4.4.0', latest: '5.0.0', daysOld: 180 },
      { name: 'prettier', current: '2.6.0', latest: '2.8.0', daysOld: 60 }
    ];
  },

  /**
   * Check license compliance
   */
  async checkLicenseCompliance(projectPath: string, language: string): Promise<any[]> {
    return [
      { name: 'react', license: 'MIT', compliant: true },
      { name: 'lodash', license: 'MIT', compliant: true },
      { name: 'commercial-lib', license: 'Proprietary', compliant: false },
      { name: 'gpl-lib', license: 'GPL-3.0', compliant: false }
    ];
  },

  /**
   * Calculate supply chain risk score
   */
  calculateSupplyChainRisk(vuln: any[], outdated: any[], licenses: any[]): any {
    let riskScore = 0;

    // Critical vulnerabilities add 10 points each
    riskScore += (vuln.filter((v: any) => v.severity === 'critical').length) * 10;

    // High vulnerabilities add 5 points each
    riskScore += (vuln.filter((v: any) => v.severity === 'high').length) * 5;

    // Very outdated packages add 3 points
    riskScore += (outdated.filter((o: any) => o.daysOld > 365).length) * 3;

    // Non-compliant licenses add 7 points
    riskScore += (licenses.filter((l: any) => !l.compliant).length) * 7;

    return {
      score: Math.min(riskScore, 100),
      severity: riskScore > 50 ? 'critical' : riskScore > 30 ? 'high' : riskScore > 15 ? 'medium' : 'low',
      recommendations: this.generateSupplyChainRecommendations(riskScore)
    };
  },

  /**
   * Generate supply chain risk recommendations
   */
  generateSupplyChainRecommendations(riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 50) {
      recommendations.push('🔴 CRITICAL: Update all vulnerable packages immediately');
      recommendations.push('🔴 Review and replace non-compliant dependencies');
    } else if (riskScore > 30) {
      recommendations.push('🟡 HIGH RISK: Plan and execute security updates');
      recommendations.push('🟡 Audit supply chain for weaknesses');
    } else if (riskScore > 15) {
      recommendations.push('🟢 MEDIUM: Keep packages up to date');
      recommendations.push('🟢 Review quarterly for security updates');
    } else {
      recommendations.push('✅ LOW RISK: Continue monitoring');
    }

    return recommendations;
  }
};

/**
 * Code Review Assistant Service
 * Auto-suggest improvements, detect patterns, enforce best practices
 */
export const codeReviewService = {
  /**
   * Generate automatic code review suggestions
   */
  async generateReviewSuggestions(code: string, language: string): Promise<any[]> {
    const suggestions: any[] = [];

    // Check naming conventions
    const namingIssues = this.checkNamingConventions(code, language);
    suggestions.push(...namingIssues);

    // Check best practices
    const bestPracticeIssues = this.checkBestPractices(code, language);
    suggestions.push(...bestPracticeIssues);

    // Check security issues
    const securityIssues = this.checkSecurityPatterns(code);
    suggestions.push(...securityIssues);

    // Check performance issues
    const perfIssues = this.checkPerformancePatterns(code);
    suggestions.push(...perfIssues);

    return suggestions.sort((a, b) => b.priority - a.priority);
  },

  /**
   * Check naming conventions
   */
  checkNamingConventions(code: string, language: string): any[] {
    const issues: any[] = [];

    // Check for single letter variables
    const singleLetterVars = code.match(/\b[a-z]\s*=/g) || [];
    if (singleLetterVars.length > 3) {
      issues.push({
        type: 'NAMING',
        severity: 'low',
        priority: 2,
        message: `${singleLetterVars.length} single-letter variables found. Use descriptive names.`,
        line: code.split('\n').findIndex(l => /\b[a-z]\s*=/.test(l)),
        suggestion: 'Rename variables to clarify intent (e.g., "i" -> "index", "x" -> "value")'
      });
    }

    // Check for inconsistent casing
    const camelCaseVars = (code.match(/\b[a-z][a-zA-Z0-9]*\b/g) || []).length;
    const snake_case_vars = (code.match(/\b[a-z_]+_[a-z_]*\b/g) || []).length;

    if (camelCaseVars > 5 && snake_case_vars > 5) {
      issues.push({
        type: 'NAMING',
        severity: 'low',
        priority: 1,
        message: 'Mixed naming conventions (camelCase and snake_case)',
        suggestion: `Use consistent naming: ${language === 'python' ? 'snake_case' : 'camelCase'}`
      });
    }

    return issues;
  },

  /**
   * Check best practices
   */
  checkBestPractices(code: string, language: string): any[] {
    const issues: any[] = [];

    // Check for magic numbers/strings
    const magicStrings = (code.match(/"[^"]{5,}"/g) || []).length;
    if (magicStrings > 10) {
      issues.push({
        type: 'BEST_PRACTICE',
        severity: 'medium',
        priority: 5,
        message: `${magicStrings} magic strings found. Extract to constants.`,
        suggestion: 'Move hardcoded strings to named constants for maintainability'
      });
    }

    // Check for deep nesting
    const deepNesting = /\{\s*\{\s*\{\s*\{/.test(code);
    if (deepNesting) {
      issues.push({
        type: 'BEST_PRACTICE',
        severity: 'medium',
        priority: 4,
        message: 'Deep nesting detected (4+ levels)',
        suggestion: 'Extract nested logic into separate functions'
      });
    }

    // Check function length
    const functions = code.match(/(?:function|def|=>)\s*\({[\s\S]{1,5000}\}/g) || [];
    for (const func of functions) {
      if (func.length > 2000) {
        issues.push({
          type: 'BEST_PRACTICE',
          severity: 'medium',
          priority: 4,
          message: 'Function is too long (>2000 chars)',
          suggestion: 'Break function into smaller, single-responsibility functions'
        });
      }
    }

    return issues;
  },

  /**
   * Check security patterns
   */
  checkSecurityPatterns(code: string): any[] {
    const issues: any[] = [];

    // Check for SQL injection patterns
    if (/query|execute|sql/i.test(code) && !/.prepare|bind|parameterized/i.test(code)) {
      issues.push({
        type: 'SECURITY',
        severity: 'critical',
        priority: 10,
        message: 'Potential SQL injection vulnerability',
        line: code.split('\n').findIndex(l => /query|execute|sql/i.test(l)),
        suggestion: 'Use prepared statements or parameterized queries'
      });
    }

    // Check for hardcoded secrets
    if (/password|token|secret|api.?key/i.test(code) && /=\s*["'][^"']{8,}["']/i.test(code)) {
      issues.push({
        type: 'SECURITY',
        severity: 'critical',
        priority: 10,
        message: 'Potential hardcoded secrets detected',
        suggestion: 'Use environment variables or secure vaults'
      });
    }

    // Check for unsafe deserialization
    if (/eval|deserialize|pickle|JSON\.parse|innerHTML/i.test(code)) {
      issues.push({
        type: 'SECURITY',
        severity: 'high',
        priority: 8,
        message: 'Unsafe deserialization or code execution method',
        suggestion: 'Use safe alternatives (JSON.parse vs eval, etc)'
      });
    }

    return issues;
  },

  /**
   * Check performance patterns
   */
  checkPerformancePatterns(code: string): any[] {
    const issues: any[] = [];

    // Check for nested loops
    const nestedLoops = (code.match(/for|while/gi) || []).length > 5;
    if (nestedLoops) {
      issues.push({
        type: 'PERFORMANCE',
        severity: 'medium',
        priority: 5,
        message: 'Multiple nested loops detected',
        suggestion: 'Consider algorithmic improvements (sorting, indexing, etc)'
      });
    }

    // Check for regex compilation in loop
    if (/new\s+RegExp.*for|for.*new\s+RegExp/i.test(code)) {
      issues.push({
        type: 'PERFORMANCE',
        severity: 'medium',
        priority: 5,
        message: 'RegExp compiled inside loop',
        suggestion: 'Move RegExp compilation outside the loop'
      });
    }

    return issues;
  }
};
