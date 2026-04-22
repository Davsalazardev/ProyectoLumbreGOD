import { Request, Response, NextFunction } from 'express';
/**
 * Authentication middleware
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Admin-only middleware
 */
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error handler middleware
 */
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Request logging middleware
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimitMiddleware: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map