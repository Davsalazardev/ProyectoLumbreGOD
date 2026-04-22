import React from 'react';
import { Analysis } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
  ComposedChart
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

interface Props {
  analyses: Analysis[];
}

export const TrendChart: React.FC<Props> = ({ analyses }) => {
  // Reverse to chronological order + limit to last 10 scans
  const sorted = [...analyses]
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .filter(a => a.status === 'COMPLETED' && a.metrics)
    .slice(0, 10);

  if (sorted.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-xl p-8 text-center">
        <p className="text-slate-500 font-mono text-sm">No hay análisis completados</p>
      </div>
    );
  }

  const data = sorted.map((a, index) => ({
    name: `#${index + 1}`,
    date: new Date(a.startedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    time: new Date(a.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    bugs: a.metrics?.bugs ?? 0,
    vulnerabilities: a.metrics?.vulnerabilities ?? 0,
    smells: a.metrics?.codeSmells ?? 0,
    loc: a.metrics?.loc ?? 0,
    coverage: a.metrics?.coverage ?? 0
  }));

  if (sorted.length === 1) {
    // Single analysis - show as bars with better layout
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Análisis Actual
            </h3>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800/50 rounded">
              {data[0].date} {data[0].time}
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bugGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="vulnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="smellGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#e2e8f0', fontFamily: 'monospace', padding: '4px 0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="bugs" fill="url(#bugGradient)" radius={[8, 8, 0, 0]} name="Bugs" />
                <Bar dataKey="vulnerabilities" fill="url(#vulnGradient)" radius={[8, 8, 0, 0]} name="Vulnerabilidades" />
                <Bar dataKey="smells" fill="url(#smellGradient)" radius={[8, 8, 0, 0]} name="Code Smells" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-500 uppercase mb-2 font-mono">LOC Totales</div>
            <div className="text-2xl font-bold text-blue-400">{data[0].loc.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-500 uppercase mb-2 font-mono">Problemas</div>
            <div className="text-2xl font-bold text-orange-400">
              {(data[0].bugs + data[0].vulnerabilities + data[0].smells).toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-500 uppercase mb-2 font-mono">Cobertura</div>
            <div className="text-2xl font-bold text-green-400">{Math.round(data[0].coverage * 10) / 10}%</div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple analyses - show as line chart
  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800/50 rounded-xl p-6">
      <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
        <TrendingUp size={14} /> Evolución de Incidencias
      </h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="bugLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ color: '#e2e8f0', fontFamily: 'monospace' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
              cursor={{ stroke: '#475569', strokeDasharray: '5 5' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace', paddingTop: '20px' }} />
            <Line
              type="monotone"
              name="Bugs"
              dataKey="bugs"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              name="Vulnerabilidades"
              dataKey="vulnerabilities"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              name="Smells"
              dataKey="smells"
              stroke="#eab308"
              strokeWidth={3}
              dot={{ r: 5, fill: '#eab308', strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
