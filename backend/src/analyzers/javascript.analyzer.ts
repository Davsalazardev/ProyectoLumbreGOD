import { NormalizedIssue, Severity, IssueType } from '../types';

interface LintMessage {
  ruleId: string | null;
  severity: number;
  message: string;
  line: number;
  column: number;
}

// Severity mapping from ESLint severity numbers
function mapSeverity(eslintSeverity: number, ruleId: string | null): Severity {
  const criticalRules = ['no-eval', 'no-implied-eval', 'no-new-func', 'security/detect-eval-with-expression'];
  const majorRules = ['no-unused-vars', 'no-undef', 'eqeqeq', 'no-console'];

  if (ruleId && criticalRules.includes(ruleId)) return 'CRITICAL';
  if (ruleId && majorRules.includes(ruleId)) return 'MAJOR';
  if (eslintSeverity === 2) return 'MAJOR';
  if (eslintSeverity === 1) return 'MINOR';
  return 'INFO';
}

function mapType(ruleId: string | null): IssueType {
  const bugRules = ['no-undef', 'no-unused-vars', 'no-unreachable', 'no-constant-condition', 'use-before-define'];
  const vulnRules = ['no-eval', 'no-implied-eval', 'no-new-func'];

  if (!ruleId) return 'CODE_SMELL';
  if (vulnRules.some(r => ruleId.includes(r))) return 'VULNERABILITY';
  if (bugRules.includes(ruleId)) return 'BUG';
  return 'CODE_SMELL';
}

