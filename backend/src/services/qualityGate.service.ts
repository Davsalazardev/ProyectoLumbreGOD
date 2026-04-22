import { QualityGateResult, QualityGateCondition, AnalysisMetrics } from '../types';

interface IssueCounts {
  critical: number;
  major: number;
  minor: number;
  info: number;
}

// Default quality gate thresholds
const DEFAULT_THRESHOLDS = {
  maxCriticalIssues: 0,       // 0 critical issues allowed
  maxMajorIssues: 5,          // max 5 major issues
  maxTechnicalDebtMinutes: 30 // max 30 minutes of technical debt
};

// Technical debt estimation (minutes per issue type/severity)
const DEBT_MINUTES: Record<string, number> = {
  CRITICAL: 60,
  MAJOR: 30,
  MINOR: 10,
  INFO: 5
};

export function calculateMetrics(
  issues: Array<{ severity: string; type: string }>
): AnalysisMetrics {
  const bugs = issues.filter(i => i.type === 'BUG').length;
  const vulnerabilities = issues.filter(i => i.type === 'VULNERABILITY').length;
  const codeSmells = issues.filter(i => i.type === 'CODE_SMELL').length;

  const technicalDebt = issues.reduce((acc, issue) => {
    return acc + (DEBT_MINUTES[issue.severity] || 5);
  }, 0);

  return { bugs, vulnerabilities, codeSmells, technicalDebt };
}

export function evaluateQualityGate(
  metrics: AnalysisMetrics,
  issueCounts: IssueCounts
): QualityGateResult {
  const conditions: QualityGateCondition[] = [
    {
      metric: 'Critical Issues',
      operator: '<=',
      threshold: DEFAULT_THRESHOLDS.maxCriticalIssues,
      value: issueCounts.critical,
      status: issueCounts.critical <= DEFAULT_THRESHOLDS.maxCriticalIssues ? 'PASSED' : 'FAILED'
    },
    {
      metric: 'Major Issues',
      operator: '<=',
      threshold: DEFAULT_THRESHOLDS.maxMajorIssues,
      value: issueCounts.major,
      status: issueCounts.major <= DEFAULT_THRESHOLDS.maxMajorIssues ? 'PASSED' : 'FAILED'
    },
    {
      metric: 'Technical Debt (min)',
      operator: '<=',
      threshold: DEFAULT_THRESHOLDS.maxTechnicalDebtMinutes,
      value: metrics.technicalDebt,
      status: metrics.technicalDebt <= DEFAULT_THRESHOLDS.maxTechnicalDebtMinutes ? 'PASSED' : 'FAILED'
    }
  ];

  const overallStatus = conditions.every(c => c.status === 'PASSED') ? 'PASSED' : 'FAILED';

  return { status: overallStatus, conditions };
}
