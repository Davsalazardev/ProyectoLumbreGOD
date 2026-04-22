export interface AuthPayload {
    id: string;
    email: string;
    role: string;
}
export declare class AuthService {
    /**
     * Register a new user
     */
    register(email: string, password: string, name: string, role?: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    /**
     * Login user
     */
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): AuthPayload;
    /**
     * Refresh token
     */
    refreshToken(token: string): string;
    /**
     * Generate JWT token
     */
    private generateToken;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: string;
    } | null>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, data: {
        name?: string;
        email?: string;
    }): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
    }>;
    /**
     * Change password
     */
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    /**
     * Delete user (only ADMIN or self)
     */
    deleteUser(requestingUserId: string, targetUserId: string, requestingUserRole: string): Promise<{
        success: boolean;
    }>;
    /**
     * List all users (ADMIN only)
     */
    listUsers(requestingUserRole: string, skip?: number, take?: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: string;
    }[]>;
    /**
     * Update user role (ADMIN only)
     */
    updateUserRole(requestingUserRole: string, userId: string, newRole: string): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map