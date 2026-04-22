import React from 'react';

interface GradeRating {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage?: number;
  duplications?: number;
}

const getGrade = (value: number, type: 'bugs' | 'vulns' | 'smells' | 'coverage' | 'duplication'): string => {
  switch (type) {
    case 'bugs':
      if (value === 0) return 'A';
      if (value <= 2) return 'B';
      if (value <= 5) return 'C';
      if (value <= 10) return 'D';
      return 'E';
    case 'vulns':
      if (value === 0) return 'A';
      if (value <= 1) return 'B';
      if (value <= 3) return 'C';
      if (value <= 8) return 'D';
      return 'E';
    case 'smells':
      if (value === 0) return 'A';
      if (value <= 5) return 'B';
      if (value <= 20) return 'C';
      if (value <= 50) return 'D';
      return 'E';
    case 'coverage':
      if (value >= 80) return 'A';
      if (value >= 60) return 'B';
      if (value >= 40) return 'C';
      if (value >= 20) return 'D';
      return 'E';
    case 'duplication':
      if (value <= 5) return 'A';
      if (value <= 10) return 'B';
      if (value <= 15) return 'C';
      if (value <= 20) return 'D';
      return 'E';
    default:
      return 'A';
  }
};

const getGradeColor = (grade: string): { bg: string; text: string; border: string } => {
  switch (grade) {
    case 'A':
      return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' };
    case 'B':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' };
    case 'C':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' };
    case 'D':
      return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' };
    case 'E':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' };
    default:
      return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' };
  }
};

interface GradeCardProps {
  label: string;
  value: number;
  grade: string;
  type: 'bugs' | 'vulns' | 'smells' | 'coverage' | 'duplication';
  unit?: string;
}

const GradeCard: React.FC<GradeCardProps> = ({ label, value, grade, unit = '' }) => {
  const colors = getGradeColor(grade);

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-lg p-6 text-center transition-all hover:shadow-lg`}
    >
      <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-3">{label}</p>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-left">
          <p className="text-3xl font-mono font-black text-white">
            {value}{unit}
          </p>
        </div>

        <div className={`w-20 h-20 rounded-full ${colors.bg} border-4 ${colors.border} flex items-center justify-center`}>
          <span className={`text-5xl font-mono font-black ${colors.text}`}>{grade}</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
        {grade === 'A' && 'Excelente'}
        {grade === 'B' && 'Bueno'}
        {grade === 'C' && 'Aceptable'}
        {grade === 'D' && 'Necesita Mejora'}
        {grade === 'E' && 'Crítico'}
      </div>
    </div>
  );
};

interface LetterGradesProps {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage?: number;
  duplications?: number;
}

export const LetterGrades: React.FC<LetterGradesProps> = ({
  bugs,
  vulnerabilities,
  codeSmells,
  coverage = 0,
  duplications = 0
}) => {
  const bugGrade = getGrade(bugs, 'bugs');
  const vulnGrade = getGrade(vulnerabilities, 'vulns');
  const smellGrade = getGrade(codeSmells, 'smells');
  const coverageGrade = getGrade(coverage, 'coverage');
  const dupGrade = getGrade(duplications, 'duplication');

  const overallGrades = [bugGrade, vulnGrade, smellGrade, coverageGrade, dupGrade]
    .map(g => (g === 'A' ? 5 : g === 'B' ? 4 : g === 'C' ? 3 : g === 'D' ? 2 : 1));
  const avgGradeNum = Math.round(overallGrades.reduce((a, b) => a + (b as number), 0) / overallGrades.length);
  const overallGrade = ['E', 'D', 'C', 'B', 'A'][Math.max(0, Math.min(4, avgGradeNum - 1))] || 'A';

  return (
    <div>
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6 mb-8">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-8">Calificaciones Generales</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <GradeCard label="Confiabilidad" value={bugs} grade={bugGrade} type="bugs" />
          <GradeCard label="Seguridad" value={vulnerabilities} grade={vulnGrade} type="vulns" />
          <GradeCard label="Mantenibilidad" value={codeSmells} grade={smellGrade} type="smells" />
          <GradeCard label="Cobertura" value={coverage} grade={coverageGrade} type="coverage" unit="%" />
          <GradeCard label="Duplicidad" value={duplications} grade={dupGrade} type="duplication" unit="%" />
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6 text-center">
          <p className="text-slate-600 font-mono text-xs uppercase tracking-widest mb-4">Calificación General del Proyecto</p>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-slate-400 font-mono text-sm mb-2">Promedio de Grades</p>
              <div className="flex gap-1">
                {['D', 'C', 'B', 'A'][Math.min(3, Math.max(0, avgGradeNum - 2))]}
              </div>
            </div>

            <div className={`${getGradeColor(overallGrade).bg} border-4 ${getGradeColor(overallGrade).border} rounded-full w-32 h-32 flex items-center justify-center`}>
              <span className={`text-7xl font-mono font-black ${getGradeColor(overallGrade).text}`}>
                {overallGrade}
              </span>
            </div>

            <div>
              <p className="text-slate-400 font-mono text-sm mb-2">Estado</p>
              <p className={`text-lg font-mono font-black ${
                overallGrade === 'A' ? 'text-green-400' :
                overallGrade === 'B' ? 'text-emerald-400' :
                overallGrade === 'C' ? 'text-yellow-400' :
                overallGrade === 'D' ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {overallGrade === 'A' && '✓ Excelente'}
                {overallGrade === 'B' && '✓ Bueno'}
                {overallGrade === 'C' && '⚠ Aceptable'}
                {overallGrade === 'D' && '✗ Necesita Mejora'}
                {overallGrade === 'E' && '✗ Crítico'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
