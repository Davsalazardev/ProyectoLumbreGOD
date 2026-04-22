"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = exports.requestLogger = exports.errorHandler = exports.optionalAuthMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * Authentication middleware
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('[AUTH MIDDLEWARE] Token present:', !!token);
        if (!token) {
            return res.status(401).json({ error: 'No authorization token' });
        }
        const decoded = auth_service_1.authService.verifyToken(token);
        console.log('[AUTH MIDDLEWARE] Decoded:', decoded);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        console.log('[AUTH MIDDLEWARE] Error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Admin-only middleware
 */
const adminMiddleware = (req, res, next) => {
    const role = req.userRole;
    if (role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = auth_service_1.authService.verifyToken(token);
            req.userId = decoded.id;
            req.userEmail = decoded.email;
            req.userRole = decoded.role;
        }
    }
    catch (error) {
        // Ignore auth errors for optional middleware
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
/**
 * Error handler middleware
 */
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
};
exports.requestLogger = requestLogger;
/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map();
const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const ip = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, []);
        }
        const timestamps = requestCounts.get(ip);
        const recentRequests = timestamps.filter(t => t > windowStart);
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil((Math.min(...timestamps) + windowMs - now) / 1000)
            });
        }
        recentRequests.push(now);
        requestCounts.set(ip, recentRequests);
        next();
    };
};
exports.rateLimitMiddleware = rateLimitMiddleware;
//# sourceMappingURL=auth.middleware.js.map