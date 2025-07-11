import React, { useState, useEffect, useRef } from 'react';
import {
    AlertCircle, Trophy, Sword, Shield, Crown, Gem, Star,
    Heart, Skull, Package, Target, Zap, Move, User,
    Dices, Castle, Swords, AlertTriangle, Sparkles
} from 'lucide-react';
import {
    Item,
    Question,
    Trap,
    Enemy,
    Tile,
    Player,
    GameState
} from "./types/game.types";
import Dice from './components/Dice'
import {createGameBoard, generateRandomItem, getAvailableTiles, getOrderedPathTiles} from './utils/gameLogic';
import { PLAYER_COLORS, QUESTIONS } from './utils/gameData';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import { generateRandomQuestion } from './utils/gameData';
import EquipmentPanel from './components/EquipmentPanel';
import { getItemSlot, calculateTotalStats } from './utils/equipmentLogic';
import { ItemSlot } from './types/game.types';

// Add this function to handle general tile clicks (for debugging or future features)
const handleTileClick = (tile: Tile) => {
    // For now, just log tile information - you can expand this later
    console.log('Tile clicked:', tile);
};

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 8;
const MIN_PATH_LENGTH = 35;
const MAX_PATH_LENGTH = 45;

// Rarity configurations
const RARITIES = {
    'common': { multiplier: 1, color: 'text-gray-500', bgColor: 'bg-gray-100', chance: 50 },
    'uncommon': { multiplier: 2, color: 'text-green-600', bgColor: 'bg-green-100', chance: 30 },
    'rare': { multiplier: 2.5, color: 'text-blue-600', bgColor: 'bg-blue-100', chance: 12 },
    'very rare': { multiplier: 3, color: 'text-purple-600', bgColor: 'bg-purple-100', chance: 6 },
    'legendary': { multiplier: 5, color: 'text-yellow-600', bgColor: 'bg-yellow-100', chance: 2 }
};

// Sample items
const ITEM_POOL: Omit<Item, 'id'>[] = [
    { name: 'Wooden Sword', type: 'weapon', rarity: 'common', stats: 10, icon: 'sword' },
    { name: 'Iron Shield', type: 'armor', rarity: 'uncommon', stats: 20, icon: 'shield' },
    { name: 'Mystic Staff', type: 'weapon', rarity: 'rare', stats: 25, icon: 'wand' },
    { name: 'Dragon Crown', type: 'armor', rarity: 'very rare', stats: 30, icon: 'crown' },
    { name: 'Eternal Gem', type: 'weapon', rarity: 'legendary', stats: 50, icon: 'gem' },
    { name: 'Spike Trap', type: 'trap', rarity: 'common', stats: 15, icon: 'trap', effect: 'damage' },
    { name: 'Monster Box', type: 'trap', rarity: 'uncommon', stats: 25, icon: 'creature', effect: 'creature' },
    { name: 'Thief\'s Curse', type: 'trap', rarity: 'rare', stats: 0, icon: 'package', effect: 'item_loss' }
];

// Sample enemies
const ENEMIES: Omit<Enemy, 'id' | 'reward'>[] = [
    { name: 'Goblin Scout', health: 30, power: 15 },
    { name: 'Stone Golem', health: 50, power: 25 },
    { name: 'Dark Knight', health: 70, power: 35 },
    { name: 'Dragon Whelp', health: 100, power: 50 }
];

