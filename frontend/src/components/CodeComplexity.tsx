import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface CodeComplexityProps {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  loc: number;
  files: number;
}

export const CodeComplexity: React.FC<CodeComplexityProps> = ({
  bugs,
  vulnerabilities,
  codeSmells,
  loc,
  files
}) => {
  // Calculate estimated complexity metrics
  const avgLocPerFile = files > 0 ? Math.round(loc / files) : 0;
  const estimatedCyclomaticComplexity = Math.max(1, Math.ceil((bugs + vulnerabilities + codeSmells) / Math.max(1, files / 10)));
  const complexityRating = avgLocPerFile > 300 ? 'Alto' : avgLocPerFile > 200 ? 'Medio' : 'Bajo';
  const healthScore = Math.max(0, 100 - (avgLocPerFile / 5) - (estimatedCyclomaticComplexity * 5));

  // Simulated file complexity distribution
  const complexityDistribution = [
    { name: 'Muy Simple', count: Math.max(1, Math.floor(files * 0.3)), complexity: 1 },
    { name: 'Simple', count: Math.max(1, Math.floor(files * 0.25)), complexity: 2 },
    { name: 'Moderado', count: Math.max(1, Math.floor(files * 0.25)), complexity: 3 },
    { name: 'Complejo', count: Math.max(1, Math.floor(files * 0.15)), complexity: 4 },
    { name: 'Muy Complejo', count: Math.max(1, Math.floor(files * 0.05)), complexity: 5 }
  ];

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#dc2626'];

  return (
    <div className="space-y-6">
      {/* Complexity Metrics */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-8">Complejidad del Código</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">LOC Promedio/Archivo</p>
            <p className="text-3xl font-mono font-black text-white">{avgLocPerFile}</p>
            <p className={`text-xs font-mono mt-2 ${
              avgLocPerFile < 200 ? 'text-green-400' : 
              avgLocPerFile < 300 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {avgLocPerFile < 200 ? 'Óptimo' : avgLocPerFile < 300 ? 'Aceptable' : 'Alto'}
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Complejidad Ciclomática Est.</p>
            <p className="text-3xl font-mono font-black text-white">{estimatedCyclomaticComplexity}</p>
            <p className={`text-xs font-mono mt-2 ${
              estimatedCyclomaticComplexity <= 5 ? 'text-green-400' : 
              estimatedCyclomaticComplexity <= 10 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {estimatedCyclomaticComplexity <= 5 ? 'Baja' : estimatedCyclomaticComplexity <= 10 ? 'Media' : 'Alta'}
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Calificación</p>
            <p className="text-3xl font-mono font-black text-white">{complexityRating}</p>
            <p className="text-xs font-mono text-slate-500 mt-2">Basado en LOC</p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Salud</p>
            <p className={`text-3xl font-mono font-black ${
              healthScore > 70 ? 'text-green-400' :
              healthScore > 50 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {Math.round(healthScore)}%
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-center">
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Archivos Totales</p>
            <p className="text-3xl font-mono font-black text-white">{files}</p>
            <p className="text-xs font-mono text-slate-500 mt-2">Analizados</p>
          </div>
        </div>
      </div>

      {/* Complexity Distribution */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
          Distribución de Complejidad por Archivo
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={complexityDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              style={{ fontSize: '11px', fontWeight: 'bold' }}
              tick={{ fill: '#cbd5e1' }}
              angle={-15}
              textAnchor="end"
              height={60}
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
              formatter={(value: any) => [`${value} archivos`, 'Cantidad']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {complexityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <div className="grid grid-cols-5 gap-3">
            {complexityDistribution.map((item, index) => (
              <div key={item.name} className="text-center">
                <div
                  className="w-full h-2 rounded-full mb-2"
                  style={{ backgroundColor: colors[index] }}
                />
                <p className="text-slate-500 font-mono text-xs">{item.name}</p>
                <p className="text-slate-400 font-mono text-xs font-bold mt-1">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
