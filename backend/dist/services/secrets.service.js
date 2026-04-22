"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretsService = void 0;
/**
 * Secrets Detection Service
 * Detect sensitive data
 */
exports.secretsService = {
    async scanForSecrets(code) {
        const secrets = [];
        if (code.toLowerCase().includes('api_key')) {
            secrets.push({ type: 'API_KEY', severity: 'critical', pattern: 'API key found' });
        }
        if (code.includes('password')) {
            secrets.push({ type: 'PASSWORD', severity: 'high', pattern: 'Password found' });
        }
        return secrets;
    },
    getSummary(secrets) {
        return { total: secrets.length, critical: secrets.length };
    }
};
//# sourceMappingURL=secrets.service.js.map