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

// Calculate equipment bonuses separately from base stats
export const calculateEquipmentBonuses = (player: Player): PlayerStats => {
    const bonuses: PlayerStats = {
        attack: 0,
        defense: 0,
        health: 0,
        speed: 0
    };

    // Add stats from equipped items
    Object.values(player.equipped).forEach(item => {
        if (item) {
            // Weapons primarily add attack
            if (item.type === 'weapon') {
                bonuses.attack += item.stats;
                bonuses.health += Math.floor(item.stats * 0.1); // Small health bonus
            }
            // Armor primarily adds defense
            else if (item.type === 'armor' || item.icon === 'armor' || item.icon === 'shield' || item.icon === 'helmet') {
                bonuses.defense += item.stats;
                bonuses.health += Math.floor(item.stats * 0.3); // Moderate health bonus
            }
            // Accessories add mixed stats
            else {
                bonuses.attack += Math.floor(item.stats * 0.3);
                bonuses.defense += Math.floor(item.stats * 0.3);
                bonuses.speed += Math.floor(item.stats * 0.2);
            }

            // Special effects
            if (item.effect === 'movement_bonus' || item.effect === 'haste') {
                bonuses.speed += 10;
            }
        }
    });

    return bonuses;
};

// Calculate total stats from base stats + equipment
export const calculateTotalStats = (player: Player): PlayerStats => {
    const bonuses = calculateEquipmentBonuses(player);

    return {
        attack: player.baseStats.attack + bonuses.attack,
        defense: player.baseStats.defense + bonuses.defense,
        health: player.baseStats.health + bonuses.health,
        speed: player.baseStats.speed + bonuses.speed
    };
};

// Get detailed stat breakdown for UI display
export interface StatBreakdown {
    base: number;
    bonus: number;
    total: number;
}

export const getStatBreakdowns = (player: Player): {
    attack: StatBreakdown;
    defense: StatBreakdown;
    health: StatBreakdown;
    speed: StatBreakdown;
} => {
    const bonuses = calculateEquipmentBonuses(player);

    return {
        attack: {
            base: player.baseStats.attack,
            bonus: bonuses.attack,
            total: player.baseStats.attack + bonuses.attack
        },
        defense: {
            base: player.baseStats.defense,
            bonus: bonuses.defense,
            total: player.baseStats.defense + bonuses.defense
        },
        health: {
            base: player.baseStats.health,
            bonus: bonuses.health,
            total: player.baseStats.health + bonuses.health
        },
        speed: {
            base: player.baseStats.speed,
            bonus: bonuses.speed,
            total: player.baseStats.speed + bonuses.speed
        }
    };
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
