export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL';
export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'json' | 'yaml' | 'unknown';

export interface NormalizedIssue {
  file: string;
  line: number;
  column: number;
  severity: Severity;
  type: IssueType;
  message: string;
  rule: string;  codeSnippet?: string;}

export interface AnalysisMetrics {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  technicalDebt: number; // minutes
}

export interface QualityGateResult {
  status: 'PASSED' | 'FAILED';
  conditions: QualityGateCondition[];
}

export interface QualityGateCondition {
  metric: string;
  operator: string;
  threshold: number;
  value: number;
  status: 'PASSED' | 'FAILED';
}

export interface AnalyzeJobData {
  projectId: string;
  analysisId: string;
  code: string;
  filename: string;
  language?: Language;
}
