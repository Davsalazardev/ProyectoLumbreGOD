import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { api } from '../services/api';
import { QualityGateBadge } from '../components/QualityGateBadge';
import { SonarRating } from '../components/SonarRating';
import { TrendingUp, TrendingDown, Code2, GitBranch } from 'lucide-react';

const languageIcon: Record<string, { icon: React.ReactNode; bg: string; text: string; name: string }> = {
  javascript: { icon: '◆', bg: 'from-yellow-500 to-yellow-600', text: 'JavaScript', name: 'JS' },
  typescript: { icon: '<>', bg: 'from-blue-500 to-blue-600', text: 'TypeScript', name: 'TS' },
  python: { icon: '⬢', bg: 'from-green-500 to-green-600', text: 'Python', name: 'PY' },
  java: { icon: '☕', bg: 'from-orange-500 to-red-600', text: 'Java', name: 'Java' },
  csharp: { icon: '#', bg: 'from-purple-500 to-purple-600', text: 'C#', name: 'C#' },
  cpp: { icon: '++', bg: 'from-cyan-500 to-blue-600', text: 'C++', name: 'C++' },
  auto: { icon: '✨', bg: 'from-slate-500 to-slate-600', text: 'Mixed', name: 'Auto' },
  unknown: { icon: '📦', bg: 'from-slate-600 to-slate-700', text: 'Unknown', name: 'Unk' }
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
}

function formatDebt(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleImportProjects = async () => {
    try {
      setImporting(true);
      await api.importLocalProjects();
      // Reload projects
      await fetchProjects();
    } catch (err: any) {
      console.error('Import error:', err);
      // Still reload projects even if import had issues
      await fetchProjects();
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    // Auto-import projects on first load
    const autoImport = async () => {
      try {
        await api.importLocalProjects();
      } catch {
        // Silently fail on first load
      } finally {
        await fetchProjects();
      }
    };
    autoImport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sonar-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded border border-red-800 shadow-sm mt-6">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900/50 to-slate-950/50 backdrop-blur border-b border-slate-800/50 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-mono font-black text-white mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Proyectos
              </h1>
              <p className="text-slate-400 font-mono text-sm flex items-center gap-2">
                <Code2 size={14} />
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''} monitoreado{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImportProjects}
                disabled={importing}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-lg font-mono font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <GitBranch size={16} />
                  {importing ? 'Cargando...' : 'Importar'}
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-cyan-600 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={fetchProjects}
                className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-800/50 transition-all font-mono font-semibold text-sm"
              >
                ↻ Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 rounded-2xl backdrop-blur">
            <Code2 size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 font-mono text-lg mb-2">No hay proyectos aún</p>
            <p className="text-slate-500 font-mono text-sm">Haz clic en "Importar" para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
            {projects.map((project) => {
              const lastAnalysis = project.analyses?.[0];
              const metrics = lastAnalysis?.metrics || project.metrics;
              const qgStatus = project.qualityGate?.status || 'UNKNOWN';
              const lang = project.language || 'unknown';
              const langData = languageIcon[lang.toLowerCase()] || languageIcon.unknown;

              // Calculate trend
              const totalIssues = (metrics?.bugs || 0) + (metrics?.vulnerabilities || 0) + (metrics?.codeSmells || 0);
              const trend = totalIssues > 50 ? 'down' : 'up';

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group h-full"
                >
                  <div className="relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/50 hover:border-slate-600/80 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-1 overflow-hidden"
>
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-600/5 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 space-y-6">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Language Badge */}
                          <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-gradient-to-r ${langData.bg} text-white font-mono font-bold text-xs shadow-lg hover:shadow-xl transition-shadow`}>
                            <span className="text-lg">{langData.icon}</span>
                            <span>{langData.name}</span>
                          </div>

                          {/* Project Name */}
                          <h3 className="text-2xl font-mono font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300 mb-2 line-clamp-2">
                            {project.name}
                          </h3>

                          {/* Meta Info */}
                          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                            <span className="px-2 py-1 bg-slate-800/50 rounded">
                              Creado {formatDate(project.createdAt)}
                            </span>
                            {metrics && (
                              <span className="px-2 py-1 bg-slate-800/50 rounded">
                                {metrics.loc?.toLocaleString() || 0} LOC
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quality Gate Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Calidad</div>
                          <QualityGateBadge status={qgStatus} size="lg" />
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      {metrics ? (
                        <div className="grid grid-cols-4 gap-3">
                          {/* Bugs */}
                          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-3 hover:border-red-500/50 transition-all group/metric">
                            <p className="text-[10px] uppercase text-red-400/70 font-bold tracking-wider mb-1.5">Bugs</p>
                            <div className="flex items-end gap-1.5">
                              <SonarRating value={metrics.bugs || 0} type="bugs" size="sm" />
                              <span className="text-xl font-mono font-black text-white">{metrics.bugs || 0}</span>
                            </div>
                            <div className="text-[10px] text-red-400/60 mt-1 flex items-center gap-1">
                              {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {trend === 'up' ? 'Aumenta' : 'Mejora'}
                            </div>
                          </div>

                          {/* Vulnerabilities */}
                          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-3 hover:border-orange-500/50 transition-all group/metric">
                            <p className="text-[10px] uppercase text-orange-400/70 font-bold tracking-wider mb-1.5">Vulner.</p>
                            <div className="flex items-end gap-1.5">
                              <SonarRating value={metrics.vulnerabilities || 0} type="vulnerabilities" size="sm" />
                              <span className="text-xl font-mono font-black text-white">{metrics.vulnerabilities || 0}</span>
                            </div>
                            <div className="text-[10px] text-orange-400/60 mt-1">
                              Alto riesgo
                            </div>
                          </div>

                          {/* Code Smells */}
                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3 hover:border-blue-500/50 transition-all group/metric">
                            <p className="text-[10px] uppercase text-blue-400/70 font-bold tracking-wider mb-1.5">Olores</p>
                            <div className="flex items-end gap-1.5">
                              <SonarRating value={metrics.codeSmells || 0} type="smells" size="sm" />
                              <span className="text-xl font-mono font-black text-white">{metrics.codeSmells || 0}</span>
                            </div>
                            <div className="text-[10px] text-blue-400/60 mt-1">
                              Mantenib.
                            </div>
                          </div>

                          {/* Technical Debt */}
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3 hover:border-purple-500/50 transition-all group/metric">
                            <p className="text-[10px] uppercase text-purple-400/70 font-bold tracking-wider mb-1.5">Deuda</p>
                            <p className="text-xl font-mono font-black text-white">{formatDebt(metrics.technicalDebt || 0)}</p>
                            <div className="text-[10px] text-purple-400/60 mt-1">
                              Técnica
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                          <p className="text-slate-400 font-mono text-xs">Sin análisis</p>
                        </div>
                      )}

                      {/* Footer Stats */}
                      {metrics && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                          <div className="text-xs text-slate-500 font-mono">
                            {metrics.files || 0} archivos analizados
                          </div>
                          <div className="text-xs font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">
                            Ver detalles →
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
