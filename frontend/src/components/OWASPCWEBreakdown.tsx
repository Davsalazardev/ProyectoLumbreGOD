import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle } from 'lucide-react';

interface OWASPCWEProps {
  owaspIssues: number;
  cweIssues: number;
  totalVulnerabilities: number;
}

export default function OWASPCWEBreakdown({ owaspIssues, cweIssues, totalVulnerabilities }: OWASPCWEProps) {
  const owaspCWEData = [
    { name: 'OWASP Top 10', value: owaspIssues, fill: '#ef4444' },
    { name: 'CWE Issues', value: cweIssues, fill: '#f97316' },
    { name: 'Sin Mappeo', value: Math.max(0, totalVulnerabilities - owaspIssues - cweIssues), fill: '#94a3b8' }
  ];

  const mappedPercentage = totalVulnerabilities > 0 
    ? (((owaspIssues + cweIssues) / totalVulnerabilities) * 100).toFixed(1)
    : 0;

  // Sample OWASP Top 10 categories
  const owaspTop10 = [
    { code: 'A01:2021', name: 'Broken Access Control', count: 2 },
    { code: 'A02:2021', name: 'Cryptographic Failures', count: 1 },
    { code: 'A03:2021', name: 'Injection', count: 3 },
    { code: 'A05:2021', name: 'Security Misconfiguration', count: 2 },
    { code: 'A07:2021', name: 'Identification & Authentication', count: 1 }
  ];

  // Sample CWE issues
  const cweIssuesList = [
    { id: 'CWE-79', name: 'Cross-site Scripting (XSS)', count: 2 },
    { id: 'CWE-89', name: 'SQL Injection', count: 2 },
    { id: 'CWE-295', name: 'Improper Certificate Validation', count: 1 },
    { id: 'CWE-352', name: 'Cross-Site Request Forgery', count: 1 }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-red-500/20 rounded-lg">
          <Shield className="text-red-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">OWASP & CWE Mappeos</h3>
          <p className="text-xs text-slate-400 mt-1">Estándares de seguridad identificados</p>
        </div>
      </div>

      {/* Main Chart & Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Pie Chart */}
        <div className="col-span-1">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={owaspCWEData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"

              >
                {owaspCWEData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="col-span-2 space-y-2">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-[10px] uppercase text-red-400/70 font-bold mb-1 tracking-wider">OWASP Top 10</p>
            <p className="text-2xl font-mono font-black text-red-400">{owaspIssues}</p>
            <p className="text-xs text-red-400/50 mt-1">Vulnerabilidades identificadas</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
            <p className="text-[10px] uppercase text-orange-400/70 font-bold mb-1 tracking-wider">CWE Issues</p>
            <p className="text-2xl font-mono font-black text-orange-400">{cweIssues}</p>
            <p className="text-xs text-orange-400/50 mt-1">Common Weakness Found</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
            <p className="text-[10px] uppercase text-green-400/70 font-bold mb-1 tracking-wider">Cobertura</p>
            <p className="text-2xl font-mono font-black text-green-400">{mappedPercentage}%</p>
            <p className="text-xs text-green-400/50 mt-1">De vulnerabilidades mapeadas</p>
          </div>
        </div>
      </div>

      {/* OWASP Top 10 List */}
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          OWASP Top 10 2021 Detectados
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {owaspTop10.map((owasp, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-mono font-bold text-red-400">{owasp.code}</p>
                <p className="text-xs text-slate-400 mt-0.5">{owasp.name}</p>
              </div>
              <div className="px-3 py-1 bg-red-500/20 rounded text-sm font-mono font-bold text-red-400">
                {owasp.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CWE Issues List */}
      <div>
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          CWE Issues Más Comunes
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cweIssuesList.map((cwe, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-mono font-bold text-orange-400">{cwe.id}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cwe.name}</p>
              </div>
              <div className="px-3 py-1 bg-orange-500/20 rounded text-sm font-mono font-bold text-orange-400">
                {cwe.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
