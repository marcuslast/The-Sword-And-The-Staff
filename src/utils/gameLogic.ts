import { Tile, Player, Item, Enemy, Trap } from '../types/game.types';
import {
    ITEM_POOL,
    ENEMIES,
    RARITIES } from './gameData';
import { generateRandomPath, BOARD_WIDTH, BOARD_HEIGHT } from './pathGeneration';

const MIN_PATH_LENGTH = 35;

// Helper function to create the game board with random path
export const createGameBoard = (): Tile[] => {
    const tiles: Tile[] = [];
    const path = generateRandomPath();

    // Create all tiles
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const isPath = path.some(([px, py]) => px === x && py === y);
            const tileIndex = path.findIndex(([px, py]) => px === x && py === y);

            let type: Tile['type'] = 'normal';
            if (tileIndex === 0) type = 'start';
            else if (tileIndex === path.length - 1) type = 'castle';
            else if (isPath && tileIndex > 0) {
                // Randomly distribute special tiles
                const rand = Math.random();
                if (rand <= 0.4) type = 'battle';
                else if (rand > 0.85 && rand < 0.99 ) type = 'bonus';
            }

            const tile: Tile = {
                id: y * BOARD_WIDTH + x,
                type,
                x,
                y,
                isPath
            };

            // Add enemies to battle tiles
            if (type === 'battle') {
                const enemyTemplate = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
                const rewardItem = ITEM_POOL.filter(i => i.type === 'weapon' || i.type === 'armor')[
                    Math.floor(Math.random() * ITEM_POOL.filter(i => i.type === 'weapon' || i.type === 'armor').length)
                    ];

                tile.enemy = {
                    id: `enemy-${tileIndex}`,
                    ...enemyTemplate,
                    reward: {
                        id: `reward-${tileIndex}`,
                        ...rewardItem
                    }
                };
            }

            tiles.push(tile);
        }
    }

    return tiles;
};

// Item generation
export const generateRandomItem = (rarity?: keyof typeof RARITIES): Item => {
    let selectedRarity = rarity;

    if (!selectedRarity) {
        const random = Math.random() * 100;
        let cumulative = 0;
        for (const [r, config] of Object.entries(RARITIES)) {
            cumulative += config.chance;
            if (random <= cumulative) {
                selectedRarity = r as keyof typeof RARITIES;
                break;
            }
        }
    }

    const itemsOfRarity = ITEM_POOL.filter(item => item.rarity === selectedRarity);
    const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)] || ITEM_POOL[0];

    return {
        id: Date.now().toString() + Math.random(),
        ...randomItem,
        stats: Math.floor(randomItem.stats * RARITIES[randomItem.rarity].multiplier)
    };
};

// Calculate available tiles based on dice roll
export const getAvailableTiles = (currentPosition: number, diceValue: number, board: Tile[]): number[] => {
    const pathTiles = board.filter(t => t.isPath).sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return b.y - a.y; // Reverse y to go from bottom to top
    });

    const availablePositions: number[] = [];

    console.log('Current position:', currentPosition, 'Dice value:', diceValue);
    console.log('Path tiles length:', pathTiles.length);

    // Player can move anywhere from 1 to diceValue spaces forward
    for (let i = 1; i <= diceValue; i++) {
        const newPosition = currentPosition + i;
        if (newPosition < pathTiles.length) {
            availablePositions.push(newPosition);
            console.log('Available position:', newPosition, 'Tile:', pathTiles[newPosition]);
        }
    }

    console.log('Available positions:', availablePositions);
    return availablePositions;
};

// Helper function to get path tiles in correct order
export const getOrderedPathTiles = (board: Tile[]): Tile[] => {
    return board.filter(t => t.isPath).sort((a, b) => {
        // Sort by y (bottom to top) then x (left to right)
        if (a.y === b.y) return a.x - b.x;
        return b.y - a.y;
    });
};
