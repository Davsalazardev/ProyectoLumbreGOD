import { Request, Response } from 'express';
/**
 * Auth Controller - Handles authentication and user management
 */
export declare class AuthController {
    /**
     * POST /auth/register
     */
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /auth/login
     */
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /auth/refresh
     */
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /auth/me
     */
    getCurrentUser(req: Request, res: Response): Promise<void>;
    /**
     * PUT /auth/profile
     */
    updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * POST /auth/change-password
     */
    changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /auth/users (ADMIN only)
     */
    listUsers(req: Request, res: Response): Promise<void>;
    /**
     * PUT /auth/users/:userId/role (ADMIN only)
     */
    updateUserRole(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /auth/users/:userId
     */
    deleteUser(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map