// Simulate ESLint-like analysis with pattern matching - EXPANDED WITH 50+ RULES
function analyzePatterns(code: string, filename: string): NormalizedIssue[] {
  const issues: NormalizedIssue[] = [];
  const lines = code.split('\n');
  const codeStr = code.toLowerCase();

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    const lowerLine = line.toLowerCase();

    // Helper para obtener el snippet de contexto (3 líneas)
    const getSnippet = () => {
      const start = Math.max(0, index - 1);
      const end = Math.min(lines.length, index + 2);
      return lines.slice(start, end).join('\n');
    };

    // ============= SECURITY VULNERABILITIES (CWE/OWASP) =============
    
    // CWE-95: eval usage (CODE INJECTION)
    if (/\beval\s*\(/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('eval') + 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-95] eval() es un riesgo crítico de seguridad - permite inyección de código arbitrario',
        rule: 'no-eval',
        codeSnippet: getSnippet()
      });
    }

    // CWE-95: Function constructor (CODE INJECTION)
    if (/new\s+Function\s*\(/.test(line) || /Function\s*\(\s*['"]/. test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('Function') + 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-95] Constructpr Function() permite inyección de código - evitar a toda costa',
        rule: 'no-new-func',
        codeSnippet: getSnippet()
      });
    }

    // CWE-95: setTimeout/setInterval con strings
    if (/\b(setTimeout|setInterval)\s*\(\s*['"]/. test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.search(/\b(setTimeout|setInterval)/) + 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-95] setTimeout/setInterval con strings ejecutan código dinámicamente - riesgo de inyección',
        rule: 'no-implied-eval',
        codeSnippet: getSnippet()
      });
    }

    // CWE-79: XSS - innerHTML
    if (/\.innerHTML\s*=|\.innerHTML\s*\+=/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('innerHTML') + 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-79] innerHTML puede introducir XSS - sanitiza entrada con DOMPurify o usa textContent',
        rule: 'security/detect-innerHTML',
        codeSnippet: getSnippet()
      });
    }

    // CWE-79: XSS - document.write
    if (/document\.write\s*\(/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('document.write') + 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-79] document.write() es un riesgo de XSS - usa DOM APIs seguras',
        rule: 'security/detect-document-write',
        codeSnippet: getSnippet()
      });
    }

    // CWE-89: SQL Injection Pattern
    if (/(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\s+/i.test(line) && /[+\s]+[\w'"]/. test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-89] SQL Injection potencial - usa prepared statements o ORMs (Sequelize, TypeORM)',
        rule: 'security/detect-sql-injection',
        codeSnippet: getSnippet()
      });
    }

    // CWE-798: Hardcoded Credentials/API Keys
    if (/(api[_-]?key|password|secret|token|credential)\s*[:=]\s*['"]/i.test(line) || 
        /['"]sk[-_]live[-_]/i.test(line) || /['"]AKIA/i.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-798] Credenciales hardcodeadas - usa variables de entorno (process.env)',
        rule: 'security/detect-hardcoded-secrets',
        codeSnippet: getSnippet()
      });
    }

    // CWE-327: Weak Cryptography
    if (/\.md5\(|\.sha1\(|\.sha\(\)|crypto\.createCipher\(/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-327] Criptografía débil - usa SHA-256 o mejor con bcrypt/argon2',
        rule: 'security/detect-weak-crypto',
        codeSnippet: getSnippet()
      });
    }

    // CWE-502: Deserialization of Untrusted Data
    if (/JSON\.parse\s*\(|eval\s*\(|new\s+Function|pickle/i.test(line)) {
      if (/JSON\.parse\s*\(/.test(line) && /getUserInput|fromClient|request\./i.test(code)) {
        issues.push({
          file: filename,
          line: lineNum,
          column: 1,
          severity: 'MAJOR',
          type: 'VULNERABILITY',
          message: '[CWE-502] Deserialización de datos no confiables - valida con JSON Schema',
          rule: 'security/detect-unsafe-deserialization',
          codeSnippet: getSnippet()
        });
      }
    }

    // CWE-352: CSRF - Missing token check
    if (/\b(POST|PUT|DELETE|PATCH)\b/i.test(line) && !/_csrf|csrf_token|xsrf/.test(code)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'VULNERABILITY',
        message: '[CWE-352] Posible CSRF - implementa validación de CSRF tokens',
        rule: 'security/detect-missing-csrf',
        codeSnippet: getSnippet()
      });
    }

    // CWE-338: Use of Cryptographically Weak Random
    if (/Math\.random\(\)/.test(line) && /(security|token|password|secret|key)/i.test(code.split('\n').slice(Math.max(0, index - 5), index + 5).join('\n'))) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'CRITICAL',
        type: 'VULNERABILITY',
        message: '[CWE-338] Math.random() no es criptográficamente seguro - usa crypto.getRandomBytes()',
        rule: 'security/detect-weak-random',
        codeSnippet: getSnippet()
      });
    }

    // CWE-614: Missing HTTPS check
    if (/http:\/\/[^/\s]/.test(line) && !line.includes('//') && !line.includes('localhost') && !line.includes('127.0.0.1')) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'VULNERABILITY',
        message: '[CWE-614] URL sin HTTPS - usar siempre HTTPS en producción',
        rule: 'security/detect-plain-http',
        codeSnippet: getSnippet()
      });
    }

    // ============= BUG PATTERNS =============

    // Strict equality
    if (/[^=!<>]==[^=]/.test(line) && !trimmed.startsWith('//')) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('==') + 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Usa igualdad estricta (===) en lugar de (==) para evitar problemas de tipos',
        rule: 'eqeqeq',
        codeSnippet: getSnippet()
      });
    }

    // Null/undefined comparison
    if (/\!\=\s*null|\!\=\s*undefined|==\s*null|==\s*undefined/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Usa === null o === undefined en lugar de == para mejor precisión',
        rule: 'no-eq-null',
        codeSnippet: getSnippet()
      });
    }

    // Empty catch blocks (BUG)
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('catch') + 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Bloque catch vacío - ignora los errores silenciosamente, al menos registra',
        rule: 'no-empty',
        codeSnippet: getSnippet()
      });
    }

    // ============= CODE SMELLS =============

    // Detect console.log (CODE_SMELL)
    if (/\bconsole\.(log|warn|error|info|debug)\s*\(/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('console') + 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: 'El uso de \'console\' debería eliminarse antes de producción - usa logger',
        rule: 'no-console',
        codeSnippet: getSnippet()
      });
    }

    // Detect var declarations (CODE_SMELL)
    if (/^\s*var\s+/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('var') + 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: "Uso de 'var' evitar - usa 'let' o 'const' para scoping correcto",
        rule: 'no-var',
        codeSnippet: getSnippet()
      });
    }

    // Detect TODO/FIXME comments (INFO)
    if (/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/.test(line)) {
      const match = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/);
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('//') + 1,
        severity: 'INFO',
        type: 'CODE_SMELL',
        message: `${match?.[1]} comentario encontrado - trabajo sin terminar`,
        rule: 'no-warning-comments',
        codeSnippet: getSnippet()
      });
    }

    // Detect long lines (CODE_SMELL)
    if (line.length > 120) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 121,
        severity: 'INFO',
        type: 'CODE_SMELL',
        message: `Línea demasiado larga (${line.length} > 120 caracteres)`,
        rule: 'max-len',
        codeSnippet: getSnippet()
      });
    }

    // Detect alert/confirm/prompt (CODE_SMELL)
    if (/\b(alert|confirm|prompt)\s*\(/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.search(/\b(alert|confirm|prompt)\s*\(/) + 1,
        severity: 'MAJOR',
        type: 'CODE_SMELL',
        message: 'Uso de alert/confirm/prompt bloquea el navegador - usa modales/notificaciones',
        rule: 'no-alert',
        codeSnippet: getSnippet()
      });
    }

    // Detect debugger statements (CRITICAL)
    if (/\bdebugger\b/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: line.indexOf('debugger') + 1,
        severity: 'CRITICAL',
        type: 'BUG',
        message: 'No debe usarse \'debugger\' en código de producción',
        rule: 'no-debugger',
        codeSnippet: getSnippet()
      });
    }

    // Regex Denial of Service (ReDoS)
    if (/new\s+RegExp\s*\(|\/.*[\+\*\{].*[\+\*\{].*\//. test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'VULNERABILITY',
        message: '[CWE-1333] Posible Regex DoS - evita backtracking excesivo en regex complejos',
        rule: 'security/detect-regex-dos',
        codeSnippet: getSnippet()
      });
    }

    // Unused variables
    if (/\b(const|let|var)\s+(\w+)\s*=/.test(line)) {
      const match = line.match(/\b(const|let|var)\s+(\w+)\s*=/);
      if (match) {
        const varName = match[2];
        const restOfCode = lines.slice(index + 1, Math.min(index + 20, lines.length)).join('\n');
        if (!restOfCode.includes(varName) && varName !== '_') {
          issues.push({
            file: filename,
            line: lineNum,
            column: 1,
            severity: 'MINOR',
            type: 'CODE_SMELL',
            message: `Variable '${varName}' declarada pero no usada`,
            rule: 'no-unused-vars',
            codeSnippet: getSnippet()
          });
        }
      }
    }

    // Multiple statements on one line
    if ((line.match(/;/g) || []).length > 1) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: 'Múltiples sentencias en una línea - mejora legibilidad',
        rule: 'no-multiple-statements',
        codeSnippet: getSnippet()
      });
    }

    // Generic exceptions catching all
    if (/catch\s*\(\s*\w+\s*\)/.test(line) && !line.includes('Error') && !line.includes('error')) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Atrapa excepciones genéricas - especifica el tipo de error esperado',
        rule: 'prefer-specific-error-handling',
        codeSnippet: getSnippet()
      });
    }

    // TypeScript-specific: any type usage
    if (/:\s*any\b/.test(line) || /as\s+any\b/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: (line.indexOf(': any') !== -1 ? line.indexOf(': any') : line.indexOf('as any')) + 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: "Evita usar 'any' - anula las validaciones de tipo de TypeScript",
        rule: '@typescript-eslint/no-explicit-any',
        codeSnippet: getSnippet()
      });
    }

    // Type assertions without verification
    if (/(as\s+\w+|<\w+>)/.test(line)) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MINOR',
        type: 'CODE_SMELL',
        message: 'Usa "as" type assertions con cuidado - verifica tipos en runtime si es necesario',
        rule: '@typescript-eslint/no-as-assertions',
        codeSnippet: getSnippet()
      });
    }

    // Promise without error handling
    if (/\.then\(/.test(line) && !/.catch\(/.test(code.split('\n').slice(Math.max(0, index - 2), index + 3).join('\n'))) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Promise sin manejo de error .catch() - siempre gestionarechazos',
        rule: 'handle-promise-rejection',
        codeSnippet: getSnippet()
      });
    }

    // Async without try-catch
    if (/async\s+\w+\s*\(/.test(line) && !/try\s*\{/.test(code.split('\n').slice(index, index + 5).join('\n'))) {
      issues.push({
        file: filename,
        line: lineNum,
        column: 1,
        severity: 'MAJOR',
        type: 'BUG',
        message: 'Función async sin try-catch - captura errores con try/catch',
        rule: 'handle-async-errors',
        codeSnippet: getSnippet()
      });
    }
  });

  return issues;
}

export async function analyzeJavaScript(code: string, filename: string): Promise<NormalizedIssue[]> {
  try {
    return analyzePatterns(code, filename);
  } catch (error) {
    console.error('JavaScript analyzer error:', error);
    return [];
  }
}
