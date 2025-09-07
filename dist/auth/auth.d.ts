import { Request, Response, NextFunction } from 'express';
import { User as DatabaseUser } from '../database/database.js';
declare global {
    namespace Express {
        interface Request {
            user?: DatabaseUser;
        }
    }
}
export interface AuthRequest extends Request {
    user?: DatabaseUser;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    country?: string;
    timezone?: string;
}
export interface SocialLoginRequest {
    provider: 'google' | 'microsoft';
    providerId: string;
    email: string;
    name: string;
    profilePicture?: string;
}
declare class AuthService {
    private jwtSecret;
    private jwtExpiresIn;
    constructor();
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
    generateToken(userId: number): string;
    verifyToken(token: string): {
        userId: number;
    } | null;
    register(userData: RegisterRequest): Promise<{
        user: DatabaseUser;
        token: string;
    }>;
    login(credentials: LoginRequest): Promise<{
        user: DatabaseUser;
        token: string;
    }>;
    socialLogin(socialData: SocialLoginRequest): Promise<{
        user: DatabaseUser;
        token: string;
    }>;
    authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    validateEmail(email: string): boolean;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.d.ts.map