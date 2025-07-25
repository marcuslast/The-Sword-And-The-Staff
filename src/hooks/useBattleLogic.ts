import {BattleState, Enemy, Player, BattleRound, Item} from '../types/game.types';
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
        const enemyInitiative = calculateInitiative(20); // Enemy base speed

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
            playerStats
        };

        return initialState;
    };

    const playerAttack = (state: BattleState): BattleState => {
        const attackModifier = calculateAttackModifier(state.playerStats);
        const attackRoll = rollDice('d20', attackModifier);

        // Enemy AC is based on their power
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
            const damage = calculateDamage(state.playerStats.attack, attackRoll.isCritical);
            newState.enemyHealth = Math.max(0, newState.enemyHealth - damage);

            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'),
                damage,
                isPlayerTurn: true,
                description: attackRoll.isCritical
                    ? `CRITICAL HIT! Your attack devastates ${state.enemy.name}!`
                    : `Hit! You strike ${state.enemy.name} with your weapon!`
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
        const enemyAttackModifier = Math.floor(state.enemy.power / 10);
        const enemyRoll = rollDice('d20', enemyAttackModifier);

        const playerAC = 10 + calculateDefenseModifier(state.playerStats);

        let newState = { ...state };
        let round: BattleRound;

        if (enemyRoll.total >= playerAC || enemyRoll.isCritical) {
            const damage = Math.floor(state.enemy.power / 5) + rollDice('d6').value;
            const critDamage = enemyRoll.isCritical ? damage * 2 : damage;
            newState.playerHealth = Math.max(0, newState.playerHealth - critDamage);

            round = {
                playerRoll: rollDice('d20'),
                enemyRoll: enemyRoll,
                damage: critDamage,
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

        // Handle different item types
        switch (item.type) {
            case 'potion':
                const healAmount = item.stats;
                newState.playerHealth = Math.min(
                    newState.playerMaxHealth,
                    newState.playerHealth + healAmount
                );
                description += `, healing for ${healAmount} HP!`;
                break;

            case 'consumable':
                // Apply temporary buffs
                description += `, gaining temporary power!`;
                break;

            case 'mythic':
                // Apply powerful effects
                description += `, unleashing ${item.effect || 'mythic power'}!`;
                break;

            default:
                description += `, but it had no effect in battle.`;
                break;
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
