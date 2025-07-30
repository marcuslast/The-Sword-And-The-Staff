// src/utils/gameData.ts - Enhanced with battle items
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
    // ... (keep your existing armor items)
    { name: 'Leather Armor', type: 'armor', rarity: 'common', stats: 12, icon: 'armor', value: 24 },
    { name: 'Chainmail', type: 'armor', rarity: 'uncommon', stats: 18, icon: 'armor', value: 90 },
    { name: 'Plate Armor', type: 'armor', rarity: 'rare', stats: 30, icon: 'armor', value: 400 },
    // Add more armor items as needed...
];

export const TRAPS: Omit<Item, 'id'>[] = [
    { name: 'Pit Trap', type: 'trap', rarity: 'common', stats: 10, icon: 'hole', effect: 'fall_damage', value: 50 },
    { name: 'Poison Dart Trap', type: 'trap', rarity: 'uncommon', stats: 20, icon: 'dart', effect: 'poison', value: 120 },
    // Add more traps as needed...
];

// ENHANCED BATTLE ITEMS - NEW SECTION
export const ENHANCED_BATTLE_ITEMS: Omit<Item, 'id'>[] = [
    // Healing Potions
    { name: 'Minor Health Potion', type: 'potion', rarity: 'common', stats: 20, icon: 'potion', effect: 'healing', value: 50 },
    { name: 'Health Potion', type: 'potion', rarity: 'common', stats: 35, icon: 'potion', effect: 'healing', value: 75 },
    { name: 'Greater Health Potion', type: 'potion', rarity: 'uncommon', stats: 50, icon: 'potion', effect: 'healing', value: 150 },
    { name: 'Superior Health Potion', type: 'potion', rarity: 'rare', stats: 75, icon: 'potion', effect: 'healing', value: 300 },
    { name: 'Master Health Potion', type: 'potion', rarity: 'very rare', stats: 100, icon: 'potion', effect: 'healing', value: 500 },

    // Poison Items
    { name: 'Basic Poison Vial', type: 'consumable', rarity: 'common', stats: 15, icon: 'vial', effect: 'weapon_poison', value: 80 },
    { name: 'Deadly Poison', type: 'consumable', rarity: 'uncommon', stats: 25, icon: 'vial', effect: 'weapon_poison', value: 150 },
    { name: 'Serpent\'s Venom', type: 'consumable', rarity: 'rare', stats: 40, icon: 'vial', effect: 'weapon_poison', value: 300 },
    { name: 'Wyvern Toxin', type: 'consumable', rarity: 'very rare', stats: 60, icon: 'vial', effect: 'weapon_poison', value: 600 },

    // Damage Poisons (immediate effect)
    { name: 'Poison Dart', type: 'consumable', rarity: 'common', stats: 20, icon: 'dart', effect: 'poison_damage', value: 60 },
    { name: 'Toxic Cloud', type: 'consumable', rarity: 'uncommon', stats: 35, icon: 'vial', effect: 'poison_damage', value: 120 },
    { name: 'Acid Bomb', type: 'consumable', rarity: 'rare', stats: 50, icon: 'vial', effect: 'acid_damage', value: 250 },

    // Buff Potions
    { name: 'Potion of Strength', type: 'consumable', rarity: 'uncommon', stats: 15, icon: 'potion', effect: 'attack_boost', value: 200 },
    { name: 'Potion of Iron Skin', type: 'consumable', rarity: 'uncommon', stats: 10, icon: 'potion', effect: 'defense_boost', value: 180 },
    { name: 'Potion of Swiftness', type: 'consumable', rarity: 'uncommon', stats: 20, icon: 'potion', effect: 'speed_boost', value: 160 },
    { name: 'Berserker\'s Rage', type: 'consumable', rarity: 'rare', stats: 25, icon: 'potion', effect: 'berserk', value: 400 },

    // Utility Items
    { name: 'Smoke Bomb', type: 'consumable', rarity: 'common', stats: 0, icon: 'bomb', effect: 'miss_chance', value: 100 },
    { name: 'Flash Powder', type: 'consumable', rarity: 'uncommon', stats: 0, icon: 'powder', effect: 'blind_enemy', value: 150 },
    { name: 'Caltrops', type: 'consumable', rarity: 'common', stats: 10, icon: 'trap', effect: 'enemy_slow', value: 80 },

    // Special Combat Items
    { name: 'Alchemist Fire', type: 'consumable', rarity: 'uncommon', stats: 30, icon: 'fire', effect: 'fire_damage', value: 180 },
    { name: 'Holy Water', type: 'consumable', rarity: 'rare', stats: 45, icon: 'vial', effect: 'holy_damage', value: 300 },
    { name: 'Frost Bomb', type: 'consumable', rarity: 'rare', stats: 35, icon: 'ice', effect: 'ice_damage', value: 280 },

    // Emergency Items
    { name: 'Escape Powder', type: 'consumable', rarity: 'uncommon', stats: 0, icon: 'powder', effect: 'flee_battle', value: 250 },
    { name: 'Shield Potion', type: 'consumable', rarity: 'rare', stats: 50, icon: 'shield', effect: 'temp_shield', value: 350 },
    { name: 'Regeneration Elixir', type: 'consumable', rarity: 'very rare', stats: 15, icon: 'potion', effect: 'regeneration', value: 800 },
];

