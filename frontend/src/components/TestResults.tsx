import React from 'react';
import { Activity } from 'lucide-react';

interface TestResultsProps {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTime: number;
  averageTime: number;
}

export default function TestResults({
  totalTests = 42,
  passedTests = 40,
  failedTests = 2,
  executionTime = 8500,
  averageTime = 202
}: TestResultsProps) {
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Sample test result data
  const testsByStatus = [
    { status: 'PASSED', count: passedTests, color: 'bg-green-500', textColor: 'text-green-400' },
    { status: 'FAILED', count: failedTests, color: 'bg-red-500', textColor: 'text-red-400' }
  ];

  // Sample recent test runs
  const recentRuns = [
    { file: 'auth.test.ts', passed: 12, failed: 0, duration: 245 },
    { file: 'utils.test.ts', passed: 15, failed: 1, duration: 189 },
    { file: 'services.test.ts', passed: 10, failed: 1, duration: 340 },
    { file: 'api.test.ts', passed: 3, failed: 0, duration: 128 }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-500/20 rounded-lg">
          <Activity className="text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white">Resultados de Tests</h3>
          <p className="text-xs text-slate-400 mt-1">Ejecución y cobertura de tests</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-slate-400/70 font-bold mb-2 tracking-wider">Total</p>
          <p className="text-3xl font-mono font-black text-slate-300">{totalTests}</p>
          <p className="text-xs text-slate-400/50 mt-1">Tests</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-green-400/70 font-bold mb-2 tracking-wider">Pasados</p>
          <p className="text-3xl font-mono font-black text-green-400">{passedTests}</p>
          <p className="text-xs text-green-400/50 mt-1">Exitosos</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-red-400/70 font-bold mb-2 tracking-wider">Fallidos</p>
          <p className="text-3xl font-mono font-black text-red-400">{failedTests}</p>
          <p className="text-xs text-red-400/50 mt-1">Con errores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-purple-400/70 font-bold mb-2 tracking-wider">Success Rate</p>
          <p className="text-3xl font-mono font-black text-purple-400">{successRate.toFixed(0)}%</p>
          <p className="text-xs text-purple-400/50 mt-1">Tasa éxito</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
          <p className="text-[10px] uppercase text-blue-400/70 font-bold mb-2 tracking-wider">Tiempo Eject.</p>
          <p className="text-2xl font-mono font-black text-blue-400">{(executionTime / 1000).toFixed(1)}s</p>
          <p className="text-xs text-blue-400/50 mt-1">Total</p>
        </div>
      </div>

      {/* Test Status Bars */}
      <div className="mb-6 space-y-2">
        <h4 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-widest">Resumen por Estado</h4>
        {testsByStatus.map((status) => {
          const percentage = totalTests > 0 ? (status.count / totalTests) * 100 : 0;
          return (
            <div key={status.status} className="space-y-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono text-slate-400">{status.status}</span>
                <span className={`text-sm font-mono font-bold ${status.textColor}`}>
                  {status.count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${status.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Test Runs */}
      <div>
        <h4 className="text-sm font-mono font-bold text-slate-400 mb-3">Ejecuciones Recientes</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {recentRuns.map((run, idx) => (
            <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-mono font-bold text-slate-300">{run.file}</p>
                <p className="text-xs font-mono text-cyan-400">{run.duration}ms</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-mono">
                  ✓ {run.passed}
                </span>
                {run.failed > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded font-mono">
                    ✗ {run.failed}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
