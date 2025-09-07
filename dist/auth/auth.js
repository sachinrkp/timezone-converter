import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from '../database/database.js';
class AuthService {
    jwtSecret;
    jwtExpiresIn = '7d';
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
    }
    // Password hashing
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    // JWT token management
    generateToken(userId) {
        return jwt.sign({ userId }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    }
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    // User registration
    async register(userData) {
        const { email, password, name, country, timezone } = userData;
        // Check if user already exists
        const existingUser = await database.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const passwordHash = await this.hashPassword(password);
        // Create user
        const userId = await database.createUser({
            email,
            password_hash: passwordHash,
            name,
            country: country || 'US',
            timezone: timezone || 'UTC',
            provider: 'local'
        });
        // Get created user
        const user = await database.getUserById(userId);
        if (!user) {
            throw new Error('Failed to create user');
        }
        // Generate token
        const token = this.generateToken(userId);
        // Update last login
        await database.updateUserLastLogin(userId);
        return { user, token };
    }
    // User login
    async login(credentials) {
        const { email, password } = credentials;
        // Get user by email
        const user = await database.getUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check if user has password (not social login only)
        if (!user.password_hash) {
            throw new Error('Please use social login for this account');
        }
        // Verify password
        const isValidPassword = await this.comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        // Generate token
        const token = this.generateToken(user.id);
        // Update last login
        await database.updateUserLastLogin(user.id);
        return { user, token };
    }
    // Social login
    async socialLogin(socialData) {
        const { provider, providerId, email, name, profilePicture } = socialData;
        // Check if user exists by provider
        let user = await database.getUserByProvider(provider, providerId);
        if (!user) {
            // Check if user exists by email
            user = await database.getUserByEmail(email);
            if (user) {
                // Update existing user with provider info
                await database.run('UPDATE users SET provider = ?, provider_id = ?, profile_picture = ? WHERE id = ?', [provider, providerId, profilePicture, user.id]);
                user.provider = provider;
                user.provider_id = providerId;
                user.profile_picture = profilePicture;
            }
            else {
                // Create new user
                const userId = await database.createUser({
                    email,
                    name,
                    profile_picture: profilePicture,
                    provider,
                    provider_id: providerId,
                    country: 'US',
                    timezone: 'UTC'
                });
                user = await database.getUserById(userId);
                if (!user) {
                    throw new Error('Failed to create user');
                }
            }
        }
        // Generate token
        const token = this.generateToken(user.id);
        // Update last login
        await database.updateUserLastLogin(user.id);
        return { user, token };
    }
    // Middleware to authenticate requests
    async authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
            if (!token) {
                res.status(401).json({ error: 'Access token required' });
                return;
            }
            const decoded = this.verifyToken(token);
            if (!decoded) {
                res.status(403).json({ error: 'Invalid or expired token' });
                return;
            }
            const user = await database.getUserById(decoded.userId);
            if (!user) {
                res.status(403).json({ error: 'User not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(403).json({ error: 'Authentication failed' });
        }
    }
    // Optional authentication middleware (doesn't fail if no token)
    async optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                const decoded = this.verifyToken(token);
                if (decoded) {
                    const user = await database.getUserById(decoded.userId);
                    if (user) {
                        req.user = user;
                    }
                }
            }
            next();
        }
        catch (error) {
            next(); // Continue without authentication
        }
    }
    // Password validation
    validatePassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database.getUserById(userId);
        if (!user || !user.password_hash) {
            throw new Error('User not found or no password set');
        }
        // Verify current password
        const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        // Validate new password
        const validation = this.validatePassword(newPassword);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }
        // Hash new password
        const newPasswordHash = await this.hashPassword(newPassword);
        // Update password
        await database.run('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);
    }
    // Reset password (for future implementation)
    async requestPasswordReset(email) {
        const user = await database.getUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not
            return;
        }
        // TODO: Implement password reset logic
        // 1. Generate reset token
        // 2. Store reset token in database with expiration
        // 3. Send email with reset link
        console.log(`Password reset requested for: ${email}`);
    }
}
export const authService = new AuthService();
export default authService;
//# sourceMappingURL=auth.js.map