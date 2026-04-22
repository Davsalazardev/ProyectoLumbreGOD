export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL';
export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type QualityGateStatus = 'PASSED' | 'FAILED' | 'UNKNOWN';

export interface Project {
  id: string;
  name: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  latestAnalysis?: Analysis | null;
  qualityGate?: QualityGate;
  metrics?: Metrics;
  analyses?: Analysis[];
}

export interface Analysis {
  id: string;
  projectId: string;
  status: AnalysisStatus;
  startedAt: string;
  finishedAt?: string;
  metrics?: Metrics;
}

export interface Issue {
  id: string;
  analysisId: string;
  file: string;
  line: number;
  column: number;
  severity: Severity;
  type: IssueType;
  message: string;
  rule: string;
  codeSnippet?: string;
  resolution?: string;}

export interface Metrics {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage?: number;
  technicalDebt: number;
  loc: number;
  files: number;
  duplications: number;
  cyclomaticComplexity?: number;
  cognitiveComplexity?: number;
  maintainabilityIndex?: number;
  maintainabilityRating?: string;
  securityRating?: string;
  reliabilityRating?: string;
  technicalDebtRatio?: number;
  newIssues?: number;
  resolvedIssues?: number;
  reopenedIssues?: number;
  testCoverage?: number;
  testExecutionTime?: number;
  failedTests?: number;
  owaspA1Issues?: number;
  cweIssuesCount?: number;
  securityHotspots?: number;
  codeDistributionLow?: number;
  codeDistributionMedium?: number;
  codeDistributionHigh?: number;
}

export interface QualityGate {
  status: QualityGateStatus;
  conditions: QualityGateCondition[];
}

export interface QualityGateCondition {
  metric: string;
  operator: string;
  threshold: number;
  value: number;
  status: 'PASSED' | 'FAILED';
}

export interface IssuesResponse {
  issues: Issue[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
