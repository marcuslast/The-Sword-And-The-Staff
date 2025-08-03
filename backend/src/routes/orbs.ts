import express, { Request, Response } from 'express';
import Joi from 'joi';
import User, { IUser } from '../models/User';
import Orb, { IOrb, OrbRarity } from '../models/Orb';
import { auth } from '../middleware/auth';

const router = express.Router();

// Define ResourceType if not exported from Orb model
export type ResourceType = 'food' | 'wood' | 'stone' | 'iron' | 'gems';

// Debug route
router.get('/debug', (req, res) => {
    res.json({
        message: 'Orbs routes are working!',
        timestamp: new Date(),
        headers: req.headers.authorization ? 'Has auth header' : 'No auth header'
    });
});

// Test route
router.get('/test', (req: Request, res: Response) => {
    console.log('🧪 Orbs test route hit!');
    res.json({
        message: 'Orbs routes working!',
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// Validation schemas
const gameCompleteSchema = Joi.object({
    goldCollected: Joi.number().min(0).required(),
    orbsToAward: Joi.number().min(1).max(10).default(2)
});

const openMultipleSchema = Joi.object({
    rarity: Joi.string().valid('common', 'uncommon', 'rare', 'very rare', 'legendary').required(),
    count: Joi.number().min(1).max(10).required()
});

// Orb rarity chances and rewards
const ORB_RARITY_CHANCES = {
    common: 50,      // 50%
    uncommon: 30,    // 30%
    rare: 15,        // 15%
    'very rare': 4,  // 4%
    legendary: 1     // 1%
};

const ORB_REWARDS = {
    common: { goldMin: 50, goldMax: 150, itemCount: 1 },
    uncommon: { goldMin: 100, goldMax: 300, itemCount: 2 },
    rare: { goldMin: 200, goldMax: 500, itemCount: 3 },
    'very rare': { goldMin: 400, goldMax: 800, itemCount: 4 },
    legendary: { goldMin: 800, goldMax: 1500, itemCount: 5 }
};

// Resource configuration
const RESOURCE_CHANCES = {
    common: 0.3,     // 30% chance for resources in common orbs
    uncommon: 0.5,   // 50% chance
    rare: 0.7,       // 70% chance
    'very rare': 0.9, // 90% chance
    legendary: 1     // 100% chance
};

const RESOURCE_TYPES: ResourceType[] = ['food', 'wood', 'stone', 'iron', 'gems'];

const RESOURCE_QUANTITIES = {
    common: { min: 10, max: 50 },
    uncommon: { min: 30, max: 100 },
    rare: { min: 80, max: 200 },
    'very rare': { min: 150, max: 400 },
    legendary: { min: 300, max: 800 }
};

// Helper function to safely update user resources
const updateUserResource = (user: IUser, resourceType: ResourceType, quantity: number): void => {
    if (!user.inventory.resources) {
        user.inventory.resources = {
            food: 0,
            wood: 0,
            stone: 0,
            iron: 0,
            gems: 0
        };
    }

    // Type-safe way to update the resource
    const current = user.inventory.resources[resourceType] || 0;
    user.inventory.resources[resourceType] = current + quantity;
};

const updateUserGold = (user: IUser, amount: number): void => {
    const currentGold = Number(user.inventory.gold) || 0;
    // Use Object.assign to safely update
    Object.assign(user.inventory, { gold: currentGold + amount });
};

const updateOrbCount = (user: IUser, rarity: OrbRarity, change: number): void => {
    const rarityKey = rarity === 'very rare' ? 'veryRare' : rarity;

    // Type-safe update using Object.assign
    const currentCounts = { ...user.inventory.orbsCount };
    const currentCount = Number(currentCounts[rarityKey as keyof typeof currentCounts]) || 0;

    Object.assign(user.inventory.orbsCount, {
        [rarityKey]: Math.max(0, currentCount + change)
    });
};

// Helper function to generate random orb rarity
const generateOrbRarity = (): OrbRarity => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(ORB_RARITY_CHANCES)) {
        cumulative += chance;
        if (random <= cumulative) {
            return rarity as OrbRarity;
        }
    }
    return 'common'; // fallback
};

// Helper function to generate orb contents
const generateOrbContents = (rarity: OrbRarity) => {
    const rewards = ORB_REWARDS[rarity];
    const gold = Math.floor(Math.random() * (rewards.goldMax - rewards.goldMin + 1)) + rewards.goldMin;

    const items: Array<{
        type: 'resource';
        resourceType: ResourceType;
        quantity: number;
        value?: number;
    }> = [];

    // Add resources based on rarity chance
    if (Math.random() <= RESOURCE_CHANCES[rarity]) {
        const resourceCount = rarity === 'legendary' ?
            Math.floor(Math.random() * 3) + 3 : // 3-5 resources for legendary
            Math.floor(Math.random() * 2) + 1; // 1-2 resources for others

        for (let i = 0; i < resourceCount; i++) {
            const resourceType = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
            const quantity = Math.floor(
                Math.random() *
                (RESOURCE_QUANTITIES[rarity].max - RESOURCE_QUANTITIES[rarity].min + 1)
            ) + RESOURCE_QUANTITIES[rarity].min;

            items.push({
                type: 'resource',
                resourceType,
                quantity,
                value: Math.floor(quantity * (0.5 + Math.random())) // Random value calculation
            });
        }
    }

    return { gold, items };
};

// @route   POST /api/orbs/complete-game
// @desc    Award orbs and gold for completing a game
// @access  Private
router.post('/complete-game', auth, async (req: Request, res: Response) => {
    try {
        console.log('🎮 Complete game route hit, user:', req.user?.userId);
        console.log('🎮 Request body:', req.body);

        const { error, value } = gameCompleteSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { goldCollected, orbsToAward } = value;
        const userId = req.user?.userId!;

        // Generate orbs
        const newOrbs: Array<{ rarity: OrbRarity }> = [];
        for (let i = 0; i < orbsToAward; i++) {
            const rarity = generateOrbRarity();
            newOrbs.push({ rarity });

            // Create orb in database
            await new Orb({
                userId,
                rarity,
                isOpened: false
            }).save();
        }

        // Update user stats and inventory
        const user = await User.findById(userId) as IUser;
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Add gold
        updateUserGold(user, goldCollected);

        // Add orbs to count
        newOrbs.forEach(orb => {
            updateOrbCount(user, orb.rarity, 1);
        });

        // Update game stats
        user.gameStats.gamesWon++;
        user.gameStats.totalGoldCollected += goldCollected;

        await user.save();

        console.log('✅ Game completed successfully for user:', userId);
        console.log('✅ Rewards:', { gold: goldCollected, orbs: newOrbs });

        res.json({
            message: 'Game completed successfully!',
            rewards: {
                gold: goldCollected,
                orbs: newOrbs
            },
            newTotals: {
                gold: user.inventory.gold,
                orbsCount: user.inventory.orbsCount
            }
        });

    } catch (error) {
        console.error('Complete game error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   GET /api/orbs
// @desc    Get user's orbs
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        console.log('🔮 Get orbs route hit, user:', req.user?.userId);
        console.log('🔮 Query params:', req.query);

        const { opened } = req.query;
        const filter: any = { userId: req.user?.userId };

        if (opened !== undefined) {
            filter.isOpened = opened === 'true';
        }

        console.log('🔮 Database filter:', filter);

        const orbs = await Orb.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        console.log('🔮 Found orbs:', orbs.length);

        const user = await User.findById(req.user?.userId).select('inventory');

        console.log('🔮 User inventory:', user?.inventory);

        const response = {
            orbs: orbs.map(orb => ({
                id: orb._id,
                rarity: orb.rarity,
                isOpened: orb.isOpened,
                openedAt: orb.openedAt,
                contents: orb.isOpened ? orb.contents : null,
                createdAt: orb.createdAt
            })),
            summary: user?.inventory || null
        };

        console.log('✅ Sending orbs response:', response);

        res.json(response);

    } catch (error) {
        console.error('Get orbs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/orbs/:orbId/open
// @desc    Open an orb
// @access  Private
router.post('/:orbId/open', auth, async (req: Request, res: Response) => {
    try {
        console.log('💎 Open orb route hit, orbId:', req.params.orbId, 'user:', req.user?.userId);

        const { orbId } = req.params;
        const userId = req.user?.userId!;

        // Find the orb
        const orb = await Orb.findOne({
            _id: orbId,
            userId,
            isOpened: false
        }) as IOrb;

        if (!orb) {
            console.log('❌ Orb not found or already opened:', orbId);
            return res.status(404).json({
                message: 'Orb not found or already opened'
            });
        }

        // Generate contents
        const contents = generateOrbContents(orb.rarity);
        console.log('💎 Generated contents for', orb.rarity, 'orb:', contents);

        // Update orb
        orb.isOpened = true;
        orb.openedAt = new Date();
        orb.contents = contents;
        await orb.save();

        // Update user
        const user = await User.findById(userId) as IUser;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        updateUserGold(user, contents.gold);

        // Add resources to inventory
        if (contents.items) {
            contents.items.forEach(item => {
                if (item.type === 'resource' && item.resourceType) {
                    updateUserResource(user, item.resourceType, item.quantity);
                }
            });
        }

        user.gameStats.totalOrbsOpened++;

        // Decrease orb count
        updateOrbCount(user, orb.rarity, -1);

        await user.save();

        console.log('✅ Orb opened successfully:', orbId);

        res.json({
            message: 'Orb opened successfully!',
            orb: {
                id: orb._id,
                rarity: orb.rarity,
                contents: orb.contents,
                openedAt: orb.openedAt
            },
            newTotals: {
                gold: user.inventory.gold,
                orbsCount: user.inventory.orbsCount,
                resources: user.inventory.resources || {
                    food: 0,
                    wood: 0,
                    stone: 0,
                    iron: 0,
                    gold: 0,
                    gems: 0
                }
            }
        });

    } catch (error) {
        console.error('Open orb error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/orbs/open-multiple
// @desc    Open multiple orbs at once
// @access  Private
router.post('/open-multiple', auth, async (req: Request, res: Response) => {
    try {
        console.log('💎💎 Open multiple orbs route hit, user:', req.user?.userId);
        console.log('💎💎 Request body:', req.body);

        const { error, value } = openMultipleSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { rarity, count } = value;
        const userId = req.user?.userId!;

        // Find unopened orbs of this rarity
        const orbs = await Orb.find({
            userId,
            rarity,
            isOpened: false
        }).limit(count);

        console.log('💎💎 Found', orbs.length, rarity, 'orbs for user');

        if (orbs.length < count) {
            console.log('❌ Not enough orbs:', orbs.length, 'available,', count, 'requested');
            return res.status(400).json({
                message: `Not enough ${rarity} orbs. You have ${orbs.length}, requested ${count}`
            });
        }

        const results = [];
        let totalGold = 0;
        const totalResources: Record<ResourceType, number> = {
            food: 0,
            wood: 0,
            stone: 0,
            iron: 0,
            gems: 0
        };

        // Open each orb
        for (const orb of orbs) {
            const contents = generateOrbContents(orb.rarity);
            orb.isOpened = true;
            orb.openedAt = new Date();
            orb.contents = contents;
            await orb.save();

            totalGold += contents.gold;

            // Track resources
            if (contents.items) {
                contents.items.forEach(item => {
                    if (item.type === 'resource' && item.resourceType) {
                        totalResources[item.resourceType] += item.quantity;
                    }
                });
            }

            results.push({
                id: orb._id,
                rarity: orb.rarity,
                contents: contents
            });
        }

        // Update user
        const user = await User.findById(userId) as IUser;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        updateUserGold(user, totalGold);
        user.gameStats.totalOrbsOpened += count;

        // Add resources to inventory
        for (const [resourceType, quantity] of Object.entries(totalResources) as [ResourceType, number][]) {
            if (quantity > 0) {
                updateUserResource(user, resourceType, quantity);
            }
        }

        // Decrease orb count
        updateOrbCount(user, rarity, -count);

        await user.save();

        console.log('✅ Multiple orbs opened successfully:', count, rarity, 'orbs, total gold:', totalGold);

        res.json({
            message: `${count} ${rarity} orbs opened successfully!`,
            results,
            totalGold,
            totalResources,
            newTotals: {
                gold: user.inventory.gold,
                orbsCount: user.inventory.orbsCount,
                resources: user.inventory.resources || {
                    food: 0,
                    wood: 0,
                    stone: 0,
                    iron: 0,
                    gold: 0,
                    gems: 0
                }
            }
        });

    } catch (error) {
        console.error('Open multiple orbs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
