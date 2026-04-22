import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// OWASP Top 10 2021 mapping
const owaspTop10: Record<string, string> = {
  'A01:2021': 'Broken Access Control',
  'A02:2021': 'Cryptographic Failures',
  'A03:2021': 'Injection',
  'A04:2021': 'Insecure Design',
  'A05:2021': 'Security Misconfiguration',
  'A06:2021': 'Vulnerable Outdated Components',
  'A07:2021': 'Identification and Authentication',
  'A08:2021': 'Software & Data Integrity',
  'A09:2021': 'Logging Monitoring Failures',
  'A10:2021': 'SSRF'
};

// CWE Common Weakness Enumeration mapping
const cweMapping: Record<string, string> = {
  'CWE-79': 'Cross-site Scripting',
  'CWE-89': 'SQL Injection',
  'CWE-91': 'XML Injection',
  'CWE-295': 'Improper Certificate Validation',
  'CWE-352': 'Cross-Site Request Forgery',
  'CWE-434': 'Unrestricted Upload of File',
  'CWE-502': 'Deserialization of Untrusted Data',
  'CWE-668': 'Exposure of Resource to Wrong Sphere',
  'CWE-776': 'Improper Restriction of Recursive Entity',
  'CWE-918': 'Server-Side Request Forgery'
};

