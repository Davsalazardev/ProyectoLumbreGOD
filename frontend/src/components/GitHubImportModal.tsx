import React, { useState } from 'react';
import { api } from '../services/api';

interface Props {
  onImportComplete: (project: any) => void;
  onClose: () => void;
}

export const GitHubImportModal: React.FC<Props> = ({ onImportComplete, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const extractRepoName = (url: string) => {
    // Extract repo name from URL: https://github.com/user/repo.git → repo
    const match = url.match(/\/([^\/]+?)(\.git)?$/);
    return match ? match[1] : '';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    
    // Auto-fill project name from repo URL
    if (url && !projectName) {
      const name = extractRepoName(url);
      if (name) {
        setProjectName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      setError('Por favor ingresa una URL de GitHub');
      return;
    }

    if (!projectName.trim()) {
      setError('Por favor ingresa un nombre para el proyecto');
      return;
    }

    // Validate GitHub URL
    if (!repoUrl.includes('github.com')) {
      setError('Por favor usa una URL válida de GitHub (github.com)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress('🔄 Importando repositorio...');

      const response = await api.post('/repositories/import', {
        url: repoUrl.trim().endsWith('.git') ? repoUrl : `${repoUrl}.git`,
        branch: branch || 'main',
        projectName: projectName.trim(),
      });

      if (response.success) {
        setProgress('✅ ¡Importación completada!');
        setTimeout(() => {
          onImportComplete(response.project);
          onClose();
        }, 1500);
      } else {
        setError(response.message || 'Error al importar el repositorio');
        setProgress('');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(
        err.message ||
        'Error: No se pudo conectar con el repositorio. Verifica que la URL sea correcta.'
      );
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">📥 Importar de GitHub</h2>
          <p className="text-blue-100 text-sm mt-1">Pega el link de cualquier repositorio de GitHub</p>
        </div>

        {/* Content */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          {/* GitHub URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔗 URL del Repositorio GitHub
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={handleUrlChange}
              placeholder="https://github.com/username/repository.git"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ej: https://github.com/facebook/react o https://github.com/facebook/react.git
            </p>
          </div>

          {/* Project Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📝 Nombre del Proyecto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ej: Mi Proyecto Awesome"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🌿 Rama (opcional)
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rama por defecto: main
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 
                          text-red-800 dark:text-red-200 px-4 py-3 rounded">
              <p className="font-medium">❌ Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Progress Message */}
          {progress && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 
                          text-blue-800 dark:text-blue-200 px-4 py-3 rounded">
              <p className="text-sm">{progress}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                        rounded-lg px-4 py-3">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Qué sucederá:</strong><br/>
              1. Se clonará el repositorio<br/>
              2. Se analizará automáticamente<br/>
              3. Se ejecutará análisis de ML, performance y dependencias<br/>
              4. Los resultados aparecerán en el dashboard
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                       text-white font-medium rounded-lg transition
                       flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Importando...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Importar Repositorio
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 font-medium rounded-lg transition"
            >
              Cancelar
            </button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">⚡ Ejemplos rápidos:</p>
            <div className="space-y-2">
              {[
                { name: 'React', url: 'https://github.com/facebook/react' },
                { name: 'Vue.js', url: 'https://github.com/vuejs/vue' },
                { name: 'Next.js', url: 'https://github.com/vercel/next.js' },
              ].map((example) => (
                <button
                  key={example.name}
                  type="button"
                  onClick={() => {
                    setRepoUrl(example.url);
                    setProjectName(example.name);
                  }}
                  disabled={loading}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {example.name} →
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
