import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import User from '../models/User';
import Orb from '../models/Orb';
import { IUser } from '../models/User';

const router = express.Router();

/**
 * @route   GET /api/realm/inventory
 * @desc    Get user's inventory data (orbs count, gold, resources)
 * @access  Private
 */
router.get('/inventory', auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId!;

        // Get user with inventory data
        const user = await User.findById(userId)
            .select('inventory gameStats')
            .lean() as IUser;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get unopened orbs count by rarity
        const orbs = await Orb.aggregate([
            {
                $match: {
                    userId: userId,
                    isOpened: false
                }
            },
            {
                $group: {
                    _id: "$rarity",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert aggregation result to inventory format
        const orbsCount = {
            common: 0,
            uncommon: 0,
            rare: 0,
            veryRare: 0,
            legendary: 0
        };

        orbs.forEach(orb => {
            const rarity = orb._id === 'very rare' ? 'veryRare' : orb._id;
            orbsCount[rarity as keyof typeof orbsCount] = orb.count;
        });

        // Prepare response
        const response = {
            gold: user.inventory.gold || 0,
            orbsCount,
            resources: user.inventory.resources || {
                food: 0,
                wood: 0,
                stone: 0,
                iron: 0,
                gems: 0
            },
            stats: {
                totalOrbsOpened: user.gameStats.totalOrbsOpened || 0,
                totalGoldCollected: user.gameStats.totalGoldCollected || 0
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route   GET /api/realm/recent-openings
 * @desc    Get user's recently opened orbs
 * @access  Private
 */
router.get('/recent-openings', auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId!;
        const limit = parseInt(req.query.limit as string) || 5;

        const recentOpenings = await Orb.find({
            userId,
            isOpened: true
        })
            .sort({ openedAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            openings: recentOpenings.map(orb => ({
                id: orb._id,
                rarity: orb.rarity,
                contents: orb.contents,
                openedAt: orb.openedAt
            }))
        });

    } catch (error) {
        console.error('Get recent openings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
