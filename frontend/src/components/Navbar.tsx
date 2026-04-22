import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitHubImportModal } from './GitHubImportModal';

interface NavbarProps {
  onProjectImported?: (project: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onProjectImported }) => {
  const location = useLocation();
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportComplete = (project: any) => {
    setShowImportModal(false);
    if (onProjectImported) {
      onProjectImported(project);
    }
  };

  return (
    <>
      <nav className="bg-sonar-darkBlue text-white shadow-md sticky top-0 z-40 font-sans">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/projects" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 bg-sonar-accent rounded-sm flex items-center justify-center text-white font-black text-xs group-hover:bg-blue-600 transition-colors">
              CS
            </div>
            <span className="text-white font-semibold text-sm tracking-tight hover:text-gray-200">
              CodeScan
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-4 h-full">
            <Link
              to="/projects"
              className={`h-full flex items-center px-2 text-sm font-semibold transition-colors border-b-2 ${
                location.pathname === '/projects' || location.pathname === '/'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Projects
            </Link>
            <Link
              to="/rules"
              className={`h-full flex items-center px-2 text-sm font-semibold transition-colors border-b-2 ${
                location.pathname === '/rules'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Rules
            </Link>

            {/* Import from GitHub Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="ml-4 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
                       text-white text-sm font-semibold rounded-lg transition-all duration-200
                       flex items-center gap-2 shadow-md hover:shadow-lg"
              title="Importar repositorio de GitHub"
            >
              <span>📥</span>
              <span>Import GitHub</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Import Modal */}
      {showImportModal && (
        <GitHubImportModal
          onImportComplete={handleImportComplete}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </>
  );
};
