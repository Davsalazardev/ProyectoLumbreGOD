import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

/**
 * Authentication middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('[AUTH MIDDLEWARE] Token present:', !!token);

    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const decoded = authService.verifyToken(token);
    console.log('[AUTH MIDDLEWARE] Decoded:', decoded);
    (req as any).userId = decoded.id;
    (req as any).userEmail = decoded.email;
    (req as any).userRole = decoded.role;

    next();
  } catch (error: any) {
    console.log('[AUTH MIDDLEWARE] Error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};


/**
 * Admin-only middleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).userRole;

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }

  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = authService.verifyToken(token);
      (req as any).userId = decoded.id;
      (req as any).userEmail = decoded.email;
      (req as any).userRole = decoded.role;
    }
  } catch (error) {
    // Ignore auth errors for optional middleware
  }

  next();
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};

/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map<string, number[]>();

export const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const timestamps = requestCounts.get(ip)!;
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
