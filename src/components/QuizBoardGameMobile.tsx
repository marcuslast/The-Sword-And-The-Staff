import React, { useState, useEffect, useRef } from 'react';
import {
    AlertCircle, Trophy, Sword, Shield, Crown, Gem, Star,
    Heart, Skull, Package, Target, Zap, Move, User,
    Dices, Castle, Swords, AlertTriangle, Sparkles,
    ChevronUp, X, Menu, Backpack, Users, Settings,
    ChevronLeft, ChevronRight, Zap as Lightning,
    HardHat, Shirt, Footprints, Hand, UsersRound, Plus, Minus
} from 'lucide-react';
import {
    Item,
    Question,
    Trap,
    Enemy,
    Tile,
    Player,
    GameState,
    ItemSlot,
    EquipmentSlots
} from "../types/game.types";
import { createGameBoard, generateRandomItem, getAvailableTiles, getOrderedPathTiles } from '../utils/gameLogic';
import { PLAYER_COLORS, RARITIES, generateRandomQuestion, ENEMIES, ITEM_POOL } from '../utils/gameData';
import { getItemSlot, calculateTotalStats, compareItems } from '../utils/equipmentLogic';

// Mobile-optimized Item Icon Component
const ItemIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 24 }) => {
    const icons: { [key: string]: React.ReactNode } = {
        'sword': <Sword size={size} />,
        'shield': <Shield size={size} />,
        'crown': <Crown size={size} />,
        'gem': <Gem size={size} />,
        'wand': <Star size={size} />,
        'trap': <AlertTriangle size={size} />,
        'creature': <Skull size={size} />,
        'package': <Package size={size} />,
        'armor': <Shirt size={size} />,
        'helmet': <HardHat size={size} />,
        'boots': <Footprints size={size} />,
        'gloves': <Hand size={size} />,
        'cloak': <UsersRound size={size} />
    };
    return <>{icons[icon] || <Sword size={size} />}</>;
};

