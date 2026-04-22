import React from 'react';

interface SecurityHotspotsProps {
  vulnerabilities: number;
  codeSmells: number;
  bugs: number;
}

export const SecurityHotspots: React.FC<SecurityHotspotsProps> = ({
  vulnerabilities,
  codeSmells,
  bugs
}) => {
  // Simulated security hotspots based on vulnerabilities
  const criticalHotspots = Math.max(1, Math.floor(vulnerabilities * 0.3));
  const majorHotspots = Math.max(1, Math.floor(vulnerabilities * 0.5));
  const minorHotspots = Math.max(1, Math.floor(vulnerabilities * 0.2));

  const totalHotspots = criticalHotspots + majorHotspots + minorHotspots;
  const reviewedHotspots = Math.floor(totalHotspots * 0.6); // Simulated reviewed
  const pendingReview = totalHotspots - reviewedHotspots;

  const hotspotFiles = Math.max(1, Math.floor(vulnerabilities / 2));

  return (
    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
      <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
        Puntos Críticos de Seguridad
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">Críticos</p>
          <p className="text-3xl font-mono font-black text-red-400">{criticalHotspots}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
          <p className="text-orange-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">Mayores</p>
          <p className="text-3xl font-mono font-black text-orange-400">{majorHotspots}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-yellow-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">Menores</p>
          <p className="text-3xl font-mono font-black text-yellow-400">{minorHotspots}</p>
        </div>
        <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 text-center">
          <p className="text-slate-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">Total</p>
          <p className="text-3xl font-mono font-black text-slate-300">{totalHotspots}</p>
        </div>
      </div>

      {/* Review Status */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Estado de Revisión</p>
          <p className="text-slate-500 font-mono text-xs">
            {reviewedHotspots} de {totalHotspots} revisados
          </p>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
            style={{
              width: `${(reviewedHotspots / totalHotspots) * 100}%`
            }}
          />
        </div>

        <div className="flex justify-between mt-4 text-xs font-mono">
          <span className="text-green-400">Revisados: {reviewedHotspots}</span>
          <span className="text-orange-400">Pendientes: {pendingReview}</span>
        </div>
      </div>

      {/* Files Affected */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Archivos Afectados</p>
          <p className="text-3xl font-mono font-black text-slate-300">{hotspotFiles}</p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Riesgo Promedio</p>
          <p className="text-xl font-mono font-black text-orange-400">
            {vulnerabilities > 0 ? 'Alto' : 'Bajo'}
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Acción Requerida</p>
          <p className={`text-lg font-mono font-black ${pendingReview > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {pendingReview > 0 ? 'Sí' : 'No'}
          </p>
        </div>
      </div>

      <p className="text-slate-600 font-mono text-xs mt-6 pt-6 border-t border-slate-800/50">
        Los puntos críticos de seguridad requieren revisión manual para determinar si son vulnerabilidades reales o falsos positivos.
      </p>
    </div>
  );
};
