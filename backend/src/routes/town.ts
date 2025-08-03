import express, { Request, Response } from 'express';
import Joi from 'joi';
import Town, { ITown, BuildingPosition } from '../models/Town';
import Building, { IBuilding } from '../models/Building';
import User, { IUser } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const buildBuildingSchema = Joi.object({
    x: Joi.number().min(0).max(19).required(),
    y: Joi.number().min(0).max(15).required(),
    type: Joi.string().required()
});

const upgradeBuildingSchema = Joi.object({
    x: Joi.number().min(0).max(19).required(),
    y: Joi.number().min(0).max(15).required()
});

// Helper function to calculate resource production
const calculateProduction = (buildings: BuildingPosition[], buildingConfigs: Map<string, IBuilding>, timeDiff: number): Record<string, number> => {
    const production: Record<string, number> = {
        wood: 0,
        stone: 0,
        iron: 0,
        food: 0,
        gems: 0
    };

    buildings.forEach(building => {
        if (building.type === 'empty' || building.isUpgrading) return;

        const config = buildingConfigs.get(building.type);
        if (!config?.production) return;

        const levelProduction = config.production.find(p => p.level === building.level);
        if (!levelProduction) return;

        // Calculate how many production cycles occurred
        const cycles = Math.floor(timeDiff / (levelProduction.time * 1000));

        Object.entries(levelProduction.resources as Record<string, number>).forEach(([resource, amount]) => {
            if (production[resource] !== undefined) {
                production[resource] += amount * cycles;
            }
        });
    });

    return production;
};

