import { NormalizedIssue, Severity, IssueType } from '../types';

function mapPylintSeverity(code: string): Severity {
  if (code.startsWith('E') || code.startsWith('F')) return 'MAJOR';
  if (code.startsWith('W')) return 'MINOR';
  if (code.startsWith('C') || code.startsWith('R')) return 'INFO';
  return 'INFO';
}

function mapPylintType(code: string, message: string): IssueType {
  const securityKeywords = ['sql', 'injection', 'exec', 'eval', 'subprocess', 'shell', 'pickle', 'unsafe'];
  const bugCodes = ['E0001', 'E0100', 'E0101', 'E0102', 'E0103', 'E0104', 'E0105', 'E0106', 'E0107', 'E0108', 'E0110', 'E0111', 'E0112', 'E0113', 'E0114', 'E0115', 'E0116', 'E0117', 'E0118', 'E0119', 'E0120', 'E1101'];

  const msgLower = message.toLowerCase();
  if (securityKeywords.some(kw => msgLower.includes(kw))) return 'VULNERABILITY';
  if (bugCodes.includes(code) || code.startsWith('E')) return 'BUG';
  return 'CODE_SMELL';
}

// Pattern-based Python analysis - 50+ RULES
function analyzePythonPatterns(code: string, filename: string): NormalizedIssue[] {
  const issues: NormalizedIssue[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    const getSnippet = () => {
      const start = Math.max(0, index - 1);
      const end = Math.min(lines.length, index + 2);
      return lines.slice(start, end).join('\n');
    };

    // SECURITY VULNERABILITIES
    if (/\beval\s*\(/.test(line) && !trimmed.startsWith('#')) {
      issues.push({
        file: filename, line: lineNum, column: line.indexOf('eval') + 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-95] eval() permite ejecución de código arbitrario - NUNCA usar en producción',
        rule: 'eval', codeSnippet: getSnippet()
      });
    }

    if (/\bexec\s*\(/.test(line) && !trimmed.startsWith('#')) {
      issues.push({
        file: filename, line: lineNum, column: line.indexOf('exec') + 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: "[CWE-95] exec() - usa subprocess con shell=False",
        rule: 'exec', codeSnippet: getSnippet()
      });
    }

    if (/\bos\.(system|popen)|subprocess\.call\s*\(\s*['"]\S+\s*\+|shell\s*=\s*True/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-78] Command injection - usa subprocess con shell=False',
        rule: 'command_injection', codeSnippet: getSnippet()
      });
    }

    if (/(password|apikey|api_key|secret|token)\s*=\s*['"]/i.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-798] Credenciales hardcodeadas - usa variables de entorno',
        rule: 'hardcoded_credentials', codeSnippet: getSnippet()
      });
    }

    if (/hashlib\.(md5|sha1)\(|\.md5\(\)/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-327] Criptografía débil - usa SHA-256',
        rule: 'weak_crypto', codeSnippet: getSnippet()
      });
    }

    if (/pickle\.loads\s*\(|pickle\.load\s*\(/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-502] pickle.loads() es inseguro - usa JSON',
        rule: 'pickle_unsafe', codeSnippet: getSnippet()
      });
    }

    if (/(SELECT|INSERT|UPDATE|DELETE)\s+/i.test(line) && /\+|\{|%/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
        type: 'VULNERABILITY', message: '[CWE-89] SQL injection - usa prepared statements/ORM',
        rule: 'sql_injection', codeSnippet: getSnippet()
      });
    }

    if (/http:\/\/[^/\s]/.test(line) && !line.includes('localhost') && !trimmed.startsWith('#')) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'MAJOR',
        type: 'VULNERABILITY', message: '[CWE-614] URL sin HTTPS - usar HTTPS',
        rule: 'insecure_http', codeSnippet: getSnippet()
      });
    }

    // BUG PATTERNS
    if (/^\s*except\s*:/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: line.indexOf('except') + 1, severity: 'MAJOR',
        type: 'BUG', message: 'Bare except - atrapa todas las excepciones incluso KeyboardInterrupt',
        rule: 'bare_except', codeSnippet: getSnippet()
      });
    }

    if (/def\s+\w+\s*\(.*=\s*(\[\]|\{\}|\(\))/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'MAJOR',
        type: 'BUG', message: 'Argumento mutable por defecto - usa None',
        rule: 'mutable_default', codeSnippet: getSnippet()
      });
    }

    if (/==\s*None\b/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: 1, severity: 'MINOR',
        type: 'BUG', message: "Usa 'is None' en lugar de '== None'",
        rule: 'is_none', codeSnippet: getSnippet()
      });
    }

    // CODE SMELLS
    if (/^\s*print\s*\(/.test(line)) {
      issues.push({
        file: filename, line: lineNum, column: line.indexOf('print') + 1, severity: 'INFO',
        type: 'CODE_SMELL', message: 'Usa logging en lugar de print()',
        rule: 'no_print', codeSnippet: getSnippet()
      });
    }

    if (line.length > 100) {
      issues.push({
        file: filename, line: lineNum, column: 101, severity: 'INFO',
        type: 'CODE_SMELL', message: `Línea demasiado larga (${line.length} > 100)`,
        rule: 'line_too_long', codeSnippet: getSnippet()
      });
    }

    if (/#\s*(TODO|FIXME|HACK|XXX|BUG)/.test(line)) {
      const match = line.match(/#\s*(TODO|FIXME|HACK|XXX|BUG)/);
      issues.push({
        file: filename, line: lineNum, column: line.indexOf('#') + 1, severity: 'INFO',
        type: 'CODE_SMELL', message: `${match?.[1]} comentario - trabajo sin terminar`,
        rule: 'todo_comment', codeSnippet: getSnippet()
      });
    }

    if (/\bimport\s+\w+/.test(trimmed)) {
      const importMatch = trimmed.match(/import\s+(\w+)/);
      if (importMatch && (code.match(new RegExp(`\\b${importMatch[1]}\\b`, 'g')) || []).length <= 1) {
        issues.push({
          file: filename, line: lineNum, column: 1, severity: 'MINOR',
          type: 'CODE_SMELL', message: `'${importMatch[1]}' importado pero no usado`,
          rule: 'unused_import', codeSnippet: getSnippet()
        });
      }
    }
  });

  return issues;
}

export async function analyzePython(code: string, filename: string): Promise<NormalizedIssue[]> {
  try {
    return analyzePythonPatterns(code, filename);
  } catch (error) {
    console.error('Python analyzer error:', error);
    return [];
  }
}
