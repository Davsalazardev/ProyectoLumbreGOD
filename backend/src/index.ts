import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRoutes from './routes/projects.routes';
import authRoutes from './routes/auth.routes';
import metricsRoutes from './routes/metrics.routes';
import notificationRoutes from './routes/notification.routes';
import gitRoutes from './routes/git.routes';
import hierarchyRoutes from './routes/hierarchy.routes';
import advancedRoutes from './routes/advanced.routes';
import { requestLogger, rateLimitMiddleware, errorHandler } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(requestLogger);
app.use(rateLimitMiddleware(100, 60000)); // 100 requests per minute
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Core
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/reports', require('./routes/reports.routes').default);

// Routes - Advanced Features
app.use('/api', advancedRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    features: [
      '✅ Git Integration',
      '✅ Performance Analysis',
      '✅ Machine Learning (Bug Prediction)',
      '✅ Team Collaboration',
      '✅ CI/CD Integration',
      '✅ Advanced Search',
      '✅ Dependency Scanning',
      '✅ Code Review Assistant'
    ]
  });
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 CodesCam API running on http://localhost:${PORT}`);
  console.log(`📊 SwaggerUI: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Git Integration: /api/repositories/import`);
  console.log(`🤖 ML Analysis: /api/analysis/:projectId/ml/predict-bugs`);
  console.log(`👥 Collaboration: /api/projects/:projectId/code-reviews`);
  console.log(`🔍 Search: /api/search?q=query&projectId=id`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`📧 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`🔗 Git Integration: http://localhost:${PORT}/api/git\n`);
});

export default app;
