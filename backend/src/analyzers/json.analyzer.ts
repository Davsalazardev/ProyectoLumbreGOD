import { NormalizedIssue } from '../types';

/**
 * Analyze JSON files for common issues
 */
export async function analyzeJSON(code: string, filename: string): Promise<NormalizedIssue[]> {
  const issues: NormalizedIssue[] = [];
  const lines = code.split('\n');

  try {
    // Try to parse JSON to detect syntax errors
    JSON.parse(code);
  } catch (error: any) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      let line = 1;
      let position = 0;
      for (let i = 0; i < lines.length; i++) {
        if (position + lines[i].length >= parseInt(match[1])) {
          line = i + 1;
          break;
        }
        position += lines[i].length + 1;
      }

      issues.push({
        file: filename,
        line,
        column: 1,
        severity: 'CRITICAL',
        type: 'BUG',
        message: `JSON syntax error: ${error.message}`,
        rule: 'json/syntax-error',
        codeSnippet: lines[line - 1] || ''
      });
    }
  }

  // Check for common JSON issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Trailing commas
    if (/,\s*[}\]]/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf(',') + 1,
        severity: 'MAJOR',
        type: 'CODE_SMELL',
        message: 'Trailing comma in JSON',
        rule: 'json/trailing-comma',
        codeSnippet: line
      });
    }

    // Duplicate keys (simple check)
    const keyMatch = line.match(/"([^"]+)"\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      const previousLines = lines.slice(Math.max(0, index - 5), index);
      const duplicateCount = previousLines.filter(l => new RegExp(`"${key}"\\s*:`).test(l)).length;
      if (duplicateCount > 0) {
        issues.push({
          file: filename,
          line: lineNum,
          column: line.indexOf('"') + 1,
          severity: 'MAJOR',
          type: 'BUG',
          message: `Duplicate key in JSON: "${key}"`,
          rule: 'json/duplicate-key',
          codeSnippet: line
        });
      }
    }

    // Very long lines
    if (line.length > 200) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: 'Line exceeds 200 characters',
        rule: 'json/long-line',
        codeSnippet: line.substring(0, 100) + '...'
      });
    }
  });

  return issues;
}
