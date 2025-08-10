import express, { Request, Response } from 'express';
import Joi from 'joi';
import Town, { ITown, BuildingPosition } from '../models/Town';
import Building, { IBuilding } from '../models/Building';
import User, { IUser, TrainingQueueItem, UserResources } from '../models/User';
import { auth } from '../middleware/auth';
import { getTroopConfig, getTrainingCost, getTrainingTime, TROOP_CONFIGS } from '../config/troops';

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

const speedupSchema = Joi.object({
    x: Joi.number().min(0).max(19).required(),
    y: Joi.number().min(0).max(15).required()
});

const trainTroopsSchema = Joi.object({
    x: Joi.number().min(0).max(19).required(),
    y: Joi.number().min(0).max(15).required(),
    troopType: Joi.string().valid('swordsmen', 'archers', 'ballistas', 'berserkers', 'horsemen', 'lancers', 'spies').required(),
    quantity: Joi.number().min(1).max(100).required()
});

const speedupTrainingSchema = Joi.object({
    trainingId: Joi.string().required()
});

// Helper to iterate Mongoose Map or plain object
function forEachResource(res: Map<string, number> | Record<string, number> | undefined, cb: (key: string, value: number) => void) {
    if (!res) return;
    if (res instanceof Map) {
        res.forEach((v: number, k: string) => cb(k, v));
    } else {
        Object.entries(res).forEach(([k, v]) => cb(k, v as number));
    }
}

// Helper function to calculate resource production
const calculateProduction = (
    buildings: BuildingPosition[],
    buildingConfigs: Map<string, IBuilding>,
    timeDiff: number
): Record<string, number> => {
    const production: Record<string, number> = {
        wood: 0,
        stone: 0,
        iron: 0,
        food: 0,
        gems: 0
    };

    buildings.forEach(building => {
        if (building.type === 'empty' || building.isUpgrading || building.isBuilding || (building.level ?? 0) <= 0) return;

        const config = buildingConfigs.get(building.type);
        if (!config?.production) return;

        const levelProduction = config.production.find((p) => p.level === building.level);
        if (!levelProduction) return;

        const cycles = Math.floor(timeDiff / (levelProduction.time * 1000));
        forEachResource(levelProduction.resources, (resource, amount) => {
            if (production[resource] !== undefined) {
                production[resource] += amount * cycles;
            }
        });
    });

    return production;
};

// Process completed training automatically
const processCompletedTraining = async (user: IUser): Promise<boolean> => {
    const now = new Date();
    let hasCompletions = false;

    // Find completed training
    const completedTraining = user.trainingQueue.filter(item => item.endTime <= now);

    if (completedTraining.length === 0) return false;

    // Process each completed training
    completedTraining.forEach(training => {
        const { troopType, level, quantity } = training;

        // Add troops to army
        const currentCount = (user.army[troopType as keyof typeof user.army] as unknown as Map<number, number>).get(level) || 0;
        (user.army[troopType as keyof typeof user.army] as unknown as Map<number, number>).set(level, currentCount + quantity);

        // Update stats
        user.gameStats.totalTroopsTrained += quantity;

        hasCompletions = true;
    });

    // Remove completed training from queue
    user.trainingQueue = user.trainingQueue.filter(item => item.endTime > now);

    if (hasCompletions) {
        await user.save();
    }

    return hasCompletions;
};

// Finalize finished timers and update layout levels
async function finalizeTimedOperations(town: ITown): Promise<boolean> {
    const now = new Date();
    let changed = false;

    const layout = town.layout ? JSON.parse(town.layout) : createInitialLayout(town.mapSize.width, town.mapSize.height, town.buildings);

    town.buildings.forEach(b => {
        // complete construction
        if (b.isBuilding && b.buildEndTime && b.buildEndTime <= now) {
            b.isBuilding = false;
            b.buildStartTime = undefined;
            b.buildEndTime = undefined;
            b.level = Math.max(1, b.level || 1);
            if (layout[b.y] && layout[b.y][b.x]) {
                layout[b.y][b.x] = { ...(layout[b.y][b.x] || {}), type: b.type, level: b.level, id: `${b.x}-${b.y}` };
            }
            changed = true;
        }

        // complete upgrade
        if (b.isUpgrading && b.upgradeEndTime && b.upgradeEndTime <= now) {
            b.isUpgrading = false;
            b.upgradeStartTime = undefined;
            b.upgradeEndTime = undefined;
            b.level = (b.level || 0) + 1;
            if (layout[b.y] && layout[b.y][b.x]) {
                layout[b.y][b.x] = { ...(layout[b.y][b.x] || {}), type: b.type, level: b.level, id: `${b.x}-${b.y}` };
            }
            changed = true;
        }
    });

    if (changed) {
        town.layout = JSON.stringify(layout);
        await town.save();
    }

    return changed;
}

