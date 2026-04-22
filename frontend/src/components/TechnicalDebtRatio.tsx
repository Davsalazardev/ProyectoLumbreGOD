import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

interface TechnicalDebtRatioProps {
  debtRatio: number;
  technicalDebt: number;
  loc: number;
  bugs: number;
  codeSmells: number;
}

export default function TechnicalDebtRatio({
  debtRatio,
  technicalDebt,
  loc,
  bugs,
  codeSmells
}: TechnicalDebtRatioProps) {
  // Convert minutes to days
  const debtInDays = technicalDebt / 480; // 480 min = 1 dev day

  // Historical trend data (simulated)
  const debtHistory = Array.from({ length: 12 }, (_, i) => ({
    month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
    ratio: debtRatio * (0.8 + Math.random() * 0.4),
    workDays: debtInDays * (0.7 + Math.random() * 0.5)
  }));

  const getDebtStatus = (ratio: number): { label: string; color: string; bg: string } => {
    if (ratio < 5) return { label: 'Excelente', color: 'text-green-400', bg: 'from-green-500/10 to-green-600/5' };
    if (ratio < 10) return { label: 'Bueno', color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-600/5' };
    if (ratio < 20) return { label: 'Aceptable', color: 'text-yellow-400', bg: 'from-yellow-500/10 to-yellow-600/5' };
    return { label: 'Crítico', color: 'text-red-400', bg: 'from-red-500/10 to-red-600/5' };
  };

  const status = getDebtStatus(debtRatio);

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-500/20 rounded-lg">
          <Zap className="text-amber-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Ratio de Deuda Técnica</h3>
          <p className="text-xs text-slate-400 mt-1">Deuda acumulada por línea de código</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className={`bg-gradient-to-br ${status.bg} border ${status.color === 'text-green-400' ? 'border-green-500/20' : status.color === 'text-blue-400' ? 'border-blue-500/20' : status.color === 'text-yellow-400' ? 'border-yellow-500/20' : 'border-red-500/20'} rounded-lg p-4`}>
          <p className="text-[10px] uppercase text-slate-400/70 font-bold mb-2 tracking-wider">Ratio</p>
          <p className={`text-3xl font-mono font-black ${status.color}`}>{debtRatio.toFixed(1)}%</p>
          <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-purple-400/70 font-bold mb-2 tracking-wider">Días/Dev</p>
          <p className="text-2xl font-mono font-black text-purple-400">{debtInDays.toFixed(1)}</p>
          <p className="text-xs text-purple-400/50 mt-1">Para resolver</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-cyan-400/70 font-bold mb-2 tracking-wider">LOC</p>
          <p className="text-2xl font-mono font-black text-cyan-400">{loc.toLocaleString()}</p>
          <p className="text-xs text-cyan-400/50 mt-1">Líneas totales</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-orange-400/70 font-bold mb-2 tracking-wider">Bugs</p>
          <p className="text-2xl font-mono font-black text-orange-400">{bugs}</p>
          <p className="text-xs text-orange-400/50 mt-1">Encontrados</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-pink-400/70 font-bold mb-2 tracking-wider">Smells</p>
          <p className="text-2xl font-mono font-black text-pink-400">{codeSmells}</p>
          <p className="text-xs text-pink-400/50 mt-1">Detectados</p>
        </div>
      </div>

      {/* Historical Trend */}
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Tendencia Histórica (12 meses)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={debtHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} yAxisId="left" />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
              cursor={{ stroke: '#06b6d4', strokeWidth: 2 }}
            />
            <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Máximo Recomendado', fill: '#ef4444', fontSize: 10 }} yAxisId="left" />
            <Line
              type="linear"
              dataKey="ratio"
              stroke="#f59e0b"
              dot={{ r: 4, fill: '#f59e0b' }}
              strokeWidth={3}
              name="Deuda (%)"
              yAxisId="left"
            />
            <Line
              type="linear"
              dataKey="workDays"
              stroke="#06b6d4"
              dot={{ r: 4, fill: '#06b6d4' }}
              strokeWidth={3}
              name="Días/Dev"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendation */}
      <div className={`p-4 ${status.bg} border ${status.color === 'text-green-400' ? 'border-green-500/20' : status.color === 'text-blue-400' ? 'border-blue-500/20' : status.color === 'text-yellow-400' ? 'border-yellow-500/20' : 'border-red-500/20'} rounded-lg`}>
        <p className={`text-sm ${status.color} font-mono`}>
          {debtRatio < 5 && '✅ Tu deuda técnica está bajo control. Mantén el ritmo actual.'}
          {debtRatio >= 5 && debtRatio < 10 && '📊 La deuda técnica está aumentando. Considera reservar sprints para refactorización.'}
          {debtRatio >= 10 && debtRatio < 20 && '⚠️ La deuda técnica es significativa. Prioritiza resolvimiento de bugs y refactorización.'}
          {debtRatio >= 20 && '🚨 La deuda técnica es crítica. Reduce nuevas features y enfócate en calidad.'}
        </p>
      </div>
    </div>
  );
}
