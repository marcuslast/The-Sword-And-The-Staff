import express, { Request, Response } from 'express';
import Joi from 'joi';
import WorldMap, { IWorldMap } from '../models/WorldMap';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const updateTileSchema = Joi.object({
    q: Joi.number().required(),
    r: Joi.number().required(),
    terrain: Joi.string().valid('grass', 'grass_rocks', 'forest', 'dense_forest', 'rocks', 'mountains', 'snowy_mountains', 'water', 'castle', 'pond').required()
});

const attackTileSchema = Joi.object({
    q: Joi.number().required(),
    r: Joi.number().required(),
    units: Joi.object().pattern(
        Joi.string(),
        Joi.number().min(1)
    ).required()
});

// Get world map
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        let worldMap: any = await WorldMap.findOne();

        // If no map exists, generate a new one
        if (!worldMap) {
            worldMap = await generateNewMap(30);
        }

        // Get viewport if specified
        const { minQ, maxQ, minR, maxR } = req.query;

        if (minQ && maxQ && minR && maxR) {
            // Return only tiles in viewport for performance
            const filteredTiles = worldMap.tiles.filter((tile: { q: number; r: number; }) =>
                tile.q >= Number(minQ) && tile.q <= Number(maxQ) &&
                tile.r >= Number(minR) && tile.r <= Number(maxR)
            );

            return res.json({
                tiles: filteredTiles,
                mapSize: worldMap.mapSize,
                version: worldMap.version
            });
        }

        res.json(worldMap);
    } catch (error) {
        console.error('Error fetching world map:', error);
        res.status(500).json({ message: 'Failed to fetch world map' });
    }
});

// Get tiles around a position
router.get('/tiles/:q/:r/:radius', auth, async (req: Request, res: Response) => {
    try {
        const { q, r, radius } = req.params;
        const centerQ = Number(q);
        const centerR = Number(r);
        const searchRadius = Math.min(Number(radius), 10); // Max radius of 10

        const worldMap = await WorldMap.findOne();
        if (!worldMap) {
            return res.status(404).json({ message: 'World map not found' });
        }

        // Find tiles within radius using axial distance
        const tiles = worldMap.tiles.filter(tile => {
            const distance = (Math.abs(tile.q - centerQ) + Math.abs(tile.q + tile.r - centerQ - centerR) + Math.abs(tile.r - centerR)) / 2;
            return distance <= searchRadius;
        });

        res.json({ tiles });
    } catch (error) {
        console.error('Error fetching tiles:', error);
        res.status(500).json({ message: 'Failed to fetch tiles' });
    }
});

// Update tile (admin only)
router.put('/tile', auth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const user = await User.findById((req as any).user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { error } = updateTileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { q, r, terrain } = req.body;

        const worldMap = await WorldMap.findOne();
        if (!worldMap) {
            return res.status(404).json({ message: 'World map not found' });
        }

        const tileIndex = worldMap.tiles.findIndex(t => t.q === q && t.r === r);
        if (tileIndex === -1) {
            return res.status(404).json({ message: 'Tile not found' });
        }

        worldMap.tiles[tileIndex].terrain = terrain;
        worldMap.lastUpdated = new Date();
        worldMap.version += 1;

        await worldMap.save();

        res.json({
            message: 'Tile updated successfully',
            tile: worldMap.tiles[tileIndex]
        });
    } catch (error) {
        console.error('Error updating tile:', error);
        res.status(500).json({ message: 'Failed to update tile' });
    }
});

// Save entire map (admin only)
router.post('/save', auth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const user = await User.findById((req as any).user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { tiles, mapSize } = req.body;

        let worldMap = await WorldMap.findOne();
        if (!worldMap) {
            worldMap = new WorldMap({
                tiles,
                mapSize,
                version: 1
            });
        } else {
            worldMap.tiles = tiles;
            worldMap.mapSize = mapSize;
            worldMap.version += 1;
            worldMap.lastUpdated = new Date();
        }

        await worldMap.save();

        res.json({
            message: 'World map saved successfully',
            version: worldMap.version
        });
    } catch (error) {
        console.error('Error saving world map:', error);
        res.status(500).json({ message: 'Failed to save world map' });
    }
});

// Generate new map (admin only)
router.post('/generate', auth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const user = await User.findById((req as any).user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { mapSize = 30 } = req.body;
        const worldMap = await generateNewMap(mapSize);

        res.json({
            message: 'New world map generated',
            worldMap
        });
    } catch (error) {
        console.error('Error generating world map:', error);
        res.status(500).json({ message: 'Failed to generate world map' });
    }
});

// Helper function to generate a new map
async function generateNewMap(radius: number): Promise<IWorldMap> {
    const tiles = [];

    for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
            const distance = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;

            // Procedural terrain generation
            let terrain = 'grass';
            const noise = Math.random();

            if (distance > radius * 0.8) {
                terrain = 'water';
            } else if (distance > radius * 0.6 && noise > 0.3) {
                terrain = noise > 0.7 ? 'mountains' : 'rocks';
            } else if (noise > 0.8) {
                terrain = 'dense_forest';
            } else if (noise > 0.6) {
                terrain = 'forest';
            } else if (noise > 0.4) {
                terrain = 'grass_rocks';
            }

            // Add some water features
            if (Math.random() < 0.02 && terrain === 'grass') {
                terrain = 'pond';
            }

            tiles.push({
                q,
                r,
                terrain,
                owner: undefined,
                resources: [],
                buildings: []
            });
        }
    }

    // Delete existing map and create new one
    await WorldMap.deleteMany({});
    const worldMap = new WorldMap({
        tiles,
        mapSize: radius,
        version: 1
    });

    await worldMap.save();
    return worldMap;
}

export default router;
