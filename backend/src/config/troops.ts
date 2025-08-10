// backend/src/config/troops.ts
export interface TroopStats {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    carryCapacity: number;
}

export interface TroopLevelConfig {
    level: number;
    stats: TroopStats;
    trainingCost: {
        food: number;
        wood: number;
        stone: number;
        iron: number;
        gold: number;
    };
    trainingTime: number; // seconds
    populationCost: number;
}

export interface TroopConfig {
    type: string;
    name: string;
    description: string;
    buildingRequired: string;
    imageUrl: string;
    levels: TroopLevelConfig[];
}

// Helper functions for troop balance
const calculateStats = (baseAttack: number, baseDefense: number, baseHealth: number, level: number): TroopStats => {
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
): TroopLevelConfig[] => {
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

export const TROOP_CONFIGS: Record<string, TroopConfig> = {
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

// Helper function to get troop config
export const getTroopConfig = (troopType: string): TroopConfig | null => {
    return TROOP_CONFIGS[troopType] || null;
};

// Helper function to get troop stats for a specific level
export const getTroopStats = (troopType: string, level: number): TroopStats | null => {
    const config = getTroopConfig(troopType);
    if (!config || level < 1 || level > 30) return null;

    return config.levels[level - 1]?.stats || null;
};

// Helper function to get training cost for a specific level
export const getTrainingCost = (troopType: string, level: number) => {
    const config = getTroopConfig(troopType);
    if (!config || level < 1 || level > 30) return null;

    return config.levels[level - 1]?.trainingCost || null;
};

// Helper function to get training time for a specific level
export const getTrainingTime = (troopType: string, level: number): number | null => {
    const config = getTroopConfig(troopType);
    if (!config || level < 1 || level > 30) return null;

    return config.levels[level - 1]?.trainingTime || null;
};
