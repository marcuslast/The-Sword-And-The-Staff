import { useState, useEffect } from 'react';
import {
    Item,
    Question,
    Player,
    GameState,
    ItemSlot,
    Tile, CharacterType
} from '../types/game.types';
import { createGameBoard, getAvailableTiles, getOrderedPathTiles, generateRandomItem } from '../utils/gameLogic';
import { PLAYER_COLORS } from '../utils/gameData';
import { getItemSlot, calculateTotalStats } from '../utils/equipmentLogic';
import { BattleState } from '../types/game.types';
import { useBattleLogic } from './useBattleLogic';
import useRealmLogic from "../realm/hooks/useRealmLogic";

export const useGameLogic = () => {
    const [gameMode, setGameMode] = useState<'menu' | 'setup' | 'playing' | 'realm'>('menu');
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
    const [playerSetup, setPlayerSetup] = useState({
        name: '',
        playerCount: 2,
        character: 'male-knight' as CharacterType
    });
    const [availableTiles, setAvailableTiles] = useState<number[]>([]);
    const [isSelectingTile, setIsSelectingTile] = useState(false);
    const [currentReward, setCurrentReward] = useState<Item | null>(null);
    const [canEndTurn, setCanEndTurn] = useState(false);

    // Shop state
    const [showShop, setShowShop] = useState(false);

    const battleLogic = useBattleLogic();

    // realm
    const realmLogic = useRealmLogic();
    const [showGameCompleteRewards, setShowGameCompleteRewards] = useState(false);
    const [gameCompleteRewards, setGameCompleteRewards] = useState<any>(null);

    const handleRewardDismiss = () => {
        setCurrentReward(null);
        setCanEndTurn(true);
        setGameState(prev => ({
            ...prev,
            phase: 'finishing'
        }));
    };

    // Shop Functions
    const handleBuyItem = (item: Item) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.gold < item.value) return;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        gold: p.gold - item.value,
                        inventory: [...p.inventory, { ...item, id: Date.now().toString() + Math.random() }]
                    }
                    : p
            )
        }));
    };

    const handleSellItem = (item: Item) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const sellPrice = Math.floor(item.value * 0.6); // 60% of purchase price
        const isEquipped = (() => {
            const slot = getItemSlot(item);
            return slot && currentPlayer.equipped[slot]?.id === item.id;
        })();

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === currentPlayer.id) {
                    let newEquipped = { ...p.equipped };
                    let newInventory = p.inventory.filter(i => i.id !== item.id);

                    // If item is equipped, unequip it
                    if (isEquipped) {
                        const slot = getItemSlot(item);
                        if (slot) {
                            delete newEquipped[slot];
                        }
                    }

                    // Create updated player for stats calculation
                    const updatedPlayer: Player = {
                        ...p,
                        gold: p.gold + sellPrice,
                        inventory: newInventory,
                        equipped: newEquipped
                    };

                    // Update health based on new total stats if equipment changed
                    if (isEquipped) {
                        const newTotalStats = calculateTotalStats(updatedPlayer);
                        return {
                            ...updatedPlayer,
                            maxHealth: newTotalStats.health,
                            health: Math.min(p.health, newTotalStats.health)
                        };
                    }

                    return updatedPlayer;
                }
                return p;
            })
        }));
    };

    const isShopAvailable = () => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id !== '1') {
            return false;
        }

        // Get ordered path tiles to find the current tile
        const pathTiles = getOrderedPathTiles(gameState.board);
        const currentTile = pathTiles[currentPlayer.position];

        if (!currentTile) {
            console.log('No current tile found at position:', currentPlayer.position);
            return false;
        }

        // Debug logging
        console.log('Current tile:', currentTile);
        console.log('Tile type:', currentTile.type);

        // Define which tile types allow shop access - expanded to include more possibilities
        const allowedShopTiles = ['shop', 'merchant'];

        const isShopTile = allowedShopTiles.includes(currentTile.type);
        console.log('Is shop tile:', isShopTile);

        return isShopTile;
    };

    const openShop = () => {
        console.log('Attempting to open shop...');
        console.log('Shop available:', isShopAvailable());

        // Only allow shop access if on appropriate tile
        if (!isShopAvailable()) {
            console.log('Shop not available on this tile');
            return;
        }

        console.log('Opening shop...');
        setShowShop(true);
    };

    const closeShop = () => {
        setShowShop(false);
    };

    // NEW: Get enhanced tile information for better UI feedback
    const getCurrentTileInfo = () => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return null;

        const pathTiles = getOrderedPathTiles(gameState.board);
        const currentTile = pathTiles[currentPlayer.position];

        return currentTile || null;
    };

    // FIXED: Enhanced available tiles calculation to allow backward movement
    const getEnhancedAvailableTiles = (currentPosition: number, diceValue: number | null) => {
        if (!diceValue) return [];

        const pathTiles = getOrderedPathTiles(gameState.board);
        const availablePositions: number[] = [];

        // Allow movement both forward and backward
        for (let i = 1; i <= diceValue; i++) {
            // Forward movement
            const forwardPos = currentPosition + i;
            if (forwardPos < pathTiles.length) {
                availablePositions.push(forwardPos);
            }

            // Backward movement (don't go below 0)
            const backwardPos = currentPosition - i;
            if (backwardPos >= 0) {
                availablePositions.push(backwardPos);
            }
        }

        return availablePositions.sort((a, b) => a - b);
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
                    // Player loses - call handlePlayerDefeat to properly reset them
                    handlePlayerDefeat(currentPlayer.id);
                    setGameState(prev => ({
                        ...prev,
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
                    const availablePositions = getEnhancedAvailableTiles(currentPlayer.position, gameState.diceValue);
                    setAvailableTiles(availablePositions);
                    setIsSelectingTile(true);

                    if (availablePositions.length > 0) {
                        setTimeout(() => {
                            const randomTileIndex = Math.floor(Math.random() * availablePositions.length);
                            const selectedTile = availablePositions[randomTileIndex];
                            handleTileSelection(selectedTile);
                        }, 1500);
                    }
                    break;

                case 'battle':
                    if (gameState.currentBattle) {
                        const battle = gameState.currentBattle;
                        if (battle.phase === 'player_attack') {
                            // AI decision making for battle actions
                            const battleItems = getBattleItems(currentPlayer.inventory);
                            const lowHealth = battle.playerHealth < battle.playerMaxHealth * 0.3;

                            // AI prioritizes healing when health is low
                            if (lowHealth && battleItems.some(item => item.effect === 'healing')) {
                                const healingItem = battleItems.find(item => item.effect === 'healing');
                                if (healingItem) {
                                    setTimeout(() => {
                                        handleUseItem(healingItem);
                                    }, 1500);
                                    return;
                                }
                            }

                            // AI might use weapon coatings or buffs
                            if (Math.random() < 0.3 && battleItems.some(item => item.effect?.includes('weapon_') || item.effect?.includes('boost'))) {
                                const buffItem = battleItems.find(item =>
                                    item.effect?.includes('weapon_') || item.effect?.includes('boost')
                                );
                                if (buffItem) {
                                    setTimeout(() => {
                                        handleUseItem(buffItem);
                                    }, 1500);
                                    return;
                                }
                            }

                            // Default to attack
                            setTimeout(() => {
                                const newBattleState = battleLogic.playerAttack(battle);
                                updateBattleState(newBattleState);
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
        // All available character types
        const allCharacters: CharacterType[] = [
            'male-archer', 'male-dwarf', 'male-general', 'male-knight', 'male-sorcerer', 'male-wizard',
            'female-general', 'female-knight', 'female-sorceress', 'female-summoner', 'female-thief', 'female-witch'
        ];

        // Human player's character
        const humanCharacter = playerSetup.character;
        const usedCharacters = new Set<CharacterType>([humanCharacter]);

        const newPlayers: Player[] = [
            {
                id: '1',
                username: playerSetup.name,
                character: humanCharacter,
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
                gold: 100, // Starting gold
                lastGoldWin: 0
            }
        ];

        // randomise

        for (let i = 1; i < playerSetup.playerCount; i++) {
            // Get available characters (not already used)
            const availableCharacters = allCharacters.filter(c => !usedCharacters.has(c));

            // If we've run out of unique characters, just pick randomly from all
            const character = availableCharacters.length > 0
                ? availableCharacters[Math.floor(Math.random() * availableCharacters.length)]
                : allCharacters[Math.floor(Math.random() * allCharacters.length)];

            usedCharacters.add(character);

            newPlayers.push({
                id: `${i + 1}`,
                username: `AI Player ${i}`,
                character,
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
                gold: 100, // Starting gold for AI too
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

    const getBattleItems = (inventory: Item[]): Item[] => {
        return inventory.filter(item => {
            // Include potions and consumables
            if (item.type === 'potion' || item.type === 'consumable' || item.type === 'mythic') {
                return true;
            }

            // Include items with battle-usable effects
            if (item.effect) {
                const battleEffects = [
                    'healing', 'full_healing',
                    'acid_damage', 'fire_damage', 'cold_damage', 'lightning_damage', 'explosive_damage',
                    'weapon_poison', 'weapon_poison_strong', 'weapon_sharpness', 'weapon_fire', 'weapon_holy', 'weapon_blessed',
                    'strength_boost', 'defense_boost', 'speed_boost', 'rage_mode', 'giant_strength',
                    'enemy_weakness', 'enemy_confusion', 'enemy_paralysis', 'enemy_control',
                    'invisibility', 'flight', 'fire_breath', 'resurrection'
                ];

                return battleEffects.includes(item.effect);
            }

            return false;
        });
    };

    const handlePlayerDefeat = (playerId: string) => {
        setGameState(prev => {
            const defeatedPlayer = prev.players.find(p => p.id === playerId);
            if (!defeatedPlayer) return prev;

            // Calculate base stats without equipment
            const baseStats = {
                ...defeatedPlayer.baseStats,
                health: defeatedPlayer.baseStats.health // Ensure we use base health
            };

            const maxHealth = baseStats.health;

            // Reset player with full health
            const updatedPlayers = prev.players.map(p => {
                if (p.id === playerId) {
                    return {
                        ...p,
                        position: 0,
                        health: maxHealth,
                        maxHealth: maxHealth,
                        inventory: [],
                        equipped: {},
                        gold: 100,
                    };
                }
                return p;
            });

            return {
                ...prev,
                players: updatedPlayers
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
                        // FIXED: Use enhanced available tiles calculation
                        const availablePositions = getEnhancedAvailableTiles(currentPlayer.position, value);
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

    const handleGameVictory = async (winningPlayer: Player) => {
        try {
            // Set winner in game state
            setGameState(prev => ({
                ...prev,
                winner: winningPlayer,
                phase: 'game_over'
            }));

            // Only give realm rewards to human player
            if (winningPlayer.id === '1') {
                console.log('💰 Calculating rewards...');

                // Calculate gold collected (player starts with 100, anything above that is collected)
                const goldCollected = Math.max(0, winningPlayer.gold - 100);

                console.log('🔮 Awarding rewards:', { goldCollected, orbs: 2 });

                // Try to award realm rewards
                try {
                    const rewardsResult = await realmLogic.completeGame({
                        goldCollected: goldCollected,
                        orbsToAward: 2
                    });

                    if (rewardsResult.success) {
                        console.log('✅ Rewards awarded successfully!', rewardsResult.rewards);
                        setGameCompleteRewards(rewardsResult.rewards);
                        setShowGameCompleteRewards(true);
                    } else {
                        console.error('❌ Failed to award rewards:', rewardsResult.error);
                    }
                } catch (apiError) {
                    console.error('💥 API Error:', apiError);
                }
            }
        } catch (error) {
            console.error('💥 Victory handling error:', error);
        }
    };

    const dismissGameCompleteRewards = () => {
        console.log('👋 Dismissing game complete rewards');
        setShowGameCompleteRewards(false);
        setGameCompleteRewards(null);
        realmLogic.clearLastGameRewards();
    };


    const handleTileEffect = async (tile: Tile, player: Player) => {
        console.log('🎯 Processing tile effect:', tile.type, 'for player:', player.username);

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
                console.log('🏰 VICTORY! Player reached castle:', player.username);
                await handleGameVictory(player);
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
            phase: 'finishing'
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

    const shouldConsumeItem = (item: Item): boolean => {
        // Always consume potions and most consumables
        if (item.type === 'potion') return true;

        if (item.type === 'consumable') {
            // Most consumables are used up, but some might be reusable
            const reusableEffects = ['invisibility_ring', 'flight_boots']; // hypothetical reusable items
            return !reusableEffects.includes(item.effect || '');
        }

        // Mythic items are usually not consumed
        if (item.type === 'mythic') {
            // Some mythic items might be single-use
            const singleUseMythic = ['phoenix_tears', 'resurrection_stone'];
            return singleUseMythic.includes(item.effect || '');
        }

        return false;
    };

    const handleUseItem = (item: Item) => {
        if (!gameState.currentBattle) return;

        const newBattleState = battleLogic.playerUseItem(gameState.currentBattle, item);

        // Determine if the item should be consumed
        const shouldRemoveItem = shouldConsumeItem(item);

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
                        health: newBattleState.playerHealth // Update health if changed by item
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
        showShop,

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

        // Shop functions
        openShop,
        closeShop,
        isShopAvailable,
        handleBuyItem,
        handleSellItem,

        getCurrentTileInfo,
        getEnhancedAvailableTiles,

        // Battle logic
        battleLogic,
        updateBattleState,
        completeBattle,
        resolveBattle,

        // items
        handleUseItem,
        getBattleItems: () => {
            const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
            return currentPlayer ? getBattleItems(currentPlayer.inventory) : [];
        },

        // New realm integration values
        realmLogic,
        showGameCompleteRewards,
        gameCompleteRewards,
        dismissGameCompleteRewards,

        handleGameVictory,
    };
};

