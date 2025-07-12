import React, { useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MobileGameBoard from '../components/MobileGameBoard';
import RewardDisplay from '../components/RewardDisplay';
import {
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull, Package,
    Heart, Trophy, Target, Dices, User, Zap
} from 'lucide-react';
import { ItemSlot } from '../types/game.types';
import MobileBattleScreen from '../components/MobileBattleScreen';
import backgroundImg from '../assets/images/background.jpg';

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
    const { gameState, gameMode, battleLogic } = props;
    const [activeTab, setActiveTab] = useState<'game' | 'inventory' | 'stats'>('game');

    const handleRewardClose = () => {
        // Use the handleRewardDismiss function from props
        props.handleRewardDismiss();
    };

    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen relative">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-8">The Sword and The Staff</h1>
                        <button
                            onClick={() => props.setGameMode('setup')}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameMode === 'setup') {
        return (
            <div className="min-h-screen relative">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
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
                    <h3 className="font-bold text-gray-800">{currentPlayer?.username.toUpperCase()} - Turn</h3>
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

            {/* Battle Section */}
            {gameState.phase === 'battle' && gameState.currentBattle && (
                <MobileBattleScreen
                    battleState={gameState.currentBattle}
                    onAttack={() => {
                        if (gameState.currentBattle) {
                            const newBattleState = battleLogic.playerAttack(gameState.currentBattle);
                            props.updateBattleState(newBattleState);
                        }
                    }}
                    onDefend={() => {
                        if (gameState.currentBattle) {
                            const newBattleState = battleLogic.playerDefend(gameState.currentBattle);
                            props.updateBattleState(newBattleState);
                        }
                    }}
                    onContinue={() => {
                        if (gameState.currentBattle) {
                            const result = battleLogic.resolveBattle(gameState.currentBattle);
                            props.completeBattle(result.playerWon, gameState.currentBattle);
                        }
                    }}
                    isPlayerTurn={currentPlayer?.id === '1'}
                    currentPlayer={currentPlayer}
                />
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
                                    onClick={() => props.handleEquipItem(item)}
                                    className={`p-3 rounded-lg border-2 ${rarityConfig.bgColor} cursor-pointer active:scale-95 transition-transform`}
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ItemIcon icon={item.icon} size={16} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        <div className="capitalize">{item.rarity} {item.type}</div>
                                        <div>Stats: {item.stats}</div>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 font-semibold">
                                        Tap to equip
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
                            <div
                                key={slot}
                                onClick={() => props.handleUnequipItem(slot as ItemSlot)}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer active:scale-95 transition-transform"
                            >
                                <ItemIcon icon={item.icon} size={20} />
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-600 capitalize">{slot}</div>
                                </div>
                                <div className="text-sm font-bold text-green-600">+{item.stats}</div>
                                <div className="text-xs text-red-600 font-semibold">
                                    Tap to unequip
                                </div>
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
        <div className="min-h-screen relative">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImg})` }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-60" />
            <div className="relative z-10 min-h-screen flex flex-col">
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
        </div>
    );
};

export default MobileLayout;