// Mobile Game Board Component
const MobileGameBoard: React.FC<{
    board: Tile[];
    players: Player[];
    currentPlayerId: string;
    availableTiles: number[];
    isSelectingTile: boolean;
    onTileSelection: (position: number) => void;
}> = ({ board, players, currentPlayerId, availableTiles, isSelectingTile, onTileSelection }) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const getTileContent = (tile: Tile) => {
        const pathTiles = getOrderedPathTiles(board);
        const playersOnTile = players.filter(p => {
            const playerTile = pathTiles[p.position];
            return playerTile && playerTile.x === tile.x && playerTile.y === tile.y;
        });

        const tilePosition = pathTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
        const isAvailable = isSelectingTile && availableTiles.includes(tilePosition);

        return (
            <div
                className={`relative w-full h-full flex items-center justify-center transition-all duration-300
                    ${isAvailable ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse' : ''}`}
                onClick={() => isAvailable && onTileSelection(tilePosition)}
            >
                {tile.type === 'start' && <Move className="text-green-400" size={14} />}
                {tile.type === 'castle' && <Castle className="text-purple-400" size={16} />}
                {tile.type === 'battle' && tile.enemy && <Swords className="text-red-400" size={14} />}
                {tile.type === 'bonus' && <Sparkles className="text-yellow-400" size={14} />}
                {tile.type === 'trap' && tile.trap && <AlertTriangle className="text-orange-400" size={14} />}

                {playersOnTile.map((player, idx) => (
                    <div
                        key={player.id}
                        className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transform transition-all duration-500"
                        style={{
                            backgroundColor: player.color,
                            top: `${25 + idx * 20}%`,
                            left: `${25 + idx * 20}%`,
                            zIndex: 10 + idx,
                            boxShadow: `0 0 10px ${player.color}`
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-3xl shadow-2xl" ref={boardRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
            <div
                className="absolute inset-0 p-3 transition-transform duration-200"
                style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
                }}
            >
                <div className="grid grid-cols-10 gap-1 h-full">
                    {board.map((tile) => (
                        <div
                            key={tile.id}
                            className={`relative rounded-xl transition-all duration-300 ${
                                tile.isPath
                                    ? tile.type === 'castle'
                                        ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg'
                                        : tile.type === 'start'
                                            ? 'bg-gradient-to-br from-green-600 to-green-800 shadow-lg'
                                            : 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-md'
                                    : 'bg-gray-800/50'
                            } ${tile.type === 'battle' ? 'ring-2 ring-red-500' : ''}
                            ${tile.type === 'trap' && tile.trap ? 'ring-2 ring-orange-500' : ''}
                            ${tile.type === 'bonus' ? 'ring-2 ring-yellow-500' : ''}`}
                        >
                            {getTileContent(tile)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Bottom Sheet Component
const BottomSheet: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const deltaY = e.touches[0].clientY - startY;
        setCurrentY(Math.max(0, deltaY));
    };

    const handleTouchEnd = () => {
        if (currentY > 100) {
            onClose();
        }
        setCurrentY(0);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            )}
            <div
                ref={sheetRef}
                className={`fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-out z-50
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    transform: isOpen ? `translateY(${currentY}px)` : 'translateY(100%)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

// Tab Button Component
const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}> = ({ active, onClick, icon, label, badge }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200
                ${active
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-gray-400 hover:text-gray-200'}`}
        >
            <div className="relative">
                {icon}
                {badge !== undefined && badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {badge > 99 ? '99+' : badge}
                    </div>
                )}
            </div>
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );
};

// Mobile Inventory Item Component
const MobileInventoryItem: React.FC<{
    item: Item;
    equipped?: boolean;
    onClick: () => void;
    onHover?: (item: Item | null) => void;
    comparison?: any;
}> = ({ item, equipped, onClick, onHover, comparison }) => {
    const rarityConfig = RARITIES[item.rarity];

    return (
        <div
            onClick={onClick}
            onTouchStart={() => onHover?.(item)}
            onTouchEnd={() => onHover?.(null)}
            className={`relative p-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg
                ${equipped
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                : `bg-gray-800 border-2 ${rarityConfig.color.replace('text-', 'border-')}`}`}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${equipped ? 'bg-white/20' : 'bg-gray-700'}`}>
                    <ItemIcon icon={item.icon} size={24} />
                </div>
                <div className="flex-1">
                    <h4 className={`font-semibold ${equipped ? 'text-white' : 'text-gray-100'}`}>
                        {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm ${equipped ? 'text-white/80' : 'text-gray-400'}`}>
                            Power: {item.stats}
                        </span>
                        {equipped && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                Equipped
                            </span>
                        )}
                    </div>
                </div>
                {item.type === 'weapon' && <Sword size={16} className="text-gray-500" />}
                {item.type === 'armor' && <Shield size={16} className="text-gray-500" />}
            </div>

            {comparison && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm space-y-1">
                    {Object.entries(comparison).map(([stat, value]: [string, any]) => {
                        if (value === 0) return null;
                        return (
                            <div key={stat} className={`flex items-center justify-between
                                ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <span className="capitalize">{stat}:</span>
                                <span className="font-semibold flex items-center">
                                    {value > 0 ? <Plus size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
                                    {Math.abs(value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Main Mobile Game Component
export const QuizBoardGameMobile: React.FC = () => {
    // Game state
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

    // Mobile-specific state
    const [activeTab, setActiveTab] = useState<'game' | 'inventory' | 'players' | 'settings'>('game');
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [bottomSheetContent, setBottomSheetContent] = useState<'question' | 'battle' | 'reward' | 'trap' | null>(null);
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<ItemSlot | null>(null);

    // AI Handler Effect
    useEffect(() => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id === '1') return;

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
                                setGameState(prev => ({
                                    ...prev,
                                    currentQuestion: null,
                                    phase: 'rolling',
                                    diceValue: null
                                }));
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
                    setTimeout(() => resolveBattle(), 2000);
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

    // Initialize game
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

        // Add AI players
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

    // Dice rolling
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
                presentQuestion();
            }, 500);
        }, 1000);
    };

    const presentQuestion = () => {
        const question = generateRandomQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: question,
            phase: 'question'
        }));
        setSelectedAnswer(null);
        setShowResult(false);
        setBottomSheetContent('question');
        setShowBottomSheet(true);
    };

    // Handle answer submission
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
            setShowBottomSheet(false);

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
            }
        }, 2000);
    };

    // Handle tile selection
    const handleTileSelection = (selectedPosition: number) => {
        if (gameState.phase !== 'selecting_tile' || !isSelectingTile || !availableTiles.includes(selectedPosition)) {
            return;
        }

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const spacesMovedActual = selectedPosition - currentPlayer.position;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? {
                        ...p,
                        position: selectedPosition,
                        stats: { ...p.stats, tilesMovedTotal: p.stats.tilesMovedTotal + spacesMovedActual }
                    }
                    : p
            ),
            phase: 'moving'
        }));

        setAvailableTiles([]);
        setIsSelectingTile(false);

        const pathTiles = getOrderedPathTiles(gameState.board);
        const selectedTile = pathTiles[selectedPosition];

        if (selectedTile && selectedTile.type === 'castle') {
            setGameState(prev => ({
                ...prev,
                phase: 'game_over',
                winner: currentPlayer
            }));
            return;
        }

        setTimeout(() => {
            if (selectedTile && selectedTile.type === 'battle' && selectedTile.enemy) {
                startBattle(selectedTile.enemy);
            } else if (selectedTile && selectedTile.type === 'trap' && selectedTile.trap) {
                activateTrap(selectedTile.trap);
            } else if (selectedTile && selectedTile.type === 'bonus') {
                giveRandomItem();
            } else {
                const item = generateRandomItem('common');
                giveItemToPlayer(item);
            }
        }, 500);
    };

    // Battle system
    const startBattle = (enemy: Enemy) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        // Create a proper BattleState
        const battleState = {
            enemy: { ...enemy },
            playerHealth: currentPlayer.health,
            playerMaxHealth: currentPlayer.maxHealth,
            enemyHealth: enemy.health,
            enemyMaxHealth: enemy.health,
            // @ts-ignore
            rounds: [],
            currentRound: 0,
            isPlayerTurn: true,
            phase: 'player_attack' as const,
            playerStats: calculateTotalStats(currentPlayer)
        };

        setGameState(prev => ({
            ...prev,
            phase: 'battle',
            currentBattle: battleState
        }));
        setBottomSheetContent('battle');
        setShowBottomSheet(true);
    };



    const resolveBattle = () => {
        if (!gameState.currentBattle) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const battle = gameState.currentBattle;
        const totalStats = calculateTotalStats(currentPlayer);
        const playerPower = totalStats.attack + Math.floor(totalStats.defense * 0.5);

        // Simple battle resolution
        const playerWins = playerPower >= battle.enemy.health;

        if (playerWins) {
            giveItemToPlayer(battle.enemy.reward);
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? { ...p, stats: { ...p.stats, battlesWon: p.stats.battlesWon + 1 } }
                        : p
                )
            }));
        } else {
            const damage = battle.enemy.power;
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? { ...p, health: Math.max(0, p.health - damage) }
                        : p
                )
            }));
        }

        setTimeout(() => {
            setGameState(prev => ({
                ...prev,
                currentBattle: null,
                phase: 'rolling'
            }));
            setShowBottomSheet(false);
        }, 2000);
    };

    // Trap system
    const activateTrap = (trap: Trap) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        setGameState(prev => ({
            ...prev,
            phase: 'trap',
            activeTrap: trap
        }));
        setBottomSheetContent('trap');
        setShowBottomSheet(true);

        setTimeout(() => {
            switch (trap.type) {
                case 'damage':
                    setGameState(prev => ({
                        ...prev,
                        players: prev.players.map(p =>
                            p.id === currentPlayer.id
                                ? { ...p, health: Math.max(0, p.health - trap.power) }
                                : p
                        )
                    }));
                    break;
                case 'creature':
                    const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
                    const battleEnemy: Enemy = {
                        id: 'trap-enemy',
                        ...enemy,
                        reward: generateRandomItem()
                    };
                    startBattle(battleEnemy);
                    return;
                case 'item_loss':
                    if (currentPlayer.inventory.length > 0) {
                        const randomIndex = Math.floor(Math.random() * currentPlayer.inventory.length);
                        setGameState(prev => ({
                            ...prev,
                            players: prev.players.map(p =>
                                p.id === currentPlayer.id
                                    ? { ...p, inventory: p.inventory.filter((_, i) => i !== randomIndex) }
                                    : p
                            )
                        }));
                    }
                    break;
            }

            setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    activeTrap: null,
                    phase: 'rolling'
                }));
                setShowBottomSheet(false);
            }, 2000);
        }, 1500);
    };

    // Item management
    const giveRandomItem = () => {
        const item = generateRandomItem();
        giveItemToPlayer(item);
    };

    const giveItemToPlayer = (item: Item) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        setGameState((prev: any) => ({
            ...prev,
            players: prev.players.map((p: { id: string; inventory: any; }) =>
                p.id === currentPlayer.id
                    ? { ...p, inventory: [...p.inventory, item] }
                    : p
            ),
            phase: 'reward'
        }));

        setCurrentReward(item);
        setBottomSheetContent('reward');
        setShowBottomSheet(true);
    };

    const closeRewardDisplay = () => {
        setCurrentReward(null);
        setCanEndTurn(true);
        setShowBottomSheet(false);

        setGameState((prev: any) => ({
            ...prev,
            phase: 'rolling'
        }));
    };

    // Equipment management
    const handleEquipItem = (item: Item) => {
        const slot = getItemSlot(item);
        if (!slot) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id !== '1') return; // Only human player can equip

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === currentPlayer.id) {
                    const newEquipped = { ...p.equipped };
                    const oldItem = newEquipped[slot];

                    // Create new inventory without the item being equipped
                    const newInventory = p.inventory.filter(i => i.id !== item.id);

                    // If there's already an item in this slot, add it back to inventory
                    if (oldItem) {
                        newInventory.push(oldItem);
                    }

                    // Equip the new item
                    newEquipped[slot] = item;

                    // Create the updated player object for stats calculation
                    const updatedPlayer: Player = {
                        ...p,
                        equipped: newEquipped,
                        inventory: newInventory
                    };

                    // Update health based on new total stats
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

                        // Create the updated player object for stats calculation
                        const updatedPlayer: Player = {
                            ...p,
                            equipped: newEquipped,
                            inventory: [...p.inventory, unequippedItem]
                        };

                        // Update health based on new total stats
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


    // End turn
    const endTurn = () => {
        setCanEndTurn(false);
        setDiceRolling(false);
        setSelectedAnswer(null);
        setShowResult(false);
        setAvailableTiles([]);
        setIsSelectingTile(false);
        setCurrentReward(null);

        setGameState((prev: any) => {
            const currentIndex = prev.players.findIndex((p: { id: any; }) => p.id === prev.currentPlayerId);
            const nextIndex = (currentIndex + 1) % prev.players.length;
            const nextPlayer = prev.players[nextIndex];

            return {
                ...prev,
                currentPlayerId: nextPlayer.id,
                phase: 'rolling',
                diceValue: null,
                currentQuestion: null,
                currentBattle: null,
                activeTrap: null
            };
        });
    };

    // Menu screen
    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                            <Castle size={48} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Quest to Red Rock</h1>
                        <p className="text-purple-200">A quiz adventure game</p>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={playerSetup.name}
                            onChange={(e) => setPlayerSetup(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-6 py-4 bg-white/20 backdrop-blur rounded-2xl text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            placeholder="Enter your name"
                        />

                        <select
                            value={playerSetup.playerCount}
                            onChange={(e) => setPlayerSetup(prev => ({ ...prev, playerCount: Number(e.target.value) }))}
                            className="w-full px-6 py-4 bg-white/20 backdrop-blur rounded-2xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value={2} className="text-gray-900">2 Players</option>
                            <option value={3} className="text-gray-900">3 Players</option>
                            <option value={4} className="text-gray-900">4 Players</option>
                        </select>

                        <button
                            onClick={startGame}
                            disabled={!playerSetup.name.trim()}
                            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                        >
                            Start Adventure
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-2xl">
                        <h3 className="font-bold text-white mb-2">How to Play</h3>
                        <ul className="space-y-1 text-purple-200 text-sm">
                            <li>🎲 Roll dice to move along the path</li>
                            <li>❓ Answer questions to claim your moves</li>
                            <li>⚔️ Equip items and battle enemies</li>
                            <li>💰 Collect rewards and upgrade gear</li>
                            <li>🏰 First to reach the castle wins!</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Main game screen
    if (gameMode === 'playing') {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        const isPlayerTurn = gameState.currentPlayerId === '1';
        const totalStats = currentPlayer ? calculateTotalStats(currentPlayer) : null;

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex flex-col">
                {/* Top Status Bar */}
                <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-lg text-white p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-xs opacity-80">Current Turn</p>
                                <p className="font-bold text-lg">{currentPlayer?.username}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs opacity-80">Position</p>
                            <p className="font-bold text-2xl">{currentPlayer?.position || 0}</p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                            <p className="text-xs opacity-80">❤️ HP</p>
                            <p className="font-bold text-sm">{currentPlayer?.health}/{currentPlayer?.maxHealth}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                            <p className="text-xs opacity-80">⚔️ ATK</p>
                            <p className="font-bold text-sm">{totalStats?.attack || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                            <p className="text-xs opacity-80">🛡️ DEF</p>
                            <p className="font-bold text-sm">{totalStats?.defense || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                            <p className="text-xs opacity-80">👟 SPD</p>
                            <p className="font-bold text-sm">{totalStats?.speed || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'game' && (
                        <div className="h-full p-4 flex flex-col">
                            <MobileGameBoard
                                board={gameState.board}
                                players={gameState.players}
                                currentPlayerId={gameState.currentPlayerId}
                                availableTiles={availableTiles}
                                isSelectingTile={isSelectingTile}
                                onTileSelection={handleTileSelection}
                            />

                            {/* Game Controls */}
                            <div className="mt-4 flex justify-center space-x-4">
                                {gameState.phase === 'rolling' && isPlayerTurn && (
                                    <button
                                        onClick={rollDice}
                                        disabled={diceRolling}
                                        className={`relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-full shadow-2xl transform transition-all duration-200
                                            ${diceRolling ? 'scale-110 animate-pulse' : 'hover:scale-110 active:scale-95'}`}
                                    >
                                        <Dices size={32} className={diceRolling ? 'animate-spin' : ''} />
                                        {gameState.diceValue && (
                                            <div className="absolute -top-4 -right-4 bg-white text-gray-900 w-10 h-10 rounded-full font-bold text-xl shadow-lg flex items-center justify-center">
                                                {gameState.diceValue}
                                            </div>
                                        )}
                                    </button>
                                )}

                                {canEndTurn && isPlayerTurn && (
                                    <button
                                        onClick={endTurn}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                                    >
                                        End Turn
                                    </button>
                                )}
                            </div>

                            {/* Phase Indicator */}
                            <div className="mt-4 text-center">
                                <p className="text-white/60 text-sm">
                                    {gameState.phase === 'selecting_tile' && 'Choose where to move!'}
                                    {gameState.phase === 'rolling' && 'Roll the dice to move'}
                                    {gameState.phase === 'moving' && 'Moving...'}
                                    {!isPlayerTurn && '🤖 AI is thinking...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && currentPlayer && (
                        <div className="h-full overflow-y-auto p-4">
                            <h3 className="text-white font-bold text-2xl mb-6">Equipment & Inventory</h3>

                            {/* Equipment Slots Grid */}
                            <div className="mb-6">
                                <h4 className="text-white/80 text-sm mb-3">Equipment Slots</h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {(['weapon', 'armor', 'helmet', 'shield', 'gloves', 'boots', 'cloak', 'accessory'] as ItemSlot[]).map(slot => {
                                        const equipped = currentPlayer.equipped[slot];
                                        return (
                                            <div
                                                key={slot}
                                                className={`aspect-square bg-gray-800/50 backdrop-blur rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all duration-200
                                                    ${equipped ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'}
                                                    ${equipped && isPlayerTurn ? 'active:scale-95' : ''}`}
                                                onClick={() => equipped && isPlayerTurn && handleUnequipItem(slot)}
                                            >
                                                {equipped ? (
                                                    <>
                                                        <ItemIcon icon={equipped.icon} size={28} />
                                                        <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                                                            {equipped.name}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-gray-600">
                                                            {slot === 'weapon' && <Sword size={24} />}
                                                            {slot === 'armor' && <Shirt size={24} />}
                                                            {slot === 'helmet' && <HardHat size={24} />}
                                                            {slot === 'shield' && <Shield size={24} />}
                                                            {slot === 'gloves' && <Hand size={24} />}
                                                            {slot === 'boots' && <Footprints size={24} />}
                                                            {slot === 'cloak' && <UsersRound size={24} />}
                                                            {slot === 'accessory' && <Gem size={24} />}
                                                        </div>
                                                        <span className="text-xs text-gray-600 mt-1 capitalize">
                                                            {slot}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Inventory Items */}
                            <div>
                                <h4 className="text-white/80 text-sm mb-3">
                                    Inventory ({currentPlayer.inventory.length} items)
                                </h4>
                                <div className="space-y-3">
                                    {currentPlayer.inventory.map(item => {
                                        const slot = getItemSlot(item);
                                        const equipped = slot && currentPlayer.equipped[slot]?.id === item.id;
                                        const comparison = slot && hoveredItem?.id === item.id && currentPlayer.equipped[slot]
                                            ? compareItems(currentPlayer.equipped[slot], item)
                                            : null;

                                        return (
                                            <MobileInventoryItem
                                                key={item.id}
                                                item={item}
                                                equipped={equipped}
                                                onClick={() => !equipped && slot && isPlayerTurn && handleEquipItem(item)}
                                                onHover={setHoveredItem}
                                                comparison={comparison}
                                            />
                                        );
                                    })}

                                    {currentPlayer.inventory.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            <Package size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>No items in inventory</p>
                                            <p className="text-sm mt-1">Collect items by answering questions!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'players' && (
                        <div className="h-full overflow-y-auto p-4">
                            <h3 className="text-white font-bold text-2xl mb-6">Players</h3>
                            <div className="space-y-3">
                                {gameState.players.map(player => {
                                    const playerStats = calculateTotalStats(player);
                                    return (
                                        <div
                                            key={player.id}
                                            className={`bg-gray-800/50 backdrop-blur rounded-2xl p-4 border-2 transition-all duration-200
                                                ${player.id === gameState.currentPlayerId
                                                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                                : 'border-gray-700'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                                        style={{
                                                            backgroundColor: player.color,
                                                            boxShadow: `0 4px 20px ${player.color}40`
                                                        }}
                                                    >
                                                        {player.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-lg">{player.username}</p>
                                                        <p className="text-gray-400 text-sm">Position: {player.position}</p>
                                                    </div>
                                                </div>
                                                {player.id === gameState.currentPlayerId && (
                                                    <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                                                        Current Turn
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                    <span className="text-gray-400">Health:</span>
                                                    <span className="text-white font-medium ml-1">{player.health}/{player.maxHealth}</span>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                    <span className="text-gray-400">Items:</span>
                                                    <span className="text-white font-medium ml-1">{player.inventory.length}</span>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                    <span className="text-gray-400">Attack:</span>
                                                    <span className="text-white font-medium ml-1">{playerStats.attack}</span>
                                                </div>
                                                <div className="bg-gray-700/50 rounded-lg p-2">
                                                    <span className="text-gray-400">Defense:</span>
                                                    <span className="text-white font-medium ml-1">{playerStats.defense}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="h-full p-4">
                            <h3 className="text-white font-bold text-2xl mb-6">Settings</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        // eslint-disable-next-line no-restricted-globals
                                        if (confirm('Are you sure you want to quit the game?')) {
                                            setGameMode('menu');
                                            setGameState({
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
                                        }
                                    }}
                                    className="w-full bg-red-500/20 backdrop-blur border-2 border-red-500 text-red-400 py-4 px-6 rounded-2xl font-medium hover:bg-red-500/30 transition-all duration-200"
                                >
                                    Quit Game
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 px-4 py-3 pb-safe">
                    <div className="grid grid-cols-4 gap-2">
                        <TabButton
                            active={activeTab === 'game'}
                            onClick={() => setActiveTab('game')}
                            icon={<Castle size={20} />}
                            label="Game"
                        />
                        <TabButton
                            active={activeTab === 'inventory'}
                            onClick={() => setActiveTab('inventory')}
                            icon={<Backpack size={20} />}
                            label="Items"
                            badge={currentPlayer?.inventory.length}
                        />
                        <TabButton
                            active={activeTab === 'players'}
                            onClick={() => setActiveTab('players')}
                            icon={<Users size={20} />}
                            label="Players"
                        />
                        <TabButton
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                            icon={<Settings size={20} />}
                            label="More"
                        />
                    </div>
                </div>

                {/* Question Bottom Sheet */}
                {gameState.phase === 'question' && gameState.currentQuestion && (
                    <BottomSheet
                        isOpen={showBottomSheet}
                        onClose={() => {}}
                        title={gameState.currentQuestion.category}
                    >
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {gameState.currentQuestion.question}
                            </h4>
                            <div className="space-y-3">
                                {gameState.currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => isPlayerTurn && setSelectedAnswer(index)}
                                        disabled={showResult || !isPlayerTurn}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
                                            ${selectedAnswer === index
                                            ? showResult
                                                ? index === gameState.currentQuestion!.correctAnswer
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                                : 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                                        } ${!isPlayerTurn ? 'opacity-50' : ''}`}
                                    >
                                        <span className="font-medium text-gray-800">{option}</span>
                                        {showResult && index === gameState.currentQuestion!.correctAnswer && (
                                            <span className="float-right text-green-600 font-bold">✓</span>
                                        )}
                                        {showResult && selectedAnswer === index && index !== gameState.currentQuestion!.correctAnswer && (
                                            <span className="float-right text-red-600 font-bold">✗</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {selectedAnswer !== null && !showResult && isPlayerTurn && (
                                <button
                                    onClick={handleAnswerSubmit}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    Submit Answer
                                </button>
                            )}
                            {showResult && (
                                <div className={`p-4 rounded-2xl ${
                                    selectedAnswer === gameState.currentQuestion!.correctAnswer
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    <p className="font-semibold text-center">
                                        {selectedAnswer === gameState.currentQuestion!.correctAnswer
                                            ? '🎉 Correct! You can now move!'
                                            : '😔 Incorrect. Better luck next time!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </BottomSheet>
                )}

                {/* Battle Bottom Sheet */}
                {gameState.phase === 'battle' && gameState.currentBattle && (
                    <BottomSheet
                        isOpen={showBottomSheet}
                        onClose={() => {}}
                        title="Battle!"
                    >
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                                    <Swords size={64} className="text-white" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg">
                                    <p className="font-bold text-red-600">VS</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{gameState.currentBattle.enemy.name}</h3>
                                <div className="flex justify-center space-x-4 mt-2">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Health</p>
                                        <p className="text-xl font-bold text-red-600">{gameState.currentBattle.enemy.health}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Power</p>
                                        <p className="text-xl font-bold text-orange-600">{gameState.currentBattle.enemy.power}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-2xl">
                                <p className="text-sm text-gray-600">Your Combat Power</p>
                                <p className="text-3xl font-bold text-purple-800">
                                    {gameState.currentBattle ?
                                        calculateTotalStats(gameState.players.find(p => p.id === gameState.currentPlayerId)!).attack +
                                        Math.floor(calculateTotalStats(gameState.players.find(p => p.id === gameState.currentPlayerId)!).defense * 0.5)
                                        : 0}
                                </p>
                            </div>

                            {isPlayerTurn && (
                                <button
                                    onClick={resolveBattle}
                                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    Fight!
                                </button>
                            )}
                        </div>
                    </BottomSheet>
                )}

                {/* Reward Bottom Sheet */}
                {currentReward && (
                    <BottomSheet
                        isOpen={showBottomSheet}
                        onClose={closeRewardDisplay}
                        title="Reward Earned!"
                    >
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                                <Trophy size={64} className="text-white" />
                            </div>

                            <div className={`p-6 rounded-2xl ${RARITIES[currentReward.rarity].bgColor} border-2 ${RARITIES[currentReward.rarity].color.replace('text-', 'border-')}`}>
                                <ItemIcon icon={currentReward.icon} size={48} />
                                <h3 className={`text-2xl font-bold mt-3 ${RARITIES[currentReward.rarity].color}`}>
                                    {currentReward.name}
                                </h3>
                                <p className={`text-lg mt-1 ${RARITIES[currentReward.rarity].color} capitalize`}>
                                    {currentReward.rarity} {currentReward.type}
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Power:</span> {currentReward.stats}
                                    </p>
                                    {currentReward.effect && (
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Effect:</span> {currentReward.effect.replace(/_/g, ' ')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={closeRewardDisplay}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Awesome! Continue
                            </button>
                        </div>
                    </BottomSheet>
                )}

                {/* Trap Bottom Sheet */}
                {gameState.phase === 'trap' && gameState.activeTrap && (
                    <BottomSheet
                        isOpen={showBottomSheet}
                        onClose={() => {}}
                        title="Trap Activated!"
                    >
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-pulse">
                                <AlertTriangle size={64} className="text-white" />
                            </div>

                            <div>
                                <p className="text-lg text-gray-600">Set by</p>
                                <p className="text-2xl font-bold text-gray-900">{gameState.activeTrap.ownerName}</p>
                            </div>

                            <div className="bg-orange-100 p-4 rounded-2xl">
                                <p className="text-xl font-semibold text-orange-800">
                                    {gameState.activeTrap.type === 'damage' && `You take ${gameState.activeTrap.power} damage!`}
                                    {gameState.activeTrap.type === 'creature' && 'A creature attacks!'}
                                    {gameState.activeTrap.type === 'item_loss' && 'You lose a random item!'}
                                </p>
                            </div>
                        </div>
                    </BottomSheet>
                )}

                {/* Game Over Modal */}
                {gameState.phase === 'game_over' && gameState.winner && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                                <Castle size={64} className="text-white" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Victory!</h2>
                                <p className="text-xl text-gray-600">
                                    {gameState.winner.username} has reached Red Rock Castle!
                                </p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-2xl">
                                <p className="text-sm text-gray-600">Final Stats</p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Questions:</span>
                                        <span className="font-bold ml-1">{gameState.winner.stats.questionsAnswered}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Correct:</span>
                                        <span className="font-bold ml-1">{gameState.winner.stats.correctAnswers}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Battles Won:</span>
                                        <span className="font-bold ml-1">{gameState.winner.stats.battlesWon}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Items:</span>
                                        <span className="font-bold ml-1">{gameState.winner.inventory.length}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setGameMode('menu');
                                    setGameState({
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
                                    setActiveTab('game');
                                }}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default QuizBoardGameMobile;
