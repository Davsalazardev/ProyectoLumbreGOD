import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface RuleData {
  rule: string;
  count: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
}

interface IssuesByRuleProps {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
}

export const IssuesByRule: React.FC<IssuesByRuleProps> = ({
  bugs,
  vulnerabilities,
  codeSmells
}) => {
  // Simulated top rules generating issues
  const rules: RuleData[] = [
    { rule: 'Unused Variables', count: Math.max(1, Math.floor(codeSmells * 0.15)), severity: 'MINOR' },
    { rule: 'SQL Injection Risk', count: Math.max(1, Math.floor(vulnerabilities * 0.25)), severity: 'CRITICAL' },
    { rule: 'Missing Error Handling', count: Math.max(1, Math.floor(bugs * 0.20)), severity: 'MAJOR' },
    { rule: 'Duplicate Code', count: Math.max(1, Math.floor(codeSmells * 0.18)), severity: 'MINOR' },
    { rule: 'Long Functions', count: Math.max(1, Math.floor(codeSmells * 0.14)), severity: 'MINOR' },
    { rule: 'Authentication Bypass', count: Math.max(1, Math.floor(vulnerabilities * 0.20)), severity: 'CRITICAL' },
    { rule: 'Resource Leak', count: Math.max(1, Math.floor(bugs * 0.15)), severity: 'MAJOR' },
    { rule: 'Type Mismatch', count: Math.max(1, Math.floor(codeSmells * 0.12)), severity: 'MINOR' },
    { rule: 'XSS Vulnerability', count: Math.max(1, Math.floor(vulnerabilities * 0.15)), severity: 'CRITICAL' },
    { rule: 'Hardcoded Credentials', count: Math.max(1, Math.floor(vulnerabilities * 0.10)), severity: 'CRITICAL' }
  ];

  const sortedRules = rules.sort((a, b) => b.count - a.count).slice(0, 10);
  const totalByRule = sortedRules.reduce((sum, r) => sum + r.count, 0);

  const severityColors = {
    CRITICAL: '#dc2626',
    MAJOR: '#ea580c',
    MINOR: '#f59e0b',
    INFO: '#3b82f6'
  };

  const severityBgColors = {
    CRITICAL: 'bg-red-500/10 border-red-500/30',
    MAJOR: 'bg-orange-500/10 border-orange-500/30',
    MINOR: 'bg-yellow-500/10 border-yellow-500/30',
    INFO: 'bg-blue-500/10 border-blue-500/30'
  };

  const severityTextColors = {
    CRITICAL: 'text-red-400',
    MAJOR: 'text-orange-400',
    MINOR: 'text-yellow-400',
    INFO: 'text-blue-400'
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Total Reglas</p>
          <p className="text-3xl font-mono font-black text-white">{sortedRules.length}</p>
          <p className="text-slate-500 font-mono text-xs mt-1">activas</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Críticas</p>
          <p className="text-3xl font-mono font-black text-red-400">
            {sortedRules.filter(r => r.severity === 'CRITICAL').length}
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1">reglas</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Mayores</p>
          <p className="text-3xl font-mono font-black text-orange-400">
            {sortedRules.filter(r => r.severity === 'MAJOR').length}
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1">reglas</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">Menores</p>
          <p className="text-3xl font-mono font-black text-yellow-400">
            {sortedRules.filter(r => r.severity === 'MINOR').length}
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1">reglas</p>
        </div>
      </div>

      {/* Top Rules Chart */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">
          Top 10 Reglas que Generan Problemas
        </h3>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={sortedRules}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 250, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
            <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} tick={{ fill: '#cbd5e1' }} />
            <YAxis
              dataKey="rule"
              type="category"
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
              formatter={(value: any) => [`${value} issues`, 'Cantidad']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
              {sortedRules.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={severityColors[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rule Details */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-6">
        <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-6">Detalles de Reglas</h3>

        <div className="space-y-3">
          {sortedRules.map((rule, idx) => (
            <div
              key={idx}
              className={`${severityBgColors[rule.severity]} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: severityColors[rule.severity] }}
                  />
                  <span className="text-slate-300 font-mono text-sm font-semibold">{rule.rule}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-mono font-bold uppercase ${severityTextColors[rule.severity]}`}>
                    {rule.severity}
                  </span>
                  <span className="text-slate-300 font-mono text-sm font-black">{rule.count}</span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800/30">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(rule.count / sortedRules[0].count) * 100}%`,
                    backgroundColor: severityColors[rule.severity]
                  }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-slate-500 font-mono text-[10px]">
                  {((rule.count / totalByRule) * 100).toFixed(1)}% del total
                </p>
                <p className="text-slate-500 font-mono text-[10px]">
                  {rule.count} / {totalByRule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-slate-600 font-mono text-xs bg-slate-900/30 border border-slate-800/50 rounded-lg p-4">
        Enfócate en las reglas críticas primero. Resolver las top 3 reglas eliminaría ~
        {Math.round(
          (sortedRules.slice(0, 3).reduce((sum, r) => sum + r.count, 0) / totalByRule) * 100
        )}% de los problemas.
      </p>
    </div>
  );
};