// Random path generation
const generateRandomPath = (): [number, number][] => {
    const pathPatterns = [
        // Pattern 1: Staircase pattern
        () => {
            const path: [number, number][] = [];
            let x = 0, y = BOARD_HEIGHT - 1;

            while (x < BOARD_WIDTH - 1 || y > 0) {
                path.push([x, y]);

                // Move right for 2-3 steps, then up for 1-2 steps
                const rightSteps = Math.floor(Math.random() * 2) + 2;
                const upSteps = Math.floor(Math.random() * 2) + 1;

                // Move right
                for (let i = 0; i < rightSteps && x < BOARD_WIDTH - 1; i++) {
                    x++;
                    path.push([x, y]);
                }

                // Move up
                for (let i = 0; i < upSteps && y > 0; i++) {
                    y--;
                    path.push([x, y]);
                }
            }

            return path;
        },

        // Pattern 2: Zigzag pattern
        () => {
            const path: [number, number][] = [];
            let x = 0, y = BOARD_HEIGHT - 1;
            let movingRight = true;

            while (y > 0) {
                path.push([x, y]);

                if (movingRight) {
                    // Move right until we hit the edge or decide to turn
                    while (x < BOARD_WIDTH - 1 && Math.random() < 0.7) {
                        x++;
                        path.push([x, y]);
                    }
                    movingRight = false;
                } else {
                    // Move left until we hit the edge or decide to turn
                    while (x > 0 && Math.random() < 0.7) {
                        x--;
                        path.push([x, y]);
                    }
                    movingRight = true;
                }

                // Move up
                if (y > 0) {
                    y--;
                    path.push([x, y]);
                }
            }

            // Ensure we end at the top-right corner
            while (x < BOARD_WIDTH - 1) {
                x++;
                path.push([x, y]);
            }

            return path;
        },

        // Pattern 3: Curved path
        () => {
            const path: [number, number][] = [];
            let x = 0, y = BOARD_HEIGHT - 1;

            // First segment: move right along bottom
            while (x < Math.floor(BOARD_WIDTH / 2)) {
                path.push([x, y]);
                x++;
            }

            // Second segment: move up along middle
            while (y > Math.floor(BOARD_HEIGHT / 2)) {
                path.push([x, y]);
                y--;
            }

            // Third segment: move right to edge
            while (x < BOARD_WIDTH - 1) {
                path.push([x, y]);
                x++;
            }

            // Fourth segment: move up to top
            while (y > 0) {
                path.push([x, y]);
                y--;
            }

            return path;
        }
    ];

    // Choose a random pattern
    const selectedPattern = pathPatterns[Math.floor(Math.random() * pathPatterns.length)];
    let path = selectedPattern();

    // Ensure minimum length by adding some detours
    if (path.length < MIN_PATH_LENGTH) {
        const extraTiles = MIN_PATH_LENGTH - path.length;
        const midPoint = Math.floor(path.length / 2);

        // Add a small loop at the midpoint
        if (midPoint > 0 && midPoint < path.length - 1) {
            const [baseX, baseY] = path[midPoint];
            const detour: [number, number][] = [];

            // Create a small square detour if possible
            if (baseX > 0 && baseX < BOARD_WIDTH - 2 && baseY > 0 && baseY < BOARD_HEIGHT - 2) {
                detour.push([baseX + 1, baseY]);
                detour.push([baseX + 1, baseY - 1]);
                detour.push([baseX, baseY - 1]);
                detour.push([baseX, baseY]);
            }

            path.splice(midPoint, 0, ...detour);
        }
    }

    return path;
};

// Components
const ItemIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 24 }) => {
    const icons: { [key: string]: React.ReactNode } = {
        'sword': <Sword size={size} />,
        'shield': <Shield size={size} />,
        'crown': <Crown size={size} />,
        'gem': <Gem size={size} />,
        'wand': <Star size={size} />,
        'trap': <AlertTriangle size={size} />,
        'creature': <Skull size={size} />,
        'package': <Package size={size} />
    };
    return <>{icons[icon] || <Sword size={size} />}</>;
};

