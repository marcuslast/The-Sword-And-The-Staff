import {BattleState, Enemy, Player, BattleRound, Item, BattleEffect, PlayerStats} from '../types/game.types';
import {
    rollDice,
    calculateAttackModifier,
    calculateDefenseModifier,
    calculateDamage,
    calculateInitiative
} from '../utils/diceUtils';
import { calculateTotalStats } from '../utils/equipmentLogic';

export const useBattleLogic = () => {
    const initiateBattle = (enemy: Enemy, player: Player): BattleState => {
        const playerStats = calculateTotalStats(player);

        // Roll initiative
        const playerInitiative = calculateInitiative(playerStats.speed);
        const enemyInitiative = calculateInitiative(20);

        const isPlayerFirst = playerInitiative.total >= enemyInitiative.total;

        const initialState: BattleState = {
            enemy,
            playerHealth: player.health,
            playerMaxHealth: player.maxHealth,
            enemyHealth: enemy.health,
            enemyMaxHealth: enemy.health,
            rounds: [{
                playerRoll: playerInitiative,
                enemyRoll: enemyInitiative,
                isPlayerTurn: true,
                description: `Initiative rolls - You: ${playerInitiative.total}, ${enemy.name}: ${enemyInitiative.total}. ${isPlayerFirst ? 'You go first!' : 'Enemy goes first!'}`
            }],
            currentRound: 1,
            isPlayerTurn: isPlayerFirst,
            phase: isPlayerFirst ? 'player_attack' : 'enemy_attack',
            playerStats,
            playerEffects: [],
            enemyEffects: []
        };

        return initialState;
    };

    const applyEffects = (state: BattleState): BattleState => {
        let newState = { ...state };

        // Process player effects
        newState.playerEffects = newState.playerEffects.map(effect => {
            switch (effect.type) {
                case 'damage_over_time':
                    // Apply poison/burning damage
                    newState.playerHealth = Math.max(0, newState.playerHealth - effect.value);
                    break;
                case 'shield':
                    // Shield effects are passive, just track duration
                    break;
            }
            return { ...effect, duration: effect.duration - 1 };
        }).filter(effect => effect.duration > 0);

        // Process enemy effects
        newState.enemyEffects = newState.enemyEffects.map(effect => {
            switch (effect.type) {
                case 'damage_over_time':
                    newState.enemyHealth = Math.max(0, newState.enemyHealth - effect.value);
                    break;
            }
            return { ...effect, duration: effect.duration - 1 };
        }).filter(effect => effect.duration > 0);

        return newState;
    };

    const calculateEffectiveStats = (baseStats: PlayerStats, effects: BattleEffect[]): PlayerStats => {
        let effectiveStats = { ...baseStats };

        effects.forEach(effect => {
            switch (effect.type) {
                case 'stat_boost':
                    if (effect.name.includes('Strength') || effect.name.includes('Rage')) {
                        effectiveStats.attack += effect.value;
                    }
                    if (effect.name.includes('Defense')) {
                        effectiveStats.defense += effect.value;
                    }
                    if (effect.name === 'Berserker Rage') {
                        effectiveStats.defense -= 5; // Rage penalty
                    }
                    break;
            }
        });

        return effectiveStats;
    };

    const calculateWeaponDamage = (baseAttack: number, effects: BattleEffect[]): number => {
        let totalDamage = baseAttack;

        effects.forEach(effect => {
            if (effect.type === 'weapon_coating') {
                totalDamage += effect.value;
            }
        });

        return totalDamage;
    };

    const playerAttack = (state: BattleState): BattleState => {
        const effectiveStats = calculateEffectiveStats(state.playerStats, state.playerEffects);
        const attackModifier = calculateAttackModifier(effectiveStats);
        const attackRoll = rollDice('d20', attackModifier);

        // Check if enemy is confused and might miss player
        const enemyConfused = state.enemyEffects.some(e => e.name === 'Confused');
        const playerInvisible = state.playerEffects.some(e => e.name === 'Invisible');

        const enemyAC = 10 + Math.floor(state.enemy.power / 10);

        let newState = { ...state };
        let round: BattleRound;

        if (attackRoll.isCriticalFail) {
            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'),
                isPlayerTurn: true,
                description: `Critical fail! You stumble and miss completely!`
            };
        } else if (attackRoll.total >= enemyAC || attackRoll.isCritical) {
            let baseDamage = calculateDamage(effectiveStats.attack, attackRoll.isCritical);

            // Add weapon coating damage
            const weaponDamage = calculateWeaponDamage(baseDamage, state.playerEffects);

            newState.enemyHealth = Math.max(0, newState.enemyHealth - weaponDamage);

            let damageDescription = '';
            state.playerEffects.forEach(effect => {
                if (effect.type === 'weapon_coating') {
                    damageDescription += ` Your ${effect.name.toLowerCase()} adds ${effect.value} extra damage!`;
                }
            });

            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'),
                damage: weaponDamage,
                isPlayerTurn: true,
                description: attackRoll.isCritical
                    ? `CRITICAL HIT! Your attack devastates ${state.enemy.name}!${damageDescription}`
                    : `Hit! You strike ${state.enemy.name} with your weapon!${damageDescription}`
            };
        } else {
            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'),
                isPlayerTurn: true,
                description: `Miss! Your attack fails to connect (needed ${enemyAC}, rolled ${attackRoll.total}).`
            };
        }

        newState.rounds = [...newState.rounds, round];
        newState.currentRound++;

        // Apply ongoing effects
        newState = applyEffects(newState);

        // Check for victory
        if (newState.enemyHealth <= 0) {
            newState.phase = 'victory';
        } else {
            newState.phase = 'enemy_attack';
            newState.isPlayerTurn = false;
        }

        return newState;
    };

    const playerDefend = (state: BattleState): BattleState => {
        const defenseRoll = rollDice('d20', calculateDefenseModifier(state.playerStats));

        let round: BattleRound = {
            playerRoll: defenseRoll,
            enemyRoll: rollDice('d20'),
            isPlayerTurn: true,
            description: `You take a defensive stance, preparing for the enemy's attack. (+${Math.floor(defenseRoll.value / 4)} AC this turn)`
        };

        const newState = {
            ...state,
            rounds: [...state.rounds, round],
            currentRound: state.currentRound + 1,
            phase: 'enemy_attack' as const,
            isPlayerTurn: false
        };

        return newState;
    };

    const enemyAttack = (state: BattleState): BattleState => {
        // Check for enemy effects that might prevent attack
        const isConfused = state.enemyEffects.some(e => e.name === 'Confused');
        const playerInvisible = state.playerEffects.some(e => e.name === 'Invisible');

        let missChance = 0;
        if (isConfused) missChance += 50;
        if (playerInvisible) missChance = 100; // Always miss invisible targets

        const willMiss = Math.random() * 100 < missChance;

        if (willMiss) {
            const round: BattleRound = {
                playerRoll: rollDice('d20'),
                enemyRoll: rollDice('d20'),
                isPlayerTurn: false,
                description: isConfused
                    ? `${state.enemy.name} swings wildly in confusion and misses!`
                    : `${state.enemy.name} cannot see you and attacks thin air!`
            };

            const newState = {
                ...state,
                rounds: [...state.rounds, round],
                currentRound: state.currentRound + 1,
                phase: 'player_attack' as const,
                isPlayerTurn: true
            };

            return applyEffects(newState);
        }

        // Normal enemy attack logic with effect modifications
        let enemyPower = state.enemy.power;
        state.enemyEffects.forEach(effect => {
            if (effect.type === 'stat_boost' && effect.name === 'Weakened') {
                enemyPower += effect.value; // effect.value is negative for weakened
            }
        });

        const enemyAttackModifier = Math.floor(enemyPower / 10);
        const enemyRoll = rollDice('d20', enemyAttackModifier);

        let playerAC = 10 + calculateDefenseModifier(state.playerStats);

        // Add defense bonuses from effects
        state.playerEffects.forEach(effect => {
            if (effect.type === 'stat_boost' && effect.name.includes('Defense')) {
                playerAC += Math.floor(effect.value / 2);
            }
        });

        let newState = { ...state };
        let round: BattleRound;

        if (enemyRoll.total >= playerAC || enemyRoll.isCritical) {
            let damage = Math.floor(enemyPower / 5) + rollDice('d6').value;
            const critDamage = enemyRoll.isCritical ? damage * 2 : damage;

            // Apply damage reduction from effects
            let finalDamage = critDamage;
            state.playerEffects.forEach(effect => {
                if (effect.type === 'stat_boost' && effect.name.includes('Defense')) {
                    finalDamage = Math.max(1, finalDamage - Math.floor(effect.value / 3));
                }
            });

            newState.playerHealth = Math.max(0, newState.playerHealth - finalDamage);

            round = {
                playerRoll: rollDice('d20'),
                enemyRoll: enemyRoll,
                damage: finalDamage,
                isPlayerTurn: false,
                description: enemyRoll.isCritical
                    ? `CRITICAL! ${state.enemy.name} lands a devastating blow!`
                    : `${state.enemy.name} hits you with a fierce attack!`
            };
        } else {
            round = {
                playerRoll: rollDice('d20'),
                enemyRoll: enemyRoll,
                isPlayerTurn: false,
                description: `${state.enemy.name}'s attack misses! (needed ${playerAC}, rolled ${enemyRoll.total})`
            };
        }

        newState.rounds = [...newState.rounds, round];
        newState.currentRound++;

        // Apply ongoing effects
        newState = applyEffects(newState);

        // Check for defeat
        if (newState.playerHealth <= 0) {
            newState.phase = 'defeat';
        } else {
            newState.phase = 'player_attack';
            newState.isPlayerTurn = true;
        }

        return newState;
    };

    const resolveBattle = (state: BattleState): { playerWon: boolean; damage: number } => {
        const playerWon = state.phase === 'victory';
        const totalDamage = state.playerMaxHealth - state.playerHealth;

        return {
            playerWon,
            damage: totalDamage
        };
    };

    const playerUseItem = (state: BattleState, item: Item): BattleState => {
        let newState = { ...state };
        let description = `Used ${item.name}`;
        let effectApplied = false;

        // Handle different item effects
        switch (item.effect) {
            // Healing items
            case 'healing':
                const healAmount = item.stats;
                const oldHealth = newState.playerHealth;
                newState.playerHealth = Math.min(newState.playerMaxHealth, newState.playerHealth + healAmount);
                const actualHealing = newState.playerHealth - oldHealth;
                description += `, healing for ${actualHealing} HP!`;
                effectApplied = true;
                break;

            case 'full_healing':
                newState.playerHealth = newState.playerMaxHealth;
                description += `, fully restoring your health!`;
                effectApplied = true;
                break;

            // Direct damage items (thrown at enemy)
            case 'acid_damage':
            case 'fire_damage':
            case 'cold_damage':
            case 'lightning_damage':
            case 'explosive_damage':
                const damage = item.stats + Math.floor(Math.random() * 6) + 1; // Add some randomness
                newState.enemyHealth = Math.max(0, newState.enemyHealth - damage);
                description += `, dealing ${damage} ${item.effect.split('_')[0]} damage to ${state.enemy.name}!`;
                effectApplied = true;
                break;

            // Weapon coatings
            case 'weapon_poison':
            case 'weapon_poison_strong':
                newState.playerEffects.push({
                    type: 'weapon_coating',
                    name: 'Poisoned Weapon',
                    duration: 3,
                    value: item.stats,
                    description: `Your weapon drips with poison (+${item.stats} poison damage per hit)`
                });
                description += `, coating your weapon with deadly poison!`;
                effectApplied = true;
                break;

            case 'weapon_sharpness':
                newState.playerEffects.push({
                    type: 'weapon_coating',
                    name: 'Sharpened Weapon',
                    duration: 4,
                    value: item.stats,
                    description: `Your weapon gleams with razor sharpness (+${item.stats} damage)`
                });
                description += `, sharpening your weapon to a deadly edge!`;
                effectApplied = true;
                break;

            case 'weapon_holy':
                newState.playerEffects.push({
                    type: 'weapon_coating',
                    name: 'Blessed Weapon',
                    duration: 4,
                    value: item.stats,
                    description: `Your weapon glows with holy light (+${item.stats} holy damage)`
                });
                description += `, blessing your weapon with divine power!`;
                effectApplied = true;
                break;

            case 'weapon_fire':
                newState.playerEffects.push({
                    type: 'weapon_coating',
                    name: 'Flaming Weapon',
                    duration: 5,
                    value: item.stats,
                    description: `Your weapon ignites with flame (+${item.stats} fire damage)`
                });
                description += `, setting your weapon ablaze!`;
                effectApplied = true;
                break;

            // Buff effects
            case 'strength_boost':
                newState.playerEffects.push({
                    type: 'stat_boost',
                    name: 'Enhanced Strength',
                    duration: 3,
                    value: item.stats,
                    description: `+${item.stats} attack damage`
                });
                description += `, surging with enhanced strength!`;
                effectApplied = true;
                break;

            case 'defense_boost':
                newState.playerEffects.push({
                    type: 'stat_boost',
                    name: 'Enhanced Defense',
                    duration: 3,
                    value: item.stats,
                    description: `+${item.stats} damage reduction`
                });
                description += `, your skin hardening like armor!`;
                effectApplied = true;
                break;

            case 'rage_mode':
                newState.playerEffects.push({
                    type: 'stat_boost',
                    name: 'Berserker Rage',
                    duration: 4,
                    value: item.stats,
                    description: `+${item.stats} attack, -5 defense`
                });
                description += `, entering a berserker rage!`;
                effectApplied = true;
                break;

            // Enemy debuffs
            case 'enemy_weakness':
                newState.enemyEffects.push({
                    type: 'stat_boost',
                    name: 'Weakened',
                    duration: 3,
                    value: -item.stats,
                    description: `${state.enemy.name} is weakened (-${item.stats} attack)`
                });
                description += `, weakening ${state.enemy.name}!`;
                effectApplied = true;
                break;

            case 'enemy_confusion':
                newState.enemyEffects.push({
                    type: 'special',
                    name: 'Confused',
                    duration: 2,
                    value: 50, // 50% chance to miss
                    description: `${state.enemy.name} is confused (50% miss chance)`
                });
                description += `, confusing ${state.enemy.name}!`;
                effectApplied = true;
                break;

            // Special effects
            case 'invisibility':
                newState.playerEffects.push({
                    type: 'special',
                    name: 'Invisible',
                    duration: 2,
                    value: 0,
                    description: 'You are invisible (enemy attacks miss)'
                });
                description += `, vanishing from sight!`;
                effectApplied = true;
                break;

            case 'fire_breath':
                const breathDamage = item.stats;
                newState.enemyHealth = Math.max(0, newState.enemyHealth - breathDamage);
                // Also apply burning effect
                newState.enemyEffects.push({
                    type: 'damage_over_time',
                    name: 'Burning',
                    duration: 3,
                    value: Math.floor(item.stats / 4),
                    description: `Taking ${Math.floor(item.stats / 4)} fire damage per turn`
                });
                description += `, breathing fire for ${breathDamage} damage and setting ${state.enemy.name} ablaze!`;
                effectApplied = true;
                break;

            default:
                description += `, but it had no effect in battle.`;
                break;
        }

        if (!effectApplied) {
            description += ` ${item.name} cannot be used in battle.`;
        }

        const round: BattleRound = {
            playerRoll: rollDice('d20'),
            enemyRoll: rollDice('d20'),
            isPlayerTurn: true,
            description
        };

        newState.rounds = [...newState.rounds, round];
        newState.currentRound++;
        newState.phase = 'enemy_attack';
        newState.isPlayerTurn = false;

        // Apply ongoing effects
        newState = applyEffects(newState);

        return newState;
    };

    return {
        initiateBattle,
        playerAttack,
        playerDefend,
        enemyAttack,
        resolveBattle,
        playerUseItem
    };
};
