import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';

interface ActivityData {
  date: string;
  commits: number;
  issuesResolved: number;
  newIssues: number;
}

interface ActivityTimelineProps {
  analyses: Array<{
    id: string;
    startedAt: string;
    status: string;
  }>;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ analyses }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
          Actividad
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-500 font-mono text-sm">No hay datos de actividad disponibles</p>
        </div>
      </div>
    );
  }

  // Group analyses by date
  const activityMap: Record<string, number> = {};
  analyses.forEach(a => {
    const date = new Date(a.startedAt).toLocaleDateString('es-ES');
    activityMap[date] = (activityMap[date] || 0) + 1;
  });

  const chartData = Object.entries(activityMap)
    .map(([date, count]) => ({
      date,
      analyses: count,
      dateNum: new Date(date).getTime()
    }))
    .sort((a, b) => a.dateNum - b.dateNum)
    .slice(-15); // Last 15 analyses

  const totalAnalyses = analyses.length;
  const successfulAnalyses = analyses.filter(a => a.status === 'COMPLETED').length;
  const recentAnalyses = analyses.slice(0, 3).length;

  return (
    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest">
            Actividad de Análisis
          </h3>
          <p className="text-slate-600 font-mono text-xs mt-1">Histórico de análisis realizados</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={true} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            tick={{ fill: '#cbd5e1' }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            tick={{ fill: '#cbd5e1' }}
            label={{ value: 'Análisis', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
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
            formatter={(value: any) => `${value} análisis`}
            cursor={{ stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Bar
            dataKey="analyses"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            name="Análisis"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/50">
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Total</p>
          <p className="text-2xl font-mono font-black text-white mt-1">{totalAnalyses}</p>
          <p className="text-slate-500 font-mono text-[10px] mt-1">análisis</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Exitosos</p>
          <p className="text-2xl font-mono font-black text-green-500 mt-1">{successfulAnalyses}</p>
          <p className="text-slate-500 font-mono text-[10px] mt-1">completados</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Tasa Éxito</p>
          <p className="text-2xl font-mono font-black text-blue-500 mt-1">
            {totalAnalyses > 0 ? Math.round((successfulAnalyses / totalAnalyses) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};
