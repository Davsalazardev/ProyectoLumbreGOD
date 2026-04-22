import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';

interface CognitiveComplexityProps {
  cognitiveComplexity: number;
  cyclomaticComplexity: number;
  averagePerFile: number;
}

export default function CognitiveComplexity({
  cognitiveComplexity,
  cyclomaticComplexity,
  averagePerFile
}: CognitiveComplexityProps) {
  // Generate educational data showing cognitive vs cyclomatic
  const data = [
    { metric: 'Cognitive', value: cognitiveComplexity, color: '#06b6d4' },
    { metric: 'Cyclomatic', value: cyclomaticComplexity, color: '#f59e0b' }
  ];

  const chartData = Array.from({ length: 10 }, (_, i) => ({
    file: `file_${i + 1}.ts`,
    cognitive: cyclomaticComplexity * 0.8 + Math.random() * 3,
    cyclomatic: cyclomaticComplexity + Math.random() * 2
  }));

  const getComplexityLevel = (value: number): string => {
    if (value < 5) return 'Baja';
    if (value < 10) return 'Media';
    if (value < 15) return 'Alta';
    return 'Muy Alta';
  };

  const getComplexityColor = (value: number): string => {
    if (value < 5) return 'text-green-400';
    if (value < 10) return 'text-yellow-400';
    if (value < 15) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500/20 rounded-lg">
          <Brain className="text-cyan-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Complejidad Cognitiva</h3>
          <p className="text-xs text-slate-400 mt-1">Análisis de legibilidad vs complejidad ciclomatic</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-cyan-400/70 font-bold mb-2 tracking-wider">Cognitiva</p>
          <p className={`text-2xl font-mono font-black ${getComplexityColor(cognitiveComplexity)}`}>
            {cognitiveComplexity.toFixed(1)}
          </p>
          <p className="text-xs text-cyan-400/50 mt-1 flex items-center gap-1">
            <span>{getComplexityLevel(cognitiveComplexity)}</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-amber-400/70 font-bold mb-2 tracking-wider">Cyclomatic</p>
          <p className={`text-2xl font-mono font-black ${getComplexityColor(cyclomaticComplexity)}`}>
            {cyclomaticComplexity.toFixed(1)}
          </p>
          <p className="text-xs text-amber-400/50 mt-1">Métrica Classic</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-purple-400/70 font-bold mb-2 tracking-wider">Promedio/Archivo</p>
          <p className="text-2xl font-mono font-black text-purple-400">
            {averagePerFile.toFixed(1)}
          </p>
          <p className="text-xs text-purple-400/50 mt-1">Por archivo</p>
        </div>
      </div>

      {/* Chart: Cognitive vs Cyclomatic by File */}
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Distribución por Archivo
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="file" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
              cursor={{ stroke: '#06b6d4', strokeWidth: 2 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="linear"
              dataKey="cognitive"
              stroke="#06b6d4"
              dot={{ r: 4, fill: '#06b6d4' }}
              strokeWidth={2}
              name="Complejidad Cognitiva"
            />
            <Line
              type="linear"
              dataKey="cyclomatic"
              stroke="#f59e0b"
              dot={{ r: 4, fill: '#f59e0b' }}
              strokeWidth={2}
              name="Complejidad Cyclomatic"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendation */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300 font-mono">
          💡 <strong>Consejo:</strong> La complejidad cognitiva es {((1 - cognitiveComplexity / cyclomaticComplexity) * 100).toFixed(0)}% menor que la cyclomatic. Enfócate en reducir ambas métricas.
        </p>
      </div>
    </div>
  );
}
