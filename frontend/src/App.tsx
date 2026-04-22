import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage';
import { RulesPage } from './pages/RulesPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

function App() {
  const handleProjectImported = (project: any) => {
    // Show success notification
    const message = `✅ ¡${project.name} importado exitosamente!`;
    console.log(message);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Navbar onProjectImported={handleProjectImported} />
        
        <main className="relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<Navigate to="/" replace />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
