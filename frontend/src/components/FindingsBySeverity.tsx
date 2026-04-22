import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface FindingsBySeverityProps {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
}

export const FindingsBySeverity: React.FC<FindingsBySeverityProps> = ({
  bugs,
  vulnerabilities,
  codeSmells
}) => {
  // Map issues to severity levels (approximation based on issue types)
  const data = [
    {
      name: 'Blocker',
      count: Math.max(1, Math.floor(vulnerabilities * 0.3)),
      color: '#dc2626'
    },
    {
      name: 'Critical',
      count: Math.max(1, Math.floor(vulnerabilities * 0.4 + bugs * 0.2)),
      color: '#ea580c'
    },
    {
      name: 'Major',
      count: Math.max(1, Math.floor(bugs * 0.5 + codeSmells * 0.3)),
      color: '#f59e0b'
    },
    {
      name: 'Minor',
      count: Math.max(1, Math.floor(codeSmells * 0.4 + bugs * 0.3)),
      color: '#eab308'
    },
    {
      name: 'Info',
      count: Math.max(1, Math.floor(codeSmells * 0.3)),
      color: '#3b82f6'
    }
  ];

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
      <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
        Hallazgos por Severidad
      </h3>
      
      <div className="grid grid-cols-5 gap-3 mb-6">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div
              className="w-full h-16 rounded flex items-center justify-center mb-2"
              style={{ backgroundColor: item.color + '20', borderColor: item.color + '60', borderWidth: '1px' }}
            >
              <span className="text-xl font-mono font-black" style={{ color: item.color }}>
                {item.count}
              </span>
            </div>
            <p className="text-slate-500 font-mono text-xs">{item.name}</p>
            <p className="text-slate-600 font-mono text-[10px] mt-1">
              {Math.round((item.count / total) * 100)}%
            </p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
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
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-slate-800/50">
        <p className="text-slate-500 font-mono text-xs">
          Total de hallazgos: <span className="text-white font-black">{total}</span>
        </p>
      </div>
    </div>
  );
};
