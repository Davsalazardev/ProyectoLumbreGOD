import React from 'react';
import { Link } from 'react-router-dom';

export const RulesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link to="/projects" className="text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors">
        ← Volver
      </Link>
      <h1 className="text-2xl font-mono font-black text-white mt-4 mb-8">Catálogo de Reglas y Directrices</h1>
      
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-mono font-bold text-white mb-2">
            <span className="text-blue-400 mr-2">TS/JS</span> no-eval
          </h2>
          <p className="text-sm font-mono text-slate-400 mb-6">
            El uso de <code className="bg-slate-800 px-1 rounded text-red-300">eval()</code> permite la ejecución de código arbitrario y abre la puerta a inyecciones.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg">
              <p className="text-[10px] text-red-500 uppercase font-black mb-2">No Compliant</p>
              <pre className="text-xs text-red-300 font-mono">
                {`const data = eval("(" + jsonString + ")");`}
              </pre>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg">
              <p className="text-[10px] text-emerald-500 uppercase font-black mb-2">Compliant</p>
              <pre className="text-xs text-emerald-300 font-mono">
                {`const data = JSON.parse(jsonString);`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-mono font-bold text-white mb-2">
            <span className="text-green-400 mr-2">Python</span> hardcoded-credentials
          </h2>
          <p className="text-sm font-mono text-slate-400 mb-6">
            Almacenar contraseñas o tokens directamente en código fuente incrementa dramáticamente el riesgo de fugas de datos.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg">
              <p className="text-[10px] text-red-500 uppercase font-black mb-2">No Compliant</p>
              <pre className="text-xs text-red-300 font-mono">
                {`db_password = "SuperSecretPassword123"
connect(db_password)`}
              </pre>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg">
              <p className="text-[10px] text-emerald-500 uppercase font-black mb-2">Compliant</p>
              <pre className="text-xs text-emerald-300 font-mono">
                {`import os
db_password = os.getenv("DB_PASSWORD")
connect(db_password)`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
