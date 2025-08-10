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
    {
        type: 'quarry',
        name: 'Stone Quarry',
        description: 'Produces stone for construction',
        category: 'resource',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(120, i + 1),
                iron: calculateCost(50, i + 1)
            },
            time: calculateCost(180, i + 1)
        })),
        production: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: { stone: calculateProduction(10, i + 1) },
            time: 3600
        })),
        unlockRequirements: {
            townLevel: 3,
            buildings: [
                { type: 'townhall', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/quarry.png',
        isActive: true
    },
    {
        type: 'mine',
        name: 'Iron Mine',
        description: 'Produces iron for weapons and tools',
        category: 'resource',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(150, i + 1),
                stone: calculateCost(200, i + 1)
            },
            time: calculateCost(240, i + 1)
        })),
        production: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: { iron: calculateProduction(8, i + 1) },
            time: 3600
        })),
        unlockRequirements: {
            townLevel: 4,
            buildings: [
                { type: 'townhall', level: 4 }
            ]
        },
        imageUrl: '/assets/buildings/mine.png',
        isActive: true
    },
    {
        type: 'gem_mine',
        name: 'Gem Mine',
        description: 'Produces precious gems for premium upgrades',
        category: 'resource',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(300, i + 1),
                stone: calculateCost(400, i + 1),
                iron: calculateCost(200, i + 1),
                gold: calculateCost(100, i + 1)
            },
            time: calculateCost(600, i + 1)
        })),
        production: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: { gems: calculateProduction(2, i + 1) },
            time: 7200 // 2 hours
        })),
        unlockRequirements: {
            townLevel: 8,
            buildings: [
                { type: 'townhall', level: 8 }
            ]
        },
        imageUrl: '/assets/buildings/gem_mine.png',
        isActive: true
    },

    // Military Buildings
    {
        type: 'barracks',
        name: 'Barracks',
        description: 'Trains swordsmen for infantry combat',
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
            townLevel: 3,
            buildings: [
                { type: 'townhall', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/barracks.png',
        isActive: true
    },
    {
        type: 'archery_range',
        name: 'Archery Range',
        description: 'Trains archers for ranged combat',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(180, i + 1),
                stone: calculateCost(120, i + 1),
                iron: calculateCost(40, i + 1)
            },
            time: calculateCost(250, i + 1)
        })),
        unlockRequirements: {
            townLevel: 4,
            buildings: [
                { type: 'barracks', level: 2 }
            ]
        },
        imageUrl: '/assets/buildings/archery_range.png',
        isActive: true
    },
    {
        type: 'siege_workshop',
        name: 'Siege Workshop',
        description: 'Builds powerful ballistas for siege warfare',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(400, i + 1),
                stone: calculateCost(300, i + 1),
                iron: calculateCost(150, i + 1),
                gold: calculateCost(50, i + 1)
            },
            time: calculateCost(600, i + 1)
        })),
        unlockRequirements: {
            townLevel: 7,
            buildings: [
                { type: 'barracks', level: 5 }
            ]
        },
        imageUrl: '/assets/buildings/siege_workshop.png',
        isActive: true
    },
    {
        type: 'warrior_lodge',
        name: 'Warrior Lodge',
        description: 'Trains fierce berserkers for devastating attacks',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(250, i + 1),
                stone: calculateCost(200, i + 1),
                iron: calculateCost(100, i + 1),
                gold: calculateCost(30, i + 1)
            },
            time: calculateCost(400, i + 1)
        })),
        unlockRequirements: {
            townLevel: 6,
            buildings: [
                { type: 'barracks', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/warrior_lodge.png',
        isActive: true
    },
    {
        type: 'stable',
        name: 'Stable',
        description: 'Trains horsemen for fast cavalry strikes',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(300, i + 1),
                stone: calculateCost(150, i + 1),
                iron: calculateCost(80, i + 1),
                food: calculateCost(100, i + 1)
            },
            time: calculateCost(450, i + 1)
        })),
        unlockRequirements: {
            townLevel: 5,
            buildings: [
                { type: 'farm', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/stable.png',
        isActive: true
    },
    {
        type: 'training_grounds',
        name: 'Training Grounds',
        description: 'Trains elite lancers for heavy cavalry combat',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(350, i + 1),
                stone: calculateCost(300, i + 1),
                iron: calculateCost(120, i + 1),
                gold: calculateCost(80, i + 1)
            },
            time: calculateCost(500, i + 1)
        })),
        unlockRequirements: {
            townLevel: 8,
            buildings: [
                { type: 'stable', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/training_grounds.png',
        isActive: true
    },
    {
        type: 'spy_den',
        name: 'Spy Den',
        description: 'Trains spies for reconnaissance and sabotage',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(150, i + 1),
                stone: calculateCost(100, i + 1),
                iron: calculateCost(50, i + 1),
                gold: calculateCost(100, i + 1)
            },
            time: calculateCost(350, i + 1)
        })),
        unlockRequirements: {
            townLevel: 6,
            buildings: [
                { type: 'townhall', level: 6 }
            ]
        },
        imageUrl: '/assets/buildings/spy_den.png',
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
    },
    {
        type: 'mansion',
        name: 'Mansion',
        description: 'Luxurious housing for wealthy citizens',
        category: 'residential',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(300, i + 1),
                stone: calculateCost(250, i + 1),
                iron: calculateCost(100, i + 1),
                gold: calculateCost(150, i + 1)
            },
            time: calculateCost(600, i + 1)
        })),
        unlockRequirements: {
            townLevel: 10,
            buildings: [
                { type: 'house', level: 5 }
            ]
        },
        imageUrl: '/assets/buildings/mansion.png',
        isActive: true
    },

    // Defensive Buildings
    {
        type: 'wall',
        name: 'Wall',
        description: 'Defensive walls to protect your town',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                stone: calculateCost(200, i + 1),
                iron: calculateCost(100, i + 1)
            },
            time: calculateCost(300, i + 1)
        })),
        unlockRequirements: {
            townLevel: 5,
            buildings: [
                { type: 'barracks', level: 1 }
            ]
        },
        imageUrl: '/assets/buildings/wall.png',
        isActive: true
    },
    {
        type: 'tower',
        name: 'Defense Tower',
        description: 'Towers for enhanced defensive capabilities',
        category: 'military',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(150, i + 1),
                stone: calculateCost(300, i + 1),
                iron: calculateCost(150, i + 1)
            },
            time: calculateCost(400, i + 1)
        })),
        unlockRequirements: {
            townLevel: 6,
            buildings: [
                { type: 'wall', level: 3 }
            ]
        },
        imageUrl: '/assets/buildings/tower.png',
        isActive: true
    },

    // Economic Buildings
    {
        type: 'market',
        name: 'Market',
        description: 'Trade goods and resources with other players',
        category: 'special',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(250, i + 1),
                stone: calculateCost(200, i + 1),
                gold: calculateCost(100, i + 1)
            },
            time: calculateCost(400, i + 1)
        })),
        unlockRequirements: {
            townLevel: 7,
            buildings: [
                { type: 'townhall', level: 7 }
            ]
        },
        imageUrl: '/assets/buildings/market.png',
        isActive: true
    },
    {
        type: 'vault',
        name: 'Vault',
        description: 'Stores large quantities of resources safely',
        category: 'special',
        maxLevel: 30,
        buildCost: Array.from({ length: 30 }, (_, i) => ({
            level: i + 1,
            resources: {
                wood: calculateCost(200, i + 1),
                stone: calculateCost(150, i + 1),
                iron: calculateCost(100, i + 1)
            },
            time: calculateCost(300, i + 1)
        })),
        unlockRequirements: {
            townLevel: 4,
            buildings: [
                { type: 'townhall', level: 4 }
            ]
        },
        imageUrl: '/assets/images/buildings/vault.jpg',
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

// Sample town layout with more buildings
const sampleTown = {
    userId: new mongoose.Types.ObjectId(),
    name: 'Starter Town',
    level: 1,
    mapSize: { width: 10, height: 8 },
    buildings: [
        { x: 4, y: 3, type: 'townhall', level: 1 },
        { x: 3, y: 3, type: 'house', level: 1 },
        { x: 5, y: 3, type: 'farm', level: 1 },
        { x: 2, y: 4, type: 'lumbermill', level: 1 },
        { x: 6, y: 4, type: 'barracks', level: 1 }
    ],
    layout: JSON.stringify(Array(8).fill(Array(10).fill('grass')))
};

// Sample test user with more resources
const testUser = {
    username: 'testplayer',
    email: 'test@example.com',
    password: 'test1234',
    displayName: 'Test Player',
    inventory: {
        gold: 100000,
        orbsCount: {
            common: 3,
            uncommon: 1,
            rare: 0,
            veryRare: 10,
            legendary: 10
        },
        resources: {
            food: 20000,
            wood: 30000,
            stone: 25000,
            iron: 15000,
            gems: 10000
        }
    },
    army: {
        swordsmen: { 1: 5, 2: 2 },
        archers: { 1: 3 },
        ballistas: {},
        berserkers: {},
        horsemen: {},
        lancers: {},
        spies: {}
    },
    trainingQueue: []
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

        // List all building types for reference
        console.log('📋 Available building types:');
        buildingConfigs.forEach(building => {
            console.log(`   - ${building.type}: ${building.name} (${building.category})`);
        });

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
        console.log('\nThe test user has:');
        console.log(`- ${testUser.inventory.gold} gold`);
        console.log(`- Starting resources and some trained troops`);
        console.log(`- A town with basic buildings including a barracks`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
