// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/games';
import orbRoutes from './routes/orbs';
import townRoutes from './routes/town';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// More lenient rate limiting for game operations
const gameApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 60, // 60 requests per minute for game operations
    message: 'Too many game requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting only for sensitive operations
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Very lenient rate limiting for general API usage
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', gameApiLimiter, userRoutes);
app.use('/api/games', gameApiLimiter, gameRoutes);
app.use('/api/orbs', gameApiLimiter, orbRoutes);
app.use('/api/town', gameApiLimiter, townRoutes);

// Health check (no rate limiting)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
