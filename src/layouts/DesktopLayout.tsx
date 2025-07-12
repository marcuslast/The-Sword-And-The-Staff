
import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from '../components/GameBoard';
import GameStatus from '../components/GameStatus';
import EquipmentPanel from '../components/EquipmentPanel';
import {
    AlertCircle, Trophy, Sword, Shield, Crown, Gem, Star,
    Heart, Skull, Package, Target, Zap, Move, User,
    Dices, Castle, Swords, AlertTriangle, Sparkles
} from 'lucide-react';
import { Item } from '../types/game.types';

interface DesktopLayoutProps extends ReturnType<typeof useGameLogic> {}

// Item Icon Component
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

// Rarity configurations
const RARITIES = {
    'common': { multiplier: 1, color: 'text-gray-500', bgColor: 'bg-gray-100', chance: 50 },
    'uncommon': { multiplier: 2, color: 'text-green-600', bgColor: 'bg-green-100', chance: 30 },
    'rare': { multiplier: 2.5, color: 'text-blue-600', bgColor: 'bg-blue-100', chance: 12 },
    'very rare': { multiplier: 3, color: 'text-purple-600', bgColor: 'bg-purple-100', chance: 6 },
    'legendary': { multiplier: 5, color: 'text-yellow-600', bgColor: 'bg-yellow-100', chance: 2 }
};

// Question Component
const QuestionComponent: React.FC<{
    gameState: any;
    selectedAnswer: number | null;
    setSelectedAnswer: (answer: number | null) => void;
    showResult: boolean;
    handleAnswerSubmit: () => void;
}> = ({ gameState, selectedAnswer, setSelectedAnswer, showResult, handleAnswerSubmit }) => {
    if (!gameState.currentQuestion || gameState.phase !== 'question') return null;

    const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentPlayerId);
    const isPlayerTurn = currentPlayer?.id === '1'; // Assuming '1' is the human player

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-2">
                    {gameState.currentQuestion.category}
                </span>
                <h3 className="text-xl font-bold text-gray-800">
                    {gameState.currentQuestion.question}
                </h3>
            </div>

            <div className="space-y-3">
                {gameState.currentQuestion.options.map((option: string, index: number) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (!isPlayerTurn) return;
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

// Reward Display Component
const RewardDisplay: React.FC<{ item: Item | null; onClose: () => void }> = ({ item, onClose }) => {
    if (!item) return null;

    const rarityConfig = RARITIES[item.rarity];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border-4" style={{ borderColor: rarityConfig.color.replace('text-', '#') }}>
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
        </div>
    );
};

// Battle Component
const BattleComponent: React.FC<{
    gameState: any;
    battleLogic: any;
    updateBattleState: any;
}> = ({ gameState, battleLogic, updateBattleState }) => {
    if (!gameState.currentBattle || gameState.phase !== 'battle') return null;

    const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentPlayerId);
    const isPlayerTurn = currentPlayer?.id === '1';

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="text-2xl font-bold mb-4 text-red-600">Battle!</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-600 mb-2">{currentPlayer?.username}</h4>
                        <div className="space-y-1 text-sm">
                            <div>Health: {gameState.currentBattle.playerHealth}/{gameState.currentBattle.playerMaxHealth}</div>
                            <div>Attack: {gameState.currentBattle.playerStats.attack}</div>
                            <div>Defense: {gameState.currentBattle.playerStats.defense}</div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-600 mb-2">{gameState.currentBattle.enemy.name}</h4>
                        <div className="space-y-1 text-sm">
                            <div>Health: {gameState.currentBattle.enemyHealth}/{gameState.currentBattle.enemyMaxHealth}</div>
                            <div>Power: {gameState.currentBattle.enemy.power}</div>
                        </div>
                    </div>
                </div>

                {gameState.currentBattle.phase === 'player_attack' && isPlayerTurn && (
                    <div className="space-x-4">
                        <button
                            onClick={() => {
                                const newBattleState = battleLogic.playerAttack(gameState.currentBattle);
                                updateBattleState(newBattleState);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Attack!
                        </button>
                        <button
                            onClick={() => {
                                const newBattleState = battleLogic.playerDefend(gameState.currentBattle);
                                updateBattleState(newBattleState);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Defend
                        </button>
                    </div>
                )}

                {gameState.currentBattle.phase === 'enemy_attack' && (
                    <div className="text-gray-600 font-medium animate-pulse">
                        🤖 {gameState.currentBattle.enemy.name} is attacking...
                    </div>
                )}

                {(gameState.currentBattle.phase === 'victory' || gameState.currentBattle.phase === 'defeat') && (
                    <div className={`text-2xl font-bold ${
                        gameState.currentBattle.phase === 'victory' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {gameState.currentBattle.phase === 'victory' ? 'Victory!' : 'Defeated!'}
                    </div>
                )}
            </div>
        </div>
    );
};

// End Turn Component
const EndTurnComponent: React.FC<{
    canEndTurn: boolean;
    onEndTurn: () => void;
    currentPlayer: any;
}> = ({ canEndTurn, onEndTurn, currentPlayer }) => {
    if (!canEndTurn || currentPlayer?.id !== '1') return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-center">
                <button
                    onClick={onEndTurn}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    End Turn
                </button>
            </div>
        </div>
    );
};

const DesktopLayout: React.FC<DesktopLayoutProps> = (props) => {
    const { gameState, gameMode } = props;

    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-8">Quiz Board Game</h1>
                    <button
                        onClick={() => props.setGameMode('setup')}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    if (gameMode === 'setup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Game Setup</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={props.playerSetup.name}
                            onChange={(e) => props.setPlayerSetup({...props.playerSetup, name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            value={props.playerSetup.playerCount}
                            onChange={(e) => props.setPlayerSetup({...props.playerSetup, playerCount: parseInt(e.target.value)})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value={2}>2 Players</option>
                            <option value={3}>3 Players</option>
                            <option value={4}>4 Players</option>
                        </select>
                        <button
                            onClick={props.startGame}
                            disabled={!props.playerSetup.name.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentPlayerId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
                    {/* Game Board */}
                    <div className="lg:col-span-3">
                        <GameBoard
                            board={gameState.board}
                            players={gameState.players}
                            currentPlayerId={gameState.currentPlayerId}
                            availableTiles={props.availableTiles}
                            isSelectingTile={props.isSelectingTile}
                            onTileSelection={props.handleTileSelection}
                        />
                    </div>

                    {/* Side Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <GameStatus
                            gameState={gameState}
                            diceRolling={props.diceRolling}
                            onRollDice={props.rollDice}
                            isSelectingTile={props.isSelectingTile}
                            availableTiles={props.availableTiles}
                        />

                        <EquipmentPanel
                            player={currentPlayer}
                            onEquipItem={props.handleEquipItem}
                            onUnequipItem={props.handleUnequipItem}
                        />

                        <EndTurnComponent
                            canEndTurn={props.canEndTurn}
                            onEndTurn={props.endTurn}
                            currentPlayer={currentPlayer}
                        />
                    </div>
                </div>

                {/* Game Phase Overlays */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="pointer-events-auto max-w-2xl w-full">
                            <BattleComponent
                                gameState={gameState}
                                battleLogic={props.battleLogic}
                                updateBattleState={props.updateBattleState}
                            />
                        </div>
                    </div>
                </div>

                {/* Reward Display */}
                <RewardDisplay
                    item={props.currentReward}
                    onClose={() => props.setCurrentReward(null)}
                />
            </div>
        </div>
    );
};

export default DesktopLayout;
