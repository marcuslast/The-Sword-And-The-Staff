import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from '../components/GameBoard';
import Shop from '../components/Shop';
import {
    HealthBar,
    StatsGrid,
    PlayerSummary
} from '../components/HealthDisplay';
import EquipmentPanel from '../components/EquipmentPanel';
import {
    AlertCircle, Trophy, Sword, Shield, Crown, Gem, Star,
    Heart, Skull, Package, Target, Zap, Move, User,
    Dices, Castle, Swords, AlertTriangle, Sparkles, ShoppingCart, Coins,
    Store, MapPin, ArrowLeft, ArrowRight, Navigation
} from 'lucide-react';
import { Item } from '../types/game.types';
import { getStatBreakdowns } from '../utils/equipmentLogic';
import CharacterSelection from "../components/CharacterSelection";
import {CHARACTER_IMAGES} from "../utils/characterImage";
import { getCharacterImage } from '../utils/characterUtils';

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

// ENHANCED: Tile Info Display Component
const TileInfoDisplay: React.FC<{
    currentTile: any;
    isShopAvailable: boolean;
}> = ({ currentTile, isShopAvailable }) => {
    if (!currentTile) return null;

    const getTileIcon = (tileType: string) => {
        switch (tileType) {
            case 'shop':
            case 'village':
            case 'town':
            case 'city':
            case 'merchant':
                return <Store size={16} className="text-yellow-500" />;
            case 'battle':
                return <Swords size={16} className="text-red-500" />;
            case 'bonus':
                return <Sparkles size={16} className="text-purple-500" />;
            case 'trap':
                return <AlertTriangle size={16} className="text-orange-500" />;
            case 'castle':
                return <Castle size={16} className="text-blue-500" />;
            default:
                return <MapPin size={16} className="text-gray-500" />;
        }
    };

    const getTileDescription = (tileType: string) => {
        switch (tileType) {
            case 'shop':
            case 'village':
            case 'town':
            case 'city':
            case 'merchant':
                return 'Shop available';
            case 'battle':
                return 'Battle tile';
            case 'bonus':
                return 'Bonus reward';
            case 'trap':
                return 'Dangerous trap';
            case 'castle':
                return 'Victory tile';
            default:
                return 'Safe tile';
        }
    };

    return (
        <div className={`flex items-center space-x-2 p-2 rounded-lg ${
            isShopAvailable
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-gray-50 border border-gray-200'
        }`}>
            {getTileIcon(currentTile.type)}
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 capitalize">
                    {currentTile.type} Tile
                </div>
                <div className="text-xs text-gray-500">
                    {getTileDescription(currentTile.type)}
                </div>
            </div>
            {isShopAvailable && (
                <div className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    Shop Ready!
                </div>
            )}
        </div>
    );
};

// ENHANCED: Movement Preview Component
const MovementPreview: React.FC<{
    availableTiles: number[];
    currentPosition: number;
    diceValue: number | null;
}> = ({ availableTiles, currentPosition, diceValue }) => {
    if (!diceValue || availableTiles.length === 0) return null;

    const forwardMoves = availableTiles.filter(pos => pos > currentPosition);
    const backwardMoves = availableTiles.filter(pos => pos < currentPosition);

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <Navigation size={16} className="mr-2" />
                Movement Options
            </h4>
            <div className="space-y-2 text-sm">
                {forwardMoves.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <ArrowRight size={14} className="text-green-600" />
                        <span>Forward: {forwardMoves.length} options (tiles {forwardMoves.join(', ')})</span>
                    </div>
                )}
                {backwardMoves.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <ArrowLeft size={14} className="text-blue-600" />
                        <span>Backward: {backwardMoves.length} options (tiles {backwardMoves.join(', ')})</span>
                    </div>
                )}
                <div className="text-xs text-gray-600 pt-1 border-t border-green-200">
                    💡 You can move in both directions!
                </div>
            </div>
        </div>
    );
};

