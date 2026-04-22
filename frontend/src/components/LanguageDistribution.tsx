import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LanguageDistributionProps {
  loc: number;
  files: number;
  projectLanguage?: string;
}

export const LanguageDistribution: React.FC<LanguageDistributionProps> = ({
  loc,
  files,
  projectLanguage = 'Mixed'
}) => {
  // Simulated language distribution based on project language
  const languageMap: Record<string, Array<{ name: string; percentage: number; loc: number }>> = {
    typescript: [
      { name: 'TypeScript', percentage: 65, loc: Math.floor(loc * 0.65) },
      { name: 'JavaScript', percentage: 20, loc: Math.floor(loc * 0.20) },
      { name: 'HTML', percentage: 10, loc: Math.floor(loc * 0.10) },
      { name: 'CSS', percentage: 5, loc: Math.floor(loc * 0.05) }
    ],
    python: [
      { name: 'Python', percentage: 85, loc: Math.floor(loc * 0.85) },
      { name: 'YAML', percentage: 10, loc: Math.floor(loc * 0.10) },
      { name: 'JSON', percentage: 5, loc: Math.floor(loc * 0.05) }
    ],
    java: [
      { name: 'Java', percentage: 80, loc: Math.floor(loc * 0.80) },
      { name: 'XML', percentage: 15, loc: Math.floor(loc * 0.15) },
      { name: 'Properties', percentage: 5, loc: Math.floor(loc * 0.05) }
    ],
    csharp: [
      { name: 'C#', percentage: 75, loc: Math.floor(loc * 0.75) },
      { name: 'XAML', percentage: 15, loc: Math.floor(loc * 0.15) },
      { name: 'XML', percentage: 10, loc: Math.floor(loc * 0.10) }
    ],
    cpp: [
      { name: 'C++', percentage: 70, loc: Math.floor(loc * 0.70) },
      { name: 'C', percentage: 20, loc: Math.floor(loc * 0.20) },
      { name: 'CMake', percentage: 10, loc: Math.floor(loc * 0.10) }
    ]
  };

  const languages = languageMap[projectLanguage.toLowerCase()] ||
    [
      { name: projectLanguage || 'Main', percentage: 60, loc: Math.floor(loc * 0.60) },
      { name: 'Config', percentage: 25, loc: Math.floor(loc * 0.25) },
      { name: 'Other', percentage: 15, loc: Math.floor(loc * 0.15) }
    ];

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1'];

  return (
    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
      <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
        Distribución de Lenguajes
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={languages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {languages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '2px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0'
                }}
                formatter={(value: any) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Language Details */}
        <div className="space-y-3">
          <div className="text-center pb-4 border-b border-slate-800/50">
            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Total LOC</p>
            <p className="text-3xl font-mono font-black text-white mt-2">{loc.toLocaleString()}</p>
            <p className="text-slate-500 font-mono text-xs mt-2">{files} archivos</p>
          </div>

          <div className="space-y-2">
            {languages.map((lang, idx) => (
              <div key={lang.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-mono text-xs">{lang.name}</span>
                  <span className="text-slate-300 font-mono text-xs font-semibold">{lang.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800/30">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: colors[idx % colors.length]
                    }}
                  />
                </div>
                <p className="text-slate-600 font-mono text-[10px] mt-1">{lang.loc.toLocaleString()} LOC</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
