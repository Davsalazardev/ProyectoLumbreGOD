import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TestTube2, CheckCircle, AlertCircle } from 'lucide-react';

interface CodeCoverageDetailProps {
  unitCoverage: number;
  integrationCoverage: number;
  e2eCoverage: number;
  totalCoverage: number;
  coverageTarget: number;
}

export default function CodeCoverageDetail({
  unitCoverage = 65,
  integrationCoverage = 45,
  e2eCoverage = 30,
  totalCoverage = 60,
  coverageTarget = 80
}: CodeCoverageDetailProps) {
  // Handle defaults if needed
  const coverageData = [
    { type: 'Unit', coverage: unitCoverage, fill: '#10b981' },
    { type: 'Integration', coverage: integrationCoverage, fill: '#3b82f6' },
    { type: 'E2E', coverage: e2eCoverage, fill: '#f59e0b' }
  ];

  const trendData = Array.from({ length: 10 }, (_, i) => ({
    sprint: `Sprint ${i + 1}`,
    coverage: totalCoverage * (0.7 + Math.random() * 0.3),
    target: coverageTarget
  }));

  const getCoverageStatus = (coverage: number, target: number): { label: string; color: string } => {
    if (coverage >= target) return { label: 'Objetivo Alcanzado', color: 'text-green-400' };
    if (coverage >= target - 10) return { label: 'Casi Objetivo', color: 'text-yellow-400' };
    return { label: 'Bajo Target', color: 'text-red-400' };
  };

  const status = getCoverageStatus(totalCoverage, coverageTarget);

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-green-500/20 rounded-lg">
          <TestTube2 className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Cobertura de Código</h3>
          <p className="text-xs text-slate-400 mt-1">Tests unitarios, integración y E2E</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-green-400/70 font-bold mb-2 tracking-wider">Total</p>
          <p className="text-3xl font-mono font-black text-green-400">{totalCoverage.toFixed(0)}%</p>
          <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-green-400/70 font-bold mb-2 tracking-wider">Unit</p>
          <p className="text-2xl font-mono font-black text-green-400">{unitCoverage.toFixed(0)}%</p>
          <p className="text-xs text-green-400/50 mt-1">Unitarios</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-blue-400/70 font-bold mb-2 tracking-wider">Integration</p>
          <p className="text-2xl font-mono font-black text-blue-400">{integrationCoverage.toFixed(0)}%</p>
          <p className="text-xs text-blue-400/50 mt-1">Integración</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-amber-400/70 font-bold mb-2 tracking-wider">E2E</p>
          <p className="text-2xl font-mono font-black text-amber-400">{e2eCoverage.toFixed(0)}%</p>
          <p className="text-xs text-amber-400/50 mt-1">End to End</p>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-slate-400/70 font-bold mb-2 tracking-wider">Target</p>
          <p className="text-2xl font-mono font-black text-slate-400">{coverageTarget.toFixed(0)}%</p>
          <p className="text-xs text-slate-400/50 mt-1">Objetivo</p>
        </div>
      </div>

      {/* Coverage Distribution */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-mono font-bold text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle size={14} />
            Por Tipo de Test
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={coverageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="coverage" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Chart */}
        <div>
          <h4 className="text-sm font-mono font-bold text-slate-400 mb-4 flex items-center gap-2">
            <AlertCircle size={14} />
            Tendencia (últimos 10 sprints)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="sprint" stroke="#94a3b8" style={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="linear"
                dataKey="coverage"
                stroke="#10b981"
                dot={{ r: 4, fill: '#10b981' }}
                strokeWidth={2}
                name="Cobertura Actual"
              />
              <Line
                type="linear"
                dataKey="target"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`p-4 ${totalCoverage >= coverageTarget ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'} rounded-lg`}>
        <p className={`text-sm ${totalCoverage >= coverageTarget ? 'text-green-300' : 'text-yellow-300'} font-mono`}>
          {totalCoverage >= coverageTarget 
            ? '✅ Cobertura en objetivo. Mantén el nivel actual.'
            : `⚠️ Faltan ${(coverageTarget - totalCoverage).toFixed(1)}% para alcanzar el objetivo. Aumenta tests en áreas críticas.`
          }
        </p>
      </div>
    </div>
  );
}
