
import React, { useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MobileGameBoard from '../components/MobileGameBoard';
import RewardDisplay from '../components/RewardDisplay';
import {
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull, Package,
    Heart, Trophy, Target, Dices, User, Zap
} from 'lucide-react';
import { Item } from '../types/game.types';

interface MobileLayoutProps extends ReturnType<typeof useGameLogic> {}

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

const MobileLayout: React.FC<MobileLayoutProps> = (props) => {
    const { gameState, gameMode } = props;
    const [activeTab, setActiveTab] = useState<'game' | 'inventory' | 'stats'>('game');

    const handleRewardClose = () => {
        // Only call the available function from props
        props.setCurrentReward(null);
        // The game logic should handle the rest automatically
    };

    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-8">Quiz Board Game</h1>
                    <button
                        onClick={() => props.setGameMode('setup')}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    if (gameMode === 'setup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Game Setup</h2>
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
                            onClick={() => {
                                console.log('Mobile startGame clicked with:', props.playerSetup);
                                props.startGame();
                            }}
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

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    const humanPlayer = gameState.players.find(p => p.id === '1');

    // Game Screen Content
    const GameContent = () => (
        <div className="space-y-4">
            {/* Game Board */}
            <div className="h-80">
                <MobileGameBoard
                    board={gameState.board}
                    players={gameState.players}
                    currentPlayerId={gameState.currentPlayerId}
                    availableTiles={props.availableTiles}
                    isSelectingTile={props.isSelectingTile}
                    onTileSelection={props.handleTileSelection}
                />
            </div>

            {/* Current Player Info */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">Current Turn</h3>
                    <div className="text-sm text-gray-600">Phase: {gameState.phase}</div>
                </div>
                <div className="flex items-center space-x-3">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: currentPlayer?.color }}
                    />
                    <span className="font-medium">{currentPlayer?.username}</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Heart size={16} />
                        <span>{currentPlayer?.health}/{currentPlayer?.maxHealth}</span>
                    </div>
                </div>
            </div>

            {/* Dice Section */}
            {gameState.phase === 'rolling' && currentPlayer?.id === '1' && (
                <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                    <button
                        onClick={props.rollDice}
                        disabled={props.diceRolling}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Dices className="inline mr-2" size={20} />
                        {props.diceRolling ? 'Rolling...' : 'Roll Dice'}
                    </button>
                    {gameState.diceValue && (
                        <div className="mt-2 text-2xl font-bold text-blue-600">
                            🎲 {gameState.diceValue}
                        </div>
                    )}
                </div>
            )}

            {/* Question Section */}
            {gameState.phase === 'question' && gameState.currentQuestion && (
                <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                            {gameState.currentQuestion.category}
                        </span>
                        <h3 className="font-bold text-gray-800 text-sm">
                            {gameState.currentQuestion.question}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {gameState.currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => props.setSelectedAnswer(index)}
                                disabled={props.selectedAnswer !== null || currentPlayer?.id !== '1'}
                                className={`w-full p-3 text-left border-2 rounded-lg transition-all text-sm ${
                                    props.selectedAnswer === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                } ${currentPlayer?.id !== '1' ? 'opacity-50' : ''}`}
                            >
                                {String.fromCharCode(65 + index)}. {option}
                            </button>
                        ))}
                    </div>
                    {props.selectedAnswer !== null && currentPlayer?.id === '1' && (
                        <button
                            onClick={props.handleAnswerSubmit}
                            className="w-full mt-3 bg-green-600 text-white font-bold py-2 rounded-lg"
                        >
                            Submit Answer
                        </button>
                    )}
                </div>
            )}

            {/* Battle Section */}
            {gameState.phase === 'battle' && gameState.currentBattle && (
                <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="text-center">
                        <h3 className="font-bold text-red-600 mb-3">⚔️ Battle!</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="font-bold text-blue-600 text-sm">{currentPlayer?.username}</div>
                                <div className="text-xs text-gray-600">
                                    HP: {currentPlayer?.health}/{currentPlayer?.maxHealth}
                                </div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <div className="font-bold text-red-600 text-sm">{gameState.currentBattle.enemy.name}</div>
                                <div className="text-xs text-gray-600">
                                    Power: {gameState.currentBattle.enemy.power}
                                </div>
                            </div>
                        </div>
                        {currentPlayer?.id === '1' && (
                            <button
                                onClick={props.resolveBattle}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Fight!
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* End Turn Button */}
            {props.canEndTurn && currentPlayer?.id === '1' && (
                <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                    <button
                        onClick={props.endTurn}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        End Turn
                    </button>
                </div>
            )}
        </div>
    );

    // Inventory Screen Content
    const InventoryContent = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">Inventory</h3>
                {humanPlayer?.inventory.length ? (
                    <div className="grid grid-cols-2 gap-3">
                        {humanPlayer.inventory.map((item, index) => {
                            const rarityConfig = RARITIES[item.rarity];
                            return (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-2 ${rarityConfig.bgColor}`}
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ItemIcon icon={item.icon} size={16} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        <div className="capitalize">{item.rarity} {item.type}</div>
                                        <div>Stats: {item.stats}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <Package size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No items in inventory</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">Equipped Items</h3>
                {Object.keys(humanPlayer?.equipped || {}).length ? (
                    <div className="space-y-3">
                        {Object.entries(humanPlayer?.equipped || {}).map(([slot, item]) => (
                            <div key={slot} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <ItemIcon icon={item.icon} size={20} />
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-600 capitalize">{slot}</div>
                                </div>
                                <div className="text-sm font-bold text-green-600">+{item.stats}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <Shield size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No equipment equipped</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Stats Screen Content
    const StatsContent = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">Player Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Health</span>
                        <div className="flex items-center space-x-2">
                            <Heart size={16} className="text-red-500" />
                            <span className="font-bold">{humanPlayer?.health}/{humanPlayer?.maxHealth}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Attack</span>
                        <div className="flex items-center space-x-2">
                            <Sword size={16} className="text-orange-500" />
                            <span className="font-bold">{humanPlayer?.baseStats.attack}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Defense</span>
                        <div className="flex items-center space-x-2">
                            <Shield size={16} className="text-blue-500" />
                            <span className="font-bold">{humanPlayer?.baseStats.defense}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Speed</span>
                        <div className="flex items-center space-x-2">
                            <Zap size={16} className="text-yellow-500" />
                            <span className="font-bold">{humanPlayer?.baseStats.speed}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">Game Progress</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Questions Answered</span>
                        <div className="flex items-center space-x-2">
                            <Target size={16} className="text-purple-500" />
                            <span className="font-bold">{humanPlayer?.stats.questionsAnswered}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Correct Answers</span>
                        <div className="flex items-center space-x-2">
                            <Trophy size={16} className="text-green-500" />
                            <span className="font-bold">{humanPlayer?.stats.correctAnswers}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Battles Won</span>
                        <div className="flex items-center space-x-2">
                            <Sword size={16} className="text-red-500" />
                            <span className="font-bold">{humanPlayer?.stats.battlesWon}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tiles Moved</span>
                        <div className="flex items-center space-x-2">
                            <User size={16} className="text-blue-500" />
                            <span className="font-bold">{humanPlayer?.stats.tilesMovedTotal}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-4">All Players</h3>
                <div className="space-y-3">
                    {gameState.players.map((player, index) => (
                        <div key={player.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: player.color }}
                            />
                            <div className="flex-1">
                                <div className="font-medium">{player.username}</div>
                                <div className="text-sm text-gray-600">Position: {player.position}</div>
                            </div>
                            <div className="text-sm">
                                <div className="flex items-center space-x-1">
                                    <Heart size={12} />
                                    <span>{player.health}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            {/* Reward Display */}
            <RewardDisplay
                item={props.currentReward}
                onClose={handleRewardClose}
            />

            {/* Main Content */}
            <div className="flex-1 p-4 pb-20">
                {activeTab === 'game' && <GameContent />}
                {activeTab === 'inventory' && <InventoryContent />}
                {activeTab === 'stats' && <StatsContent />}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
                <div className="flex justify-around p-3">
                    <button
                        onClick={() => setActiveTab('game')}
                        className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                            activeTab === 'game'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Dices size={20} />
                        <span className="text-xs mt-1">Game</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                            activeTab === 'inventory'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Package size={20} />
                        <span className="text-xs mt-1">Inventory</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                            activeTab === 'stats'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Trophy size={20} />
                        <span className="text-xs mt-1">Stats</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileLayout;