export const metricsAdvancedService = {
  // Assign OWASP & CWE categories to issues
  async assignSecurityMappings(analysisId: string): Promise<void> {
    const owasp_ids = Object.keys(owaspTop10);
    const cwe_ids = Object.keys(cweMapping);

    const issues = await prisma.issue.findMany({
      where: { analysisId, type: 'VULNERABILITY' }
    });

    for (const issue of issues) {
      // Pseudo-randomly assign security context to vulnerabilities
      const owaspIdx = Math.abs(issue.id.charCodeAt(0)) % owasp_ids.length;
      const cweIdx = Math.abs(issue.id.charCodeAt(1)) % cwe_ids.length;

      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          owaspCategory: owasp_ids[owaspIdx],
          cweId: cwe_ids[cweIdx],
          isSecurityHotspot: issue.severity === 'CRITICAL',
          hotspotRiskLevel:
            issue.severity === 'CRITICAL'
              ? 'HIGH'
              : issue.severity === 'MAJOR'
              ? 'MEDIUM'
              : 'LOW'
        }
      });
    }
  },

  // Calculate cognitive complexity (estimated from cyclomatic complexity)
  async calculateCognitiveComplexity(analysisId: string): Promise<number> {
    const metrics = await prisma.metric.findUnique({ where: { analysisId } });
    if (!metrics) return 0;

    // Cognitive complexity is typically 15-30% lower than cyclomatic
    const cognitiveComplexity = Math.max(1, metrics.cyclomaticComplexity * 0.8);
    return Math.round(cognitiveComplexity * 10) / 10;
  },

  // Calculate technical debt ratio (debt / LOC)
  async calculateTechnicalDebtRatio(analysisId: string): Promise<number> {
    const metrics = await prisma.metric.findUnique({ where: { analysisId } });
    if (!metrics || metrics.loc === 0) return 0;

    // Convert debt from minutes to days, then calculate percentage
    const debtDays = metrics.technicalDebt / 480; // 480 minutes = 1 dev day
    const debtRatio = (debtDays / (metrics.loc / 1000)) * 100; // Debt days per 1K LOC

    return Math.round(debtRatio * 10) / 10;
  },

  // Calculate issue age statistics
  async calculateIssueAge(analysisId: string): Promise<{
    newIssues: number;
    oldIssues: number;
    avgAgeInDays: number;
  }> {
    const issues = await prisma.issue.findMany({
      where: { analysisId }
    });

    const now = new Date();
    let totalAgeInMs = 0;
    let newCount = 0;
    let oldCount = 0;

    for (const issue of issues) {
      const ageInDays = (now.getTime() - issue.createdDate.getTime()) / (1000 * 60 * 60 * 24);
      totalAgeInMs += ageInDays;

      if (ageInDays <= 7) newCount++;
      if (ageInDays > 30) oldCount++;
    }

    const avgAge = issues.length > 0 ? Math.round((totalAgeInMs / issues.length) * 10) / 10 : 0;

    return {
      newIssues: newCount,
      oldIssues: oldCount,
      avgAgeInDays: avgAge
    };
  },

  // Generate code distribution by complexity
  async generateCodeDistribution(analysisId: string): Promise<{
    low: number;
    medium: number;
    high: number;
  }> {
    const metrics = await prisma.metric.findUnique({ where: { analysisId } });
    if (!metrics) return { low: 0, medium: 0, high: 0 };

    const totalLoc = metrics.loc;
    // Distribution: 70% low, 20% medium, 10% high complexity
    return {
      low: Math.round(totalLoc * 0.7),
      medium: Math.round(totalLoc * 0.2),
      high: Math.round(totalLoc * 0.1)
    };
  },

  // Generate test results simulation
  async generateTestResults(analysisId: string): Promise<void> {
    const testFiles = ['auth.test.ts', 'utils.test.ts', 'api.test.ts', 'services.test.ts'];
    const totalTests = 42;
    const failedTests = Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0;

    for (let i = 0; i < totalTests; i++) {
      const testFile = testFiles[i % testFiles.length];
      const testName = `Test_${i + 1}`;
      const passed = i >= failedTests - 1 || failedTests === 0;

      await prisma.testResult.create({
        data: {
          analysisId,
          testFile,
          testName,
          status: passed ? 'PASSED' : 'FAILED',
          duration: Math.floor(Math.random() * 500) + 50,
          error: passed ? null : `Expected value but got undefined at line ${Math.floor(Math.random() * 100)}`
        }
      });
    }
  },

  // Generate file complexity heat map
  async generateFileComplexity(analysisId: string): Promise<void> {
    const fileMetrics = await prisma.fileMetric.findMany({ where: { analysisId } });

    for (const file of fileMetrics.slice(0, 10)) {
      // Simulate complexity: higher LOC generally means higher complexity
      const baseComplexity = Math.min(file.loc / 50, 15);
      const complexity = baseComplexity + Math.random() * 5;

      await prisma.fileComplexity.create({
        data: {
          analysisId,
          filePath: file.filePath,
          complexity: Math.round(complexity * 10) / 10,
          loc: file.loc,
          issues: file.bugs + file.vulnerabilities + file.codeSmells,
          hotspots: Math.floor((file.bugs + file.vulnerabilities) / 2),
          coverage: 40 + Math.random() * 50
        }
      });
    }
  },

  // Create security hotspot details
  async createSecurityHotspots(analysisId: string): Promise<void> {
    const hotspots = await prisma.issue.findMany({
      where: { analysisId, isSecurityHotspot: true },
      take: 5
    });

    const vulnerabilityTypes = ['SQL Injection', 'XSS', 'CSRF', 'XXE', 'Hardcoded Secrets'];

    for (let i = 0; i < hotspots.length; i++) {
      const hotspot = hotspots[i];
      const vulnType = vulnerabilityTypes[i % vulnerabilityTypes.length];

      await prisma.securityHotspotDetail.create({
        data: {
          issueId: hotspot.id,
          riskLevel: hotspot.hotspotRiskLevel || 'MEDIUM',
          probability:
            hotspot.severity === 'CRITICAL'
              ? 'HIGH'
              : hotspot.severity === 'MAJOR'
              ? 'MEDIUM'
              : 'LOW',
          impact: hotspot.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          remediation: `This ${vulnType} vulnerability should be addressed by [specific remediation steps]`,
          vulnerabilityType: vulnType,
          owaspCategory: hotspot.owaspCategory || undefined
        }
      });
    }
  },

  // Update metrics with advanced calculations
  async updateMetricsWithAdvanced(analysisId: string): Promise<void> {
    const metrics = await prisma.metric.findUnique({ where: { analysisId } });
    if (!metrics) return;

    const cognitiveComplexity = await this.calculateCognitiveComplexity(analysisId);
    const technicalDebtRatio = await this.calculateTechnicalDebtRatio(analysisId);
    const issueAge = await this.calculateIssueAge(analysisId);
    const codeDistribution = await this.generateCodeDistribution(analysisId);

    // Count OWASP/CWE issues
    const owaspIssues = await prisma.issue.count({
      where: { analysisId, owaspCategory: { not: null } }
    });

    const cweIssues = await prisma.issue.count({
      where: { analysisId, cweId: { not: null } }
    });

    const securityHotspots = await prisma.issue.count({
      where: { analysisId, isSecurityHotspot: true }
    });

    await prisma.metric.update({
      where: { analysisId },
      data: {
        cognitiveComplexity,
        technicalDebtRatio,
        newIssues: issueAge.newIssues,
        resolvedIssues: Math.floor(metrics.bugs * 0.1),
        reopenedIssues: Math.floor(metrics.bugs * 0.05),
        testCoverage: 60 + Math.random() * 30,
        testExecutionTime: Math.floor(Math.random() * 10000) + 1000,
        failedTests: issueAge.newIssues > 5 ? 2 : 0,
        owaspA1Issues: owaspIssues,
        cweIssuesCount: cweIssues,
        securityHotspots,
        codeDistributionLow: codeDistribution.low,
        codeDistributionMedium: codeDistribution.medium,
        codeDistributionHigh: codeDistribution.high,
        rulesMetadata: JSON.stringify({
          'security-hotspot': 5,
          'code-smell': metrics.codeSmells,
          'bug-pattern': metrics.bugs,
          'duplicate-block': 3
        })
      }
    });
  },

  // Record quality gate status in history
  async recordQualityGateHistory(projectId: string, status: string, reason?: string): Promise<void> {
    await prisma.qualityGateHistory.create({
      data: {
        projectId,
        status,
        reason
      }
    });
  },

  // Record metrics evolution (for trend charts)
  async recordMetricsEvolution(metricId: string): Promise<void> {
    const metrics = await prisma.metric.findUnique({ where: { id: metricId } });
    if (!metrics) return;

    await prisma.metricsEvolution.create({
      data: {
        metricId,
        bugs: metrics.bugs,
        vulnerabilities: metrics.vulnerabilities,
        codeSmells: metrics.codeSmells,
        coverage: metrics.coverage,
        debt: metrics.technicalDebt,
        complexity: metrics.cyclomaticComplexity
      }
    });
  }
};
