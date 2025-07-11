import { Item, Player, PlayerStats, EquipmentSlots, ItemSlot } from '../types/game.types';

// Map item icons to equipment slots
export const getItemSlot = (item: Item): ItemSlot | null => {
    const iconToSlotMap: Record<string, ItemSlot> = {
        // Weapons
        'sword': 'weapon',
        'dagger': 'weapon',
        'bow': 'weapon',
        'club': 'weapon',
        'spear': 'weapon',
        'mace': 'weapon',
        'axe': 'weapon',
        'staff': 'weapon',
        'hammer': 'weapon',
        'wand': 'weapon',
        'scythe': 'weapon',
        'glaive': 'weapon',
        'halberd': 'weapon',
        'crossbow': 'weapon',
        'flail': 'weapon',
        'greatsword': 'weapon',
        'gem': 'weapon', // Special weapons like Eternal Gem

        // Armor pieces
        'armor': 'armor',
        'robe': 'armor',

        // Other equipment
        'helmet': 'helmet',
        'crown': 'helmet',
        'shield': 'shield',
        'gloves': 'gloves',
        'boots': 'boots',
        'cloak': 'cloak',
        'bracers': 'accessory',
        'belt': 'accessory',
        'pauldrons': 'accessory',
        'greaves': 'accessory',
        'mask': 'accessory',
    };

    // Traps, potions, consumables cannot be equipped
    if (item.type === 'trap' || item.type === 'potion' || item.type === 'consumable') {
        return null;
    }

    return iconToSlotMap[item.icon] || null;
};

// Calculate total stats from base stats + equipment
export const calculateTotalStats = (player: Player): PlayerStats => {
    const totalStats = { ...player.baseStats };

    // Add stats from equipped items
    Object.values(player.equipped).forEach(item => {
        if (item) {
            // Weapons primarily add attack
            if (item.type === 'weapon') {
                totalStats.attack += item.stats;
                totalStats.health += Math.floor(item.stats * 0.1); // Small health bonus
            }
            // Armor primarily adds defense
            else if (item.type === 'armor' || item.icon === 'armor' || item.icon === 'shield' || item.icon === 'helmet') {
                totalStats.defense += item.stats;
                totalStats.health += Math.floor(item.stats * 0.3); // Moderate health bonus
            }
            // Accessories add mixed stats
            else {
                totalStats.attack += Math.floor(item.stats * 0.3);
                totalStats.defense += Math.floor(item.stats * 0.3);
                totalStats.speed += Math.floor(item.stats * 0.2);
            }

            // Special effects
            if (item.effect === 'movement_bonus' || item.effect === 'haste') {
                totalStats.speed += 10;
            }
        }
    });

    return totalStats;
};

// Compare two items
export const compareItems = (currentItem: Item | undefined, newItem: Item): {
    attack: number;
    defense: number;
    health: number;
    speed: number;
} => {
    const currentStats = {
        attack: 0,
        defense: 0,
        health: 0,
        speed: 0
    };

    const newStats = {
        attack: 0,
        defense: 0,
        health: 0,
        speed: 0
    };

    // Calculate current item stats
    if (currentItem) {
        if (currentItem.type === 'weapon') {
            currentStats.attack = currentItem.stats;
            currentStats.health = Math.floor(currentItem.stats * 0.1);
        } else if (currentItem.type === 'armor' || currentItem.icon === 'armor' || currentItem.icon === 'shield' || currentItem.icon === 'helmet') {
            currentStats.defense = currentItem.stats;
            currentStats.health = Math.floor(currentItem.stats * 0.3);
        } else {
            currentStats.attack = Math.floor(currentItem.stats * 0.3);
            currentStats.defense = Math.floor(currentItem.stats * 0.3);
            currentStats.speed = Math.floor(currentItem.stats * 0.2);
        }
    }

    // Calculate new item stats
    if (newItem.type === 'weapon') {
        newStats.attack = newItem.stats;
        newStats.health = Math.floor(newItem.stats * 0.1);
    } else if (newItem.type === 'armor' || newItem.icon === 'armor' || newItem.icon === 'shield' || newItem.icon === 'helmet') {
        newStats.defense = newItem.stats;
        newStats.health = Math.floor(newItem.stats * 0.3);
    } else {
        newStats.attack = Math.floor(newItem.stats * 0.3);
        newStats.defense = Math.floor(newItem.stats * 0.3);
        newStats.speed = Math.floor(newItem.stats * 0.2);
    }

    return {
        attack: newStats.attack - currentStats.attack,
        defense: newStats.defense - currentStats.defense,
        health: newStats.health - currentStats.health,
        speed: newStats.speed - currentStats.speed
    };
};
