// backend/src/scripts/seedTroops.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

// Helper functions for troop balance
const calculateStats = (baseAttack: number, baseDefense: number, baseHealth: number, level: number) => {
    const multiplier = 1 + (level - 1) * 0.15; // 15% increase per level
    return {
        attack: Math.floor(baseAttack * multiplier),
        defense: Math.floor(baseDefense * multiplier),
        health: Math.floor(baseHealth * multiplier),
        speed: 10, // Base speed (can be customized per troop type)
        carryCapacity: Math.floor(50 * multiplier)
    };
};

const calculateCost = (baseCost: any, level: number, multiplier = 1.3) => {
    return Object.entries(baseCost).reduce((acc, [resource, amount]) => {
        acc[resource] = Math.floor((amount as number) * Math.pow(multiplier, level - 1));
        return acc;
    }, {} as any);
};

const calculateTime = (baseTime: number, level: number, multiplier = 1.2) => {
    return Math.floor(baseTime * Math.pow(multiplier, level - 1));
};

// Generate levels 1-30 for each troop type
const generateTroopLevels = (
    baseAttack: number,
    baseDefense: number,
    baseHealth: number,
    baseCost: any,
    baseTime: number,
    basePopulation: number = 1
) => {
    return Array.from({ length: 30 }, (_, i) => {
        const level = i + 1;
        return {
            level,
            stats: calculateStats(baseAttack, baseDefense, baseHealth, level),
            trainingCost: calculateCost(baseCost, level),
            trainingTime: calculateTime(baseTime, level),
            populationCost: basePopulation
        };
    });
};

const TROOP_CONFIGS = {
    swordsmen: {
        type: 'swordsmen',
        name: 'Swordsmen',
        description: 'Balanced infantry units with good attack and defense',
        buildingRequired: 'barracks',
        imageUrl: '/components/training/swordsmen.jpg',
        levels: generateTroopLevels(
            25, 20, 100, // base attack, defense, health
            { food: 30, wood: 20, iron: 15, gold: 5 }, // base cost
            180, // base time (3 minutes)
            1 // population cost
        )
    },
    archers: {
        type: 'archers',
        name: 'Archers',
        description: 'Ranged units with high attack but low defense',
        buildingRequired: 'archery_range',
        imageUrl: '/components/training/archers.jpg',
        levels: generateTroopLevels(
            35, 10, 80,
            { food: 25, wood: 30, iron: 10, gold: 8 },
            150,
            1
        )
    },
    ballistas: {
        type: 'ballistas',
        name: 'Ballistas',
        description: 'Heavy siege engines with massive attack power',
        buildingRequired: 'siege_workshop',
        imageUrl: '/components/training/ballistas.jpg',
        levels: generateTroopLevels(
            60, 15, 120,
            { food: 40, wood: 80, stone: 40, iron: 60, gold: 25 },
            600, // 10 minutes base
            3 // takes 3 population slots
        )
    },
    berserkers: {
        type: 'berserkers',
        name: 'Berserkers',
        description: 'Fierce warriors with devastating attack but low defense',
        buildingRequired: 'warrior_lodge',
        imageUrl: '/components/training/berserkers.jpg',
        levels: generateTroopLevels(
            45, 8, 110,
            { food: 50, wood: 15, iron: 25, gold: 12 },
            240, // 4 minutes base
            1
        )
    },
    horsemen: {
        type: 'horsemen',
        name: 'Horsemen',
        description: 'Fast cavalry units perfect for quick strikes',
        buildingRequired: 'stable',
        imageUrl: '/components/training/horsemen.jpg',
        levels: generateTroopLevels(
            30, 25, 90,
            { food: 60, wood: 25, iron: 20, gold: 15 },
            300, // 5 minutes base
            2 // takes 2 population slots
        )
    },
    lancers: {
        type: 'lancers',
        name: 'Lancers',
        description: 'Heavy cavalry with excellent defense and good attack',
        buildingRequired: 'training_grounds',
        imageUrl: '/components/training/lancers.jpg',
        levels: generateTroopLevels(
            35, 35, 130,
            { food: 70, wood: 30, stone: 20, iron: 35, gold: 20 },
            420, // 7 minutes base
            2
        )
    },
    spies: {
        type: 'spies',
        name: 'Spies',
        description: 'Stealthy units for reconnaissance and sabotage',
        buildingRequired: 'spy_den',
        imageUrl: '/components/training/spies.jpg',
        levels: generateTroopLevels(
            15, 15, 60,
            { food: 20, wood: 10, iron: 5, gold: 30 },
            120, // 2 minutes base
            1
        )
    }
};

// Sample test user with training setup
const createTestUserWithTroops = {
    username: 'testwarrior',
    email: 'warrior@example.com',
    password: 'test1234',
    displayName: 'Test Warrior',
    inventory: {
        gold: 100000,
        orbsCount: {
            common: 5,
            uncommon: 3,
            rare: 1,
            veryRare: 10,
            legendary: 5
        },
        resources: {
            food: 50000,
            wood: 50000,
            stone: 40000,
            iron: 30000,
            gems: 20000
        }
    },
    army: {
        swordsmen: { 1: 10, 2: 5, 3: 3 },
        archers: { 1: 8, 2: 4 },
        ballistas: { 1: 2 },
        berserkers: { 1: 6 },
        horsemen: { 1: 4, 2: 2 },
        lancers: { 1: 3 },
        spies: { 1: 5, 2: 2 }
    },
    trainingQueue: []
};

async function seedTroops() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-game-db';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Create test user with troops
        await User.deleteOne({ username: 'testwarrior' });
        const user = new User(createTestUserWithTroops);
        await user.save();
        console.log(`👤 Created test warrior user: ${user.username}`);

        console.log('\n🎉 Troop system seeding completed!');
        console.log('\nTest warrior credentials:');
        console.log(`Username: ${createTestUserWithTroops.username}`);
        console.log(`Password: ${createTestUserWithTroops.password}`);
        console.log('\nThe test warrior has:');
        console.log(`- ${createTestUserWithTroops.inventory.gold} gold`);
        console.log(`- Abundant resources for training`);
        console.log(`- Starting army with various troop types`);

        console.log('\n⚔️ Available Troop Types:');
        Object.values(TROOP_CONFIGS).forEach(troop => {
            console.log(`   - ${troop.name}: ${troop.description}`);
            console.log(`     Building: ${troop.buildingRequired}`);
            console.log(`     Training time: ${troop.levels[0].trainingTime}s (base level)`);
            console.log(`     Cost: ${Object.entries(troop.levels[0].trainingCost).map(([r, a]) => `${a} ${r}`).join(', ')}`);
            console.log('');
        });

        console.log('📋 Troop Buildings Required:');
        const buildings = [...new Set(Object.values(TROOP_CONFIGS).map(t => t.buildingRequired))];
        buildings.forEach(building => {
            const troops = Object.values(TROOP_CONFIGS).filter(t => t.buildingRequired === building);
            console.log(`   - ${building}: ${troops.map(t => t.name).join(', ')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding troops:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seedTroops();
