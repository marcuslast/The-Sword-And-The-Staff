// src/utils/diceUtils.ts

import { DiceRoll, PlayerStats } from '../types/game.types';

export const rollDice = (type: DiceRoll['type'], modifier: number = 0): DiceRoll => {
    const diceValues = {
        'd4': 4,
        'd6': 6,
        'd8': 8,
        'd10': 10,
        'd12': 12,
        'd20': 20
    };

    const maxValue = diceValues[type];
    const value = Math.floor(Math.random() * maxValue) + 1;

    return {
        type,
        value,
        modifier,
        total: value + modifier,
        isCritical: type === 'd20' && value === 20,
        isCriticalFail: type === 'd20' && value === 1
    };
};

export const rollMultipleDice = (count: number, type: DiceRoll['type'], modifier: number = 0): number => {
    let total = modifier;
    for (let i = 0; i < count; i++) {
        const roll = rollDice(type, 0);
        total += roll.value;
    }
    return total;
};

export const calculateAttackModifier = (stats: PlayerStats): number => {
    // Attack modifier based on stats
    return Math.floor((stats.attack - 10) / 2);
};

export const calculateDefenseModifier = (stats: PlayerStats): number => {
    // Defense/AC modifier based on stats
    return Math.floor((stats.defense - 10) / 2);
};

export const calculateDamage = (weaponDamage: number, isCritical: boolean = false): number => {
    // Base damage is 1d6 + weapon damage bonus
    const baseDamage = rollDice('d6').value + Math.floor(weaponDamage / 10);
    return isCritical ? baseDamage * 2 : baseDamage;
};

export const calculateInitiative = (speed: number): DiceRoll => {
    const speedModifier = Math.floor((speed - 10) / 2);
    return rollDice('d20', speedModifier);
};

export const getDiceIcon = (type: DiceRoll['type']): string => {
    const icons = {
        'd4': '△',
        'd6': '⬜',
        'd8': '◆',
        'd10': '⬟',
        'd12': '⬢',
        'd20': '⬡'
    };
    return icons[type] || '🎲';
};
