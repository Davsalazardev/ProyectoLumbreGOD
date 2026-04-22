import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Report generation service
 * Generates PDF, compliance, OWASP, and security reports
 */
export class ReportService {
  /**
   * Generate compliance report (OWASP, CWE mappings)
   */
  async generateComplianceReport(projectId: string, format = 'json') {
    const analyses = await prisma.analysis.findMany({
      where: { projectId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      take: 1,
      include: { issues: true, metrics: true }
    });

    if (!analyses.length) {
      throw new Error('No completed analysis found');
    }

    const analysis = analyses[0];
    const owasp = this.categorizeOWASP(analysis.issues);
    const cwe = this.categorizeCWE(analysis.issues);

    const report = {
      projectId,
      generatedAt: new Date(),
      summary: {
        totalIssues: analysis.issues.length,
        owasp,
        cwe,
        criticalCount: analysis.issues.filter(i => i.severity === 'CRITICAL').length,
        recommendations: this.generateRecommendations(analysis.issues)
      }
    };

    // Save report to database
    const reportContent = JSON.stringify(report);
    await prisma.report.create({
      data: {
        projectId,
        type: 'COMPLIANCE',
        title: `Compliance Report - ${projectId}`,
        jsonData: reportContent,
        format
      }
    });

    return report;
  }

  /**
   * Generate OWASP Top 10 mapping
   */
  private categorizeOWASP(issues: any[]): Record<string, number> {
    const owasp: Record<string, number> = {
      'A01_BrokenAccessControl': 0,
      'A02_CryptographicFailures': 0,
      'A03_Injection': 0,
      'A04_InsecureDesign': 0,
      'A05_SecurityMisconfiguration': 0,
      'A06_VulnerableOutdatedComponents': 0,
      'A07_AuthenticationFailures': 0,
      'A08_SoftwareDataIntegrity': 0,
      'A09_LoggingMonitoringFailures': 0,
      'A10_SSRF': 0
    };

    for (const issue of issues) {
      if (issue.rule.includes('SQL') || issue.rule.includes('injection')) {
        owasp['A03_Injection']++;
      } else if (issue.rule.includes('crypto') || issue.rule.includes('hash')) {
        owasp['A02_CryptographicFailures']++;
      } else if (issue.rule.includes('auth') || issue.rule.includes('password')) {
        owasp['A07_AuthenticationFailures']++;
      } else if (issue.rule.includes('XSS') || issue.rule.includes('innerHTML')) {
        owasp['A03_Injection']++;
      } else if (issue.rule.includes('CSRF')) {
        owasp['A01_BrokenAccessControl']++;
      } else if (issue.type === 'VULNERABILITY') {
        owasp['A04_InsecureDesign']++;
      }
    }

    return owasp;
  }

  /**
   * Generate CWE mapping
   */
  private categorizeCWE(issues: any[]): Record<string, number> {
    const cwe: Record<string, number> = {};

    for (const issue of issues) {
      // Extract CWE number from rule or message
      const cweMatch = issue.rule.match(/CWE-(\d+)/);
      if (cweMatch) {
        const cweId = `CWE-${cweMatch[1]}`;
        cwe[cweId] = (cwe[cweId] || 0) + 1;
      }
    }

    return cwe;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: any[]): string[] {
    const recommendations: string[] = [];
    const vulnerabilities = issues.filter(i => i.severity === 'CRITICAL');

    if (vulnerabilities.length > 10) {
      recommendations.push('Critical vulnerabilities detected. Immediate action required.');
      recommendations.push('Conduct security audit and penetration testing.');
    }

    if (issues.some(i => i.rule.includes('SQL'))) {
      recommendations.push('Use parameterized queries to prevent SQL injection');
    }

    if (issues.some(i => i.rule.includes('XSS'))) {
      recommendations.push('Implement output encoding and content security policies');
    }

    if (issues.some(i => i.rule.includes('crypto'))) {
      recommendations.push('Use industry-standard encryption algorithms (AES, SHA-256)');
    }

    recommendations.push('Implement automated security testing in CI/CD pipeline');
    recommendations.push('Conduct regular security training for development team');

    return recommendations;
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(projectId: string): Promise<Buffer> {
    // This would use a library like pdfkit or puppeteer
    // For now, return JSON stringified as buffer
    const report = await this.generateComplianceReport(projectId, 'pdf');
    return Buffer.from(JSON.stringify(report, null, 2));
  }

  /**
   * Generate security review
   */
  async generateSecurityReview(projectId: string) {
    const analyses = await prisma.analysis.findMany({
      where: { projectId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: { issues: true, metrics: true }
    });

    if (!analyses.length) {
      throw new Error('No completed analysis found');
    }

    const latestAnalysis = analyses[0];
    const securityIssues = latestAnalysis.issues.filter(i => i.type === 'VULNERABILITY');

    const review = {
      projectId,
      generatedAt: new Date(),
      securityScore: this.calculateSecurityScore(securityIssues),
      trendAnalysis: this.analyzeTrend(analyses),
      vulnerabilitiesByType: this.groupByType(securityIssues),
      topVulnerabilities: securityIssues
        .sort((a, b) => (b.severity === 'CRITICAL' ? 1 : -1))
        .slice(0, 10),
      remediationSteps: this.generateRemediationSteps(securityIssues)
    };

    await prisma.report.create({
      data: {
        projectId,
        type: 'SECURITY_REVIEW',
        title: `Security Review - ${projectId}`,
        jsonData: JSON.stringify(review),
        format: 'json'
      }
    });

    return review;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateSecurityScore(vulnerabilities: any[]): number {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'CRITICAL':
          score -= 15;
          break;
        case 'MAJOR':
          score -= 5;
          break;
        case 'MINOR':
          score -= 2;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Analyze trend across analyses
   */
  private analyzeTrend(analyses: any[]): string {
    if (analyses.length < 2) return 'INSUFFICIENT_DATA';

    const latest = analyses[0].issues.filter((i: any) => i.type === 'VULNERABILITY').length;
    const previous = analyses[1].issues.filter((i: any) => i.type === 'VULNERABILITY').length;

    if (latest < previous) return 'IMPROVING';
    if (latest > previous) return 'DEGRADING';
    return 'STABLE';
  }

  /**
   * Group by type
   */
  private groupByType(issues: any[]): Record<string, number> {
    return {
      injection: issues.filter(i => i.rule.includes('injection')).length,
      authentication: issues.filter(i => i.rule.includes('auth')).length,
      cryptography: issues.filter(i => i.rule.includes('crypto')).length,
      xss: issues.filter(i => i.rule.includes('XSS')).length,
      deserialization: issues.filter(i => i.rule.includes('deserial')).length,
      other: issues.length
    };
  }

  /**
   * Generate remediation steps
   */
  private generateRemediationSteps(vulnerabilities: any[]): string[] {
    const steps: string[] = [];
    const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL');

    if (critical.length > 0) {
      steps.push('1. Immediately patch all CRITICAL vulnerabilities');
      steps.push('2. Deploy patches to production within 24 hours');
    }

    steps.push('3. Add security testing to CI/CD pipeline');
    steps.push('4. Implement code review process with security focus');
    steps.push('5. Schedule security training for development team');
    steps.push('6. Document security policies and procedures');

    return steps;
  }

  /**
   * Get all reports for project
   */
  async getProjectReports(projectId: string) {
    return prisma.report.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Export report as JSON
   */
  async exportAsJSON(reportId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report.jsonData ? JSON.parse(report.jsonData) : {};
  }
}

export const reportService = new ReportService();
