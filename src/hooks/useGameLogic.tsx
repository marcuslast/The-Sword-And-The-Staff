import { useState, useEffect } from 'react';
import {
    Item,
    Question,
    Player,
    GameState,
    ItemSlot,
    Tile
} from '../types/game.types';
import { createGameBoard, getAvailableTiles, getOrderedPathTiles, generateRandomItem } from '../utils/gameLogic';
import { PLAYER_COLORS, generateRandomQuestion } from '../utils/gameData';
import { getItemSlot, calculateTotalStats } from '../utils/equipmentLogic';
import { BattleState } from '../types/game.types';
import { useBattleLogic } from './useBattleLogic';

export const useGameLogic = () => {
    const [gameMode, setGameMode] = useState<'menu' | 'setup' | 'playing'>('menu');
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        currentPlayerId: '',
        board: [],
        phase: 'rolling',
        diceValue: null,
        currentQuestion: null,
        currentBattle: null,
        activeTrap: null,
        winner: null
    });
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [diceRolling, setDiceRolling] = useState(false);
    const [playerSetup, setPlayerSetup] = useState({ name: '', playerCount: 2 });
    const [availableTiles, setAvailableTiles] = useState<number[]>([]);
    const [isSelectingTile, setIsSelectingTile] = useState(false);
    const [currentReward, setCurrentReward] = useState<Item | null>(null);
    const [canEndTurn, setCanEndTurn] = useState(false);

    const battleLogic = useBattleLogic();

    const updateBattleState = (newBattleState: BattleState) => {
        setGameState(prev => ({
            ...prev,
            currentBattle: newBattleState
        }));
    };

    const completeBattle = (playerWon: boolean, battleState: BattleState) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        if (playerWon) {
            // Player wins - gets reward
            const reward = battleState.enemy.reward;
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? {
                            ...p,
                            inventory: [...p.inventory, reward],
                            stats: {
                                ...p.stats,
                                battlesWon: p.stats.battlesWon + 1
                            }
                        }
                        : p
                ),
                phase: 'reward',
                currentBattle: null
            }));
            setCurrentReward(reward);
        } else {
            // Player loses - takes damage
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? { ...p, health: Math.max(0, battleState.playerHealth) }
                        : p
                ),
                phase: 'rolling',
                currentBattle: null
            }));
            setCanEndTurn(true);
        }
    };

    // AI Logic Effect
    useEffect(() => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id === '1') return; // Not AI turn

        const handleAIAction = () => {
            switch (gameState.phase) {
                case 'rolling':
                    if (canEndTurn) {
                        const shouldContinue = !gameState.diceValue && Math.random() < 0.7;
                        if (shouldContinue) {
                            setTimeout(() => rollDice(), 1500);
                        } else {
                            setTimeout(() => endTurn(), 2000);
                        }
                    } else {
                        setTimeout(() => rollDice(), 1500);
                    }
                    break;

                case 'question':
                    if (!gameState.currentQuestion) return;
                    setTimeout(() => {
                        const randomAnswer = Math.floor(Math.random() * 4);
                        setSelectedAnswer(randomAnswer);
                        setShowResult(true);

                        const isCorrect = randomAnswer === gameState.currentQuestion!.correctAnswer;
                        setGameState(prev => ({
                            ...prev,
                            players: prev.players.map(p =>
                                p.id === currentPlayer.id
                                    ? {
                                        ...p,
                                        stats: {
                                            ...p.stats,
                                            questionsAnswered: p.stats.questionsAnswered + 1,
                                            correctAnswers: p.stats.correctAnswers + (isCorrect ? 1 : 0)
                                        }
                                    }
                                    : p
                            )
                        }));

                        setTimeout(() => {
                            setShowResult(false);
                            setSelectedAnswer(null);

                            if (isCorrect && gameState.diceValue) {
                                const availablePositions = getAvailableTiles(currentPlayer.position, gameState.diceValue, gameState.board);
                                setAvailableTiles(availablePositions);
                                setIsSelectingTile(true);
                                setGameState(prev => ({
                                    ...prev,
                                    phase: 'selecting_tile',
                                    currentQuestion: null
                                }));
                            } else {
                                setTimeout(() => endTurn(), 1000);
                            }
                        }, 2500);
                    }, 2000);
                    break;

                case 'selecting_tile':
                    if (availableTiles.length > 0) {
                        setTimeout(() => {
                            const randomTileIndex = Math.floor(Math.random() * availableTiles.length);
                            const selectedTile = availableTiles[randomTileIndex];
                            handleTileSelection(selectedTile);
                        }, 1500);
                    }
                    break;

                case 'battle':
                    if (gameState.currentBattle) {
                        // AI automatically attacks
                        setTimeout(() => {
                            if (gameState.currentBattle?.phase === 'player_attack') {
                                const newBattleState = battleLogic.playerAttack(gameState.currentBattle);
                                updateBattleState(newBattleState);

                                // Check if battle is over
                                if (newBattleState.phase === 'victory' || newBattleState.phase === 'defeat') {
                                    setTimeout(() => {
                                        const result = battleLogic.resolveBattle(newBattleState);
                                        completeBattle(result.playerWon, newBattleState);
                                    }, 2000);
                                }
                            }
                        }, 2000);
                    }
                    break;

                case 'reward':
                    setTimeout(() => {
                        setCurrentReward(null);
                        setCanEndTurn(true);
                        setGameState(prev => ({
                            ...prev,
                            phase: 'rolling'
                        }));
                    }, 3000);
                    break;
            }
        };

        if (!showResult && !currentReward) {
            handleAIAction();
        }
    }, [gameState.currentPlayerId, gameState.phase, gameState.currentQuestion, canEndTurn]);

    // Game Functions
    const startGame = () => {
        const newPlayers: Player[] = [
            {
                id: '1',
                username: playerSetup.name,
                position: 0,
                health: 100,
                maxHealth: 100,
                inventory: [],
                equipped: {},
                baseStats: {
                    attack: 10,
                    defense: 10,
                    health: 100,
                    speed: 10
                },
                stats: {
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    battlesWon: 0,
                    tilesMovedTotal: 0
                },
                color: PLAYER_COLORS[0],
                isActive: true
            }
        ];

        for (let i = 1; i < playerSetup.playerCount; i++) {
            newPlayers.push({
                id: `${i + 1}`,
                username: `AI Player ${i}`,
                position: 0,
                health: 100,
                maxHealth: 100,
                inventory: [],
                equipped: {},
                baseStats: {
                    attack: 10,
                    defense: 10,
                    health: 100,
                    speed: 10
                },
                stats: {
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    battlesWon: 0,
                    tilesMovedTotal: 0
                },
                color: PLAYER_COLORS[i],
                isActive: true
            });
        }

        setPlayers(newPlayers);
        setGameState(prev => ({
            ...prev,
            players: newPlayers,
            currentPlayerId: newPlayers[0].id,
            board: createGameBoard()
        }));
        setGameMode('playing');
    };

    const rollDice = () => {
        if (gameState.phase !== 'rolling') return;
        setDiceRolling(true);

        setTimeout(() => {
            const value = Math.floor(Math.random() * 6) + 1;
            setGameState(prev => ({
                ...prev,
                diceValue: value,
                phase: 'question'
            }));
            setDiceRolling(false);

            setTimeout(() => {
                const question = generateRandomQuestion();
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: question,
                    phase: 'question'
                }));
                setSelectedAnswer(null);
                setShowResult(false);
            }, 500);
        }, 1000);
    };

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !gameState.currentQuestion) return;

        setShowResult(true);
        const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        stats: {
                            ...p.stats,
                            questionsAnswered: p.stats.questionsAnswered + 1,
                            correctAnswers: p.stats.correctAnswers + (isCorrect ? 1 : 0)
                        }
                    }
                    : p
            )
        }));

        setTimeout(() => {
            setShowResult(false);
            setSelectedAnswer(null);

            if (isCorrect) {
                if (gameState.diceValue) {
                    const availablePositions = getAvailableTiles(currentPlayer.position, gameState.diceValue, gameState.board);
                    setAvailableTiles(availablePositions);
                    setIsSelectingTile(true);
                    setGameState(prev => ({
                        ...prev,
                        phase: 'selecting_tile',
                        currentQuestion: null
                    }));
                }
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: null,
                    phase: 'rolling',
                    diceValue: null
                }));
                endTurn();
            }
        }, 2000);
    };

    const handleTileSelection = (position: number) => {
        if (!isSelectingTile || !availableTiles.includes(position)) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const pathTiles = getOrderedPathTiles(gameState.board);
        const selectedTile = pathTiles[position];
        if (!selectedTile) return;

        // Clear selection state
        setIsSelectingTile(false);
        setAvailableTiles([]);

        // Update player position
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        position: position,
                        stats: {
                            ...p.stats,
                            tilesMovedTotal: p.stats.tilesMovedTotal + Math.abs(position - p.position)
                        }
                    }
                    : p
            ),
            diceValue: null
        }));

        // Handle tile effects
        setTimeout(() => {
            handleTileEffect(selectedTile, currentPlayer);
        }, 500);
    };


    const handleTileEffect = (tile: Tile, player: Player) => {
        switch (tile.type) {
            case 'battle':
                if (tile.enemy) {
                    const battleState = battleLogic.initiateBattle(tile.enemy, player);
                    setGameState(prev => ({
                        ...prev,
                        phase: 'battle',
                        currentBattle: battleState
                    }));
                }
                break;

            case 'bonus':
                const bonusItem = generateRandomItem();
                setGameState(prev => ({
                    ...prev,
                    players: prev.players.map(p =>
                        p.id === player.id
                            ? { ...p, inventory: [...p.inventory, bonusItem] }
                            : p
                    ),
                    phase: 'reward'
                }));
                setCurrentReward(bonusItem);
                break;

            case 'trap':
                if (tile.trap) {
                    setGameState(prev => ({
                        ...prev,
                        phase: 'trap',
                        activeTrap: tile.trap!
                    }));
                    handleTrapEffect(tile.trap, player);
                }
                break;

            case 'castle':
                // Player reached the castle - they win!
                setGameState(prev => ({
                    ...prev,
                    winner: player,
                    phase: 'game_over'
                }));
                break;

            default:
                // Normal tile - can end turn or continue
                setCanEndTurn(true);
                setGameState(prev => ({
                    ...prev,
                    phase: 'rolling'
                }));
                break;
        }
    };

    const handleTrapEffect = (trap: any, player: Player) => {
        switch (trap.effect) {
            case 'damage':
                setGameState(prev => ({
                    ...prev,
                    players: prev.players.map(p =>
                        p.id === player.id
                            ? { ...p, health: Math.max(0, p.health - trap.stats) }
                            : p
                    ),
                    phase: 'rolling'
                }));
                break;

            case 'item_loss':
                if (player.inventory.length > 0) {
                    const randomIndex = Math.floor(Math.random() * player.inventory.length);
                    setGameState(prev => ({
                        ...prev,
                        players: prev.players.map(p =>
                            p.id === player.id
                                ? {
                                    ...p,
                                    inventory: p.inventory.filter((_, index) => index !== randomIndex)
                                }
                                : p
                        ),
                        phase: 'rolling'
                    }));
                }
                break;

            default:
                setGameState(prev => ({
                    ...prev,
                    phase: 'rolling'
                }));
                break;
        }
        setCanEndTurn(true);
    };

    const resolveBattle = () => {
        if (!gameState.currentBattle) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const playerStats = calculateTotalStats(currentPlayer);
        const enemy = gameState.currentBattle.enemy;

        // Simple battle resolution
        const playerPower = playerStats.attack;
        const enemyPower = enemy.power;
        const playerDefense = playerStats.defense;

        const playerWins = playerPower > enemyPower * 0.8; // Give player slight advantage

        if (playerWins) {
            // Player wins - gets reward
            const reward = enemy.reward;
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? {
                            ...p,
                            inventory: [...p.inventory, reward],
                            stats: {
                                ...p.stats,
                                battlesWon: p.stats.battlesWon + 1
                            }
                        }
                        : p
                ),
                phase: 'reward',
                currentBattle: null
            }));
            setCurrentReward(reward);
        } else {
            // Player loses - takes damage
            const damage = Math.max(1, enemyPower - playerDefense);
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? { ...p, health: Math.max(0, p.health - damage) }
                        : p
                ),
                phase: 'rolling',
                currentBattle: null
            }));
            setCanEndTurn(true);
        }
    };

    const endTurn = () => {
        // Reset turn state
        setCanEndTurn(false);
        setIsSelectingTile(false);
        setAvailableTiles([]);
        setSelectedAnswer(null);
        setShowResult(false);

        // Get next player
        const currentIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
        const nextIndex = (currentIndex + 1) % gameState.players.length;
        const nextPlayer = gameState.players[nextIndex];

        setGameState(prev => ({
            ...prev,
            currentPlayerId: nextPlayer.id,
            phase: 'rolling',
            diceValue: null,
            currentQuestion: null,
            currentBattle: null,
            activeTrap: null
        }));
    };

    const handleEquipItem = (item: Item) => {
        const slot = getItemSlot(item);
        if (!slot) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id !== '1') return;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === currentPlayer.id) {
                    const newEquipped = { ...p.equipped };
                    const oldItem = newEquipped[slot];
                    const newInventory = p.inventory.filter(i => i.id !== item.id);

                    if (oldItem) {
                        newInventory.push(oldItem);
                    }

                    newEquipped[slot] = item;
                    const updatedPlayer: Player = {
                        ...p,
                        equipped: newEquipped,
                        inventory: newInventory
                    };

                    const newTotalStats = calculateTotalStats(updatedPlayer);

                    return {
                        ...updatedPlayer,
                        maxHealth: newTotalStats.health,
                        health: Math.min(p.health, newTotalStats.health)
                    };
                }
                return p;
            })
        }));
    };

    const handleUnequipItem = (slot: ItemSlot) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id !== '1') return;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === currentPlayer.id) {
                    const newEquipped = { ...p.equipped };
                    const unequippedItem = newEquipped[slot];

                    if (unequippedItem) {
                        delete newEquipped[slot];
                        const updatedPlayer: Player = {
                            ...p,
                            equipped: newEquipped,
                            inventory: [...p.inventory, unequippedItem]
                        };

                        const newTotalStats = calculateTotalStats(updatedPlayer);

                        return {
                            ...updatedPlayer,
                            maxHealth: newTotalStats.health,
                            health: Math.min(p.health, newTotalStats.health)
                        };
                    }
                }
                return p;
            })
        }));
    };

    return {
        // State
        gameMode,
        players,
        gameState,
        selectedAnswer,
        showResult,
        diceRolling,
        playerSetup,
        availableTiles,
        isSelectingTile,
        currentReward,
        canEndTurn,

        // Setters
        setGameMode,
        setPlayerSetup,
        setSelectedAnswer,
        setCurrentReward,

        // Functions
        startGame,
        rollDice,
        handleAnswerSubmit,
        handleTileSelection,
        endTurn,
        resolveBattle,
        handleEquipItem,
        handleUnequipItem,

        // Battle functions
        updateBattleState,
        completeBattle,
        battleLogic
    };
};
