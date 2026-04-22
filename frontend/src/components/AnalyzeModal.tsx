import React, { useState } from 'react';
import { api } from '../services/api';

interface Props {
  projectId: string;
  onAnalysisStarted: (analysisId: string) => void;
  onClose: () => void;
}

const SAMPLE_CODES: Record<string, { filename: string; code: string }> = {
  javascript: {
    filename: 'src/app.js',
    code: `// Sample JavaScript with issues
var config = {
  apiKey: "sk-hardcoded-key-123",
  debug: true
};

function fetchData(userId) {
  var query = "SELECT * FROM users WHERE id = " + userId;
  eval(config.debug ? "console.log('debug mode')" : "");
  
  try {
    return db.query(query);
  } catch(e) {}
}

// TODO: Add error handling
function processUser(user) {
  console.log("Processing:", user);
  if (user.role == "admin") {
    alert("Admin user detected!");
  }
  return user.profile.settings.preferences.theme;
}`
  },
  python: {
    filename: 'app/service.py',
    code: `import os
import pickle

password = "admin123"
secret = "my-secret-key"

def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    try:
        return db.execute(query)
    except:
        pass

def process(data):
    result = eval(data['expr'])
    if result == None:
        print("Empty result")
    return result

# TODO: refactor
def batch(items=[]):
    items.append("processed")
    return items`
  },
  java: {
    filename: 'src/UserService.java',
    code: `public class UserService {
    private String DB_PASS = "admin123";
    
    public User findUser(String id) {
        String q = "SELECT * FROM users WHERE id = " + id;
        Connection conn = new Connection(URL);
        try {
            return mapUser(conn.execute(q));
        } catch(Exception e) {}
        return null;
    }
    
    public boolean check(String email) {
        System.out.println("Checking: " + email);
        if (email == "admin@example.com") return true;
        // TODO: validate format
        return email.contains("@");
    }
}`
  }
};

export const AnalyzeModal: React.FC<Props> = ({ projectId, onAnalysisStarted, onClose }) => {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('src/main.js');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSample = (lang: string) => {
    const sample = SAMPLE_CODES[lang];
    if (sample) {
      setCode(sample.code);
      setFilename(sample.filename);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !filename.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.analyzeProject(projectId, code, filename);
      onAnalysisStarted(res.analysisId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Análisis fallido');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-white font-mono font-bold text-lg">🔬 Nuevo Análisis</h2>
            <p className="text-slate-500 text-xs font-mono mt-0.5">Pega el código para analizar</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Filename */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              Nombre de archivo (usado para detectar el lenguaje)
            </label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="src/main.js"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 font-mono text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-xs text-slate-600 font-mono mt-1">
              Soportados: .js .ts .jsx .tsx .py .java
            </p>
          </div>

          {/* Sample code loaders */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              Cargar Código de Ejemplo
            </label>
            <div className="flex gap-2">
              {['javascript', 'python', 'java'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => loadSample(lang)}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 transition-colors capitalize"
                >
                  {lang === 'javascript' ? '⚡ JavaScript' : lang === 'python' ? '🐍 Python' : '☕ Java'}
                </button>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              Código Fuente
            </label>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Pega tu código aquí..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 h-64 resize-none placeholder-slate-700 leading-relaxed"
              required
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            className="px-6 py-2 text-sm font-mono bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Iniciando...
              </>
            ) : (
              <>🚀 Ejecutar Análisis</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