// Helper function to create initial layout
function createInitialLayout(width: number, height: number, buildings: BuildingPosition[]): Record<string, any>[][] {
    const layout: Record<string, any>[][] = [];
    for (let y = 0; y < height; y++) {
        const row: Record<string, any>[] = [];
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

// @route   GET /api/town
// @desc    Get user's town (auto-completes any finished timers and training)
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        let town = await Town.findOne({ userId: req.user?.userId }) as ITown | null;
        let user = await User.findById(req.user?.userId) as IUser | null;

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

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Process completed training
        await processCompletedTraining(user);

        // Get building configurations
        const buildingConfigs = await Building.find({ isActive: true });
        const configMap = new Map(buildingConfigs.map(b => [b.type, b]));

        // Auto-complete any finished operations
        await finalizeTimedOperations(town);

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
            })),
            troopConfigs: Object.values(TROOP_CONFIGS),
            army: user.army,
            trainingQueue: user.trainingQueue
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
        const town = await Town.findOne({ userId: req.user?.userId }) as ITown | null;
        if (!town) return res.status(404).json({ message: 'Town not found' });

        const user = await User.findById(req.user?.userId) as IUser | null;
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Process completed training first
        await processCompletedTraining(user);

        // Get building configurations
        const buildingConfigs = await Building.find({ isActive: true });
        const configMap = new Map(buildingConfigs.map(b => [b.type, b]));

        // Auto-complete finished ops first
        await finalizeTimedOperations(town);

        // Calculate production
        const now = new Date();
        const timeDiff = now.getTime() - town.lastResourceCollection.getTime();
        const production = calculateProduction(town.buildings, configMap, timeDiff);

        // Add resources to user inventory
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        Object.entries(production).forEach(([resource, amount]) => {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            if (user.inventory.resources![resourceKey] !== undefined) {
                (user.inventory.resources![resourceKey] as number) += amount;
            }
        });

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

