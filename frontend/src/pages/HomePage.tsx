import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings, BarChart3, Shield, AlertCircle, Anchor } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.listProjects();
      setProjects(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const getProjectMetrics = (project: Project) => project.metrics || project.latestAnalysis?.metrics;

  const qualityGates = [
    { label: 'Passed', count: 0, icon: '✓', color: 'text-green-400' },
    { label: 'Failed', count: 0, icon: '✕', color: 'text-red-400' }
  ];

  const reliabilityRatings = [
    { label: 'A', rating: 'A', icon: 'A', color: 'text-green-400' },
    { label: 'B', rating: 'B', icon: 'B', color: 'text-blue-400' },
    { label: 'C', rating: 'C', icon: 'C', color: 'text-yellow-400' },
    { label: 'D', rating: 'D', icon: 'D', color: 'text-orange-400' },
    { label: 'E', rating: 'E', icon: 'E', color: 'text-red-400' }
  ];

  const securityRatings = [
    { label: 'A', rating: 'A', icon: 'A', color: 'text-green-400' },
    { label: 'B', rating: 'B', icon: 'B', color: 'text-blue-400' },
    { label: 'C', rating: 'C', icon: 'C', color: 'text-yellow-400' },
    { label: 'D', rating: 'D', icon: 'D', color: 'text-orange-400' },
    { label: 'E', rating: 'E', icon: 'E', color: 'text-red-400' }
  ];

  const securityReviewRatings = [
    { label: 'A', rating: 'A', icon: 'A', color: 'text-green-400' },
    { label: 'B ≥ 80%', rating: 'B', icon: 'B', color: 'text-blue-400' },
    { label: '70% - 80%', rating: 'C', icon: 'C', color: 'text-yellow-400' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
          {/* Organization */}
          <div className="mb-8">
            <div className="text-sm font-semibold text-gray-600 mb-4">Usuario</div>
            <div className="text-xs text-gray-500">Organization</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {/* Main */}
            <div>
              <Link 
                to="/"
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 text-gray-700 hover:text-gray-900"
              >
                <BarChart3 size={18} />
                <span className="text-sm">Projects</span>
              </Link>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Policies</h3>
              <nav className="space-y-2">
                <Link 
                  to="/rules"
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm">Rules</span>
                </Link>
              </nav>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">Usuario</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">OSS plan</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">Public</span>
                </div>
              </div>
              <Link 
                to="/"
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
              >
                View on GitHub <ChevronRight size={18} />
              </Link>
            </div>
            <p className="text-gray-600 text-sm mt-3">Key: angelthomásnunezhernández</p>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Filters Sidebar */}
            <div className="w-64 border-r border-gray-200 px-6 py-8 overflow-y-auto bg-white">
              <h2 className="font-semibold text-gray-900 mb-6">Filters</h2>

              {/* Quality Gate */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Quality Gate</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Passed</span>
                    </div>
                    <span className="text-gray-500">{projects.filter(p => p.qualityGate?.status === 'PASSED').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Failed</span>
                    </div>
                    <span className="text-gray-500">{projects.filter(p => p.qualityGate?.status === 'FAILED').length}</span>
                  </div>
                </div>
              </div>

              {/* Reliability */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Reliability</h3>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D', 'E'].map((rating) => {
                    const count = projects.filter((p) => getProjectMetrics(p)?.reliabilityRating === rating).length;
                    return (
                      <div key={rating} className="flex items-center justify-between text-sm">
                        <span className={`font-bold ${
                          rating === 'A' ? 'text-green-600' :
                          rating === 'B' ? 'text-blue-600' :
                          rating === 'C' ? 'text-yellow-600' :
                          rating === 'D' ? 'text-orange-600' : 'text-red-600'
                        }`}>{rating}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Security</h3>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D', 'E'].map((rating) => {
                    const count = projects.filter((p) => getProjectMetrics(p)?.securityRating === rating).length;
                    return (
                      <div key={rating} className="flex items-center justify-between text-sm">
                        <span className={`font-bold ${
                          rating === 'A' ? 'text-green-600' :
                          rating === 'B' ? 'text-blue-600' :
                          rating === 'C' ? 'text-yellow-600' :
                          rating === 'D' ? 'text-orange-600' : 'text-red-600'
                        }`}>{rating}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Review */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Security Review</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-green-600">A</span>
                    <span className="text-gray-500">
                      {projects.filter((p) => getProjectMetrics(p)?.securityRating === 'A').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-blue-600">B</span>
                    <span className="text-gray-500">
                      {projects.filter((p) => getProjectMetrics(p)?.securityRating === 'B').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-yellow-600">C</span>
                    <span className="text-gray-500">
                      {
                        projects.filter((p) => {
                          const rating = getProjectMetrics(p)?.securityRating;
                          return rating === 'C' || rating === 'D' || rating === 'E';
                        }).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Area */}
            <div className="flex-1 flex items-center justify-center p-12">
              {projects.length === 0 ? (
                <div className="text-center">
                  <div className="mb-8 flex justify-center">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center">
                      <Anchor size={80} className="text-blue-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No projects here yet</h2>
                  <p className="text-gray-600 mb-6">But your organization is all set, you can start analyzing code here!</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                  >
                    Analyze a new project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.language}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {project.latestAnalysis ? 'Con analisis' : 'Sin analisis'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
