import React from 'react';

interface CodeDuplicationProps {
  duplications: number;
  loc: number;
}

export const CodeDuplication: React.FC<CodeDuplicationProps> = ({ duplications, loc }) => {
  const duplicatedLines = Math.round((loc * duplications) / 100);
  const uniqueLines = loc - duplicatedLines;

  // Gauge visual
  const duplicationLevel =
    duplications <= 5
      ? { level: 'Excelente', color: 'text-green-400', bg: 'bg-green-500/20', icon: '✓' }
      : duplications <= 10
      ? { level: 'Bueno', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '✓' }
      : duplications <= 15
      ? { level: 'Aceptable', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⚠' }
      : duplications <= 20
      ? { level: 'Malo', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '✗' }
      : { level: 'Crítico', color: 'text-red-400', bg: 'bg-red-500/20', icon: '✗' };

  // Calculate top duplicated patterns (simulated)
  const duplicatedPatterns = [
    { pattern: 'Utility Functions', count: Math.floor(duplicatedLines * 0.25) },
    { pattern: 'Component Boilerplate', count: Math.floor(duplicatedLines * 0.20) },
    { pattern: 'Type Definitions', count: Math.floor(duplicatedLines * 0.18) },
    { pattern: 'Error Handlers', count: Math.floor(duplicatedLines * 0.16) },
    { pattern: 'Configuration Code', count: Math.floor(duplicatedLines * 0.15) },
    { pattern: 'Other', count: Math.floor(duplicatedLines * 0.06) }
  ];

  return (
    <div className="space-y-6">
      {/* Duplication Gauge */}
      <div className={`${duplicationLevel.bg} border border-${duplicationLevel.color.split('-')[1]}-500/50 rounded-lg p-8`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest mb-4">
              Duplicidad de Código
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-5xl font-mono font-black ${duplicationLevel.color}`}>
                {duplications.toFixed(1)}%
              </p>
              <p className="text-slate-400 font-mono text-sm">del código total</p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-2xl font-mono font-black ${duplicationLevel.color} mb-2`}>
              {duplicationLevel.icon} {duplicationLevel.level}
            </p>
            <p className="text-slate-500 font-mono text-xs">Refactorización {duplications > 15 ? 'Recomendada' : 'Opcional'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={`h-full transition-all ${
              duplications <= 5
                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                : duplications <= 10
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : duplications <= 15
                ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                : duplications <= 20
                ? 'bg-gradient-to-r from-orange-500 to-red-400'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${Math.min(100, duplications * 5)}%` }}
          />
        </div>

        <div className="flex justify-between mt-4 text-xs font-mono text-slate-500">
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%+</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Líneas Duplicadas</p>
          <p className="text-3xl font-mono font-black text-red-400">{duplicatedLines.toLocaleString()}</p>
          <p className="text-slate-500 font-mono text-xs mt-1">LOC</p>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Líneas Únicas</p>
          <p className="text-3xl font-mono font-black text-green-400">{uniqueLines.toLocaleString()}</p>
          <p className="text-slate-500 font-mono text-xs mt-1">LOC</p>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Total LOC</p>
          <p className="text-3xl font-mono font-black text-white">{loc.toLocaleString()}</p>
          <p className="text-slate-500 font-mono text-xs mt-1">Código</p>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Potencial de Mejora</p>
          <p className={`text-3xl font-mono font-black ${
            duplications > 15 ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {Math.round((duplicatedLines / 10) * duplications)}%
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1">Refactorizable</p>
        </div>
      </div>

      {/* Top Duplicated Patterns */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
          Patrones de Duplicidad
        </h4>

        <div className="space-y-3">
          {duplicatedPatterns.map((pattern, idx) => {
            const percentage = (pattern.count / duplicatedLines) * 100;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-mono text-xs">{pattern.pattern}</span>
                  <span className="text-slate-300 font-mono text-xs font-bold">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800/30">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
