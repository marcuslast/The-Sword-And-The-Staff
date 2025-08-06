// backend/src/scripts/seedBuildings.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Building from '../models/Building';
import Orb from '../models/Orb';
import Town from '../models/Town';
import User from '../models/User';

dotenv.config();

// Helper functions for game balance
const calculateCost = (base: number, level: number, multiplier = 1.4) => {
    return Math.floor(base * Math.pow(multiplier, level - 1));
};

const calculateProduction = (base: number, level: number, multiplier = 1.2) => {
    return Math.floor(base * Math.pow(multiplier, level - 1));
};

const buildingConfigs = [
    // Town Hall - Special building
    {
        type: 'townhall',
        name: 'Town Hall',
        description: 'Central building that determines town level and unlocks features',
        category: 'special',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(500, i + 1),
                stone: calculateCost(400, i + 1),
                iron: calculateCost(200, i + 1),
                gold: i >= 10 ? calculateCost(50, i - 9) : 0
            },
            time: calculateCost(600, i + 1, 1.3)
        })),
        unlockRequirements: {
            buildings: [
                { type: 'townhall', level: 5 }
            ]
        },
        imageUrl: '/assets/buildings/townhall.png',
        isActive: true
    },
    // Resource Buildings
    {
        type: 'farm',
        name: 'Farm',
        description: 'Produces food to feed your population',
        category: 'resource',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(80, i + 1),
                stone: calculateCost(60, i + 1)
            },
            time: calculateCost(120, i + 1)
        })),
        production: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: { food: calculateProduction(15, i + 1) },
            time: 3600 // 1 hour
        })),
        unlockRequirements: {
            townLevel: 1
        },
        imageUrl: '/assets/buildings/farm.png',
        isActive: true
    },
    {
        type: 'lumbermill',
        name: 'Lumber Mill',
        description: 'Produces wood for construction',
        category: 'resource',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                stone: calculateCost(100, i + 1)
            },
            time: calculateCost(150, i + 1)
        })),
        production: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: { wood: calculateProduction(12, i + 1) },
            time: 3600
        })),
        unlockRequirements: {
            townLevel: 2,
            buildings: [
                { type: 'townhall', level: 2 }
            ]
        },
        imageUrl: '/assets/buildings/lumbermill.png',
        isActive: true
    },
    // Military Buildings
    {
        type: 'barracks',
        name: 'Barracks',
        description: 'Trains military units for defense and attacks',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(200, i + 1),
                stone: calculateCost(180, i + 1),
                iron: calculateCost(60, i + 1)
            },
            time: calculateCost(300, i + 1)
        })),
        unlockRequirements: {
            townLevel: 5,
            buildings: [
                { type: 'townhall', level: 5 }
            ]
        },
        imageUrl: '/assets/buildings/barracks.png',
        isActive: true
    },
    // Residential Buildings
    {
        type: 'house',
        name: 'House',
        description: 'Provides housing for your population',
        category: 'residential',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(100, i + 1),
                stone: calculateCost(80, i + 1)
            },
            time: calculateCost(180, i + 1)
        })),
        unlockRequirements: {
            townLevel: 1
        },
        imageUrl: '/assets/buildings/house.png',
        isActive: true
    }
];

// Sample orbs for testing
const sampleOrbs = [
    {
        userId: new mongoose.Types.ObjectId(),
        rarity: 'common',
        isOpened: false,
        contents: {
            gold: 50,
            items: [
                { type: 'resource', resourceType: 'wood', quantity: 20, value: 10 }
            ]
        }
    },
    {
        userId: new mongoose.Types.ObjectId(),
        rarity: 'uncommon',
        isOpened: false,
        contents: {
            gold: 100,
            items: [
                { type: 'resource', resourceType: 'stone', quantity: 15, value: 30 }
            ]
        }
    }
];

// Sample town layout
const sampleTown = {
    userId: new mongoose.Types.ObjectId(),
    name: 'Starter Town',
    level: 1,
    mapSize: { width: 10, height: 10 },
    buildings: [
        { x: 5, y: 5, type: 'townhall', level: 1 },
        { x: 3, y: 4, type: 'farm', level: 1 },
        { x: 7, y: 4, type: 'house', level: 1 }
    ],
    layout: JSON.stringify(Array(10).fill(Array(10).fill('grass')))
};

// Sample test user
const testUser = {
    username: 'testplayer',
    email: 'test@example.com',
    password: 'test1234',
    displayName: 'Test Player',
    inventory: {
        gold: 500,
        orbsCount: {
            common: 3,
            uncommon: 1,
            rare: 0,
            veryRare: 0,
            legendary: 0
        },
        resources: {
            food: 100,
            wood: 200,
            stone: 150,
            iron: 50,
            gems: 0
        }
    }
};

async function seedDatabase() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-game-db';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            Building.deleteMany({}),
            Orb.deleteMany({}),
            Town.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('🗑️ Cleared existing data');

        // Seed Buildings
        const buildings = await Building.insertMany(buildingConfigs);
        console.log(`🏗️  Seeded ${buildings.length} building configurations`);

        // Seed Test User (with hashed password)
        const user = new User(testUser);
        await user.save();
        console.log(`👤 Created test user: ${user.username}`);

        // Seed Town for test user
        const townData = { ...sampleTown, userId: user._id };
        const town = await Town.create(townData);
        console.log(`🏘️  Created starter town: ${town.name}`);

        // Seed Orbs for test user
        const orbs = sampleOrbs.map(orb => ({ ...orb, userId: user._id }));
        const createdOrbs = await Orb.insertMany(orbs);
        console.log(`🎁 Seeded ${createdOrbs.length} orbs for testing`);

        console.log('🎉 Database seeding completed!');
        console.log('\nTest user credentials:');
        console.log(`Username: ${testUser.username}`);
        console.log(`Password: ${testUser.password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
