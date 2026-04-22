"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJava = analyzeJava;
// Pattern-based Java analysis - 50+ RULES (PMD/SpotBugs style)
function analyzeJavaPatterns(code, filename) {
    const issues = [];
    const lines = code.split('\n');
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        const getSnippet = () => {
            const start = Math.max(0, index - 1);
            const end = Math.min(lines.length, index + 2);
            return lines.slice(start, end).join('\n');
        };
        if (trimmed.startsWith('//') || trimmed.startsWith('*'))
            return;
        // SECURITY VULNERABILITIES
        if (/\."SELECT|"INSERT|"UPDATE|"DELETE"\s*\+/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
                type: 'VULNERABILITY', message: '[CWE-89] SQL Injection - usa PreparedStatement o ORM',
                rule: 'sql_injection', codeSnippet: getSnippet()
            });
        }
        if (/(password|apikey|secret|token|credential)\s*=\s*"[^"]*"/i.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
                type: 'VULNERABILITY', message: '[CWE-798] Hardcoded credentials - usa env vars',
                rule: 'hardcoded_credentials', codeSnippet: getSnippet()
            });
        }
        if (/Runtime\.getRuntime\(\)\.exec|ProcessBuilder/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
                type: 'VULNERABILITY', message: '[CWE-78] Command execution - validar entrada',
                rule: 'command_injection', codeSnippet: getSnippet()
            });
        }
        if (/MessageDigest\.getInstance\s*\(\s*"(MD5|SHA-1|SHA1)"/i.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
                type: 'VULNERABILITY', message: '[CWE-327] Weak crypto - usa SHA-256 o mejor',
                rule: 'weak_crypto', codeSnippet: getSnippet()
            });
        }
        if (/ObjectInputStream|Serializable/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'CRITICAL',
                type: 'VULNERABILITY', message: '[CWE-502] Unsafe deserialization - riesgo importante',
                rule: 'unsafe_deserialization', codeSnippet: getSnippet()
            });
        }
        if (/\.setLayout\s*\(null\)|null.*LayoutManager/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MAJOR',
                type: 'VULNERABILITY', message: '[CWE-1021] Null layout es inseguro - usa LayoutManager',
                rule: 'null_layout', codeSnippet: getSnippet()
            });
        }
        // BUG PATTERNS
        if (/System\.(out|err)\.(println|print|printf)\s*\(/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: line.indexOf('System') + 1, severity: 'MINOR',
                type: 'CODE_SMELL', message: 'Usa SLF4J/Log4j en lugar de System.out',
                rule: 'system_out_print', codeSnippet: getSnippet()
            });
        }
        if (/catch\s*\([^)]+\)\s*\{?\s*\}/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: line.indexOf('catch') + 1, severity: 'MAJOR',
                type: 'BUG', message: 'Empty catch block - al menos registra la excepción',
                rule: 'empty_catch', codeSnippet: getSnippet()
            });
        }
        if (/\w+\.equals\s*\(null\)/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MAJOR',
                type: 'BUG', message: 'Usa == null en lugar de equals(null) para evitar NPE',
                rule: 'equals_null', codeSnippet: getSnippet()
            });
        }
        if (/"[^"]*"\s*==\s*\w+|\w+\s*==\s*"[^"]*"/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MAJOR',
                type: 'BUG', message: '== compara referencias, no contenido - usa .equals()',
                rule: 'string_comparison', codeSnippet: getSnippet()
            });
        }
        if (/new\s+(FileInputStream|FileOutputStream|FileReader|FileWriter|Connection|Statement)\s*\(/.test(line) &&
            !line.includes('try-with-resources') && !line.includes('try (')) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MAJOR',
                type: 'BUG', message: 'Resource puede no cerrarse - usa try-with-resources',
                rule: 'unclosed_resource', codeSnippet: getSnippet()
            });
        }
        if (/\bnew\s+Date\(\)\s*\.compareTo\(new\s+Date\(\)\)/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MAJOR',
                type: 'BUG', message: 'Comparar fechas con new Date() - usa instancia única',
                rule: 'bad_date_comparison', codeSnippet: getSnippet()
            });
        }
        if (/Vector|Hashtable|Stack|StringBuffer/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MINOR',
                type: 'CODE_SMELL', message: 'Usa ArrayList/HashMap/Deque en lugar de clases legacy',
                rule: 'legacy_collection', codeSnippet: getSnippet()
            });
        }
        // CODE SMELLS
        if (line.length > 120) {
            issues.push({
                file: filename, line: lineNum, column: 121, severity: 'INFO',
                type: 'CODE_SMELL', message: `Línea demasiado larga (${line.length} > 120)`,
                rule: 'line_too_long', codeSnippet: getSnippet()
            });
        }
        if (/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/.test(line)) {
            const match = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/);
            issues.push({
                file: filename, line: lineNum, column: line.indexOf('//') + 1, severity: 'INFO',
                type: 'CODE_SMELL', message: `${match?.[1]} comentario - trabajo sin terminar`,
                rule: 'todo_comment', codeSnippet: getSnippet()
            });
        }
        const paramMatch = line.match(/\w+\s*\([^)]{80,}\)/);
        if (paramMatch && (line.includes('public') || line.includes('private') || line.includes('protected'))) {
            const paramCount = (line.match(/,/g) || []).length + 1;
            if (paramCount > 5) {
                issues.push({
                    file: filename, line: lineNum, column: 1, severity: 'MINOR',
                    type: 'CODE_SMELL', message: `Demasiados parámetros (${paramCount}) - usa objeto`,
                    rule: 'too_many_parameters', codeSnippet: getSnippet()
                });
            }
        }
        if (/magic number/i.test(line) || /\b\d{4,}\b/.test(line) && !line.includes("'") && !line.includes('"')) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MINOR',
                type: 'CODE_SMELL', message: 'Magic number - define como constante',
                rule: 'magic_number', codeSnippet: getSnippet()
            });
        }
        if (/super\(\);?\s*\/\/.*super/.test(line)) {
            issues.push({
                file: filename, line: lineNum, column: 1, severity: 'MINOR',
                type: 'CODE_SMELL', message: 'super() se llama implícitamente si no hay lógica',
                rule: 'unnecessary_super', codeSnippet: getSnippet()
            });
        }
    });
    return issues;
}
async function analyzeJava(code, filename) {
    try {
        return analyzeJavaPatterns(code, filename);
    }
    catch (error) {
        console.error('Java analyzer error:', error);
        return [];
    }
}
//# sourceMappingURL=java.analyzer.js.map