# 🔐 GUÍA COMPLETA DE IMPLEMENTACIÓN - AUTENTICACIÓN JWT + FUNCIONALIDADES

## 1. PRÓXIMOS PASOS BACKEND (Orden de ejecución)

### A. Aplicar Migración Prisma (Schema actualizado)
```bash
cd backend
npm install @prisma/client bcryptjs jsonwebtoken
npx prisma migrate dev --name add_user_table
```

### B. Crear Auth Service (backend/src/services/auth.service.ts)
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export class AuthService {
  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { email, password: hashedPassword, name, role: 'ANALYST' }
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email, name: user.name, role: user.role } };
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}
```

### C. Crear Auth Controller (backend/src/controllers/auth.controller.ts)
```typescript
import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();
const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
```

### D. Crear Middleware de Autenticación (backend/src/middleware/auth.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const authService = new AuthService();
    req.user = authService.verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### E. Actualizar index.ts del Backend
```typescript
// En src/index.ts, agregar antes de Routes:
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// Proteger proyectos:
app.use('/api/projects', authMiddleware);
```

---

## 2. FRONTEND - AUTENTICACIÓN

### A. Crear Login Page (frontend/src/pages/LoginPage.tsx)
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/projects');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-mono font-bold text-white mb-6">CodeScan</h1>
        {error && <div className="bg-red-500/20 text-red-400 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          />
          <input
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          />
          <button type="submit" className="w-full bg-sonar-accent text-white py-2 rounded font-semibold">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-slate-400 text-sm">
          Don't have an account? <Link to="/signup" className="text-sonar-accent hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
```

### B. Actualizar App.tsx con ProtectedRoute
```typescript
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
};

// En Routes:
<Route path="/login" element={<LoginPage />} />
<Route path="/projects" element={<ProtectedRoute element={<ProjectsPage />} />} />
```

### C. Actualizar API Service (frontend/src/services/api.ts)
```typescript
export const api = {
  async login(email: string, password: string) {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async listProjects() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  // ... resto de calls con token
};
```

---

## 3. NOTIFICACIONES (Email)

### A. Instalar dependencias
```bash
npm install nodemailer dotenv
```

### B. Crear Notification Service (backend/src/services/notification.service.ts)
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export class NotificationService {
  async sendAnalysisAlert(email: string, projectName: string, issues: number) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🚨 CodeScan Alert: ${projectName}`,
      html: `
        <h2>New Issues Detected</h2>
        <p>Project: <strong>${projectName}</strong></p>
        <p>Total Issues: <strong>${issues}</strong></p>
        <a href="http://localhost:3000/projects">View Details</a>
      `
    });
  }
}
```

---

## 4. GIT INTEGRATION (Basic)

### A. Instalar dependencias
```bash
npm install nodegit octokit
```

### B. Crear Git Service (backend/src/services/git.service.ts) - Stub
```typescript
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export class GitService {
  async cloneRepository(owner: string, repo: string) {
    // Implementar clonación de repositorio
  }

  async getPRAnalysis(owner: string, repo: string, prNumber: number) {
    // Implementar análisis de PR
  }
}
```

---

## 5. ENVIRONMENT VARIABLES (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/codescan"
JWT_SECRET="super-secret-key-change-in-production"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="app-specific-password"
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

---

## 6. ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Migración Prisma** - Crear tabla User
2. **Auth Service** - JWT implementation
3. **Auth Controller** - Endpoints /login, /register
4. **Protected Routes** - Middleware en backend
5. **Frontend Login** - Form y ProtectedRoute
6. **Update API** - Agregar token a headers
7. **Notificaciones** - Email alerts
8. **Git Integration** - Clone + PR analysis

---

## 7. COMANDOS PARA EJECUTAR

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm start

# Docker
docker-compose build
docker-compose up -d
```

---

## 8. TESTING

```bash
# Registrarse
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Usar token
curl http://localhost:4000/api/projects \
  -H "Authorization: Bearer <token>"
```

---

## 9. PRÓXIMAS FASES DESPUÉS DE ESTO

- [ ] Code highlighting en issues
- [ ] Compliance reports (OWASP/CWE mapping)
- [ ] Métricas avanzadas
- [ ] IDE plugins
- [ ] Custom rules marketplace
- [ ] GraphQL API
