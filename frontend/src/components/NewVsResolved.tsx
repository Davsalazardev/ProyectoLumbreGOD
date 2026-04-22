import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface AnalysisData {
  date: string;
  totalIssues: number;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
}

interface NewVsResolvedProps {
  currentAnalysis: AnalysisData;
  previousAnalysis?: AnalysisData;
  historicalData: AnalysisData[];
}

export const NewVsResolved: React.FC<NewVsResolvedProps> = ({
  currentAnalysis,
  previousAnalysis,
  historicalData
}) => {
  // Calculate new vs resolved issues
  const previousTotal = previousAnalysis?.totalIssues || 0;
  const currentTotal = currentAnalysis.totalIssues;
  const newIssues = Math.max(0, currentTotal - previousTotal);
  const resolvedIssues = previousAnalysis ? Math.max(0, previousTotal - currentTotal) : 0;
  const delta = newIssues - resolvedIssues;

  // Trend data
  const trendData = historicalData.map((analysis, idx) => ({
    date: new Date(analysis.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    new: idx === 0 ? 0 : Math.max(0, analysis.totalIssues - (historicalData[idx - 1]?.totalIssues || 0)),
    resolved: idx === 0 ? 0 : Math.max(0, (historicalData[idx - 1]?.totalIssues || 0) - analysis.totalIssues),
    total: analysis.totalIssues
  })).slice(-10);

  // Breakdown by type
  const breakdown =
    previousAnalysis ?
    [
      {
        type: 'Bugs',
        new: Math.max(0, currentAnalysis.bugs - previousAnalysis.bugs),
        resolved: Math.max(0, previousAnalysis.bugs - currentAnalysis.bugs)
      },
      {
        type: 'Vulnerabilidades',
        new: Math.max(0, currentAnalysis.vulnerabilities - previousAnalysis.vulnerabilities),
        resolved: Math.max(0, previousAnalysis.vulnerabilities - currentAnalysis.vulnerabilities)
      },
      {
        type: 'Code Smells',
        new: Math.max(0, currentAnalysis.codeSmells - previousAnalysis.codeSmells),
        resolved: Math.max(0, previousAnalysis.codeSmells - currentAnalysis.codeSmells)
      }
    ] : [];

  const totalResolved = breakdown.reduce((sum, b) => sum + b.resolved, 0);
  const totalNew = breakdown.reduce((sum, b) => sum + b.new, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-3">Total Actual</p>
          <p className="text-4xl font-mono font-black text-white mb-2">{currentTotal}</p>
          <p className="text-slate-500 font-mono text-xs">problemas detectados</p>
        </div>

        <div className={`${newIssues > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-lg p-6 text-center`}>
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-3">Problemas Nuevos</p>
          <p className={`text-4xl font-mono font-black mb-2 ${newIssues > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {newIssues}
          </p>
          <p className={`text-slate-500 font-mono text-xs ${newIssues > 0 ? 'text-red-500' : ''}`}>
            {newIssues > 0 ? '↑ Aumentó' : 'Sin cambios'}
          </p>
        </div>

        <div className={`${resolvedIssues > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-500/10 border-slate-500/30'} border rounded-lg p-6 text-center`}>
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-3">Resueltos</p>
          <p className={`text-4xl font-mono font-black mb-2 ${resolvedIssues > 0 ? 'text-green-400' : 'text-slate-400'}`}>
            {resolvedIssues}
          </p>
          <p className={`text-slate-500 font-mono text-xs ${resolvedIssues > 0 ? 'text-green-500' : ''}`}>
            {resolvedIssues > 0 ? '↓ Mejoró' : 'Sin cambios'}
          </p>
        </div>

        <div className={`${
          delta < 0
            ? 'bg-green-500/10 border-green-500/30'
            : delta > 0
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-slate-500/10 border-slate-500/30'
        } border rounded-lg p-6 text-center`}>
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-3">Delta Neto</p>
          <p className={`text-4xl font-mono font-black mb-2 ${
            delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {delta > 0 ? '+' : ''}{delta}
          </p>
          <p className="text-slate-500 font-mono text-xs">
            {delta < 0 ? '✓ Mejora' : delta > 0 ? '✗ Empeora' : 'Sin cambios'}
          </p>
        </div>
      </div>

      {/* Breakdown by Issue Type */}
      {breakdown.length > 0 && (
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
          <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
            Cambios por Tipo de Problema
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={breakdown} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="type"
                stroke="#94a3b8"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '2px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0'
                }}
                labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="new" fill="#dc2626" name="Nuevos" radius={[8, 8, 0, 0]} />
              <Bar dataKey="resolved" fill="#10b981" name="Resueltos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historical Trend */}
      {trendData.length > 1 && (
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
          <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
            Tendencia Histórica
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '2px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="new"
                stroke="#dc2626"
                fillOpacity={0.6}
                fill="url(#colorNew)"
                name="Nuevos"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                fillOpacity={0.6}
                fill="url(#colorResolved)"
                name="Resueltos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
