import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, AlertCircle } from 'lucide-react';

interface IssueAgeProps {
  newIssues: number;
  oldIssues: number;
  avgAgeInDays: number;
  totalIssues: number;
}

export default function IssueAge({ newIssues, oldIssues, avgAgeInDays, totalIssues }: IssueAgeProps) {
  const openIssues = totalIssues - newIssues;
  
  const ageData = [
    { range: '0-7 días', count: newIssues, fill: '#10b981' },
    { range: '7-30 días', count: Math.max(0, openIssues - oldIssues), fill: '#f59e0b' },
    { range: '+30 días', count: oldIssues, fill: '#ef4444' }
  ];

  const avgAgeCategory = 
    avgAgeInDays <= 7 ? 'Nuevos' : 
    avgAgeInDays <= 30 ? 'Activos' : 
    'Antiguos';

  const avgAgeColor =
    avgAgeInDays <= 7 ? 'text-green-400' :
    avgAgeInDays <= 30 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-red-500/20 rounded-lg">
          <Clock className="text-red-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Edad de los Issues</h3>
          <p className="text-xs text-slate-400 mt-1">Cuánto tiempo llevan abiertos</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-green-400/70 font-bold mb-2 tracking-wider">Nuevos</p>
          <p className="text-2xl font-mono font-black text-green-400">{newIssues}</p>
          <p className="text-xs text-green-400/50 mt-1">Últimos 7 días</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-red-400/70 font-bold mb-2 tracking-wider">Antiguos</p>
          <p className="text-2xl font-mono font-black text-red-400">{oldIssues}</p>
          <p className="text-xs text-red-400/50 mt-1">Más de 30 días</p>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-slate-400/70 font-bold mb-2 tracking-wider">Promedio</p>
          <p className={`text-2xl font-mono font-black ${avgAgeColor}`}>
            {avgAgeInDays.toFixed(0)}d
          </p>
          <p className="text-xs text-slate-400/50 mt-1">{avgAgeCategory}</p>
        </div>
      </div>

      {/* Age Distribution Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-4 flex items-center gap-2">
          <AlertCircle size={14} />
          Distribución de Edad
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="range" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
              cursor={{ fill: '#475569' }}
            />
            <Bar dataKey="count">
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 font-mono mb-1">% Nuevos</p>
          <p className="text-xl font-mono font-black text-green-400">
            {totalIssues > 0 ? ((newIssues / totalIssues) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 font-mono mb-1">% Antiguos</p>
          <p className="text-xl font-mono font-black text-red-400">
            {totalIssues > 0 ? ((oldIssues / totalIssues) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Recommendation */}
      {avgAgeInDays > 30 && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-300 font-mono">
            ⚠️ <strong>Atención:</strong> El promedio de edad de issues es muy alto. Considera refinar tu proceso de revisión o cierre de issues.
          </p>
        </div>
      )}
    </div>
  );
}
