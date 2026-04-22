import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, BarChart, Bar } from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QualityGateHistoryProps {
  passed: number;
  failed: number;
  successRate: number;
}

export default function QualityGateHistory({
  passed = 8,
  failed = 4,
  successRate = 66.7
}: QualityGateHistoryProps) {
  // Historical data (12 weeks)
  const historyData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    passed: Math.random() < 0.7 ? 1 : 0,
    failed: Math.random() < 0.3 ? 1 : 0,
    timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  const statusData = [
    { name: 'PASSED', value: passed, color: '#10b981' },
    { name: 'FAILED', value: failed, color: '#ef4444' }
  ];

  // Recent quality gate checks
  const recentGateChecks = [
    { date: 'Hoy', status: 'PASSED', issues: '0 críticos', reason: 'Todos los gates pasados' },
    { date: 'Ayer', status: 'FAILED', issues: '2 críticos', reason: 'Coverage < 80%' },
    { date: 'Hace 2 días', status: 'PASSED', issues: '0 críticos', reason: 'Todo bien' },
    { date: 'Hace 3 días', status: 'FAILED', issues: '5 bloqueadores', reason: 'Bugs detectados' },
    { date: 'Hace 4 días', status: 'PASSED', issues: '0 críticos', reason: 'Refactorización' }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500/20 rounded-lg">
          <CheckCircle2 className="text-cyan-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Historial Quality Gates</h3>
          <p className="text-xs text-slate-400 mt-1">Seguimiento de calidad a lo largo del tiempo</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-green-400/70 font-bold mb-2 tracking-wider">Gates Pasados</p>
          <p className="text-3xl font-mono font-black text-green-400">{passed}</p>
          <p className="text-xs text-green-400/50 mt-1">Último período</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-red-400/70 font-bold mb-2 tracking-wider">Gates Fallidos</p>
          <p className="text-3xl font-mono font-black text-red-400">{failed}</p>
          <p className="text-xs text-red-400/50 mt-1">Último período</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-blue-400/70 font-bold mb-2 tracking-wider">Success Rate</p>
          <p className="text-3xl font-mono font-black text-blue-400">{successRate.toFixed(0)}%</p>
          <p className="text-xs text-blue-400/50 mt-1">Tasa éxito</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-purple-400/70 font-bold mb-2 tracking-wider">Total</p>
          <p className="text-3xl font-mono font-black text-purple-400">{passed + failed}</p>
          <p className="text-xs text-purple-400/50 mt-1">Ejecuciones</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pie representation using bars */}
        <div>
          <h4 className="text-sm font-mono font-bold text-slate-400 mb-4">Distribución de Estado</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" style={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" style={{ fontSize: 11 }} width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div>
          <h4 className="text-sm font-mono font-bold text-slate-400 mb-4">Últimas 12 Semanas</h4>
          <div className="flex gap-1 items-end h-32">
            {historyData.map((week, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5">
                  {week.passed > 0 && (
                    <div className="flex-1 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" title={`${week.week}: Pasado`} />
                  )}
                  {week.failed > 0 && (
                    <div className="flex-1 bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" title={`${week.week}: Fallido`} />
                  )}
                  {week.passed === 0 && week.failed === 0 && (
                    <div className="flex-1 bg-slate-700 rounded-t opacity-40" />
                  )}
                </div>
                <p className="text-xs font-mono text-slate-500 text-center w-full">{week.week}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Quality Gate Checks */}
      <div>
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-3 flex items-center gap-2">
          Ejecuciones Recientes
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentGateChecks.map((check, idx) => (
            <div key={idx} className={`p-3 border rounded-lg ${
              check.status === 'PASSED' 
                ? 'bg-green-500/5 border-green-500/20 hover:border-green-400/50' 
                : 'bg-red-500/5 border-red-500/20 hover:border-red-400/50'
            } transition-colors`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {check.status === 'PASSED' ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  <p className={`text-sm font-mono font-bold ${
                    check.status === 'PASSED' ? 'text-green-400' : 'text-red-400'
                  }`}>{check.status}</p>
                </div>
                <p className="text-xs text-slate-400 font-mono">{check.date}</p>
              </div>
              <p className="text-xs text-slate-400 mb-1">{check.reason}</p>
              <p className="text-xs font-mono px-2 py-1 bg-slate-800/50 rounded w-fit">
                {check.issues}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
