import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';
import User, { IUser } from '../models/User';
import { auth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Debug route to test if auth routes work without authentication
router.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Auth routes working without authentication!' });
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth routes
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation schemas
const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Username can only contain letters, numbers, underscore, and dash'
        }),
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .min(6)
        .max(128)
        .required(),
    displayName: Joi.string()
        .min(1)
        .max(50)
        .required()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret || typeof secret !== 'string') {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        { userId },
        secret,
        { expiresIn: '7d' } // Use a fixed, valid expiry
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (NO AUTH REQUIRED)
router.post('/register', authLimiter, async (req: Request, res: Response) => {
    console.log('📝 Register endpoint hit:', req.body); // Debug log
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { username, email, password, displayName } = value;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        }) as IUser | null;

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    message: 'User with this email already exists'
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    message: 'Username is already taken'
                });
            }
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            displayName
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                gameStats: user.gameStats,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, async (req: Request, res: Response) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { username, password } = value;

        // Find user and include password for comparison
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        }).select('+password') as IUser | null;

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id.toString());

        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                gameStats: user.gameStats,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId) as IUser | null;
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId) as IUser | null;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update last seen
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        res.json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                gameStats: user.gameStats,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                friends: user.friends
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req: Request, res: Response) => {
    try {
        const updateSchema = Joi.object({
            displayName: Joi.string().min(1).max(50),
            avatar: Joi.string().uri().allow(null, '')
        });

        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user?.userId,
            { $set: value },  // Explicitly use $set operator
            { new: true, runValidators: true }
        ).lean() as Omit<IUser, 'password'> | null;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                gameStats: user.gameStats
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