// @route   GET /api/town
// @desc    Get user's town
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        let town = await Town.findOne({ userId: req.user?.userId }) as ITown;

        if (!town) {
            // Create initial town for new user
            const initialBuildings: BuildingPosition[] = [
                { x: 4, y: 3, type: 'townhall', level: 1 },
                { x: 3, y: 3, type: 'house', level: 1 },
                { x: 5, y: 3, type: 'farm', level: 1 }
            ];

            town = new Town({
                userId: req.user?.userId,
                name: 'My Town',
                level: 1,
                buildings: initialBuildings,
                layout: JSON.stringify(createInitialLayout(10, 8, initialBuildings))
            });

            await town.save();
        }

        // Get building configurations
        const buildingConfigs = await Building.find({ isActive: true });
        const configMap = new Map(buildingConfigs.map(b => [b.type, b]));

        // Calculate resource production since last collection
        const now = new Date();
        const timeDiff = now.getTime() - town.lastResourceCollection.getTime();
        const production = calculateProduction(town.buildings, configMap, timeDiff);

        res.json({
            town: {
                id: town._id,
                name: town.name,
                level: town.level,
                mapSize: town.mapSize,
                buildings: town.buildings,
                layout: town.layout ? JSON.parse(town.layout) : null,
                pendingProduction: production,
                lastCollected: town.lastResourceCollection
            },
            buildingConfigs: buildingConfigs.map(b => ({
                type: b.type,
                name: b.name,
                description: b.description,
                category: b.category,
                maxLevel: b.maxLevel,
                buildCost: b.buildCost,
                production: b.production,
                unlockRequirements: b.unlockRequirements,
                imageUrl: b.imageUrl
            }))
        });

    } catch (error) {
        console.error('Get town error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/collect
// @desc    Collect pending resources
// @access  Private
router.post('/collect', auth, async (req: Request, res: Response) => {
    try {
        const town = await Town.findOne({ userId: req.user?.userId }) as ITown;
        if (!town) {
            return res.status(404).json({ message: 'Town not found' });
        }

        const user = await User.findById(req.user?.userId) as IUser;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get building configurations
        const buildingConfigs = await Building.find({ isActive: true });
        const configMap = new Map(buildingConfigs.map(b => [b.type, b]));

        // Calculate production
        const now = new Date();
        const timeDiff = now.getTime() - town.lastResourceCollection.getTime();
        const production = calculateProduction(town.buildings, configMap, timeDiff);

        // Add resources to user inventory
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        Object.entries(production).forEach(([resource, amount]) => {
            if (user.inventory.resources[resource as keyof typeof user.inventory.resources] !== undefined) {
                (user.inventory.resources[resource as keyof typeof user.inventory.resources] as number) += amount;
            }
        });

        // Update collection time
        town.lastResourceCollection = now;

        await Promise.all([user.save(), town.save()]);

        res.json({
            message: 'Resources collected successfully',
            collected: production,
            newResources: user.inventory.resources
        });

    } catch (error) {
        console.error('Collect resources error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/build
// @desc    Build a new building
// @access  Private
router.post('/build', auth, async (req: Request, res: Response) => {
    try {
        const { error, value } = buildBuildingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { x, y, type } = value;
        const userId = req.user?.userId!;

        const [town, user, buildingConfig] = await Promise.all([
            Town.findOne({ userId }) as Promise<ITown>,
            User.findById(userId) as Promise<IUser>,
            Building.findOne({ type, isActive: true }) as Promise<IBuilding>
        ]);

        if (!town || !user || !buildingConfig) {
            return res.status(404).json({ message: 'Town, user, or building type not found' });
        }

        // Check if position is valid and empty
        const existingBuilding = town.buildings.find(b => b.x === x && b.y === y);
        if (existingBuilding && existingBuilding.type !== 'empty') {
            return res.status(400).json({ message: 'Position already occupied' });
        }

        // Get build cost for level 1
        const buildCost = buildingConfig.buildCost.find(c => c.level === 1);
        if (!buildCost) {
            return res.status(400).json({ message: 'Building cost not configured' });
        }

        // Check resources
        const resources = buildCost.resources as Map<string, number>;
        for (const [resource, cost] of resources.entries()) {
            const userResource = user.inventory.resources[resource as keyof typeof user.inventory.resources] as number || 0;
            if (userResource < cost) {
                return res.status(400).json({
                    message: `Insufficient ${resource}. Need ${cost}, have ${userResource}`
                });
            }
        }

        // Deduct resources
        for (const [resource, cost] of resources.entries()) {
            if (user.inventory.resources[resource as keyof typeof user.inventory.resources] !== undefined) {
                (user.inventory.resources[resource as keyof typeof user.inventory.resources] as number) -= cost;
            }
        }

        // Add building
        if (existingBuilding) {
            existingBuilding.type = type;
            existingBuilding.level = 1;
        } else {
            town.buildings.push({ x, y, type, level: 1 });
        }

        // Update layout
        const layout = town.layout ? JSON.parse(town.layout) : createInitialLayout(town.mapSize.width, town.mapSize.height, town.buildings);
        layout[y][x] = { type, level: 1, id: `${x}-${y}` };
        town.layout = JSON.stringify(layout);

        await Promise.all([user.save(), town.save()]);

        res.json({
            message: 'Building constructed successfully',
            building: { x, y, type, level: 1 },
            newResources: user.inventory.resources
        });

    } catch (error) {
        console.error('Build building error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/upgrade
// @desc    Upgrade a building
// @access  Private
router.post('/upgrade', auth, async (req: Request, res: Response) => {
    try {
        const { error, value } = upgradeBuildingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { x, y } = value;
        const userId = req.user?.userId!;

        const [town, user] = await Promise.all([
            Town.findOne({ userId }) as Promise<ITown>,
            User.findById(userId) as Promise<IUser>
        ]);

        if (!town || !user) {
            return res.status(404).json({ message: 'Town or user not found' });
        }

        const building = town.buildings.find(b => b.x === x && b.y === y);
        if (!building || building.type === 'empty') {
            return res.status(404).json({ message: 'Building not found' });
        }

        if (building.isUpgrading) {
            return res.status(400).json({ message: 'Building is already upgrading' });
        }

        const buildingConfig = await Building.findOne({ type: building.type, isActive: true }) as IBuilding;
        if (!buildingConfig) {
            return res.status(404).json({ message: 'Building configuration not found' });
        }

        if (building.level >= buildingConfig.maxLevel) {
            return res.status(400).json({ message: 'Building is already at max level' });
        }

        // Get upgrade cost
        const upgradeCost = buildingConfig.buildCost.find(c => c.level === building.level + 1);
        if (!upgradeCost) {
            return res.status(400).json({ message: 'Upgrade cost not configured' });
        }

        // Check resources
        const resources = upgradeCost.resources as Map<string, number>;
        for (const [resource, cost] of resources.entries()) {
            const userResource = user.inventory.resources[resource as keyof typeof user.inventory.resources] as number || 0;
            if (userResource < cost) {
                return res.status(400).json({
                    message: `Insufficient ${resource}. Need ${cost}, have ${userResource}`
                });
            }
        }

        // Deduct resources
        for (const [resource, cost] of resources.entries()) {
            if (user.inventory.resources[resource as keyof typeof user.inventory.resources] !== undefined) {
                (user.inventory.resources[resource as keyof typeof user.inventory.resources] as number) -= cost;
            }
        }

        // Start upgrade
        const now = new Date();
        building.isUpgrading = true;
        building.upgradeStartTime = now;
        building.upgradeEndTime = new Date(now.getTime() + upgradeCost.time * 1000);

        await Promise.all([user.save(), town.save()]);

        res.json({
            message: 'Building upgrade started',
            building: {
                x: building.x,
                y: building.y,
                type: building.type,
                level: building.level,
                isUpgrading: building.isUpgrading,
                upgradeEndTime: building.upgradeEndTime
            },
            newResources: user.inventory.resources
        });

    } catch (error) {
        console.error('Upgrade building error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Helper function to create initial layout
function createInitialLayout(width: number, height: number, buildings: BuildingPosition[]): any[][] {
    const layout = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const building = buildings.find(b => b.x === x && b.y === y);
            if (building) {
                row.push({ type: building.type, level: building.level, id: `${x}-${y}` });
            } else {
                row.push({ type: 'empty', level: 0, id: `${x}-${y}` });
            }
        }
        layout.push(row);
    }
    return layout;
}

export default router;
