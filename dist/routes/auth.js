import { Router } from 'express';
import { authService } from '../auth/auth.js';
import { database } from '../database/database.js';
const router = Router();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, country, timezone } = req.body;
        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, password, and name are required'
            });
        }
        // Validate email format
        if (!authService.validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        // Validate password
        const passwordValidation = authService.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Password validation failed',
                details: passwordValidation.errors
            });
        }
        // Register user
        const result = await authService.register({
            email,
            password,
            name,
            country,
            timezone
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                country: result.user.country,
                timezone: result.user.timezone,
                profile_picture: result.user.profile_picture,
                provider: result.user.provider,
                created_at: result.user.created_at
            },
            token: result.token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Registration failed'
        });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }
        // Login user
        const result = await authService.login({ email, password });
        res.json({
            message: 'Login successful',
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                country: result.user.country,
                timezone: result.user.timezone,
                profile_picture: result.user.profile_picture,
                provider: result.user.provider,
                last_login: result.user.last_login
            },
            token: result.token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            error: error instanceof Error ? error.message : 'Login failed'
        });
    }
});
// Social login (Google/Microsoft)
router.post('/social-login', async (req, res) => {
    try {
        const { provider, providerId, email, name, profilePicture } = req.body;
        // Validate input
        if (!provider || !providerId || !email || !name) {
            return res.status(400).json({
                error: 'Provider, providerId, email, and name are required'
            });
        }
        if (!['google', 'microsoft'].includes(provider)) {
            return res.status(400).json({
                error: 'Invalid provider. Supported providers: google, microsoft'
            });
        }
        // Validate email format
        if (!authService.validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        // Social login
        const result = await authService.socialLogin({
            provider,
            providerId,
            email,
            name,
            profilePicture
        });
        res.json({
            message: 'Social login successful',
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                country: result.user.country,
                timezone: result.user.timezone,
                profile_picture: result.user.profile_picture,
                provider: result.user.provider,
                last_login: result.user.last_login
            },
            token: result.token
        });
    }
    catch (error) {
        console.error('Social login error:', error);
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Social login failed'
        });
    }
});
// Get current user profile
router.get('/profile', authService.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                country: user.country,
                timezone: user.timezone,
                profile_picture: user.profile_picture,
                provider: user.provider,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile'
        });
    }
});
// Update user profile
router.put('/profile', authService.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, country, timezone } = req.body;
        // Validate input
        if (!name) {
            return res.status(400).json({
                error: 'Name is required'
            });
        }
        // Update user
        await database.run('UPDATE users SET name = ?, country = ?, timezone = ? WHERE id = ?', [name, country || 'US', timezone || 'UTC', userId]);
        // Get updated user
        const updatedUser = await database.getUserById(userId);
        if (!updatedUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                country: updatedUser.country,
                timezone: updatedUser.timezone,
                profile_picture: updatedUser.profile_picture,
                provider: updatedUser.provider,
                updated_at: updatedUser.updated_at
            }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Failed to update profile'
        });
    }
});
// Change password
router.put('/change-password', authService.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }
        // Validate new password
        const passwordValidation = authService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Password validation failed',
                details: passwordValidation.errors
            });
        }
        // Change password
        await authService.changePassword(userId, currentPassword, newPassword);
        res.json({
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to change password'
        });
    }
});
// Logout (client-side token removal)
router.post('/logout', authService.authenticateToken, async (req, res) => {
    try {
        // In a JWT-based system, logout is typically handled client-side
        // by removing the token. However, we can log the logout event.
        console.log(`User ${req.user.id} logged out`);
        res.json({
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed'
        });
    }
});
// Delete account
router.delete('/account', authService.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        // For security, require password confirmation for account deletion
        if (req.user.provider === 'local' && !password) {
            return res.status(400).json({
                error: 'Password confirmation required for account deletion'
            });
        }
        // Verify password if local account
        if (req.user.provider === 'local' && password) {
            const isValidPassword = await authService.comparePassword(password, req.user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid password'
                });
            }
        }
        // Soft delete user (set is_active to false)
        await database.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
        res.json({
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete account'
        });
    }
});
// Firebase sync endpoint
router.post('/firebase-sync', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL, providerId, idToken } = req.body;
        // Validate required fields
        if (!uid || !email) {
            return res.status(400).json({
                error: 'UID and email are required'
            });
        }
        // Check if user exists by Firebase UID
        let user = await database.getUserByProvider('firebase', uid);
        if (!user) {
            // Check if user exists by email
            user = await database.getUserByEmail(email);
            if (user) {
                // Update existing user with Firebase info
                await database.run('UPDATE users SET provider = ?, provider_id = ?, profile_picture = ? WHERE id = ?', ['firebase', uid, photoURL, user.id]);
                user.provider = 'firebase';
                user.provider_id = uid;
                user.profile_picture = photoURL;
            }
            else {
                // Create new user
                const userId = await database.createUser({
                    email,
                    name: displayName || email.split('@')[0],
                    profile_picture: photoURL,
                    provider: 'firebase',
                    provider_id: uid,
                    country: 'US',
                    timezone: 'UTC'
                });
                user = await database.getUserById(userId);
                if (!user) {
                    throw new Error('Failed to create user');
                }
            }
        }
        // Generate JWT token
        const token = authService.generateToken(user.id);
        // Update last login
        await database.updateUserLastLogin(user.id);
        res.json({
            message: 'Firebase sync successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                country: user.country,
                timezone: user.timezone,
                profile_picture: user.profile_picture,
                provider: user.provider,
                last_login: user.last_login
            },
            token: token
        });
    }
    catch (error) {
        console.error('Firebase sync error:', error);
        res.status(500).json({
            error: 'Failed to sync with Firebase'
        });
    }
});
// Verify token endpoint
router.get('/verify', authService.authenticateToken, async (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
        }
    });
});
export default router;
//# sourceMappingURL=auth.js.map