const QuestionComponent: React.FC<{
    gameState: GameState;
    selectedAnswer: number | null;
    setSelectedAnswer: (answer: number | null) => void;
    showResult: boolean;
    handleAnswerSubmit: () => void;
}> = ({ gameState, selectedAnswer, setSelectedAnswer, showResult, handleAnswerSubmit }) => {
    if (!gameState.currentQuestion || gameState.phase !== 'question') return null;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    const isPlayerTurn = currentPlayer?.id === '1'; // Assuming '1' is the human player

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-2">
                    {gameState.currentQuestion.category}
                </span>
                <h3 className="text-xl font-bold text-gray-800">
                    {gameState.currentQuestion.question}
                </h3>
            </div>

            <div className="space-y-3">
                {gameState.currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            console.log('Answer clicked:', index, 'Current selected:', selectedAnswer);
                            if (!isPlayerTurn) return; // Prevent clicking during AI turns
                            setSelectedAnswer(index);
                        }}
                        disabled={selectedAnswer !== null || showResult || !isPlayerTurn}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200
                            ${selectedAnswer === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                            ${!isPlayerTurn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${selectedAnswer !== null && selectedAnswer !== index ? 'opacity-50' : ''}
                        `}
                    >
                        <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + index)}. {option}
                        </span>
                    </button>
                ))}
            </div>

            {selectedAnswer !== null && isPlayerTurn && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleAnswerSubmit}
                        disabled={showResult}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        Submit Answer
                    </button>
                </div>
            )}

            {showResult && gameState.currentQuestion && (
                <div className="mt-6 p-4 rounded-lg border-2">
                    {selectedAnswer === gameState.currentQuestion.correctAnswer ? (
                        <div className="text-green-700 bg-green-50 border-green-200">
                            <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">✅</span>
                                <span className="font-bold">Correct!</span>
                            </div>
                            <p>You can now move up to {gameState.diceValue} spaces!</p>
                        </div>
                    ) : (
                        <div className="text-red-700 bg-red-50 border-red-200">
                            <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">❌</span>
                                <span className="font-bold">Incorrect!</span>
                            </div>
                            <p>The correct answer was: {gameState.currentQuestion.options[gameState.currentQuestion.correctAnswer]}</p>
                            <p>Your turn ends.</p>
                        </div>
                    )}
                </div>
            )}

            {!isPlayerTurn && (
                <div className="mt-4 text-center text-gray-600 font-medium">
                    🤖 AI is thinking...
                </div>
            )}
        </div>
    );
};

const QuizBoardGame: React.FC = () => {
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

    useEffect(() => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || currentPlayer.id === '1') return; // Not AI turn

        console.log('AI Turn:', {
            playerId: currentPlayer.id,
            phase: gameState.phase,
            selectedAnswer,
            showResult,
            canEndTurn
        });

        const handleAIAction = () => {
            switch (gameState.phase) {
                case 'rolling':
                    // If AI can end turn (has received rewards), decide whether to continue or end
                    if (canEndTurn) {
                        // AI decides to continue playing or end turn (70% chance to continue if no dice rolled yet)
                        const shouldContinue = !gameState.diceValue && Math.random() < 0.7;
                        if (shouldContinue) {
                            setTimeout(() => rollDice(), 1500);
                        } else {
                            setTimeout(() => endTurn(), 2000);
                        }
                    } else {
                        // Normal dice roll
                        setTimeout(() => rollDice(), 1500);
                    }
                    break;

                case 'question':
                    if (!gameState.currentQuestion) return;

                    setTimeout(() => {
                        const randomAnswer = Math.floor(Math.random() * 4);
                        console.log('AI selecting and submitting answer:', randomAnswer);

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
                                // Wrong answer - no movement, but don't end turn
                                setGameState(prev => ({
                                    ...prev,
                                    currentQuestion: null,
                                    phase: 'rolling',
                                    diceValue: null // Clear dice value so they need to roll again
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
                    // AI automatically closes reward and can then choose to continue or end
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
                equipped: {}, // Add this
                baseStats: { // Add this
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
            board: createGameBoard() // Generate new random board
        }));
        setGameMode('playing');
    };

    // Add this function to trigger a question
    const triggerQuestion = () => {
        const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        setSelectedAnswer(null);
        setShowResult(false);

        setGameState(prev => ({
            ...prev,
            phase: 'question',
            currentQuestion: question
        }));
    };

    const RewardDisplay: React.FC<{ item: Item | null; onClose: () => void }> = ({ item, onClose }) => {
        if (!item) return null;

        const rarityConfig = RARITIES[item.rarity];

        return (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto border-4" style={{ borderColor: rarityConfig.color.replace('text-', '') }}>
                <div className="text-center">
                    <div className="text-4xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold mb-2">Item Received!</h3>

                    <div className={`inline-flex items-center space-x-2 p-3 rounded-lg ${rarityConfig.bgColor} mb-4`}>
                        <ItemIcon icon={item.icon} size={32} />
                        <div>
                            <div className={`font-bold text-lg ${rarityConfig.color}`}>
                                {item.name}
                            </div>
                            <div className={`text-sm font-medium ${rarityConfig.color} capitalize`}>
                                {item.rarity} {item.type}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                            <span>Stats:</span>
                            <span className="font-bold">{item.stats}</span>
                        </div>
                        {item.effect && (
                            <div className="flex justify-between">
                                <span>Effect:</span>
                                <span className="font-medium capitalize">{item.effect}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    };

    const PlayerLegend: React.FC = () => {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-2">Players</h3>
                <div className="space-y-2">
                    {gameState?.players.map(player => (
                        <div
                            key={player.id}
                            className={`flex items-center space-x-2 p-2 rounded ${
                                player.id === gameState?.currentPlayerId ? 'bg-yellow-100' : ''
                            }`}
                        >
                            <div
                                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: player.color }}
                            >
                                {player.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{player.username}</span>
                            <span className="text-sm text-gray-600">
                            Pos: {player.position} | HP: {player.health}/{player.maxHealth}
                        </span>
                            {player.id === gameState?.currentPlayerId && (
                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                Current
                            </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const ActionButtons: React.FC = () => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || gameState.phase !== 'moving') return null;

        const pathTiles = gameState.board.filter(t => t.isPath);
        const currentTile = pathTiles[currentPlayer.position];

        return (
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-4">Choose your action:</h3>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={triggerQuestion}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Answer Question (Required to proceed)
                    </button>

                    {currentTile.type === 'battle' && (
                        <div className="text-sm text-gray-600">
                            💀 Battle ahead! Answer correctly to face the enemy.
                        </div>
                    )}

                    {currentTile.type === 'bonus' && (
                        <div className="text-sm text-gray-600">
                            ✨ Bonus tile! Answer correctly for extra rewards.
                        </div>
                    )}

                    {currentTile.type === 'trap' && currentTile.trap && (
                        <div className="text-sm text-gray-600">
                            ⚠️ Trap detected! Answer correctly to avoid it.
                        </div>
                    )}

                    <button
                        onClick={endTurn}
                        className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                    >
                        Skip Turn (No progress)
                    </button>
                </div>
            </div>
        );
    };


    const EndTurnButton: React.FC = () => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        const isPlayerTurn = currentPlayer?.id === '1'; // Human player

        // Show for human player in most phases (except when actively doing something)
        if (!isPlayerTurn) {
            return null;
        }

        // Don't show during active interactions (but allow showing when reward is displayed)
        if (gameState.phase === 'selecting_tile' || showResult) {
            return null;
        }

        return (
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-2 text-gray-800">Turn Options</h3>
                <div className="space-y-2">
                    {gameState.phase === 'rolling' && !gameState.diceValue && !currentReward && (
                        <button
                            onClick={rollDice}
                            disabled={diceRolling}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            {diceRolling ? 'Rolling...' : 'Roll Dice'}
                        </button>
                    )}

                    {/* Show continue/end turn options after receiving reward */}
                    {currentReward && (
                        <button
                            onClick={() => {
                                setCurrentReward(null);
                                setCanEndTurn(true);
                                setGameState(prev => ({
                                    ...prev,
                                    phase: 'rolling'
                                }));
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Continue Playing
                        </button>
                    )}

                    <button
                        onClick={endTurn}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        End Turn
                    </button>

                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-2">
                        Phase: {gameState.phase} | Can End: {canEndTurn ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>
        );
    };

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

                    // If there's already an item in this slot, unequip it first
                    if (oldItem) {
                        p.inventory.push(oldItem);
                    }

                    // Equip the new item
                    newEquipped[slot] = item;

                    // Update health based on new total stats
                    const newTotalStats = calculateTotalStats({
                        ...p,
                        equipped: newEquipped
                    });

                    return {
                        ...p,
                        equipped: newEquipped,
                        inventory: p.inventory.filter(i => i.id !== item.id),
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

                        // Update health based on new total stats
                        const newTotalStats = calculateTotalStats({
                            ...p,
                            equipped: newEquipped
                        });

                        return {
                            ...p,
                            equipped: newEquipped,
                            inventory: [...p.inventory, unequippedItem],
                            maxHealth: newTotalStats.health,
                            health: Math.min(p.health, newTotalStats.health)
                        };
                    }
                }
                return p;
            })
        }));
    };

    // Dice rolling
    const presentQuestion = () => {
        const question = generateRandomQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: question,
            phase: 'question'
        }));
        setSelectedAnswer(null);
        setShowResult(false);
    };

    // Update the rollDice function to use the fixed presentQuestion
    const rollDice = () => {
        if (gameState.phase !== 'rolling') return;

        setDiceRolling(true);

        setTimeout(() => {
            const value = Math.floor(Math.random() * 6) + 1;
            setGameState(prev => ({
                ...prev,
                diceValue: value,
                phase: 'question' // Go directly to question phase after rolling
            }));
            setDiceRolling(false);

            // Present a question immediately after rolling
            setTimeout(() => {
                presentQuestion();
            }, 500);
        }, 1000);
    };

    // Handle answer submission
    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !gameState.currentQuestion) {
            console.log('Cannot submit - no answer selected or no question');
            return;
        }

        console.log('Submitting answer:', selectedAnswer, 'Correct answer:', gameState.currentQuestion.correctAnswer);

        setShowResult(true);
        const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        // Update stats
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
                // ONLY if answer is correct, allow tile selection
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
                // Wrong answer - no movement, just end turn
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: null,
                    phase: 'rolling', // Reset to rolling for next player
                    diceValue: null // Clear dice value
                }));
                // Move to next player
                endTurn();
            }
        }, 2000);
    };

    const startBattle = (enemy: Enemy) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const totalStats = calculateTotalStats(currentPlayer);
        const playerPower = totalStats.attack + Math.floor(totalStats.defense * 0.5); // Combat power calculation

        setGameState(prev => ({
            ...prev,
            phase: 'battle',
            currentBattle: {
                enemy: { ...enemy },
                playerDamage: playerPower
            }
        }));
    };

    const resolveBattle = () => {
        if (!gameState.currentBattle) return;

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        const { enemy, playerDamage } = gameState.currentBattle;

        if (playerDamage >= enemy.health) {
            // Player wins
            giveItemToPlayer(enemy.reward);
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p =>
                    p.id === currentPlayer.id
                        ? { ...p, stats: { ...p.stats, battlesWon: p.stats.battlesWon + 1 } }
                        : p
                )
            }));
        } else {
            // Player loses
            const damage = enemy.power;
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
            setGameState(prev => ({ ...prev, currentBattle: null }));
            endTurn();
        }, 2000);
    };

    const handleTileSelection = (selectedPosition: number) => {
        console.log('=== TILE SELECTION DEBUG ===');
        console.log('Selected position:', selectedPosition);
        console.log('Available tiles:', availableTiles);
        console.log('Is selecting tile:', isSelectingTile);
        console.log('Current game phase:', gameState.phase);

        // Only allow selection if we're in the selecting_tile phase
        if (gameState.phase !== 'selecting_tile' || !isSelectingTile || !availableTiles.includes(selectedPosition)) {
            console.log('Selection blocked - wrong phase or invalid position');
            return;
        }

        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        console.log('Moving player from position', currentPlayer.position, 'to position', selectedPosition);

        // Move player to selected position
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
            phase: 'moving' // Change phase to prevent further tile selection
        }));

        // IMMEDIATELY clear tile selection state to prevent further movement
        setAvailableTiles([]);
        setIsSelectingTile(false);

        // Get the actual tile at the selected position
        const pathTiles = getOrderedPathTiles(gameState.board);
        const selectedTile = pathTiles[selectedPosition];

        console.log('Selected tile:', selectedTile);

        // Check for castle (win condition)
        if (selectedTile && selectedTile.type === 'castle') {
            setGameState(prev => ({
                ...prev,
                phase: 'game_over',
                winner: currentPlayer
            }));
            return;
        }

        // Handle special tile effects
        setTimeout(() => {
            if (selectedTile && selectedTile.type === 'battle' && selectedTile.enemy) {
                startBattle(selectedTile.enemy);
            } else if (selectedTile && selectedTile.type === 'trap' && selectedTile.trap) {
                activateTrap(selectedTile.trap);
            } else if (selectedTile && selectedTile.type === 'bonus') {
                giveRandomItem();
                // Don't end turn here - let player see reward and continue
            } else {
                // Normal tile - give a common item but don't end turn
                const item = generateRandomItem('common');
                giveItemToPlayer(item);
                // Don't end turn here - let player see reward and continue
            }
        }, 500);
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
                    // Start a battle with a random enemy
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
                setGameState(prev => ({ ...prev, activeTrap: null }));
                // After trap resolves, allow player to continue their turn
                setGameState(prev => ({ ...prev, phase: 'rolling' }));
            }, 2000);
        }, 1500);
    };

    const giveRandomItem = () => {
        const item = generateRandomItem();
        giveItemToPlayer(item);
    };

    const giveItemToPlayer = (item: Item) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer) return;

        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? { ...p, inventory: [...p.inventory, item] }
                    : p
            ),
            phase: 'reward'
        }));

        // Show the reward to the player
        setCurrentReward(item);
    };

    const closeRewardDisplay = () => {
        console.log('Closing reward display, setting canEndTurn to true');
        setCurrentReward(null);
        setCanEndTurn(true);

        setGameState(prev => ({
            ...prev,
            phase: 'rolling'
        }));
    };


    // Place trap
    const placeTrap = (trapItem: Item, tileId: number) => {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (!currentPlayer || trapItem.type !== 'trap') return;

        const trap: Trap = {
            id: Date.now().toString(),
            type: trapItem.effect as 'creature' | 'damage' | 'item_loss',
            power: trapItem.stats,
            ownerId: currentPlayer.id,
            ownerName: currentPlayer.username
        };

        setGameState(prev => ({
            ...prev,
            board: prev.board.map(tile =>
                tile.id === tileId ? { ...tile, trap } : tile
            ),
            players: prev.players.map(p =>
                p.id === currentPlayer.id
                    ? { ...p, inventory: p.inventory.filter(i => i.id !== trapItem.id) }
                    : p
            )
        }));
    };

    // End turn
    const endTurn = () => {
        setCanEndTurn(false); // Reset for next player
        setDiceRolling(false);
        setSelectedAnswer(null);
        setShowResult(false);
        setAvailableTiles([]);
        setIsSelectingTile(false);
        setCurrentReward(null);

        setGameState(prev => {
            const currentIndex = prev.players.findIndex(p => p.id === prev.currentPlayerId);
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

    // Main menu
    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-700 to-blue-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                    <h1 className="text-4xl font-bold text-center mb-2">Quest to Red Rock Castle</h1>
                    <p className="text-gray-600 text-center mb-8">A quiz adventure board game</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name</label>
                            <input
                                type="text"
                                value={playerSetup.name}
                                onChange={(e) => setPlayerSetup(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Number of Players</label>
                            <select
                                value={playerSetup.playerCount}
                                onChange={(e) => setPlayerSetup(prev => ({ ...prev, playerCount: Number(e.target.value) }))}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                            >
                                <option value={2}>2 Players (You + 1 AI)</option>
                                <option value={3}>3 Players (You + 2 AI)</option>
                                <option value={4}>4 Players (You + 3 AI)</option>
                            </select>
                        </div>

                        <button
                            onClick={startGame}
                            disabled={!playerSetup.name.trim()}
                            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-bold text-lg"
                        >
                            Start Adventure
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
                        <h3 className="font-bold mb-2">How to Play:</h3>
                        <ul className="space-y-1 text-gray-700">
                            <li>• Roll the dice to move along the path</li>
                            <li>• Answer questions correctly to claim your moves</li>
                            <li>• Battle enemies using collected items</li>
                            <li>• Place traps to sabotage other players</li>
                            <li>• First to reach Red Rock Castle wins!</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-4 bg-blue-100 rounded-lg text-sm">
                        <h3 className="font-bold mb-2 text-blue-800">New: Random Maps!</h3>
                        <p className="text-blue-700">Every game features a unique randomly generated path to the castle!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Game board
    if (gameMode === 'playing') {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        const isPlayerTurn = gameState.currentPlayerId === '1';

        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-700 to-blue-800 p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Game header */}
                    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold">Current Turn: {currentPlayer?.username}</h2>
                                {gameState.phase === 'rolling' && isPlayerTurn && (
                                    <Dice
                                        value={gameState.diceValue}
                                        rolling={diceRolling}
                                        onRoll={rollDice}
                                        disabled={!isPlayerTurn || gameState.phase !== 'rolling'}
                                    />
                                )}
                                {gameState.phase === 'moving' && isPlayerTurn && <ActionButtons />}
                            </div>
                            <div className="text-sm text-gray-600">
                                Phase: {gameState.phase.replace('_', ' ').toUpperCase()}
                            </div>
                            {gameState.currentPlayerId !== '1' && (
                                <div className="text-sm text-gray-600 animate-pulse">
                                    AI is thinking...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main game area */}
                    <div className="flex gap-4">
                        {/* Game board */}
                        <div className="flex-1">
                            <div className="space-y-4">
                                <GameStatus
                                    gameState={gameState}
                                    diceRolling={diceRolling}
                                    onRollDice={rollDice}
                                    isSelectingTile={isSelectingTile}
                                    availableTiles={availableTiles}
                                />
                                <PlayerLegend />
                                <EndTurnButton />


                                <QuestionComponent
                                    gameState={gameState}
                                    selectedAnswer={selectedAnswer}
                                    setSelectedAnswer={setSelectedAnswer}
                                    showResult={showResult}
                                    handleAnswerSubmit={handleAnswerSubmit}
                                />

                                {/* Reward Display */}
                                <RewardDisplay
                                    item={currentReward}
                                    onClose={closeRewardDisplay}
                                />

                                <GameBoard
                                    board={gameState.board}
                                    players={gameState.players}
                                    currentPlayerId={gameState.currentPlayerId}
                                    onTileClick={handleTileClick}
                                    availableTiles={availableTiles}
                                    isSelectingTile={isSelectingTile}
                                    onTileSelection={handleTileSelection}
                                />
                            </div>

                        </div>

                        {/* Side panel */}
                        <div className="w-80">
                            {/* Player stats */}
                            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                                <h3 className="font-bold mb-3">Players</h3>
                                <div className="space-y-2">
                                    {gameState.players.map(player => (
                                        <div
                                            key={player.id}
                                            className={`p-3 rounded ${player.id === gameState.currentPlayerId ? 'bg-blue-100' : 'bg-gray-50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                        <span className="font-medium flex items-center gap-2">
                          <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: player.color }}
                          />
                            {player.username}
                        </span>
                                                <span className="text-sm">Tile {player.position}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="text-red-500" />
                            {player.health}/{player.maxHealth}
                        </span>
                                                <span className="flex items-center gap-1">
                          <Package size={14} className="text-blue-500" />
                                                    {player.inventory.length}
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Equipment Panel - Add this */}
                            {isPlayerTurn && (
                                <EquipmentPanel
                                    player={currentPlayer!}
                                    onEquipItem={handleEquipItem}
                                    onUnequipItem={handleUnequipItem}
                                />
                            )}

                            {/* Current player inventory */}
                            {isPlayerTurn && (
                                <div className="bg-white rounded-lg shadow-lg p-4">
                                    <h3 className="font-bold mb-3">Your Inventory</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {currentPlayer?.inventory
                                            .filter(item => getItemSlot(item) === null) // Only show non-equippable items
                                            .length === 0 ? (
                                            <p className="text-gray-500 text-sm">No consumables or traps</p>
                                        ) : (
                                            currentPlayer?.inventory
                                                .filter(item => getItemSlot(item) === null)
                                                .map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`p-2 rounded ${RARITIES[item.rarity].bgColor}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <ItemIcon icon={item.icon} size={20} />
                                                            <span className={`text-sm font-medium ${RARITIES[item.rarity].color}`}>
                                {item.name}
                              </span>
                                                        </div>
                                                        <span className="text-sm">+{item.stats}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question modal */}
                    {gameState.phase === 'question' && gameState.currentQuestion && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
                                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {gameState.currentQuestion.category}
                  </span>
                                </div>

                                <h3 className="text-2xl font-bold mb-6">{gameState.currentQuestion.question}</h3>

                                <div className="space-y-3">
                                    {gameState.currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedAnswer(index)}
                                            disabled={showResult || !isPlayerTurn}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                selectedAnswer === index
                                                    ? showResult
                                                        ? index === gameState.currentQuestion!.correctAnswer
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-red-500 bg-red-50'
                                                        : 'border-blue-500 bg-blue-50'
                                                    : showResult && index === gameState.currentQuestion!.correctAnswer
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {option}
                                            {showResult && index === gameState.currentQuestion!.correctAnswer && (
                                                <span className="float-right text-green-600">✓</span>
                                            )}
                                            {showResult && selectedAnswer === index && index !== gameState.currentQuestion!.correctAnswer && (
                                                <span className="float-right text-red-600">✗</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {!showResult && isPlayerTurn && (
                                    <button
                                        onClick={handleAnswerSubmit}
                                        disabled={selectedAnswer === null}
                                        className={`mt-6 w-full py-3 px-4 rounded-lg font-bold ${
                                            selectedAnswer === null
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        Submit Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Battle modal */}
                    {gameState.phase === 'battle' && gameState.currentBattle && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                <h2 className="text-2xl font-bold mb-4 text-center">Battle!</h2>

                                <div className="text-center mb-6">
                                    <Swords className="w-16 h-16 text-red-600 mx-auto mb-2" />
                                    <h3 className="text-xl font-bold">{gameState.currentBattle.enemy.name}</h3>
                                    <p className="text-gray-600">Health: {gameState.currentBattle.enemy.health}</p>
                                    <p className="text-gray-600">Power: {gameState.currentBattle.enemy.power}</p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                                    <p className="text-center">
                                        Your Power: <span className="font-bold text-lg">{gameState.currentBattle.playerDamage}</span>
                                    </p>
                                </div>

                                {isPlayerTurn && (
                                    <button
                                        onClick={resolveBattle}
                                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-bold"
                                    >
                                        Fight!
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reward modal */}
                    {gameState.phase === 'reward' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-center mb-4">Reward Earned!</h2>
                                <p className="text-center text-gray-600 mb-4">
                                    You've earned a new item for your inventory!
                                </p>
                                {isPlayerTurn && (
                                    <button
                                        onClick={closeRewardDisplay}
                                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-bold"
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Trap modal */}
                    {gameState.phase === 'trap' && gameState.activeTrap && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-center mb-4">Trap Activated!</h2>
                                <p className="text-center text-gray-600 mb-2">
                                    Set by: {gameState.activeTrap.ownerName}
                                </p>
                                <p className="text-center font-medium">
                                    {gameState.activeTrap.type === 'damage' && `You take ${gameState.activeTrap.power} damage!`}
                                    {gameState.activeTrap.type === 'creature' && 'A creature attacks!'}
                                    {gameState.activeTrap.type === 'item_loss' && 'You lose a random item!'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Game over modal */}
                    {gameState.phase === 'game_over' && gameState.winner && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                <Castle className="w-20 h-20 text-purple-600 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-center mb-4">Victory!</h2>
                                <p className="text-center text-xl mb-6">
                                    {gameState.winner.username} has reached Red Rock Castle!
                                </p>
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
                                    }}
                                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-bold"
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default QuizBoardGame;
