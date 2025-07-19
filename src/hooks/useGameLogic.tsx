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
import { PLAYER_COLORS } from '../utils/gameData';
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
        currentBattle: null,
        activeTrap: null,
        winner: null,
    });
    const [diceRolling, setDiceRolling] = useState(false);
    const [playerSetup, setPlayerSetup] = useState({ name: '', playerCount: 2 });
    const [availableTiles, setAvailableTiles] = useState<number[]>([]);
    const [isSelectingTile, setIsSelectingTile] = useState(false);
    const [currentReward, setCurrentReward] = useState<Item | null>(null);
    const [canEndTurn, setCanEndTurn] = useState(false);

    const battleLogic = useBattleLogic();

    const handleRewardDismiss = () => {
        setCurrentReward(null);
        setCanEndTurn(true);
        setGameState(prev => ({
            ...prev,
            phase: 'finishing'
        }));
    };

    // Battle State Handler Effect
    useEffect(() => {
        if (!gameState.currentBattle || !gameState.players.length) return;

        const battle = gameState.currentBattle;
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        // Handle enemy attacks (happens after player attacks)
        if (battle.phase === 'enemy_attack') {
            const timer = setTimeout(() => {
                const newBattleState = battleLogic.enemyAttack(battle);
                setGameState(prev => ({
                    ...prev,
                    currentBattle: newBattleState
                }));
            }, 2000);
            return () => clearTimeout(timer);
        }

        // Handle battle resolution
        if (battle.phase === 'victory' || battle.phase === 'defeat') {
            const timer = setTimeout(() => {
                const playerWon = battle.phase === 'victory';

                if (playerWon && battle.enemy.reward) {
                    const totalGold = battle.enemy.goldReward || 10;

                    // Player wins - gets reward and updates health from battle
                    setGameState(prev => ({
                        ...prev,
                        players: prev.players.map(p =>
                            p.id === currentPlayer.id
                                ? {
                                    ...p,
                                    health: battle.playerHealth, // Keep the health from battle
                                    inventory: [...p.inventory, battle.enemy.reward],
                                    gold: p.gold + totalGold,
                                    lastGoldWin: totalGold,
                                    stats: {
                                        ...p.stats,
                                        battlesWon: p.stats.battlesWon + 1,
                                        goldCollected: p.stats.goldCollected + totalGold
                                    }
                                }
                                : p
                        ),
                        phase: 'reward',
                        currentBattle: null
                    }));
                    setCurrentReward(battle.enemy.reward);
                } else {
                    // Player loses - update health from battle state
                    setGameState(prev => ({
                        ...prev,
                        players: prev.players.map(p =>
                            p.id === currentPlayer.id
                                ? { ...p, health: Math.max(0, battle.playerHealth) }
                                : p
                        ),
                        phase: 'finishing',
                        currentBattle: null
                    }));
                    setCanEndTurn(true);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentBattle?.phase, gameState.currentPlayerId]);

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

                case 'selecting_tile':
                    const availablePositions = getAvailableTiles(currentPlayer.position, gameState.diceValue, gameState.board);
                    setAvailableTiles(availablePositions);
                    setIsSelectingTile(true);

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
                        const battle = gameState.currentBattle;
                        if (battle.phase === 'defeat') {
                            // AI was defeated - reset position and inventory
                            handlePlayerDefeat(currentPlayer.id);
                            setTimeout(() => {
                                setGameState(prev => ({
                                    ...prev,
                                    currentBattle: null,
                                    phase: 'finishing'
                                }));
                                setCanEndTurn(true);
                            }, 2000);
                        }
                        if (battle.phase === 'player_attack') {
                            setTimeout(() => {
                                const newBattleState = battleLogic.playerAttack(battle);
                                setGameState(prev => ({
                                    ...prev,
                                    currentBattle: newBattleState
                                }));
                            }, 2000);
                        }
                        else if (battle.phase === 'enemy_attack') {
                            setTimeout(() => {
                                const newBattleState = battleLogic.enemyAttack(battle);
                                setGameState(prev => ({
                                    ...prev,
                                    currentBattle: newBattleState
                                }));
                            }, 2000);
                        }
                    }
                    break;

                case 'reward':
                    setTimeout(() => {
                        setCurrentReward(null);
                        setCanEndTurn(true);
                        setGameState(prev => ({
                            ...prev,
                            phase: 'finishing'
                        }));
                    }, 3000);
                    break;

                case 'finishing':
                    if (canEndTurn) {
                        setTimeout(() => endTurn(), 1500);
                    }
                    break;
            }
        };

        if (!currentReward) {
            handleAIAction();
        }
    }, [gameState.currentPlayerId, gameState.phase, canEndTurn, gameState.currentBattle?.phase]);

    // Game Functions
    const startGame = () => {
        const newPlayers: Player[] = [
            {
                id: '1',
                username: playerSetup.name,
                position: 0,
                health: playerSetup.name === 'mlastweak' ? 1 : 100,
                maxHealth: 100,
                inventory: [],
                equipped: {},
                baseStats: {
                    attack: playerSetup.name === 'mlast' ? 1000 : 10,
                    defense: 10,
                    health: playerSetup.name === 'mlastweak' ? 1 : 100,
                    speed: 10
                },
                stats: {
                    battlesWon: 0,
                    tilesMovedTotal: 0,
                    goldCollected: 0
                },
                color: PLAYER_COLORS[0],
                isActive: true,
                isAI: false,
                gold: 0,
                lastGoldWin: 0
            }
        ];

        for (let i = 1; i < playerSetup.playerCount; i++) {
            newPlayers.push({
                id: `${i + 1}`,
                username: `AI Player ${i}`,
                position: 0,
                health: playerSetup.name === 'mlastweak' ? 1 : 100,
                maxHealth: 100,
                inventory: [],
                equipped: {},
                baseStats: {
                    attack: playerSetup.name === 'mlast' ? 1000 : 10,
                    defense: 10,
                    health: playerSetup.name === 'mlastweak' ? 1 : 100,
                    speed: 10
                },
                stats: {
                    battlesWon: 0,
                    tilesMovedTotal: 0,
                    goldCollected: 0
                },
                color: PLAYER_COLORS[i],
                isAI: true,
                isActive: true,
                gold: 0,
                lastGoldWin: 0
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

    const handlePlayerDefeat = (playerId: string) => {
        setGameState(prev => {
            const defeatedPlayer = prev.players.find(p => p.id === playerId);
            if (!defeatedPlayer) return prev;

            // Collect the defeated player's inventory and gold
            const lootedItems = [...defeatedPlayer.inventory];
            const lootedGold = defeatedPlayer.gold;

            // Find the hoard tile and add the items
            const updatedBoard = prev.board.map(tile => {
                if (tile.type === 'hoard') {
                    return {
                        ...tile,
                        hoardItems: [...(tile.hoardItems || []), ...lootedItems]
                    };
                }
                return tile;
            });

            const updatedPlayers = prev.players.map(p => {
                if (p.id === playerId) {
                    const maxHealth = calculateTotalStats({
                        ...p,
                        equipped: {} // Calculate base max health without equipment
                    }).health;

                    return {
                        ...p,
                        position: 0,
                        health: maxHealth, // Fully restore health
                        maxHealth: maxHealth, // Update max health in case equipment changed it
                        inventory: [],
                        equipped: {},
                        gold: 0, // Reset gold to 0
                    };
                }
                return p;
            });

            return {
                ...prev,
                players: updatedPlayers,
                board: updatedBoard
            };
        });
    };

    const rollDice = () => {
        if (gameState.phase !== 'rolling') return;
        setDiceRolling(true);

        setTimeout(() => {
            const value = Math.floor(Math.random() * 6) + 1;

            setGameState(prev => {
                const newState = {
                    ...prev,
                    diceValue: value,
                };

                // Get current player based on the previous state
                const currentPlayer = prev.players.find(p => p.id === prev.currentPlayerId);

                setTimeout(() => {
                    if (currentPlayer) {
                        const availablePositions = getAvailableTiles(
                            currentPlayer.position,
                            value, // Use the local value variable
                            prev.board
                        );
                        setAvailableTiles(availablePositions);
                        setIsSelectingTile(true);

                        // Use the callback form to ensure we have the latest state
                        setGameState(gameStatePrev => ({
                            ...gameStatePrev,
                            phase: 'selecting_tile',
                        }));
                    }
                }, 500);

                return newState;
            });

            setDiceRolling(false);
        }, 1000);
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
            phase: 'finishing',
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
                    phase: 'finishing'
                }));
                break;
        }
    };

    const handleTrapEffect = (trap: any, player: Player) => {
        let newHealth = player.health;

        switch (trap.effect) {
            case 'damage':
                newHealth = Math.max(0, player.health - trap.stats);
                break;
            case 'item_loss':
                // Existing item loss logic
                break;
        }

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === player.id) {
                    if (newHealth <= 0) {
                        // Player defeated by trap
                        handlePlayerDefeat(player.id);
                    }
                    return {
                        ...p,
                        health: newHealth,
                        // Handle item loss if needed
                    };
                }
                return p;
            }),
            phase: newHealth <= 0 ? 'finishing' : 'finishing'
        }));

        setCanEndTurn(true);
    };

    const endTurn = () => {
        // Reset turn state
        setCanEndTurn(false);
        setIsSelectingTile(false);
        setAvailableTiles([]);

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

    const updateBattleState = (newBattleState: BattleState) => {
        setGameState(prev => ({
            ...prev,
            currentBattle: newBattleState
        }));
    };

    const completeBattle = (playerWon: boolean, battleState: BattleState) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        if (!playerWon) {
            handlePlayerDefeat(currentPlayer.id);
            setCanEndTurn(true);
            return;
        }

        // Handle victory case
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === currentPlayer.id) {
                    return {
                        ...p,
                        health: battleState.playerHealth,
                        stats: {
                            ...p.stats,
                            battlesWon: p.stats.battlesWon + 1
                        }
                    };
                }
                return p;
            }),
            currentBattle: null,
            phase: 'reward'
        }));

        if (battleState.enemy.reward) {
            setCurrentReward(battleState.enemy.reward);
        }
    };

    const resolveBattle = () => {
        if (!gameState.currentBattle) return;

        const result = battleLogic.resolveBattle(gameState.currentBattle);
        completeBattle(result.playerWon, gameState.currentBattle);
    };

    const handleHeal = () => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id !== '1') return; // Only human player can heal

        const healAmount = Math.floor(currentPlayer.maxHealth * 0.33); // Heal 33% of max health
        const newHealth = Math.min(currentPlayer.maxHealth, currentPlayer.health + healAmount);

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? { ...p, health: newHealth }
                    : p
            ),
            phase: 'finishing'
        }));

        setCanEndTurn(true);
    };

    const handleUseItem = (item: Item) => {
        if (!gameState.currentBattle) return;

        const newBattleState = battleLogic.playerUseItem(gameState.currentBattle, item);

        // Remove the used item from inventory if it's consumable
        const shouldRemoveItem = ['potion', 'consumable'].includes(item.type);

        setGameState(prev => ({
            ...prev,
            currentBattle: newBattleState,
            players: prev.players.map(p => {
                if (p.id === prev.currentPlayerId) {
                    return {
                        ...p,
                        inventory: shouldRemoveItem
                            ? p.inventory.filter(i => i.id !== item.id)
                            : p.inventory,
                        health: newBattleState.playerHealth // Update health if changed
                    };
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
        diceRolling,
        playerSetup,
        availableTiles,
        isSelectingTile,
        currentReward,
        canEndTurn,

        // Setters
        setGameMode,
        setGameState,
        setPlayerSetup,
        setCurrentReward,

        // Functions
        startGame,
        rollDice,
        handleTileSelection,
        endTurn,
        handleEquipItem,
        handleUnequipItem,
        handleRewardDismiss,
        handleHeal,

        // Battle logic
        battleLogic,
        updateBattleState,
        completeBattle,
        resolveBattle
    };
};
