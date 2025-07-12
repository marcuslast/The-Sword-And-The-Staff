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
    { name: 'Wooden Sword', type: 'weapon', rarity: 'common', stats: 10, icon: 'sword' },
    { name: 'Rusty Dagger', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger' },
    { name: 'Hunting Bow', type: 'weapon', rarity: 'common', stats: 12, icon: 'bow' },
    { name: 'Stone Club', type: 'weapon', rarity: 'common', stats: 9, icon: 'club' },
    { name: 'Copper Shortsword', type: 'weapon', rarity: 'common', stats: 11, icon: 'sword' },
    { name: 'Wooden Spear', type: 'weapon', rarity: 'common', stats: 10, icon: 'spear' },
    { name: 'Bone Knife', type: 'weapon', rarity: 'common', stats: 7, icon: 'dagger' },
    { name: 'Sling', type: 'weapon', rarity: 'common', stats: 6, icon: 'sling' },
    { name: 'Iron Mace', type: 'weapon', rarity: 'common', stats: 13, icon: 'mace' },
    { name: 'Hatchet', type: 'weapon', rarity: 'common', stats: 12, icon: 'axe' },
    { name: 'Pitchfork', type: 'weapon', rarity: 'common', stats: 11, icon: 'spear' },
    { name: 'Wooden Staff', type: 'weapon', rarity: 'common', stats: 9, icon: 'staff' },
    { name: 'Flint Knife', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger' },
    { name: 'Iron Dagger', type: 'weapon', rarity: 'common', stats: 10, icon: 'dagger' },
    { name: 'Short Bow', type: 'weapon', rarity: 'common', stats: 11, icon: 'bow' },
    { name: 'Hand Axe', type: 'weapon', rarity: 'common', stats: 12, icon: 'axe' },
    { name: 'Iron Shortsword', type: 'weapon', rarity: 'common', stats: 14, icon: 'sword' },
    { name: 'Wooden Mallet', type: 'weapon', rarity: 'common', stats: 10, icon: 'hammer' },
    { name: 'Iron Spear', type: 'weapon', rarity: 'common', stats: 13, icon: 'spear' },
    { name: 'Cudgel', type: 'weapon', rarity: 'common', stats: 9, icon: 'club' },
    { name: 'Sickle', type: 'weapon', rarity: 'common', stats: 10, icon: 'sickle' },
    { name: 'Iron Hatchet', type: 'weapon', rarity: 'common', stats: 13, icon: 'axe' },
    { name: 'Throwing Knives', type: 'weapon', rarity: 'common', stats: 8, icon: 'dagger' },
    { name: 'Iron Flail', type: 'weapon', rarity: 'common', stats: 14, icon: 'flail' },
    { name: 'Wooden Baton', type: 'weapon', rarity: 'common', stats: 7, icon: 'club' },
    { name: 'Iron Rapier', type: 'weapon', rarity: 'common', stats: 15, icon: 'sword' },
    { name: 'Hooked Spear', type: 'weapon', rarity: 'common', stats: 12, icon: 'spear' },
    { name: 'Stone Axe', type: 'weapon', rarity: 'common', stats: 11, icon: 'axe' },
    { name: 'Iron Cleaver', type: 'weapon', rarity: 'common', stats: 13, icon: 'axe' },
    { name: 'Bone Club', type: 'weapon', rarity: 'common', stats: 8, icon: 'club' },

    // Uncommon Weapons (20 items)
    { name: 'Elven Longbow', type: 'weapon', rarity: 'uncommon', stats: 18, icon: 'bow' },
    { name: 'Lightning Javelin', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'spear', effect: 'lightning_damage' },
    { name: 'Dwarven Warhammer', type: 'weapon', rarity: 'uncommon', stats: 24, icon: 'hammer' },
    { name: 'Steel Longsword', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'sword' },
    { name: 'Silver Dagger', type: 'weapon', rarity: 'uncommon', stats: 18, icon: 'dagger', effect: 'undead_damage' },
    { name: 'Composite Bow', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'bow' },
    { name: 'Morningstar', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'mace' },
    { name: 'Scimitar', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword' },
    { name: 'War Pick', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'pick' },
    { name: 'Halberd', type: 'weapon', rarity: 'uncommon', stats: 23, icon: 'halberd' },
    { name: 'Crossbow', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'crossbow' },
    { name: 'Falchion', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword' },
    { name: 'Battleaxe', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'axe' },
    { name: 'Glaive', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'glaive' },
    { name: 'War Scythe', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'scythe' },
    { name: 'Estoc', type: 'weapon', rarity: 'uncommon', stats: 19, icon: 'sword' },
    { name: 'Heavy Flail', type: 'weapon', rarity: 'uncommon', stats: 22, icon: 'flail' },
    { name: 'Bastard Sword', type: 'weapon', rarity: 'uncommon', stats: 21, icon: 'sword' },
    { name: 'Recurve Bow', type: 'weapon', rarity: 'uncommon', stats: 20, icon: 'bow' },
    { name: 'Double-headed Axe', type: 'weapon', rarity: 'uncommon', stats: 23, icon: 'axe' },

    // Rare Weapons (10 items)
    { name: 'Mystic Staff', type: 'weapon', rarity: 'rare', stats: 25, icon: 'wand' },
    { name: 'Flame Tongue', type: 'weapon', rarity: 'rare', stats: 30, icon: 'sword', effect: 'fire_damage' },
    { name: 'Frost Brand', type: 'weapon', rarity: 'rare', stats: 28, icon: 'axe', effect: 'cold_resistance' },
    { name: 'Assassin\'s Blade', type: 'weapon', rarity: 'rare', stats: 26, icon: 'dagger', effect: 'critical_hit' },
    { name: 'Vampiric Sword', type: 'weapon', rarity: 'rare', stats: 27, icon: 'sword', effect: 'life_steal' },
    { name: 'Serpent\'s Fang', type: 'weapon', rarity: 'rare', stats: 25, icon: 'dagger', effect: 'poison' },
    { name: 'Thunder Hammer', type: 'weapon', rarity: 'rare', stats: 29, icon: 'hammer', effect: 'shockwave' },
    { name: 'Moonlight Glaive', type: 'weapon', rarity: 'rare', stats: 26, icon: 'glaive', effect: 'night_power' },
    { name: 'Phoenix Bow', type: 'weapon', rarity: 'rare', stats: 27, icon: 'bow', effect: 'fire_arrows' },
    { name: 'Duskblade', type: 'weapon', rarity: 'rare', stats: 28, icon: 'sword', effect: 'shadow_strike' },

    // Very Rare Weapons (5 items)
    { name: 'Dragon Crown', type: 'armor', rarity: 'very rare', stats: 30, icon: 'crown' },
    { name: 'Soul Reaver', type: 'weapon', rarity: 'very rare', stats: 35, icon: 'scythe', effect: 'soul_drain' },
    { name: 'Celestial Blade', type: 'weapon', rarity: 'very rare', stats: 38, icon: 'sword', effect: 'holy_damage' },
    { name: 'Titan\'s Maul', type: 'weapon', rarity: 'very rare', stats: 40, icon: 'hammer', effect: 'armor_shatter' },
    { name: 'Stormcaller', type: 'weapon', rarity: 'very rare', stats: 36, icon: 'spear', effect: 'lightning_storm' },

    // Legendary Weapons (5 items)
    { name: 'Eternal Gem', type: 'weapon', rarity: 'legendary', stats: 50, icon: 'gem' },
    { name: 'Vorpal Sword', type: 'weapon', rarity: 'legendary', stats: 45, icon: 'sword', effect: 'decapitation_chance' },
    { name: 'Staff of the Magi', type: 'weapon', rarity: 'legendary', stats: 50, icon: 'staff', effect: 'spell_absorption' },
    { name: 'Holy Avenger', type: 'weapon', rarity: 'legendary', stats: 48, icon: 'sword', effect: 'evil_smite' },
    { name: 'Doombringer', type: 'weapon', rarity: 'legendary', stats: 55, icon: 'greatsword', effect: 'doom' }
];

export const ARMORS: Omit<Item, 'id'>[] = [
    // Common Armors (25 items)
    { name: 'Leather Armor', type: 'armor', rarity: 'common', stats: 12, icon: 'armor' },
    { name: 'Padded Armor', type: 'armor', rarity: 'common', stats: 10, icon: 'armor' },
    { name: 'Hide Armor', type: 'armor', rarity: 'common', stats: 11, icon: 'armor' },
    { name: 'Studded Leather', type: 'armor', rarity: 'common', stats: 13, icon: 'armor' },
    { name: 'Ringmail', type: 'armor', rarity: 'common', stats: 14, icon: 'armor' },
    { name: 'Brigandine', type: 'armor', rarity: 'common', stats: 15, icon: 'armor' },
    { name: 'Gambeson', type: 'armor', rarity: 'common', stats: 12, icon: 'armor' },
    { name: 'Scale Mail', type: 'armor', rarity: 'common', stats: 16, icon: 'armor' },
    { name: 'Quilted Armor', type: 'armor', rarity: 'common', stats: 11, icon: 'armor' },
    { name: 'Leather Helm', type: 'armor', rarity: 'common', stats: 8, icon: 'helmet' },
    { name: 'Iron Cap', type: 'armor', rarity: 'common', stats: 9, icon: 'helmet' },
    { name: 'Buckler', type: 'armor', rarity: 'common', stats: 10, icon: 'shield' },
    { name: 'Wooden Shield', type: 'armor', rarity: 'common', stats: 12, icon: 'shield' },
    { name: 'Leather Gloves', type: 'armor', rarity: 'common', stats: 7, icon: 'gloves' },
    { name: 'Iron Bracers', type: 'armor', rarity: 'common', stats: 9, icon: 'bracers' },
    { name: 'Cloth Robe', type: 'armor', rarity: 'common', stats: 8, icon: 'robe' },
    { name: 'Leather Boots', type: 'armor', rarity: 'common', stats: 7, icon: 'boots' },
    { name: 'Iron Greaves', type: 'armor', rarity: 'common', stats: 10, icon: 'greaves' },
    { name: 'Wool Cloak', type: 'armor', rarity: 'common', stats: 6, icon: 'cloak' },
    { name: 'Chain Coif', type: 'armor', rarity: 'common', stats: 11, icon: 'helmet' },
    { name: 'Hide Shield', type: 'armor', rarity: 'common', stats: 11, icon: 'shield' },
    { name: 'Iron Pauldrons', type: 'armor', rarity: 'common', stats: 9, icon: 'pauldrons' },
    { name: 'Leather Belt', type: 'armor', rarity: 'common', stats: 5, icon: 'belt' },
    { name: 'Iron Boots', type: 'armor', rarity: 'common', stats: 10, icon: 'boots' },
    { name: 'Wooden Mask', type: 'armor', rarity: 'common', stats: 6, icon: 'mask' },

    // Uncommon Armors (15 items)
    { name: 'Chainmail', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'armor' },
    { name: 'Boots of Speed', type: 'armor', rarity: 'uncommon', stats: 15, icon: 'boots', effect: 'movement_bonus' },
    { name: 'Bracers of Defense', type: 'armor', rarity: 'uncommon', stats: 22, icon: 'bracers' },
    { name: 'Splint Mail', type: 'armor', rarity: 'uncommon', stats: 20, icon: 'armor' },
    { name: 'Half Plate', type: 'armor', rarity: 'uncommon', stats: 22, icon: 'armor' },
    { name: 'Steel Shield', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'shield' },
    { name: 'Silvered Armor', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'armor', effect: 'lycanthrope_protection' },
    { name: 'Mithral Shirt', type: 'armor', rarity: 'uncommon', stats: 17, icon: 'armor', effect: 'no_stealth_penalty' },
    { name: 'Tower Shield', type: 'armor', rarity: 'uncommon', stats: 20, icon: 'shield' },
    { name: 'Dragonhide Armor', type: 'armor', rarity: 'uncommon', stats: 21, icon: 'armor' },
    { name: 'Spiked Armor', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'armor', effect: 'melee_retaliation' },
    { name: 'Knight\'s Helm', type: 'armor', rarity: 'uncommon', stats: 16, icon: 'helmet' },
    { name: 'Elven Chain', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'armor' },
    { name: 'Sentinel Shield', type: 'armor', rarity: 'uncommon', stats: 19, icon: 'shield', effect: 'perception_bonus' },
    { name: 'Mariner\'s Armor', type: 'armor', rarity: 'uncommon', stats: 17, icon: 'armor', effect: 'swimming_bonus' },

    // Rare Armors (8 items)
    { name: 'Cloak of Protection', type: 'armor', rarity: 'rare', stats: 25, icon: 'cloak', effect: 'magic_resistance' },
    { name: 'Helm of Comprehending Languages', type: 'armor', rarity: 'rare', stats: 20, icon: 'helmet', effect: 'language_comprehension' },
    { name: 'Shield of Missile Attraction', type: 'armor', rarity: 'rare', stats: 28, icon: 'shield', effect: 'missile_attraction' },
    { name: 'Plate Armor', type: 'armor', rarity: 'rare', stats: 30, icon: 'armor' },
    { name: 'Demonhide Armor', type: 'armor', rarity: 'rare', stats: 27, icon: 'armor', effect: 'fire_resistance' },
    { name: 'Wings of Flying', type: 'armor', rarity: 'rare', stats: 15, icon: 'cloak', effect: 'flight' },
    { name: 'Armor of Resistance', type: 'armor', rarity: 'rare', stats: 25, icon: 'armor', effect: 'elemental_resistance' },
    { name: 'Helm of Telepathy', type: 'armor', rarity: 'rare', stats: 18, icon: 'helmet', effect: 'mind_reading' },

    // Very Rare Armors (5 items)
    { name: 'Plate Armor of Etherealness', type: 'armor', rarity: 'legendary', stats: 40, icon: 'armor', effect: 'phase_shift' },
    { name: 'Dragon Scale Mail', type: 'armor', rarity: 'very rare', stats: 35, icon: 'armor', effect: 'elemental_resistance' },
    { name: 'Armor of Invulnerability', type: 'armor', rarity: 'very rare', stats: 38, icon: 'armor', effect: 'damage_reduction' },
    { name: 'Mirror Shield', type: 'armor', rarity: 'very rare', stats: 32, icon: 'shield', effect: 'spell_reflection' },
    { name: 'Celestial Armor', type: 'armor', rarity: 'very rare', stats: 36, icon: 'armor', effect: 'radiant_aura' },

    // Legendary Armors (5 items)
    { name: 'Robe of the Archmagi', type: 'armor', rarity: 'legendary', stats: 45, icon: 'robe', effect: 'spell_power' },
    { name: 'Armor of the Gods', type: 'armor', rarity: 'legendary', stats: 50, icon: 'armor', effect: 'divine_protection' },
    { name: 'Shield of the Aegis', type: 'armor', rarity: 'legendary', stats: 40, icon: 'shield', effect: 'absolute_defense' },
    { name: 'Crown of Stars', type: 'armor', rarity: 'legendary', stats: 35, icon: 'crown', effect: 'stellar_power' },
    { name: 'Phoenix Armor', type: 'armor', rarity: 'legendary', stats: 42, icon: 'armor', effect: 'rebirth' }
];

export const TRAPS: Omit<Item, 'id'>[] = [
    { name: 'Pit Trap', type: 'trap', rarity: 'common', stats: 10, icon: 'hole', effect: 'fall_damage' },
    { name: 'Poison Dart Trap', type: 'trap', rarity: 'uncommon', stats: 20, icon: 'dart', effect: 'poison' },
    { name: 'Anti-Magic Field', type: 'trap', rarity: 'rare', stats: 0, icon: 'rune', effect: 'magic_suppression' },
    { name: 'Mimic Chest', type: 'trap', rarity: 'very rare', stats: 35, icon: 'chest', effect: 'creature' },
    { name: 'Alarm Rune', type: 'trap', rarity: 'common', stats: 5, icon: 'rune', effect: 'alert' },
    { name: 'Web Trap', type: 'trap', rarity: 'uncommon', stats: 15, icon: 'web', effect: 'restrain' },
    { name: 'Reverse Gravity Trap', type: 'trap', rarity: 'legendary', stats: 50, icon: 'rune', effect: 'gravity_reversal' },
    { name: 'Confusion Gas', type: 'trap', rarity: 'rare', stats: 25, icon: 'vial', effect: 'confusion' },
    { name: 'Soul Jar Trap', type: 'trap', rarity: 'legendary', stats: 60, icon: 'urn', effect: 'soul_capture' },
];

export const POTIONS: Omit<Item, 'id'>[] = [
    { name: 'Health Potion', type: 'potion', rarity: 'common', stats: 15, icon: 'potion', effect: 'healing' },
    { name: 'Greater Healing Potion', type: 'potion', rarity: 'uncommon', stats: 30, icon: 'potion' },
    { name: 'Potion of Invisibility', type: 'potion', rarity: 'rare', stats: 0, icon: 'potion', effect: 'invisibility' },
    { name: 'Elixir of Fire Breath', type: 'potion', rarity: 'very rare', stats: 40, icon: 'potion', effect: 'fire_breath' },
    { name: 'Potion of Giant Strength', type: 'potion', rarity: 'rare', stats: 35, icon: 'potion', effect: 'strength_bonus' },
    { name: 'Potion of Speed', type: 'potion', rarity: 'uncommon', stats: 25, icon: 'potion', effect: 'haste' },
    { name: 'Potion of Flying', type: 'potion', rarity: 'very rare', stats: 0, icon: 'potion', effect: 'flight' },
    { name: 'Poison', type: 'potion', rarity: 'common', stats: 10, icon: 'potion', effect: 'damage' },
];

export const MYTHIC: Omit<Item, 'id'>[] = [
    { name: 'Cataclysm', type: 'weapon', rarity: 'legendary', stats: 70, icon: 'sword', effect: 'holy' },
]

export const ITEM_POOL: Omit<Item, 'id'>[] = [
    ...WEAPONS,
    ...ARMORS,
    ...TRAPS,
    ...POTIONS,
    ...MYTHIC
];

export const ENEMIES: Omit<Enemy, 'id' | 'reward'>[] = [
    { name: 'Goblin Scout', health: 30, power: 15, image: ENEMY_IMAGES['goblin_scout'] },
    { name: 'Stone Golem', health: 50, power: 25, image: ENEMY_IMAGES['stone_golem'] },
    { name: 'Dark Knight', health: 70, power: 35, image: ENEMY_IMAGES['dark_knight'] },
    { name: 'Dragon Whelp', health: 10, power: 5, image: ENEMY_IMAGES['dragon_whelp'] },
    { name: 'Shadow Stalker', health: 40, power: 20, image: ENEMY_IMAGES['shadow_stalker'] },
    { name: 'Venomfang Serpent', health: 55, power: 25, image: ENEMY_IMAGES['venomfang_serpent'] },
    { name: 'Cursed Revenant', health: 60, power: 30, image: ENEMY_IMAGES['cursed_revenant'] },
    { name: 'Inferno Imp', health: 25, power: 18, image: ENEMY_IMAGES['inferno_imp'] },
    { name: 'Frost Wraith', health: 50, power: 22, image: ENEMY_IMAGES['frost_wraith'] },
    { name: 'Medusa', health: 70, power: 30, image: ENEMY_IMAGES['medusa'] },
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