// Clean Game Status Component with Enhanced Shop Button
const CleanGameStatus: React.FC<{
    gameState: any;
    diceRolling: boolean;
    onRollDice: () => void;
    isSelectingTile: boolean;
    availableTiles: number[];
    onHeal?: () => void;
    onOpenShop?: () => void;
    isShopAvailable?: boolean;
    getCurrentTileInfo?: () => any;
}> = ({
          gameState,
          diceRolling,
          onRollDice,
          isSelectingTile,
          availableTiles,
          onHeal,
          onOpenShop,
          isShopAvailable = false,
          getCurrentTileInfo,
      }) => {
    const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentPlayerId);

    if (!currentPlayer) return null;

    const getPhaseMessage = () => {
        switch (gameState.phase) {
            case 'rolling':
                return 'Roll the dice to start your turn!';
            case 'selecting_tile':
                return `Choose where to move (rolled ${gameState.diceValue})`;
            case 'moving':
                return 'Moving to selected tile...';
            case 'battle':
                return 'Battle in progress...';
            case 'trap':
                return 'Trap activated!';
            case 'reward':
                return 'Receiving reward...';
            case 'game_over':
                return `Game Over! ${gameState.winner?.username} wins!`;
            default:
                return 'Game in progress...';
        }
    };

    const statBreakdowns = getStatBreakdowns(currentPlayer);
    const isPlayerTurn = currentPlayer.id === '1';
    const currentTile = getCurrentTileInfo ? getCurrentTileInfo() : null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
            {/* Current Player Header */}
            <div className="text-center border-b border-gray-200 pb-4">
                <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {currentPlayer.character in CHARACTER_IMAGES ? (
                            <img
                                src={getCharacterImage(currentPlayer.character)}
                                alt={currentPlayer.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                <User size={24} className="text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {currentPlayer.username}
                        </h2>
                        <p className="text-gray-600">Position: {currentPlayer.position}</p>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                            <Coins size={16} className="text-yellow-500" />
                            <span className="font-bold text-yellow-600">{currentPlayer.gold} gold</span>
                        </div>
                    </div>
                </div>
                <p className="text-lg text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                    {getPhaseMessage()}
                </p>
            </div>

            {/* ENHANCED: Current Tile Info */}
            {currentTile && (
                <TileInfoDisplay
                    currentTile={currentTile}
                    isShopAvailable={isShopAvailable}
                />
            )}

            {/* Dice Section */}
            {(gameState.phase === 'rolling' || (gameState.diceValue !== null && gameState.phase !== 'selecting_tile')) && (
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <button
                            onClick={onRollDice}
                            disabled={gameState.phase !== 'rolling' || diceRolling}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            <Dices className="inline mr-3" size={24} />
                            {diceRolling ? 'Rolling...' : 'Roll Dice'}
                        </button>
                    </div>

                    {gameState.diceValue && (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                                <span className="text-3xl font-bold text-white">{gameState.diceValue}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ENHANCED: Movement Preview */}
            {isSelectingTile && (
                <MovementPreview
                    availableTiles={availableTiles}
                    currentPosition={currentPlayer.position}
                    diceValue={gameState.diceValue}
                />
            )}

            {/* Enhanced Action Buttons */}
            {gameState.phase === 'rolling' && isPlayerTurn && (
                <div className="flex space-x-3">
                    {/* Heal Button */}
                    {currentPlayer.health < statBreakdowns.health.total && onHeal && (
                        <button
                            onClick={onHeal}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                            <Heart className="inline mr-2" size={20} />
                            Heal 33%
                        </button>
                    )}

                    {/* ENHANCED: Shop Button with Better Visual Feedback */}
                    {onOpenShop && (
                        <button
                            onClick={onOpenShop}
                            disabled={!isShopAvailable}
                            className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg transform ${
                                isShopAvailable
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:scale-105 ring-2 ring-yellow-300 ring-opacity-50'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                            }`}
                            title={isShopAvailable ? 'Open shop - available on this tile!' : 'Shop not available on this tile'}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <ShoppingCart size={20} />
                                <span>Shop</span>
                                {isShopAvailable && (
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                            </div>
                            {!isShopAvailable && (
                                <div className="text-xs mt-1 opacity-75">
                                    Find shop tile
                                </div>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Tile Selection Info */}
            {isSelectingTile && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                    <h3 className="font-bold text-green-800 mb-2 text-lg flex items-center">
                        <Target className="mr-2" size={20} />
                        Choose Your Move!
                    </h3>
                    <p className="text-green-700">
                        Click on any <span className="font-bold text-green-600">glowing green tile</span> to move there.
                        <br />
                        Available moves: <span className="font-bold">{availableTiles.length} tiles</span>
                        <br />
                        <span className="text-sm">💡 You can move both forward and backward!</span>
                    </p>
                </div>
            )}

            {/* Player Stats - Clean Design */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">
                    Player Stats
                </h3>

                {/* Health Bar */}
                <HealthBar player={currentPlayer} showText={true} />

                {/* Stats Grid */}
                <StatsGrid player={currentPlayer} size="small" />

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Package size={20} className="mx-auto mb-1 text-gray-600" />
                        <div className="text-lg font-bold text-gray-900">{currentPlayer.inventory.length}</div>
                        <div className="text-xs text-gray-600">Items</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <div className="text-lg mb-1">💰</div>
                        <div className="text-lg font-bold text-yellow-600">{currentPlayer.gold}</div>
                        <div className="text-xs text-gray-600">Gold</div>
                    </div>
                </div>

                {/* Equipment bonus summary */}
                {(statBreakdowns.attack.bonus > 0 || statBreakdowns.defense.bonus > 0 ||
                    statBreakdowns.health.bonus > 0 || statBreakdowns.speed.bonus > 0) && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <h4 className="font-semibold text-sm mb-2 text-green-800">🛡️ Equipment Bonuses</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {statBreakdowns.health.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>❤️ Health:</span>
                                    <span className="font-bold">+{statBreakdowns.health.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.attack.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>⚔️ Attack:</span>
                                    <span className="font-bold">+{statBreakdowns.attack.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.defense.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>🛡️ Defense:</span>
                                    <span className="font-bold">+{statBreakdowns.defense.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.speed.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>👟 Speed:</span>
                                    <span className="font-bold">+{statBreakdowns.speed.bonus}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reward Display Component
const RewardDisplay: React.FC<{
    item: Item | null;
    onClose: () => void;
    gold?: number;
    isAI?: boolean;
}> = ({ item, onClose }) => {
    if (!item) return null;

    const rarityConfig = RARITIES[item.rarity];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-4 border-gray-200">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">Item Received!</h3>

                    <div className={`inline-flex items-center space-x-3 p-4 rounded-xl ${rarityConfig.bgColor} mb-6 border-2 ${rarityConfig.color.replace('text-', 'border-')}`}>
                        <ItemIcon icon={item.icon} size={40} />
                        <div>
                            <div className={`font-bold text-xl ${rarityConfig.color}`}>
                                {item.name}
                            </div>
                            <div className={`text-sm font-medium ${rarityConfig.color} capitalize`}>
                                {item.rarity} {item.type}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-gray-700 mb-6">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Stats:</span>
                            <span className="font-bold text-green-600">+{item.stats}</span>
                        </div>
                        {item.effect && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Effect:</span>
                                <span className="font-medium capitalize text-purple-600">{item.effect.replace(/_/g, ' ')}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
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
    currentPlayer: any;
}> = ({ gameState, battleLogic, updateBattleState }) => {
    if (!gameState.currentBattle || gameState.phase !== 'battle') return null;

    const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentPlayerId);
    const isPlayerTurn = currentPlayer?.id === '1';

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
            <div className="text-center">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-3xl font-bold mb-6 text-red-600">Battle!</h3>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-blue-600 text-xl mb-4">
                            {currentPlayer.username} {currentPlayer.id !== '1' ? '(AI)' : ''}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Health:</span>
                                <span className="font-bold">{gameState.currentBattle.playerHealth}/{gameState.currentBattle.playerMaxHealth}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Attack:</span>
                                <span className="font-bold">{gameState.currentBattle.playerStats.attack}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Defense:</span>
                                <span className="font-bold">{gameState.currentBattle.playerStats.defense}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                        <h4 className="font-bold text-red-600 text-xl mb-4">{gameState.currentBattle.enemy.name}</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Health:</span>
                                <span className="font-bold">{gameState.currentBattle.enemyHealth}/{gameState.currentBattle.enemyMaxHealth}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Power:</span>
                                <span className="font-bold">{gameState.currentBattle.enemy.power}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {gameState.currentBattle.phase === 'player_attack' && isPlayerTurn && (
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => {
                                const newBattleState = battleLogic.playerAttack(gameState.currentBattle);
                                updateBattleState(newBattleState);
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                            <Sword className="inline mr-2" size={20} />
                            Attack!
                        </button>
                        <button
                            onClick={() => {
                                const newBattleState = battleLogic.playerDefend(gameState.currentBattle);
                                updateBattleState(newBattleState);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                        >
                            <Shield className="inline mr-2" size={20} />
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
                    <div className={`text-3xl font-bold ${
                        gameState.currentBattle.phase === 'victory' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {gameState.currentBattle.phase === 'victory' ? '🎉 Victory!' : '💀 Defeated!'}
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
            <button
                onClick={onEndTurn}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
            >
                End Turn
            </button>
        </div>
    );
};

const DesktopLayout: React.FC<DesktopLayoutProps> = (props) => {
    const { gameState, gameMode } = props;

    if (gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-8">The Sword and The Staff</h1>
                    <button
                        onClick={() => props.setGameMode('setup')}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    // Update the setup section
    if (gameMode === 'setup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Game Setup</h2>
                    <div className="space-y-6">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={props.playerSetup.name}
                            onChange={(e) => props.setPlayerSetup({...props.playerSetup, name: e.target.value})}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        />

                        <CharacterSelection
                            selectedCharacter={props.playerSetup.character}
                            onSelect={(character) => props.setPlayerSetup({...props.playerSetup, character})}
                        />

                        <select
                            value={props.playerSetup.playerCount}
                            onChange={(e) => props.setPlayerSetup({...props.playerSetup, playerCount: parseInt(e.target.value)})}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        >
                            <option value={2}>2 Players</option>
                            <option value={3}>3 Players</option>
                            <option value={4}>4 Players</option>
                        </select>
                        <button
                            onClick={props.startGame}
                            disabled={!props.playerSetup.name.trim() || !props.playerSetup.character}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg transform hover:scale-105 disabled:transform-none"
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
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
                    <div className="lg:col-span-1 space-y-6">
                        <CleanGameStatus
                            gameState={gameState}
                            diceRolling={props.diceRolling}
                            onRollDice={props.rollDice}
                            isSelectingTile={props.isSelectingTile}
                            availableTiles={props.availableTiles}
                            onHeal={props.handleHeal}
                            onOpenShop={props.openShop}
                            isShopAvailable={props.isShopAvailable()}
                            getCurrentTileInfo={props.getCurrentTileInfo}
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
                        <div className="pointer-events-auto max-w-4xl w-full">
                            <BattleComponent
                                gameState={gameState}
                                battleLogic={props.battleLogic}
                                updateBattleState={props.updateBattleState}
                                currentPlayer={currentPlayer}
                            />
                        </div>
                    </div>
                </div>

                {/* Shop Modal */}
                <Shop
                    isOpen={props.showShop}
                    onClose={props.closeShop}
                    player={currentPlayer}
                    onBuyItem={props.handleBuyItem}
                    onSellItem={props.handleSellItem}
                />

                {/* Reward Display */}
                <RewardDisplay
                    item={props.currentReward}
                    onClose={() => props.setCurrentReward(null)}
                    gold={gameState.players.find((p: any) => p.id === gameState.currentPlayerId)?.lastGoldWin}
                    isAI={currentPlayer?.id !== '1'}
                />
            </div>
        </div>
    );
};

export default DesktopLayout;
