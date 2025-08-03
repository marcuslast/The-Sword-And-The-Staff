import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            };
        }
    }
}

interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        if (!token) {
            res.status(401).json({
                message: 'Access denied. No token provided.'
            });
            return;
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || typeof jwtSecret !== 'string') {
            console.error('JWT_SECRET is not properly configured in environment variables');
            res.status(500).json({
                message: 'Server configuration error'
            });
            return;
        }

        // TypeScript now knows jwtSecret is a string
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Add user info to request
        req.user = {
            userId: decoded.userId
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: 'Token has expired. Please login again.'
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: 'Invalid token. Please login again.'
            });
            return;
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            message: 'Internal server error during authentication'
        });
    }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        if (token) {
            const jwtSecret = process.env.JWT_SECRET;
            if (jwtSecret) {
                try {
                    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

                    req.user = {
                        userId: decoded.userId
                    };
                } catch (jwtError) {
                    // If JWT verification fails, just continue without user info
                    console.log('Optional auth failed, continuing without user:', jwtError);
                }
            }
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        next();
    }
};
