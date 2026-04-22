/**
 * Secrets Detection Service
 * Detect sensitive data
 */
export const secretsService = {
  async scanForSecrets(code: string): Promise<any[]> {
    const secrets: any[] = [];
    if (code.toLowerCase().includes('api_key')) {
      secrets.push({ type: 'API_KEY', severity: 'critical', pattern: 'API key found' });
    }
    if (code.includes('password')) {
      secrets.push({ type: 'PASSWORD', severity: 'high', pattern: 'Password found' });
    }
    return secrets;
  },
  getSummary(secrets: any[]): any {
    return { total: secrets.length, critical: secrets.length };
  }
};
