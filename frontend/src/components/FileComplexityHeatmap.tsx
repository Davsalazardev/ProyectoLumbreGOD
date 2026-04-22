import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GitBranch } from 'lucide-react';

interface FileComplexityHeatmapProps {
  files: Array<{ name: string; complexity: number; loc: number; issues: number }>;
}

export default function FileComplexityHeatmap({
  files = [
    { name: 'auth.service.ts', complexity: 12.5, loc: 450, issues: 5 },
    { name: 'api.controller.ts', complexity: 8.3, loc: 320, issues: 2 },
    { name: 'database.ts', complexity: 15.2, loc: 620, issues: 8 },
    { name: 'utils.ts', complexity: 5.1, loc: 180, issues: 1 },
    { name: 'models.ts', complexity: 6.8, loc: 290, issues: 2 },
    { name: 'middleware.ts', complexity: 9.4, loc: 410, issues: 3 },
    { name: 'validators.ts', complexity: 11.2, loc: 510, issues: 4 },
    { name: 'helpers.ts', complexity: 4.2, loc: 125, issues: 0 }
  ]
}: FileComplexityHeatmapProps) {
  const getComplexityColor = (complexity: number) => {
    if (complexity < 5) return '#10b981'; // green
    if (complexity < 10) return '#f59e0b'; // amber
    if (complexity < 15) return '#ef5350'; // red
    return '#c41c3b'; // dark red
  };

  // Sort by complexity descending for better visualization
  const sortedFiles = [...files].sort((a, b) => b.complexity - a.complexity);

  const maxComplexity = Math.max(...sortedFiles.map(f => f.complexity), 1);

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/20 rounded-lg">
          <GitBranch className="text-indigo-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Mapa de Complejidad de Archivos</h3>
          <p className="text-xs text-slate-400 mt-1">Archivos ordenados por complejidad</p>
        </div>
      </div>

      {/* Complexity Bar Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-4">Complejidad por Archivo</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedFiles} margin={{ top: 5, right: 30, left: 100, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" style={{ fontSize: 11 }} width={95} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="complexity">
              {sortedFiles.map((file, index) => (
                <Cell key={`cell-${index}`} fill={getComplexityColor(file.complexity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed File List */}
      <div className="space-y-2">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-3">Análisis Detallado</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedFiles.map((file, idx) => {
            const complexityPercent = (file.complexity / maxComplexity) * 100;
            const complexityLevel = 
              file.complexity < 5 ? 'Baja' :
              file.complexity < 10 ? 'Media' :
              file.complexity < 15 ? 'Alta' :
              'Muy Alta';
            const complexityColor =
              file.complexity < 5 ? 'text-green-400' :
              file.complexity < 10 ? 'text-yellow-400' :
              file.complexity < 15 ? 'text-red-400' :
              'text-red-600';

            return (
              <div key={idx} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-mono font-bold text-slate-200">{file.name}</p>
                    <p className={`text-xs font-mono mt-1 ${complexityColor}`}>{complexityLevel}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-mono font-black ${complexityColor}`}>
                      {file.complexity.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Mini bar */}
                <div className="mb-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${complexityPercent}%`,
                      backgroundColor: getComplexityColor(file.complexity)
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-400 font-mono">
                    {file.loc} LOC
                  </div>
                  <div className="px-2 py-1 bg-orange-500/20 rounded text-orange-400 font-mono">
                    {file.issues} Issues
                  </div>
                  <div className="px-2 py-1 bg-purple-500/20 rounded text-purple-400 font-mono">
                    {(file.loc / file.complexity).toFixed(0)} LOC/Cmpl
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
