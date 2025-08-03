import express, { Request, Response } from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Helper function to validate and convert ObjectId
const validateObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};

const toObjectId = (id: string): mongoose.Types.ObjectId => {
    return new mongoose.Types.ObjectId(id);
};

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Private
router.get('/search', auth, async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        // Search for users by username (case-insensitive)
        const users = await User.find({
            username: { $regex: q, $options: 'i' },
            _id: { $ne: toObjectId(req.user?.userId!) } // Exclude current user
        })
            .select('username displayName avatar isOnline lastSeen gameStats')
            .limit(20);

        res.json({
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                gameStats: user.gameStats
            }))
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   GET /api/users/:username
// @desc    Get user by username
// @access  Private
router.get('/:username', auth, async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .select('username displayName avatar isOnline lastSeen gameStats createdAt');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if current user is friends with this user
        const currentUser = await User.findById(req.user?.userId);
        const isFriend = currentUser?.friends.some(friendId =>
            friendId.toString() === user._id.toString()
        ) || false;

        res.json({
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                gameStats: user.gameStats,
                createdAt: user.createdAt,
                isFriend
            }
        });

    } catch (error) {
        console.error('Get user by username error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/users/:userId/friend
// @desc    Add user as friend
// @access  Private
router.post('/:userId/friend', auth, async (req: Request, res: Response) => {
    try {
        const { userId: friendId } = req.params;
        const currentUserId = req.user?.userId!;

        // Validate ObjectId format
        if (!validateObjectId(friendId)) {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        if (friendId === currentUserId) {
            return res.status(400).json({
                message: 'You cannot add yourself as a friend'
            });
        }

        // Check if friend exists
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if already friends
        const currentUser = await User.findById(currentUserId);
        const isAlreadyFriend = currentUser?.friends.some(id =>
            id.toString() === friendId
        ) || false;

        if (isAlreadyFriend) {
            return res.status(400).json({
                message: 'User is already your friend'
            });
        }

        // Convert string to ObjectId for database operations
        const friendObjectId = toObjectId(friendId);
        const currentUserObjectId = toObjectId(currentUserId);

        // Add friend to both users
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { friends: friendObjectId }
        });

        await User.findByIdAndUpdate(friendId, {
            $addToSet: { friends: currentUserObjectId }
        });

        res.json({
            message: 'Friend added successfully',
            friend: {
                id: friend._id,
                username: friend.username,
                displayName: friend.displayName,
                avatar: friend.avatar,
                isOnline: friend.isOnline
            }
        });

    } catch (error) {
        console.error('Add friend error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   DELETE /api/users/:userId/friend
// @desc    Remove user as friend
// @access  Private
router.delete('/:userId/friend', auth, async (req: Request, res: Response) => {
    try {
        const { userId: friendId } = req.params;
        const currentUserId = req.user?.userId!;

        // Validate ObjectId format
        if (!validateObjectId(friendId)) {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        // Convert string to ObjectId for database operations
        const friendObjectId = toObjectId(friendId);
        const currentUserObjectId = toObjectId(currentUserId);

        // Remove friend from both users
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { friends: friendObjectId }
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: currentUserObjectId }
        });

        res.json({
            message: 'Friend removed successfully'
        });

    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   GET /api/users/me/friends
// @desc    Get current user's friends
// @access  Private
router.get('/me/friends', auth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId)
            .populate('friends', 'username displayName avatar isOnline lastSeen gameStats')
            .select('friends');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            friends: user.friends.map((friend: any) => ({
                id: friend._id,
                username: friend.username,
                displayName: friend.displayName,
                avatar: friend.avatar,
                isOnline: friend.isOnline,
                lastSeen: friend.lastSeen,
                gameStats: friend.gameStats
            }))
        });

    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   GET /api/users/leaderboard
// @desc    Get game leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
            .select('username displayName avatar gameStats')
            .sort({ 'gameStats.gamesWon': -1 })
            .limit(50);

        res.json({
            leaderboard: users.map((user, index) => ({
                rank: index + 1,
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                gameStats: user.gameStats
            }))
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
