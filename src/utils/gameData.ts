import { Item, Enemy, Question } from '../types/game.types';
import {ENEMY_IMAGES} from "./enemyImage";

export const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

export const RARITIES = {
    'common': { multiplier: 1, color: 'text-gray-500', bgColor: 'bg-gray-100', chance: 50 },
    'uncommon': { multiplier: 2, color: 'text-green-600', bgColor: 'bg-green-100', chance: 30 },
    'rare': { multiplier: 2.5, color: 'text-blue-600', bgColor: 'bg-blue-100', chance: 12 },
    'very rare': { multiplier: 3, color: 'text-purple-600', bgColor: 'bg-purple-100', chance: 6 },
    'legendary': { multiplier: 5, color: 'text-yellow-600', bgColor: 'bg-yellow-100', chance: 2 }
};

export const WEAPONS: Omit<Item, 'id'>[] = [
    // Common Weapons (30 items)
    { name: 'Wooden Sword', type: 'weapon', rarity: 'common', stats: 10, icon: 'sword', value: 20 },
    { name: 'Rusty Dagger', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger', value: 15 },
    { name: 'Hunting Bow', type: 'weapon', rarity: 'common', stats: 12, icon: 'bow', value: 25 },
    { name: 'Stone Club', type: 'weapon', rarity: 'common', stats: 9, icon: 'club', value: 18 },
    { name: 'Copper Shortsword', type: 'weapon', rarity: 'common', stats: 11, icon: 'sword', value: 22 },
    { name: 'Wooden Spear', type: 'weapon', rarity: 'common', stats: 10, icon: 'spear', value: 20 },
    { name: 'Bone Knife', type: 'weapon', rarity: 'common', stats: 7, icon: 'dagger', value: 14 },
    { name: 'Sling', type: 'weapon', rarity: 'common', stats: 6, icon: 'sling', value: 12 },
    { name: 'Iron Mace', type: 'weapon', rarity: 'common', stats: 13, icon: 'mace', value: 26 },
    { name: 'Hatchet', type: 'weapon', rarity: 'common', stats: 12, icon: 'axe', value: 24 },
    { name: 'Pitchfork', type: 'weapon', rarity: 'common', stats: 11, icon: 'spear', value: 22 },
    { name: 'Wooden Staff', type: 'weapon', rarity: 'common', stats: 9, icon: 'staff', value: 18 },
    { name: 'Flint Knife', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger', value: 16 },
    { name: 'Iron Dagger', type: 'weapon', rarity: 'common', stats: 10, icon: 'dagger', value: 20 },
    { name: 'Short Bow', type: 'weapon', rarity: 'common', stats: 11, icon: 'bow', value: 22 },
    { name: 'Hand Axe', type: 'weapon', rarity: 'common', stats: 12, icon: 'axe', value: 24 },
    { name: 'Iron Shortsword', type: 'weapon', rarity: 'common', stats: 14, icon: 'sword', value: 28 },
    { name: 'Wooden Mallet', type: 'weapon', rarity: 'common', stats: 10, icon: 'hammer', value: 20 },
    { name: 'Iron Spear', type: 'weapon', rarity: 'common', stats: 13, icon: 'spear', value: 26 },
    { name: 'Cudgel', type: 'weapon', rarity: 'common', stats: 9, icon: 'club', value: 18 },
    { name: 'Sickle', type: 'weapon', rarity: 'common', stats: 10, icon: 'sickle', value: 20 },
    { name: 'Iron Hatchet', type: 'weapon', rarity: 'common', stats: 13, icon: 'axe', value: 26 },
    { name: 'Throwing Knives', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger', value: 16 },
    { name: 'Iron Flail', type: 'weapon', rarity: 'common', stats: 14, icon: 'flail', value: 28 },
    { name: 'Wooden Baton', type: 'weapon', rarity: 'common', stats: 7, icon: 'club', value: 14 },
    { name: 'Iron Rapier', type: 'weapon', rarity: 'common', stats: 15, icon: 'sword', value: 30 },
    { name: 'Hooked Spear', type: 'weapon', rarity: 'common', stats: 12, icon: 'spear', value: 24 },
    { name: 'Stone Axe', type: 'weapon', rarity: 'common', stats: 11, icon: 'axe', value: 22 },
    { name: 'Iron Cleaver', type: 'weapon', rarity: 'common', stats: 13, icon: 'axe', value: 26 },
    { name: 'Bone Club', type: 'weapon', rarity: 'common', stats: 8, icon: 'club', value: 16 },

    // Uncommon Weapons (20 items)
    { name: 'Elven Longbow', type: 'weapon', rarity: 'uncommon', stats: 18, icon: 'bow', value: 90 },
    { name: 'Lightning Javelin', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'spear', effect: 'lightning_damage', value: 150 },
    { name: 'Dwarven Warhammer', type: 'weapon', rarity: 'uncommon', stats: 24, icon: 'hammer', value: 120 },
    { name: 'Steel Longsword', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'sword', value: 100 },
    { name: 'Silver Dagger', type: 'weapon', rarity: 'uncommon', stats: 18, icon: 'dagger', effect: 'undead_damage', value: 140 },
    { name: 'Composite Bow', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'bow', value: 95 },
    { name: 'Morningstar', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'mace', value: 105 },
    { name: 'Scimitar', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword', value: 95 },
    { name: 'War Pick', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'pick', value: 100 },
    { name: 'Halberd', type: 'weapon', rarity: 'uncommon', stats: 23, icon: 'halberd', value: 115 },
    { name: 'Crossbow', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'crossbow', value: 100 },
    { name: 'Falchion', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword', value: 95 },
    { name: 'Battleaxe', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'axe', value: 110 },
    { name: 'Glaive', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'glaive', value: 105 },
    { name: 'War Scythe', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'scythe', value: 100 },
    { name: 'Estoc', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword', value: 95 },
    { name: 'Heavy Flail', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'flail', value: 110 },
    { name: 'Bastard Sword', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'sword', value: 105 },
    { name: 'Recurve Bow', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'bow', value: 100 },
    { name: 'Double-headed Axe', type: 'weapon', rarity: 'uncommon', stats: 23, icon: 'axe', value: 115 },

    // Rare Weapons (10 items)
    { name: 'Mystic Staff', type: 'weapon', rarity: 'rare', stats: 25, icon: 'wand', value: 300 },
    { name: 'Flame Tongue', type: 'weapon', rarity: 'rare', stats: 30, icon: 'sword', effect: 'fire_damage', value: 500 },
    { name: 'Frost Brand', type: 'weapon', rarity: 'rare', stats: 28, icon: 'axe', effect: 'cold_resistance', value: 450 },
    { name: 'Assassin\'s Blade', type: 'weapon', rarity: 'rare', stats: 26, icon: 'dagger', effect: 'critical_hit', value: 420 },
    { name: 'Vampiric Sword', type: 'weapon', rarity: 'rare', stats: 27, icon: 'sword', effect: 'life_steal', value: 450 },
    { name: 'Serpent\'s Fang', type: 'weapon', rarity: 'rare', stats: 25, icon: 'dagger', effect: 'poison', value: 400 },
    { name: 'Thunder Hammer', type: 'weapon', rarity: 'rare', stats: 29, icon: 'hammer', effect: 'shockwave', value: 480 },
    { name: 'Moonlight Glaive', type: 'weapon', rarity: 'rare', stats: 26, icon: 'glaive', effect: 'night_power', value: 420 },
    { name: 'Phoenix Bow', type: 'weapon', rarity: 'rare', stats: 27, icon: 'bow', effect: 'fire_arrows', value: 450 },
    { name: 'Duskblade', type: 'weapon', rarity: 'rare', stats: 28, icon: 'sword', effect: 'shadow_strike', value: 460 },

    // Very Rare Weapons (5 items)
    { name: 'Dragon Crown', type: 'armor', rarity: 'very rare', stats: 30, icon: 'crown', value: 900 },
    { name: 'Soul Reaver', type: 'weapon', rarity: 'very rare', stats: 35, icon: 'scythe', effect: 'soul_drain', value: 1500 },
    { name: 'Celestial Blade', type: 'weapon', rarity: 'very rare', stats: 38, icon: 'sword', effect: 'holy_damage', value: 1600 },
    { name: 'Titan\'s Maul', type: 'weapon', rarity: 'very rare', stats: 40, icon: 'hammer', effect: 'armor_shatter', value: 1700 },
    { name: 'Stormcaller', type: 'weapon', rarity: 'very rare', stats: 36, icon: 'spear', effect: 'lightning_storm', value: 1550 },

    // Legendary Weapons (5 items)
    { name: 'Eternal Gem', type: 'weapon', rarity: 'legendary', stats: 50, icon: 'gem', value: 3000 },
    { name: 'Vorpal Sword', type: 'weapon', rarity: 'legendary', stats: 45, icon: 'sword', effect: 'decapitation_chance', value: 4000 },
    { name: 'Staff of the Magi', type: 'weapon', rarity: 'legendary', stats: 50, icon: 'staff', effect: 'spell_absorption', value: 4500 },
    { name: 'Holy Avenger', type: 'weapon', rarity: 'legendary', stats: 48, icon: 'sword', effect: 'evil_smite', value: 4200 },
    { name: 'Doombringer', type: 'weapon', rarity: 'legendary', stats: 55, icon: 'greatsword', effect: 'doom', value: 5000 }
];

export const ARMORS: Omit<Item, 'id'>[] = [
    // Common Armors (25 items)
    { name: 'Leather Armor', type: 'armor', rarity: 'common', stats: 12, icon: 'armor', value: 24 },
    { name: 'Padded Armor', type: 'armor', rarity: 'common', stats: 10, icon: 'armor', value: 20 },
    { name: 'Hide Armor', type: 'armor', rarity: 'common', stats: 11, icon: 'armor', value: 22 },
    { name: 'Studded Leather', type: 'armor', rarity: 'common', stats: 13, icon: 'armor', value: 26 },
    { name: 'Ringmail', type: 'armor', rarity: 'common', stats: 14, icon: 'armor', value: 28 },
    { name: 'Brigandine', type: 'armor', rarity: 'common', stats: 15, icon: 'armor', value: 30 },
    { name: 'Gambeson', type: 'armor', rarity: 'common', stats: 12, icon: 'armor', value: 24 },
    { name: 'Scale Mail', type: 'armor', rarity: 'common', stats: 16, icon: 'armor', value: 32 },
    { name: 'Quilted Armor', type: 'armor', rarity: 'common', stats: 11, icon: 'armor', value: 22 },
    { name: 'Leather Helm', type: 'armor', rarity: 'common', stats: 8, icon: 'helmet', value: 16 },
    { name: 'Iron Cap', type: 'armor', rarity: 'common', stats: 9, icon: 'helmet', value: 18 },
    { name: 'Buckler', type: 'armor', rarity: 'common', stats: 10, icon: 'shield', value: 20 },
    { name: 'Wooden Shield', type: 'armor', rarity: 'common', stats: 12, icon: 'shield', value: 24 },
    { name: 'Leather Gloves', type: 'armor', rarity: 'common', stats: 7, icon: 'gloves', value: 14 },
    { name: 'Iron Bracers', type: 'armor', rarity: 'common', stats: 9, icon: 'bracers', value: 18 },
    { name: 'Cloth Robe', type: 'armor', rarity: 'common', stats: 8, icon: 'robe', value: 16 },
    { name: 'Leather Boots', type: 'armor', rarity: 'common', stats: 7, icon: 'boots', value: 14 },
    { name: 'Iron Greaves', type: 'armor', rarity: 'common', stats: 10, icon: 'greaves', value: 20 },
    { name: 'Wool Cloak', type: 'armor', rarity: 'common', stats: 6, icon: 'cloak', value: 12 },
    { name: 'Chain Coif', type: 'armor', rarity: 'common', stats: 11, icon: 'helmet', value: 22 },
    { name: 'Hide Shield', type: 'armor', rarity: 'common', stats: 11, icon: 'shield', value: 22 },
    { name: 'Iron Pauldrons', type: 'armor', rarity: 'common', stats: 9, icon: 'pauldrons', value: 18 },
    { name: 'Leather Belt', type: 'armor', rarity: 'common', stats: 5, icon: 'belt', value: 10 },
    { name: 'Iron Boots', type: 'armor', rarity: 'common', stats: 10, icon: 'boots', value: 20 },
    { name: 'Wooden Mask', type: 'armor', rarity: 'common', stats: 6, icon: 'mask', value: 12 },

    // Uncommon Armors (15 items)
    { name: 'Chainmail', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'armor', value: 90 },
    { name: 'Boots of Speed', type: 'armor', rarity: 'uncommon', stats: 15, icon: 'boots', effect: 'movement_bonus', value: 120 },
    { name: 'Bracers of Defense', type: 'armor', rarity: 'uncommon', stats: 22, icon: 'bracers', value: 110 },
    { name: 'Splint Mail', type: 'armor', rarity: 'uncommon', stats: 20, icon: 'armor', value: 100 },
    { name: 'Half Plate', type: 'armor', rarity: 'uncommon', stats: 22, icon: 'armor', value: 110 },
    { name: 'Steel Shield', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'shield', value: 90 },
    { name: 'Silvered Armor', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'armor', effect: 'lycanthrope_protection', value: 150 },
    { name: 'Mithral Shirt', type: 'armor', rarity: 'uncommon', stats: 17, icon: 'armor', effect: 'no_stealth_penalty', value: 140 },
    { name: 'Tower Shield', type: 'armor', rarity: 'uncommon', stats: 20, icon: 'shield', value: 100 },
    { name: 'Dragonhide Armor', type: 'armor', rarity: 'uncommon', stats: 21, icon: 'armor', value: 105 },
    { name: 'Spiked Armor', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'armor', effect: 'melee_retaliation', value: 150 },
    { name: 'Knight\'s Helm', type: 'armor', rarity: 'uncommon', stats: 16, icon: 'helmet', value: 80 },
    { name: 'Elven Chain', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'armor', value: 90 },
    { name: 'Sentinel Shield', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'shield', effect: 'perception_bonus', value: 150 },
    { name: 'Mariner\'s Armor', type: 'armor', rarity: 'uncommon', stats: 17, icon: 'armor', effect: 'swimming_bonus', value: 140 },

    // Rare Armors (8 items)
    { name: 'Cloak of Protection', type: 'armor', rarity: 'rare', stats: 25, icon: 'cloak', effect: 'magic_resistance', value: 500 },
    { name: 'Helm of Comprehending Languages', type: 'armor', rarity: 'rare', stats: 20, icon: 'helmet', effect: 'language_comprehension', value: 600 },
    { name: 'Shield of Missile Attraction', type: 'armor', rarity: 'rare', stats: 28, icon: 'shield', effect: 'missile_attraction', value: 550 },
    { name: 'Plate Armor', type: 'armor', rarity: 'rare', stats: 30, icon: 'armor', value: 400 },
    { name: 'Demonhide Armor', type: 'armor', rarity: 'rare', stats: 27, icon: 'armor', effect: 'fire_resistance', value: 700 },
    { name: 'Wings of Flying', type: 'armor', rarity: 'rare', stats: 15, icon: 'cloak', effect: 'flight', value: 1000 },
    { name: 'Armor of Resistance', type: 'armor', rarity: 'rare', stats: 25, icon: 'armor', effect: 'elemental_resistance', value: 800 },
    { name: 'Helm of Telepathy', type: 'armor', rarity: 'rare', stats: 18, icon: 'helmet', effect: 'mind_reading', value: 900 },

    // Very Rare Armors (5 items)
    { name: 'Plate Armor of Etherealness', type: 'armor', rarity: 'legendary', stats: 40, icon: 'armor', effect: 'phase_shift', value: 2500 },
    { name: 'Dragon Scale Mail', type: 'armor', rarity: 'very rare', stats: 35, icon: 'armor', effect: 'elemental_resistance', value: 1800 },
    { name: 'Armor of Invulnerability', type: 'armor', rarity: 'very rare', stats: 38, icon: 'armor', effect: 'damage_reduction', value: 2000 },
    { name: 'Mirror Shield', type: 'armor', rarity: 'very rare', stats: 32, icon: 'shield', effect: 'spell_reflection', value: 1900 },
    { name: 'Celestial Armor', type: 'armor', rarity: 'very rare', stats: 36, icon: 'armor', effect: 'radiant_aura', value: 2100 },

    // Legendary Armors (5 items)
    { name: 'Robe of the Archmagi', type: 'armor', rarity: 'legendary', stats: 45, icon: 'robe', effect: 'spell_power', value: 4000 },
    { name: 'Armor of the Gods', type: 'armor', rarity: 'legendary', stats: 50, icon: 'armor', effect: 'divine_protection', value: 4500 },
    { name: 'Shield of the Aegis', type: 'armor', rarity: 'legendary', stats: 40, icon: 'shield', effect: 'absolute_defense', value: 4200 },
    { name: 'Crown of Stars', type: 'armor', rarity: 'legendary', stats: 35, icon: 'crown', effect: 'stellar_power', value: 3800 },
    { name: 'Phoenix Armor', type: 'armor', rarity: 'legendary', stats: 42, icon: 'armor', effect: 'rebirth', value: 5000 }
];

export const TRAPS: Omit<Item, 'id'>[] = [
    { name: 'Pit Trap', type: 'trap', rarity: 'common', stats: 10, icon: 'hole', effect: 'fall_damage', value: 50 },
    { name: 'Poison Dart Trap', type: 'trap', rarity: 'uncommon', stats: 20, icon: 'dart', effect: 'poison', value: 120 },
    { name: 'Anti-Magic Field', type: 'trap', rarity: 'rare', stats: 0, icon: 'rune', effect: 'magic_suppression', value: 300 },
    { name: 'Mimic Chest', type: 'trap', rarity: 'very rare', stats: 35, icon: 'chest', effect: 'creature', value: 800 },
    { name: 'Alarm Rune', type: 'trap', rarity: 'common', stats: 5, icon: 'rune', effect: 'alert', value: 40 },
    { name: 'Web Trap', type: 'trap', rarity: 'uncommon', stats: 15, icon: 'web', effect: 'restrain', value: 100 },
    { name: 'Reverse Gravity Trap', type: 'trap', rarity: 'legendary', stats: 50, icon: 'rune', effect: 'gravity_reversal', value: 2000 },
    { name: 'Confusion Gas', type: 'trap', rarity: 'rare', stats: 25, icon: 'vial', effect: 'confusion', value: 400 },
    { name: 'Soul Jar Trap', type: 'trap', rarity: 'legendary', stats: 60, icon: 'urn', effect: 'soul_capture', value: 2500 },
];

export const POTIONS: Omit<Item, 'id'>[] = [
    { name: 'Health Potion', type: 'potion', rarity: 'common', stats: 15, icon: 'potion', effect: 'healing', value: 30 },
    { name: 'Greater Healing Potion', type: 'potion', rarity: 'uncommon', stats: 30, icon: 'potion', value: 75 },
    { name: 'Potion of Invisibility', type: 'potion', rarity: 'rare', stats: 0, icon: 'potion', effect: 'invisibility', value: 200 },
    { name: 'Elixir of Fire Breath', type: 'potion', rarity: 'very rare', stats: 40, icon: 'potion', effect: 'fire_breath', value: 500 },
    { name: 'Potion of Giant Strength', type: 'potion', rarity: 'rare', stats: 35, icon: 'potion', effect: 'strength_bonus', value: 300 },
    { name: 'Potion of Speed', type: 'potion', rarity: 'uncommon', stats: 25, icon: 'potion', effect: 'haste', value: 150 },
    { name: 'Potion of Flying', type: 'potion', rarity: 'very rare', stats: 0, icon: 'potion', effect: 'flight', value: 600 },
    { name: 'Poison', type: 'potion', rarity: 'common', stats: 10, icon: 'potion', effect: 'damage', value: 25 },
];

export const MYTHIC: Omit<Item, 'id'>[] = [
    { name: 'Cataclysm', type: 'weapon', rarity: 'legendary', stats: 70, icon: 'sword', effect: 'holy', value: 6000 }
];

export const ITEM_POOL: Omit<Item, 'id'>[] = [
    ...WEAPONS,
    ...ARMORS,
    ...TRAPS,
    ...POTIONS,
    ...MYTHIC
];

export const ENEMIES: Omit<Enemy, 'id' | 'reward'>[] = [
    { name: 'Goblin Scout', health: 30, power: 15, image: ENEMY_IMAGES['goblin_scout'], goldReward: 30 },
    { name: 'Stone Golem', health: 50, power: 25, image: ENEMY_IMAGES['stone_golem'], goldReward: 60 },
    { name: 'Dark Knight', health: 70, power: 35, image: ENEMY_IMAGES['dark_knight'], goldReward: 100 },
    { name: 'Dragon Whelp', health: 10, power: 5, image: ENEMY_IMAGES['dragon_whelp'], goldReward: 20 },
    { name: 'Shadow Stalker', health: 40, power: 20, image: ENEMY_IMAGES['shadow_stalker'], goldReward: 45 },
    { name: 'Venomfang Serpent', health: 55, power: 25, image: ENEMY_IMAGES['venomfang_serpent'], goldReward: 65 },
    { name: 'Cursed Revenant', health: 60, power: 30, image: ENEMY_IMAGES['cursed_revenant'], goldReward: 80 },
    { name: 'Inferno Imp', health: 25, power: 18, image: ENEMY_IMAGES['inferno_imp'], goldReward: 40 },
    { name: 'Frost Wraith', health: 50, power: 22, image: ENEMY_IMAGES['frost_wraith'], goldReward: 55 },
    { name: 'Medusa', health: 70, power: 30, image: ENEMY_IMAGES['medusa'], goldReward: 90 },
];

// Sample questions
export const QUESTIONS: Question[] = [
    {
        id: '1',
        category: 'Science',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        difficulty: 1
    },
    {
        id: '2',
        category: 'Movies/TV',
        question: 'Which movie won the Academy Award for Best Picture in 2020?',
        options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
        correctAnswer: 2,
        difficulty: 2
    },
    {
        id: '3',
        category: 'Geography',
        question: 'What is the capital of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 2,
        difficulty: 1
    },
    {
        id: '4',
        category: 'Science',
        question: 'How many planets are in our solar system?',
        options: ['7', '8', '9', '10'],
        correctAnswer: 1,
        difficulty: 1
    },
    {
        id: '5',
        category: 'Movies/TV',
        question: 'Who directed the movie "Inception"?',
        options: ['Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino'],
        correctAnswer: 1,
        difficulty: 2
    },
    {
        id: '6',
        category: 'Geography',
        question: 'Which is the longest river in the world?',
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correctAnswer: 1,
        difficulty: 2
    },
    {
        id: '7',
        category: 'Science',
        question: 'What is the speed of light in vacuum?',
        options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '499,792 km/s'],
        correctAnswer: 0,
        difficulty: 3
    }
];

export const generateRandomQuestion = (): Question => {
    return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
};
