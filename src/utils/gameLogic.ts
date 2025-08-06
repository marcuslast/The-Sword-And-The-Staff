import { Tile, Item } from '../types/game.types';
import { ITEM_POOL, ENEMIES, RARITIES } from './gameData';
import { generateRandomPath, BOARD_WIDTH, BOARD_HEIGHT } from './pathGeneration';

export const createGameBoard = (): Tile[] => {
    const tiles: Tile[] = [];
    const path = generateRandomPath();
    let hasShop = false;
    let shopPosition = Math.floor(path.length * 0.3 + Math.random() * path.length * 0.4);

    // Create all tiles
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const pathIndex = path.findIndex(([px, py]) => px === x && py === y);
            const isPath = pathIndex !== -1;

            let type: Tile['type'] = 'normal';
            if (pathIndex === 0) type = 'start';
            else if (pathIndex === path.length - 1) type = 'castle';
            else if (isPath && pathIndex === Math.floor(path.length * 0.6)) type = 'hoard';
            else if (isPath && pathIndex > 0) {
                const rand = Math.random();
                if (rand <= 0.35) type = 'battle';
                else if (rand > 0.85 && rand < 0.95) type = 'bonus';
                else if (rand >= 0.95) {
                    type = 'shop';
                    hasShop = true;
                }
            }

            // Force at least one shop if none was randomly placed
            if (isPath && pathIndex === shopPosition && !hasShop) {
                type = 'shop';
                hasShop = true;
            }

            const tile: Tile = {
                hoardItems: [],
                id: y * BOARD_WIDTH + x,
                type,
                x,
                y,
                isPath,
                pathIndex: isPath ? pathIndex : undefined  // CRITICAL: Store the actual path order
            };

            // Add enemies to battle tiles
            if (type === 'battle') {
                const enemyTemplate = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
                const rewardItem = ITEM_POOL.filter(i => i.type === 'weapon' || i.type === 'armor')[
                    Math.floor(Math.random() * ITEM_POOL.filter(i => i.type === 'weapon' || i.type === 'armor').length)
                    ];

                tile.enemy = {
                    id: `enemy-${pathIndex}`,
                    ...enemyTemplate,
                    reward: {
                        id: `reward-${pathIndex}`,
                        ...rewardItem
                    }
                };
            }

            // Add items to shop tiles
            if (type === 'shop') {
                tile.hoardItems = [
                    generateRandomItem('common'),
                    generateRandomItem('uncommon'),
                    generateRandomItem('rare')
                ].map(item => ({
                    ...item,
                    value: Math.floor(item.value * 1.5)
                }));
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

// FIXED: Calculate available tiles based on consecutive path movement only
export const getAvailableTiles = (currentPosition: number, diceValue: number, board: Tile[]): number[] => {
    const pathTiles = getOrderedPathTiles(board);
    const availablePositions: number[] = [];

    // Only allow consecutive forward movement along the path
    for (let steps = 1; steps <= diceValue; steps++) {
        const newPosition = currentPosition + steps;

        // Check if the new position exists on the path
        if (newPosition < pathTiles.length) {
            availablePositions.push(newPosition);
        } else {
            break; // Can't go beyond the end of the path
        }
    }

    return availablePositions;
};

// Helper function to get path tiles in correct order
export const getOrderedPathTiles = (board: Tile[]): Tile[] => {
    return board
        .filter(t => t.isPath && t.pathIndex !== undefined)
        .sort((a, b) => (a.pathIndex || 0) - (b.pathIndex || 0));  // Sort by actual path order
};
