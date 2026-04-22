/**
 * Secrets Detection Service
 * Detect sensitive data
 */
export declare const secretsService: {
    scanForSecrets(code: string): Promise<any[]>;
    getSummary(secrets: any[]): any;
};
//# sourceMappingURL=secrets.service.d.ts.map