export const POTIONS: Omit<Item, 'id'>[] = [
    // Health Potions
    { name: 'Minor Health Potion', type: 'potion', rarity: 'common', stats: 15, icon: 'potion', effect: 'healing', value: 30 },
    { name: 'Health Potion', type: 'potion', rarity: 'common', stats: 25, icon: 'potion', effect: 'healing', value: 50 },
    { name: 'Greater Health Potion', type: 'potion', rarity: 'uncommon', stats: 40, icon: 'potion', effect: 'healing', value: 100 },
    { name: 'Superior Health Potion', type: 'potion', rarity: 'rare', stats: 60, icon: 'potion', effect: 'healing', value: 200 },
    { name: 'Master Health Potion', type: 'potion', rarity: 'very rare', stats: 80, icon: 'potion', effect: 'healing', value: 400 },
    { name: 'Elixir of Life', type: 'potion', rarity: 'legendary', stats: 100, icon: 'potion', effect: 'full_healing', value: 800 },

    // Damage Potions
    { name: 'Acid Vial', type: 'consumable', rarity: 'common', stats: 12, icon: 'potion', effect: 'acid_damage', value: 40 },
    { name: 'Alchemist\'s Fire', type: 'consumable', rarity: 'uncommon', stats: 18, icon: 'potion', effect: 'fire_damage', value: 80 },
    { name: 'Frost Bomb', type: 'consumable', rarity: 'uncommon', stats: 20, icon: 'potion', effect: 'cold_damage', value: 90 },
    { name: 'Lightning Bottle', type: 'consumable', rarity: 'rare', stats: 25, icon: 'potion', effect: 'lightning_damage', value: 150 },
    { name: 'Explosive Flask', type: 'consumable', rarity: 'rare', stats: 30, icon: 'potion', effect: 'explosive_damage', value: 200 },

    // Weapon Coatings
    { name: 'Poison Coating', type: 'consumable', rarity: 'common', stats: 8, icon: 'potion', effect: 'weapon_poison', value: 60 },
    { name: 'Serpent Venom', type: 'consumable', rarity: 'uncommon', stats: 12, icon: 'potion', effect: 'weapon_poison_strong', value: 120 },
    { name: 'Oil of Sharpness', type: 'consumable', rarity: 'uncommon', stats: 10, icon: 'potion', effect: 'weapon_sharpness', value: 100 },
    { name: 'Holy Water', type: 'consumable', rarity: 'rare', stats: 15, icon: 'potion', effect: 'weapon_holy', value: 180 },
    { name: 'Dragon\'s Flame Oil', type: 'consumable', rarity: 'rare', stats: 18, icon: 'potion', effect: 'weapon_fire', value: 220 },
    { name: 'Blessed Coating', type: 'consumable', rarity: 'very rare', stats: 20, icon: 'potion', effect: 'weapon_blessed', value: 350 },

    // Buff Potions
    { name: 'Potion of Strength', type: 'consumable', rarity: 'uncommon', stats: 15, icon: 'potion', effect: 'strength_boost', value: 100 },
    { name: 'Potion of Toughness', type: 'consumable', rarity: 'uncommon', stats: 15, icon: 'potion', effect: 'defense_boost', value: 100 },
    { name: 'Potion of Speed', type: 'consumable', rarity: 'uncommon', stats: 10, icon: 'potion', effect: 'speed_boost', value: 120 },
    { name: 'Berserker\'s Rage', type: 'consumable', rarity: 'rare', stats: 25, icon: 'potion', effect: 'rage_mode', value: 200 },
    { name: 'Potion of Giant Strength', type: 'consumable', rarity: 'very rare', stats: 30, icon: 'potion', effect: 'giant_strength', value: 400 },

    // Debuff Potions (to throw at enemies)
    { name: 'Weakness Poison', type: 'consumable', rarity: 'common', stats: 10, icon: 'potion', effect: 'enemy_weakness', value: 50 },
    { name: 'Confusion Gas', type: 'consumable', rarity: 'uncommon', stats: 12, icon: 'potion', effect: 'enemy_confusion', value: 80 },
    { name: 'Paralyzing Toxin', type: 'consumable', rarity: 'rare', stats: 15, icon: 'potion', effect: 'enemy_paralysis', value: 150 },
    { name: 'Mind Control Serum', type: 'consumable', rarity: 'very rare', stats: 20, icon: 'potion', effect: 'enemy_control', value: 300 },

    // Special Effect Potions
    { name: 'Potion of Invisibility', type: 'consumable', rarity: 'rare', stats: 0, icon: 'potion', effect: 'invisibility', value: 250 },
    { name: 'Potion of Flying', type: 'consumable', rarity: 'very rare', stats: 0, icon: 'potion', effect: 'flight', value: 400 },
    { name: 'Elixir of Fire Breath', type: 'consumable', rarity: 'very rare', stats: 35, icon: 'potion', effect: 'fire_breath', value: 500 },
    { name: 'Phoenix Tears', type: 'consumable', rarity: 'legendary', stats: 0, icon: 'potion', effect: 'resurrection', value: 1000 },
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
