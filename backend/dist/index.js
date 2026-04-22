"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const metrics_routes_1 = __importDefault(require("./routes/metrics.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const git_routes_1 = __importDefault(require("./routes/git.routes"));
const hierarchy_routes_1 = __importDefault(require("./routes/hierarchy.routes"));
const advanced_routes_1 = __importDefault(require("./routes/advanced.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use(auth_middleware_1.requestLogger);
app.use((0, auth_middleware_1.rateLimitMiddleware)(100, 60000)); // 100 requests per minute
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes - Core
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', projects_routes_1.default);
app.use('/api/hierarchy', hierarchy_routes_1.default);
app.use('/api/metrics', metrics_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/git', git_routes_1.default);
app.use('/api/reports', require('./routes/reports.routes').default);
// Routes - Advanced Features
app.use('/api', advanced_routes_1.default);
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
app.use(auth_middleware_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=index.js.map