// @route   POST /api/town/train
// @desc    Start training troops
// @access  Private
router.post('/train', auth, async (req: Request, res: Response) => {
    try {
        const { error, value } = trainTroopsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { x, y, troopType, quantity } = value;
        const userId = req.user?.userId!;

        const [town, user] = await Promise.all([
            Town.findOne({ userId }) as Promise<ITown | null>,
            User.findById(userId) as Promise<IUser | null>
        ]);

        if (!town || !user) {
            return res.status(404).json({ message: 'Town or user not found' });
        }

        // Process completed training first
        await processCompletedTraining(user);

        // Check if building exists and is the correct type
        const building = town.buildings.find(b => b.x === x && b.y === y);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        const troopConfig = getTroopConfig(troopType);
        if (!troopConfig) {
            return res.status(400).json({ message: 'Invalid troop type' });
        }

        if (building.type !== troopConfig.buildingRequired) {
            return res.status(400).json({
                message: `${troopConfig.name} can only be trained in ${troopConfig.buildingRequired}`
            });
        }

        if (building.isBuilding || building.isUpgrading) {
            return res.status(400).json({ message: 'Building is currently unavailable' });
        }

        const buildingLevel = building.level || 1;
        const trainingLevel = buildingLevel; // Troops trained at building level

        // Get training cost and time
        const cost = getTrainingCost(troopType, trainingLevel);
        const timePerUnit = getTrainingTime(troopType, trainingLevel);

        if (!cost || !timePerUnit) {
            return res.status(400).json({ message: 'Training configuration not found' });
        }

        // Ensure resources object
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        // Calculate total cost
        const totalCost: Record<string, number> = {};
        Object.entries(cost).forEach(([resource, amount]) => {
            totalCost[resource] = (amount as number) * quantity;
        });

        const getResourceAmount = (user: IUser, resource: string): number => {
            if (resource === 'gold') {
                // Gold is stored in inventory.gold, not in resources
                return Number(user.inventory.gold) || 0;
            } else {
                // Other resources are in the resources object
                return Number(user.inventory.resources?.[resource as keyof UserResources]) || 0;
            }
        };

        // Check resources
        for (const [resource, totalAmount] of Object.entries(totalCost)) {
            const have = getResourceAmount(user, resource);
            if (have < totalAmount) {
                return res.status(400).json({
                    message: `Insufficient ${resource}. Need ${totalAmount}, have ${have}`
                });
            }
        }

        // Deduct resources
        for (const [resource, totalAmount] of Object.entries(totalCost)) {
            if (resource === 'gold') {
                // Deduct from the main gold field
                const currentGold = Number(user.inventory.gold) || 0;
                user.inventory.gold = currentGold - totalAmount;
            } else {
                // Deduct from resources object
                const resourceKey = resource as keyof typeof user.inventory.resources;
                const currentAmount = Number(user.inventory.resources?.[resourceKey]) || 0;
                (user.inventory.resources as any)[resourceKey] = currentAmount - totalAmount;
            }
        }

        // Calculate training time
        const totalTrainingTime = timePerUnit * quantity;
        const now = new Date();
        const endTime = new Date(now.getTime() + totalTrainingTime * 1000);

        // Add to training queue
        const trainingItem: TrainingQueueItem = {
            troopType,
            level: trainingLevel,
            quantity,
            startTime: now,
            endTime,
            buildingX: x,
            buildingY: y
        };

        user.trainingQueue.push(trainingItem);

        await user.save();

        res.json({
            message: `Training ${quantity} level ${trainingLevel} ${troopType} started`,
            training: trainingItem,
            newResources: user.inventory.resources,
            trainingQueue: user.trainingQueue
        });

    } catch (error) {
        console.error('Train troops error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/speedup-training
// @desc    Speed up troop training with gems
// @access  Private
router.post('/speedup-training', auth, async (req: Request, res: Response) => {
    try {
        const { error, value } = speedupTrainingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details[0].message
            });
        }

        const { trainingId } = value;
        const userId = req.user?.userId!;

        const user = await User.findById(userId) as IUser | null;
        if (!user) return res.status(404).json({ message: 'User not found' });

        const trainingIndex = user.trainingQueue.findIndex(item => item._id?.toString() === trainingId);
        if (trainingIndex === -1) {
            return res.status(404).json({ message: 'Training not found' });
        }

        const training = user.trainingQueue[trainingIndex];
        const now = new Date();
        const remainingMs = Math.max(0, training.endTime.getTime() - now.getTime());

        if (remainingMs === 0) {
            return res.status(400).json({ message: 'Training already completed' });
        }

        // Calculate gem cost (1 gem per minute remaining)
        const gemCost = Math.max(1, Math.ceil(remainingMs / 60000));
        const gems = user.inventory.resources?.gems || 0;

        if (gems < gemCost) {
            return res.status(400).json({
                message: `Insufficient gems. Need ${gemCost}, have ${gems}`
            });
        }

        // Deduct gems
        if (user.inventory.resources) {
            user.inventory.resources.gems -= gemCost;
        }

        // Complete training immediately
        const { troopType, level, quantity } = training;

        // Add troops to army
        const currentCount = (user.army[troopType as keyof typeof user.army] as unknown as Map<number, number>).get(level) || 0;
        (user.army[troopType as keyof typeof user.army] as unknown as Map<number, number>).set(level, currentCount + quantity);

        // Remove from training queue
        user.trainingQueue.splice(trainingIndex, 1);

        // Update stats
        user.gameStats.totalTroopsTrained += quantity;

        await user.save();

        res.json({
            message: `Training completed instantly for ${gemCost} gems`,
            army: user.army,
            newResources: user.inventory.resources,
            trainingQueue: user.trainingQueue
        });

    } catch (error) {
        console.error('Speedup training error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   DELETE /api/town/training/:trainingId
// @desc    Cancel troop training (refunds 50% of resources)
// @access  Private
router.delete('/training/:trainingId', auth, async (req: Request, res: Response) => {
    try {
        const { trainingId } = req.params;
        const userId = req.user?.userId!;

        const user = await User.findById(userId) as IUser | null;
        if (!user) return res.status(404).json({ message: 'User not found' });

        const trainingIndex = user.trainingQueue.findIndex(item => item._id?.toString() === trainingId);
        if (trainingIndex === -1) {
            return res.status(404).json({ message: 'Training not found' });
        }

        const training = user.trainingQueue[trainingIndex];
        const { troopType, level, quantity } = training;

        // Get original cost
        const cost = getTrainingCost(troopType, level);
        if (!cost) {
            return res.status(400).json({ message: 'Training cost not found' });
        }

        // Calculate refund (50% of original cost)
        const refund: Record<string, number> = {};
        Object.entries(cost).forEach(([resource, amount]) => {
            refund[resource] = Math.floor((amount as number) * quantity * 0.5);
        });

        // Refund resources
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        for (const [resource, amount] of Object.entries(refund)) {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            (user.inventory.resources as any)[resourceKey] += amount;
        }

        // Remove from training queue
        user.trainingQueue.splice(trainingIndex, 1);

        await user.save();

        res.json({
            message: 'Training cancelled and 50% resources refunded',
            refund,
            newResources: user.inventory.resources,
            trainingQueue: user.trainingQueue
        });

    } catch (error) {
        console.error('Cancel training error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/build
// @desc    Start constructing a new building (timed)
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
            Town.findOne({ userId }) as Promise<ITown | null>,
            User.findById(userId) as Promise<IUser | null>,
            Building.findOne({ type, isActive: true }) as Promise<IBuilding | null>
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
        const buildCost = buildingConfig.buildCost.find((c) => c.level === 1);
        if (!buildCost) {
            return res.status(400).json({ message: 'Building cost not configured' });
        }

        // Ensure resources object
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        // Check resources
        let hasEnough = true;
        let lacking: { resource?: string; need?: number; have?: number } = {};
        forEachResource(buildCost.resources, (resource, cost) => {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            const have = (user.inventory.resources![resourceKey] as number) || 0;
            if (have < cost && hasEnough) {
                hasEnough = false;
                lacking = { resource, need: cost, have };
            }
        });
        if (!hasEnough) {
            return res.status(400).json({
                message: `Insufficient ${lacking.resource}. Need ${lacking.need}, have ${lacking.have}`
            });
        }

        // Deduct resources
        forEachResource(buildCost.resources, (resource, cost) => {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            if (user.inventory.resources![resourceKey] !== undefined) {
                (user.inventory.resources![resourceKey] as number) -= cost;
            }
        });

        // Start build timer
        const now = new Date();
        const end = new Date(now.getTime() + (buildCost.time || 60) * 1000);

        let building: BuildingPosition;
        if (existingBuilding) {
            // Convert empty tile into construction
            existingBuilding.type = type;
            existingBuilding.level = 0; // under construction
            existingBuilding.isBuilding = true;
            existingBuilding.buildStartTime = now;
            existingBuilding.buildEndTime = end;
            building = existingBuilding;
        } else {
            building = {
                x, y, type,
                level: 0, // under construction
                isBuilding: true,
                buildStartTime: now,
                buildEndTime: end
            };
            town.buildings.push(building);
        }

        // Update layout with construction state
        const layout = town.layout ? JSON.parse(town.layout) :
            createInitialLayout(town.mapSize.width, town.mapSize.height, town.buildings);
        if (!layout[y]) layout[y] = [];
        layout[y][x] = { type, level: 0, id: `${x}-${y}`, isBuilding: true, buildEndTime: end };
        town.layout = JSON.stringify(layout);

        await Promise.all([user.save(), town.save()]);

        res.json({
            message: 'Construction started',
            building: {
                x, y, type,
                level: 0,
                isBuilding: true,
                buildStartTime: now,
                buildEndTime: end
            },
            newResources: user.inventory.resources
        });

    } catch (error) {
        console.error('Build building error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// @route   POST /api/town/upgrade
// @desc    Upgrade a building (timed)
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
            Town.findOne({ userId }) as Promise<ITown | null>,
            User.findById(userId) as Promise<IUser | null>
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
        if (building.isBuilding) {
            return res.status(400).json({ message: 'Cannot upgrade while construction is in progress' });
        }

        const buildingConfig = await Building.findOne({ type: building.type, isActive: true }) as IBuilding | null;
        if (!buildingConfig) {
            return res.status(404).json({ message: 'Building configuration not found' });
        }
        if (building.level >= buildingConfig.maxLevel) {
            return res.status(400).json({ message: 'Building is already at max level' });
        }

        // Get upgrade cost
        const upgradeCost = buildingConfig.buildCost.find((c) => c.level === building.level + 1);
        if (!upgradeCost) {
            return res.status(400).json({ message: 'Upgrade cost not configured' });
        }

        // Ensure resources object
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        // Check resources
        let hasEnough = true;
        let lacking: { resource?: string; need?: number; have?: number } = {};
        forEachResource(upgradeCost.resources, (resource, cost) => {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            const have = (user.inventory.resources![resourceKey] as number) || 0;
            if (have < cost && hasEnough) {
                hasEnough = false;
                lacking = { resource, need: cost, have };
            }
        });
        if (!hasEnough) {
            return res.status(400).json({
                message: `Insufficient ${lacking.resource}. Need ${lacking.need}, have ${lacking.have}`
            });
        }

        // Deduct resources
        forEachResource(upgradeCost.resources, (resource, cost) => {
            const resourceKey = resource as keyof typeof user.inventory.resources;
            if (user.inventory.resources![resourceKey] !== undefined) {
                (user.inventory.resources![resourceKey] as number) -= cost;
            }
        });

        // Start upgrade
        const now = new Date();
        building.isUpgrading = true;
        building.upgradeStartTime = now;
        building.upgradeEndTime = new Date(now.getTime() + upgradeCost.time * 1000);

        // Update layout flags
        const layout = town.layout ? JSON.parse(town.layout) : createInitialLayout(town.mapSize.width, town.mapSize.height, town.buildings);
        if (layout[y] && layout[y][x]) {
            layout[y][x] = { ...layout[y][x], isUpgrading: true, upgradeEndTime: building.upgradeEndTime };
            town.layout = JSON.stringify(layout);
        }

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

// @route   POST /api/town/speedup
// @desc    Spend gems to instantly finish a construction/upgrade
// @access  Private
router.post('/speedup', auth, async (req: Request, res: Response) => {
    try {
        const { error, value } = speedupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', details: error.details[0].message });
        }

        const { x, y } = value;
        const userId = req.user?.userId!;

        const [town, user] = await Promise.all([
            Town.findOne({ userId }) as Promise<ITown | null>,
            User.findById(userId) as Promise<IUser | null>
        ]);

        if (!town || !user) return res.status(404).json({ message: 'Town or user not found' });
        if (!user.inventory.resources) {
            user.inventory.resources = { food: 0, wood: 0, stone: 0, iron: 0, gems: 0 };
        }

        const b = town.buildings.find(bb => bb.x === x && bb.y === y);
        if (!b) return res.status(404).json({ message: 'Building not found' });

        const now = new Date();
        let endTime: Date | undefined;
        let type: 'build' | 'upgrade' | undefined;

        if (b.isBuilding && b.buildEndTime && b.buildEndTime > now) {
            endTime = b.buildEndTime;
            type = 'build';
        } else if (b.isUpgrading && b.upgradeEndTime && b.upgradeEndTime > now) {
            endTime = b.upgradeEndTime;
            type = 'upgrade';
        } else {
            return res.status(400).json({ message: 'No active timer to speed up' });
        }

        // Compute gem cost: 1 gem per minute left (rounded up)
        const msLeft = endTime.getTime() - now.getTime();
        const gemCost = Math.max(1, Math.ceil(msLeft / 60000));

        const gems = user.inventory.resources.gems || 0;
        if (gems < gemCost) {
            return res.status(400).json({ message: `Insufficient gems. Need ${gemCost}, have ${gems}` });
        }

        // Deduct gems
        user.inventory.resources.gems = gems - gemCost;

        // Complete immediately
        if (type === 'build') {
            b.isBuilding = false;
            b.buildStartTime = undefined;
            b.buildEndTime = undefined;
            b.level = Math.max(1, b.level || 1);
        } else {
            b.isUpgrading = false;
            b.upgradeStartTime = undefined;
            b.upgradeEndTime = undefined;
            b.level = (b.level || 0) + 1;
        }

        // Update layout
        const layout = town.layout ? JSON.parse(town.layout) : createInitialLayout(town.mapSize.width, town.mapSize.height, town.buildings);
        if (layout[y] && layout[y][x]) {
            layout[y][x] = { ...(layout[y][x] || {}), type: b.type, level: b.level, id: `${x}-${y}` };
            town.layout = JSON.stringify(layout);
        }

        await Promise.all([user.save(), town.save()]);

        res.json({
            message: 'Speedup applied',
            building: {
                x: b.x,
                y: b.y,
                type: b.type,
                level: b.level,
                isBuilding: b.isBuilding,
                isUpgrading: b.isUpgrading
            },
            newResources: user.inventory.resources
        });
    } catch (error) {
        console.error('Speedup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
