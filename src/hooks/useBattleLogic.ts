import { useState, useEffect } from 'react';
import { BattleState, Enemy, Player, BattleRound } from '../types/game.types';
import {
    rollDice,
    calculateAttackModifier,
    calculateDefenseModifier,
    calculateDamage,
    calculateInitiative
} from '../utils/diceUtils';
import { calculateTotalStats } from '../utils/equipmentLogic';

export const useBattleLogic = () => {
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

        setBattleState(initialState);
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
            // Critical fail - miss and something bad happens
            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'), // Dummy roll for enemy
                isPlayerTurn: true,
                description: `Critical fail! You stumble and miss completely!`
            };
        } else if (attackRoll.total >= enemyAC || attackRoll.isCritical) {
            // Hit! Calculate damage
            const damage = calculateDamage(state.playerStats.attack, attackRoll.isCritical);
            newState.enemyHealth = Math.max(0, newState.enemyHealth - damage);

            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'), // Dummy roll
                damage,
                isPlayerTurn: true,
                description: attackRoll.isCritical
                    ? `CRITICAL HIT! Your attack devastates ${state.enemy.name}!`
                    : `Hit! You strike ${state.enemy.name} with your weapon!`
            };
        } else {
            // Miss
            round = {
                playerRoll: attackRoll,
                enemyRoll: rollDice('d20'), // Dummy roll
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
            // Enemy turn
            newState.phase = 'enemy_attack';
            newState.isPlayerTurn = false;
        }

        setBattleState(newState);
        return newState;
    };

    const playerDefend = (state: BattleState): BattleState => {
        // Defensive stance - gain temporary AC bonus but deal less damage
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

        setBattleState(newState);
        return newState;
    };

    const enemyAttack = (state: BattleState): BattleState => {
        // Calculate enemy attack
        const enemyAttackModifier = Math.floor(state.enemy.power / 10);
        const enemyRoll = rollDice('d20', enemyAttackModifier);

        // Player AC based on defense stats
        const playerAC = 10 + calculateDefenseModifier(state.playerStats);

        let newState = { ...state };
        let round: BattleRound;

        if (enemyRoll.total >= playerAC || enemyRoll.isCritical) {
            // Enemy hits
            const damage = Math.floor(state.enemy.power / 5) + rollDice('d6').value;
            const critDamage = enemyRoll.isCritical ? damage * 2 : damage;
            newState.playerHealth = Math.max(0, newState.playerHealth - critDamage);

            round = {
                playerRoll: rollDice('d20'), // Dummy roll
                enemyRoll: enemyRoll,
                damage: critDamage,
                isPlayerTurn: false,
                description: enemyRoll.isCritical
                    ? `CRITICAL! ${state.enemy.name} lands a devastating blow!`
                    : `${state.enemy.name} hits you with a fierce attack!`
            };
        } else {
            // Enemy misses
            round = {
                playerRoll: rollDice('d20'), // Dummy roll
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
            // Back to player turn
            newState.phase = 'player_attack';
            newState.isPlayerTurn = true;
        }

        setBattleState(newState);
        return newState;
    };

    const resolveBattle = (state: BattleState): { playerWon: boolean; damage: number } => {
        const playerWon = state.phase === 'victory';
        const totalDamage = state.playerMaxHealth - state.playerHealth;

        setBattleState(null);

        return {
            playerWon,
            damage: totalDamage
        };
    };

    // Auto process enemy turns
    useEffect(() => {
        if (battleState && battleState.phase === 'enemy_attack' && !isProcessing) {
            setIsProcessing(true);
            setTimeout(() => {
                enemyAttack(battleState);
                setIsProcessing(false);
            }, 2000);
        }
    }, [battleState, isProcessing]);

    return {
        battleState,
        initiateBattle,
        playerAttack,
        playerDefend,
        enemyAttack,
        resolveBattle,
        isProcessing
    };
};
