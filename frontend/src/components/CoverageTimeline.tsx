import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';

interface CoverageData {
  date: string;
  coverage: number;
}

interface CoverageTimelineProps {
  data: CoverageData[];
  currentCoverage: number;
}

export const CoverageTimeline: React.FC<CoverageTimelineProps> = ({ data, currentCoverage }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
          Cobertura de Pruebas
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-500 font-mono text-sm">No hay datos de cobertura disponibles</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }));

  const avgCoverage = Math.round(
    data.reduce((sum, d) => sum + d.coverage, 0) / data.length
  );

  const maxCoverage = Math.max(...data.map(d => d.coverage));
  const minCoverage = Math.min(...data.map(d => d.coverage));

  return (
    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest">
            Cobertura de Pruebas
          </h3>
          <p className="text-slate-600 font-mono text-xs mt-1">Tendencia histórica de cobertura</p>
        </div>
        <div className="text-right">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Cobertura Actual</p>
          <p className="text-3xl font-mono font-black text-blue-500 mt-1">{currentCoverage}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={true} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            tick={{ fill: '#cbd5e1' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            tick={{ fill: '#cbd5e1' }}
            domain={[0, 100]}
            label={{ value: 'Cobertura (%)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '2px solid #475569',
              borderRadius: '0.75rem',
              color: '#e2e8f0',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
            }}
            labelStyle={{ color: '#a1a5b4', fontWeight: 'bold' }}
            formatter={(value: any) => [`${Math.round(value)}%`, 'Cobertura']}
            cursor={{ stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Area
            type="natural"
            dataKey="coverage"
            stroke="#3b82f6"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorCoverage)"
            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff' }}
            name="Cobertura"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/50">
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Máximo</p>
          <p className="text-2xl font-mono font-black text-green-500 mt-1">{maxCoverage}%</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Promedio</p>
          <p className="text-2xl font-mono font-black text-blue-500 mt-1">{avgCoverage}%</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Mínimo</p>
          <p className="text-2xl font-mono font-black text-orange-500 mt-1">{minCoverage}%</p>
        </div>
      </div>
    </div>
  );
};
