import React from 'react';
import { Link } from 'react-router-dom';

export const RulesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link to="/projects" className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
        ← Volver
      </Link>
      <h1 className="text-2xl font-mono font-black text-gray-900 mt-4 mb-8">Catálogo de Reglas y Directrices</h1>
      
      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-mono font-bold text-gray-900 mb-2">
            <span className="text-blue-600 mr-2">TS/JS</span> no-eval
          </h2>
          <p className="text-sm font-mono text-gray-600 mb-6">
            El uso de <code className="bg-gray-100 px-1 rounded text-red-600">eval()</code> permite la ejecución de código arbitrario y abre la puerta a inyecciones.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-[10px] text-red-600 uppercase font-black mb-2">No Compliant</p>
              <pre className="text-xs text-red-700 font-mono">
                {`const data = eval("(" + jsonString + ")");`}
              </pre>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <p className="text-[10px] text-emerald-600 uppercase font-black mb-2">Compliant</p>
              <pre className="text-xs text-emerald-700 font-mono">
                {`const data = JSON.parse(jsonString);`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-mono font-bold text-gray-900 mb-2">
            <span className="text-green-600 mr-2">Python</span> hardcoded-credentials
          </h2>
          <p className="text-sm font-mono text-gray-600 mb-6">
            Almacenar contraseñas o tokens directamente en código fuente incrementa dramáticamente el riesgo de fugas de datos.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-[10px] text-red-600 uppercase font-black mb-2">No Compliant</p>
              <pre className="text-xs text-red-700 font-mono">
                {`db_password = "SuperSecretPassword123"
connect(db_password)`}
              </pre>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <p className="text-[10px] text-emerald-600 uppercase font-black mb-2">Compliant</p>
              <pre className="text-xs text-emerald-700 font-mono">
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
