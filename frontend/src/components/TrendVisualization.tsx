import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
  Dot
} from 'recharts';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

interface TrendData {
  date: string;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  technicalDebt: number;
  coverage: number;
  maintainability: number;
}

interface TrendVisualizationProps {
  data: TrendData[];
}

export const TrendVisualization: React.FC<TrendVisualizationProps> = ({ data }) => {
  const [visibleLines, setVisibleLines] = useState({
    bugs: true,
    vulnerabilities: true,
    codeSmells: true,
    debt: true
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-slate-950/50 border border-slate-800/50 rounded flex items-center justify-center">
        <p className="text-slate-500 font-mono text-sm">No hay datos de tendencias disponibles</p>
      </div>
    );
  }

  // Format data for charts
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    dateNum: new Date(d.date).getTime()
  }));

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Issues Evolution */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              Evolución de Problemas
            </h4>
            <p className="text-slate-600 font-mono text-xs mt-1">Observa cómo suben y bajan los problemas a lo largo del tiempo</p>
          </div>
          <div className="flex gap-3 text-xs flex-wrap justify-end">
            <button
              onClick={() => toggleLine('bugs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition font-semibold ${
                visibleLines.bugs
                  ? 'bg-red-500/25 text-red-300 border border-red-500/60'
                  : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
              }`}
            >
              {visibleLines.bugs ? <Eye size={14} /> : <EyeOff size={14} />} Bugs
            </button>
            <button
              onClick={() => toggleLine('vulnerabilities')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition font-semibold ${
                visibleLines.vulnerabilities
                  ? 'bg-orange-500/25 text-orange-300 border border-orange-500/60'
                  : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
              }`}
            >
              {visibleLines.vulnerabilities ? <Eye size={14} /> : <EyeOff size={14} />} Vulnerabilidades
            </button>
            <button
              onClick={() => toggleLine('codeSmells')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition font-semibold ${
                visibleLines.codeSmells
                  ? 'bg-blue-500/25 text-blue-300 border border-blue-500/60'
                  : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
              }`}
            >
              {visibleLines.codeSmells ? <Eye size={14} /> : <EyeOff size={14} />} Code Smells
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
            <defs>
              {visibleLines.bugs && (
                <>
                  <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="shadowBugs">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                  </filter>
                </>
              )}
              {visibleLines.vulnerabilities && (
                <>
                  <linearGradient id="colorVulns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="shadowVulns">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                  </filter>
                </>
              )}
              {visibleLines.codeSmells && (
                <>
                  <linearGradient id="colorSmells" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="shadowSmells">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                  </filter>
                </>
              )}
            </defs>
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#334155" 
              vertical={true}
              horizontalPoints={[0, 100]}
            />
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
              label={{ value: 'Cantidad de Problemas', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
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
              labelStyle={{ color: '#a1a5b4', fontWeight: 'bold', fontSize: '12px' }}
              cursor={{ stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 5' }}
              wrapperStyle={{ outline: 'none' }}
              formatter={(value) => {
                if (typeof value === 'number') return [Math.round(value), ''];
                return value;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              verticalAlign="bottom"
              height={30}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  bugs: 'Bugs',
                  vulnerabilities: 'Vulnerabilidades',
                  codeSmells: 'Code Smells'
                };
                return labels[value] || value;
              }}
            />
            
            {visibleLines.bugs && (
              <Area
                type="natural"
                dataKey="bugs"
                stroke="#ef4444"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorBugs)"
                name="bugs"
                dot={{ fill: '#ef4444', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 9, strokeWidth: 3, stroke: '#fff', fill: '#ff6b6b' }}
                filter="url(#shadowBugs)"
              />
            )}
            {visibleLines.vulnerabilities && (
              <Area
                type="natural"
                dataKey="vulnerabilities"
                stroke="#f97316"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorVulns)"
                name="vulnerabilities"
                dot={{ fill: '#f97316', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 9, strokeWidth: 3, stroke: '#fff', fill: '#fb923c' }}
                filter="url(#shadowVulns)"
              />
            )}
            {visibleLines.codeSmells && (
              <Area
                type="natural"
                dataKey="codeSmells"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorSmells)"
                name="codeSmells"
                dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 9, strokeWidth: 3, stroke: '#fff', fill: '#60a5fa' }}
                filter="url(#shadowSmells)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Technical Debt */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              Deuda Técnica (Minutos)
            </h4>
            <p className="text-slate-600 font-mono text-xs mt-1">Tendencia en tiempo requerido para resolución</p>
          </div>
          <button
            onClick={() => toggleLine('debt')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition text-xs font-semibold ${
              visibleLines.debt
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/60'
                : 'bg-slate-800/50 text-slate-600 border border-slate-700/50'
            }`}
          >
            {visibleLines.debt ? <Eye size={14} /> : <EyeOff size={14} />} Deuda
          </button>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
            <defs>
              {visibleLines.debt && (
                <>
                  <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <filter id="shadowDebt">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                  </filter>
                </>
              )}
            </defs>
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#334155"
              vertical={true}
            />
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
              label={{ value: 'Minutos', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
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
              formatter={(value: any) => [`${Math.round(value)} min`, 'Deuda']}
              cursor={{ stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            {visibleLines.debt && (
              <Line
                type="natural"
                dataKey="technicalDebt"
                stroke="#a855f7"
                strokeWidth={4}
                dot={{ fill: '#a855f7', r: 6, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 9, strokeWidth: 3, stroke: '#fff', fill: '#d77dff' }}
                name="technicalDebt"
                isAnimationActive={false}
                filter="url(#shadowDebt)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      {data.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 border border-slate-800/50 rounded-lg p-4">
          <div className="text-center px-2 py-3">
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-2">Cambio Bugs</p>
            <p className={`text-2xl font-mono font-black leading-none ${
              data[data.length - 1].bugs < data[data.length - 2].bugs ? 'text-green-500' : 'text-red-500'
            }`}>
              {data[data.length - 1].bugs - data[data.length - 2].bugs > 0 ? '+' : ''}
              {data[data.length - 1].bugs - data[data.length - 2].bugs}
            </p>
          </div>
          <div className="text-center px-2 py-3">
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-2">Cambio Vulns</p>
            <p className={`text-2xl font-mono font-black leading-none ${
              data[data.length - 1].vulnerabilities < data[data.length - 2].vulnerabilities ? 'text-green-500' : 'text-red-500'
            }`}>
              {data[data.length - 1].vulnerabilities - data[data.length - 2].vulnerabilities > 0 ? '+' : ''}
              {data[data.length - 1].vulnerabilities - data[data.length - 2].vulnerabilities}
            </p>
          </div>
          <div className="text-center px-2 py-3">
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-2">Cambio Smells</p>
            <p className={`text-2xl font-mono font-black leading-none ${
              data[data.length - 1].codeSmells < data[data.length - 2].codeSmells ? 'text-green-500' : 'text-red-500'
            }`}>
              {data[data.length - 1].codeSmells - data[data.length - 2].codeSmells > 0 ? '+' : ''}
              {data[data.length - 1].codeSmells - data[data.length - 2].codeSmells}
            </p>
          </div>
          <div className="text-center px-2 py-3">
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-2">Total Análisis</p>
            <p className="text-2xl font-mono font-black text-slate-300 leading-none">{data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};
