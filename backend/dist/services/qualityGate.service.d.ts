import { QualityGateResult, AnalysisMetrics } from '../types';
interface IssueCounts {
    critical: number;
    major: number;
    minor: number;
    info: number;
}
export declare function calculateMetrics(issues: Array<{
    severity: string;
    type: string;
}>): AnalysisMetrics;
export declare function evaluateQualityGate(metrics: AnalysisMetrics, issueCounts: IssueCounts): QualityGateResult;
export {};
//# sourceMappingURL=qualityGate.service.d.ts.map