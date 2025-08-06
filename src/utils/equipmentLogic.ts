import { Item, Player, PlayerStats, ItemSlot } from '../types/game.types';

// Map item icons to equipment slots
export const getItemSlot = (item: Item): ItemSlot | null => {
    switch (item.type) {
        case 'weapon':
            return 'weapon';
        case 'armor':
            return 'armor';
        default:
            return null;
    }
};

// Calculate equipment bonuses separately from base stats
export const calculateEquipmentBonuses = (player: Player): PlayerStats => {
    // Safety check for undefined player or equipped property
    if (!player || !player.equipped) {
        return { attack: 0, defense: 0, health: 0, speed: 0 };
    }

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
    // Safety check for undefined player or player properties
    if (!player || !player.baseStats) {
        return { attack: 10, defense: 10, health: 100, speed: 10 };
    }

    const baseStats = player.baseStats;
    const equipmentBonuses = calculateEquipmentBonuses(player);

    return {
        attack: baseStats.attack + equipmentBonuses.attack,
        defense: baseStats.defense + equipmentBonuses.defense,
        health: baseStats.health + equipmentBonuses.health,
        speed: baseStats.speed + equipmentBonuses.speed
    };
};

// Get detailed stat breakdown for UI display
export interface StatBreakdown {
    base: number;
    bonus: number;
    total: number;
}

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
    // Safety check for undefined player
    if (!player || !player.baseStats) {
        return {
            attack: { base: 10, bonus: 0, total: 10 },
            defense: { base: 10, bonus: 0, total: 10 },
            health: { base: 100, bonus: 0, total: 100 },
            speed: { base: 10, bonus: 0, total: 10 }
        };
    }

    const base = player.baseStats;
    const equipment = calculateEquipmentBonuses(player);
    const total = calculateTotalStats(player);

    return {
        attack: {
            base: base.attack,
            bonus: equipment.attack,
            total: total.attack
        },
        defense: {
            base: base.defense,
            bonus: equipment.defense,
            total: total.defense
        },
        health: {
            base: base.health,
            bonus: equipment.health,
            total: total.health
        },
        speed: {
            base: base.speed,
            bonus: equipment.speed,
            total: total.speed
        }
    };
};


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
