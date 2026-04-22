"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMetrics = calculateMetrics;
exports.evaluateQualityGate = evaluateQualityGate;
// Default quality gate thresholds
const DEFAULT_THRESHOLDS = {
    maxCriticalIssues: 0, // 0 critical issues allowed
    maxMajorIssues: 5, // max 5 major issues
    maxTechnicalDebtMinutes: 30 // max 30 minutes of technical debt
};
// Technical debt estimation (minutes per issue type/severity)
const DEBT_MINUTES = {
    CRITICAL: 60,
    MAJOR: 30,
    MINOR: 10,
    INFO: 5
};
function calculateMetrics(issues) {
    const bugs = issues.filter(i => i.type === 'BUG').length;
    const vulnerabilities = issues.filter(i => i.type === 'VULNERABILITY').length;
    const codeSmells = issues.filter(i => i.type === 'CODE_SMELL').length;
    const technicalDebt = issues.reduce((acc, issue) => {
        return acc + (DEBT_MINUTES[issue.severity] || 5);
    }, 0);
    return { bugs, vulnerabilities, codeSmells, technicalDebt };
}
function evaluateQualityGate(metrics, issueCounts) {
    const conditions = [
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
//# sourceMappingURL=qualityGate.service.js.map