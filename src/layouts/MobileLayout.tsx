import React, { useState, useRef, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import MobileGameBoard from '../components/MobileGameBoard';
import RewardDisplay from '../components/RewardDisplay';
import MobileShop from '../components/MobileShop';
import {
    StatsList,
    HealthBar,
    PlayerSummary
} from '../components/HealthDisplay';
import {
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull, Package,
    Heart, Trophy, Dices, User, Zap, Plus, ShoppingCart, Coins,
    Store, MapPin, ArrowLeft, ArrowRight, Navigation
} from 'lucide-react';
import { ItemSlot } from '../types/game.types';
import MobileBattleScreen from '../components/MobileBattleScreen';
import { getStatBreakdowns } from '../utils/equipmentLogic';
import backgroundImg from '../assets/images/background.jpg';
import CharacterSelection from "../components/CharacterSelection";
import {CHARACTER_IMAGES} from "../utils/characterImage";

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

// ENHANCED: Mobile Tile Info Display Component
const MobileTileInfoDisplay: React.FC<{
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
                return <Store size={14} className="text-yellow-500" />;
            case 'battle':
                return <Sword size={14} className="text-red-500" />;
            case 'bonus':
                return <Star size={14} className="text-purple-500" />;
            case 'trap':
                return <AlertTriangle size={14} className="text-orange-500" />;
            case 'castle':
                return <Crown size={14} className="text-blue-500" />;
            default:
                return <MapPin size={14} className="text-gray-500" />;
        }
    };

    return (
        <div className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
            isShopAvailable
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-gray-50 border border-gray-200'
        }`}>
            {getTileIcon(currentTile.type)}
            <div className="flex-1">
                <div className="font-medium text-gray-700 capitalize">
                    {currentTile.type}
                </div>
            </div>
            {isShopAvailable && (
                <div className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    Shop!
                </div>
            )}
        </div>
    );
};

// ENHANCED: Mobile Movement Preview Component
const MobileMovementPreview: React.FC<{
    availableTiles: number[];
    currentPosition: number;
    diceValue: number | null;
}> = ({ availableTiles, currentPosition, diceValue }) => {
    if (!diceValue || availableTiles.length === 0) return null;

    const forwardMoves = availableTiles.filter(pos => pos > currentPosition);
    const backwardMoves = availableTiles.filter(pos => pos < currentPosition);

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center text-sm">
                <Navigation size={14} className="mr-2" />
                Movement Options
            </h4>
            <div className="space-y-1 text-xs">
                {forwardMoves.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <ArrowRight size={12} className="text-green-600" />
                        <span>Forward: {forwardMoves.length} options</span>
                    </div>
                )}
                {backwardMoves.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <ArrowLeft size={12} className="text-blue-600" />
                        <span>Backward: {backwardMoves.length} options</span>
                    </div>
                )}
                <div className="text-xs text-gray-600 pt-1 border-t border-green-200">
                    💡 Tap any glowing tile to move!
                </div>
            </div>
        </div>
    );
};

const MobileLayout: React.FC<MobileLayoutProps> = (props) => {
    const { gameState, gameMode, battleLogic } = props;
    const [activeTab, setActiveTab] = useState<'game' | 'inventory' | 'stats' | 'shop'>('game');

    const handleRewardClose = () => {
        props.handleRewardDismiss();
    };

    const battleScreenRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (gameState.phase === 'battle' && battleScreenRef.current) {
            battleScreenRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [gameState.phase]);

    // Auto-switch away from shop tab when shop becomes unavailable
    useEffect(() => {
        const shopAvailable = props.isShopAvailable();
        if (activeTab === 'shop' && !shopAvailable) {
            setActiveTab('game');
        }
    }, [activeTab, gameState.currentPlayerId, props]);

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

    // In the setup section (gameMode === 'setup')
    if (gameMode === 'setup') {
        return (
            <div className="min-h-screen relative">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-2">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Game Setup</h2>
                        <div className="space-y-4">
                            <div className="w-full -mx-2">
                                <CharacterSelection
                                    selectedCharacter={props.playerSetup.character}
                                    onSelect={(character) => props.setPlayerSetup({...props.playerSetup, character})}
                                />

                                <input
                                    type="text"
                                    placeholder="Enter your Character name"
                                    value={props.playerSetup.name}
                                    onChange={(e) => props.setPlayerSetup({...props.playerSetup, name: e.target.value})}
                                    className="m-2 w-full text-center p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

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
                                disabled={!props.playerSetup.name.trim() || !props.playerSetup.character}
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
    const availableItems = currentPlayer?.inventory.filter(item =>
        ['potion', 'consumable', 'mythic'].includes(item.type)
    ) || [];

    // Updated Game Screen Content with cleaner stats
    const GameContent = () => {
        // Get current values inside the component
        const currentTileInfo = props.getCurrentTileInfo ? props.getCurrentTileInfo() : null;
        const shopAvailable = props.isShopAvailable();

        return (
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

                {/* ENHANCED: Current Tile Info */}
                {currentTileInfo && (
                    <MobileTileInfoDisplay
                        currentTile={currentTileInfo}
                        isShopAvailable={shopAvailable}
                    />
                )}

                {/* REDESIGNED Current Player Info */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                                <img
                                    src={CHARACTER_IMAGES[currentPlayer.character]}
                                    alt={currentPlayer.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{currentPlayer?.username}</h3>
                                <p className="text-sm text-gray-600 capitalize">{gameState.phase.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Position</p>
                            <p className="text-xl font-bold text-purple-600">{currentPlayer?.position}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                                <Coins size={14} className="text-yellow-500" />
                                <span className="text-sm font-bold text-yellow-600">{currentPlayer?.gold}</span>
                            </div>
                        </div>
                    </div>

                    {/* Clean Health Bar */}
                    <div className="mb-3">
                        <HealthBar player={currentPlayer} showText={true} />
                    </div>

                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {(() => {
                            const breakdowns = getStatBreakdowns(currentPlayer);
                            return (
                                <>
                                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                                        <Sword size={16} className="text-orange-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-gray-900">{breakdowns.attack.total}</div>
                                        {breakdowns.attack.bonus > 0 && (
                                            <div className="text-xs text-green-600 font-medium">+{breakdowns.attack.bonus}</div>
                                        )}
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                                        <Shield size={16} className="text-blue-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-gray-900">{breakdowns.defense.total}</div>
                                        {breakdowns.defense.bonus > 0 && (
                                            <div className="text-xs text-green-600 font-medium">+{breakdowns.defense.bonus}</div>
                                        )}
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                                        <Zap size={16} className="text-yellow-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-gray-900">{breakdowns.speed.total}</div>
                                        {breakdowns.speed.bonus > 0 && (
                                            <div className="text-xs text-green-600 font-medium">+{breakdowns.speed.bonus}</div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* ENHANCED: Movement Preview */}
                {props.isSelectingTile && (
                    <MobileMovementPreview
                        availableTiles={props.availableTiles}
                        currentPosition={currentPlayer?.position || 0}
                        diceValue={gameState.diceValue}
                    />
                )}

                {/* Dice Section */}
                {gameState.phase === 'rolling' && currentPlayer?.id === '1' && (
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                            <button
                                onClick={props.rollDice}
                                disabled={props.diceRolling}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                            >
                                <Dices className="inline mr-2" size={20} />
                                {props.diceRolling ? 'Rolling...' : 'Roll Dice'}
                            </button>

                            {currentPlayer.health < getStatBreakdowns(currentPlayer).health.total && (
                                <button
                                    onClick={props.handleHeal}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
                                >
                                    <Heart size={18} />
                                </button>
                            )}

                            {/* FIXED: Mobile Shop Button */}
                            <button
                                onClick={() => {
                                    if (shopAvailable) {
                                        setActiveTab('shop');
                                    }
                                }}
                                className={`font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                                    shopAvailable
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white ring-2 ring-yellow-300 ring-opacity-50'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                }`}
                                title={shopAvailable ? 'Open shop - available on this tile!' : 'Shop not available on this tile'}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    <ShoppingCart size={18} />
                                    {shopAvailable && (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Enhanced shop availability message */}
                        {!shopAvailable && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                <p className="text-xs text-gray-600 text-center">
                                    🏪 Find a shop tile to access the merchant
                                </p>
                            </div>
                        )}

                        {shopAvailable && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                <p className="text-xs text-yellow-700 text-center font-medium">
                                    🏪 Shop available on this tile! Tap the shop button to trade.
                                </p>
                            </div>
                        )}

                        {gameState.diceValue && (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                                    <span className="text-2xl font-bold text-white">{gameState.diceValue}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Battle Section */}
                {gameState.phase === 'battle' && gameState.currentBattle && (
                    <div ref={battleScreenRef}>
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
                            availableItems={availableItems}
                            onUseItem={(item) => {
                                if (gameState.currentBattle) {
                                    const newBattleState = battleLogic.playerUseItem(gameState.currentBattle, item);
                                    props.updateBattleState(newBattleState);

                                    if (['potion', 'consumable'].includes(item.type)) {
                                        props.setGameState(prev => ({
                                            ...prev,
                                            players: prev.players.map(p => {
                                                if (p.id === gameState.currentPlayerId) {
                                                    return {
                                                        ...p,
                                                        inventory: p.inventory.filter(i => i.id !== item.id)
                                                    };
                                                }
                                                return p;
                                            })
                                        }));
                                    }
                                }
                            }}
                        />
                    </div>
                )}

                {/* End Turn Button */}
                {props.canEndTurn && currentPlayer?.id === '1' && (
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 text-center">
                        <button
                            onClick={props.endTurn}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                        >
                            End Turn
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Updated Inventory Content
    const InventoryContent = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Inventory</h3>
                {humanPlayer?.inventory.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {humanPlayer.inventory.map((item, index) => {
                            const rarityConfig = RARITIES[item.rarity];
                            return (
                                <div
                                    key={index}
                                    onClick={() => props.handleEquipItem(item)}
                                    className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer active:scale-98 transition-all duration-200 border border-gray-200"
                                >
                                    <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                                        <ItemIcon icon={item.icon} size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-gray-900">{item.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${rarityConfig.bgColor} ${rarityConfig.color}`}>
                                                {item.rarity}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 capitalize">
                                            {item.type} • +{item.stats} stats
                                        </div>
                                    </div>
                                    <div className="text-blue-600">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <Package size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No items in inventory</p>
                        <p className="text-sm mt-1">Explore to find equipment!</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Equipped Items</h3>
                {Object.keys(humanPlayer?.equipped || {}).length ? (
                    <div className="space-y-3">
                        {Object.entries(humanPlayer?.equipped || {}).map(([slot, item]) => (
                            <div
                                key={slot}
                                onClick={() => props.handleUnequipItem(slot as ItemSlot)}
                                className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer active:scale-98 transition-all duration-200 border border-blue-200"
                            >
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <ItemIcon icon={item.icon} size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-600 capitalize">{slot} • +{item.stats} stats</div>
                                </div>
                                <div className="text-blue-600 font-semibold text-sm">
                                    Equipped
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <Shield size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No equipment equipped</p>
                        <p className="text-sm mt-1">Equip items from inventory</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Updated Stats Content with cleaner design
    const StatsContent = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Your Stats</h3>

                {/* Clean Stats Display */}
                <StatsList player={humanPlayer} className="mb-4" />

                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">💰</span>
                            </div>
                            <span className="font-medium text-gray-700">Gold</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">{humanPlayer?.gold}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Game Progress</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                        <Sword size={20} className="text-red-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900">{humanPlayer?.stats.battlesWon}</div>
                        <div className="text-xs text-gray-600">Battles Won</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <User size={20} className="text-blue-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900">{humanPlayer?.stats.tilesMovedTotal}</div>
                        <div className="text-xs text-gray-600">Tiles Moved</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">All Players</h3>
                <div className="space-y-3">
                    {gameState.players.map((player) => (
                        <PlayerSummary
                            key={player.id}
                            player={player}
                            isCurrentPlayer={player.id === gameState.currentPlayerId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    // Shop Content for mobile using MobileShop component
    const ShopContent = () => (
        <MobileShop
            player={humanPlayer || gameState.players[0]}
            onBuyItem={props.handleBuyItem}
            onSellItem={props.handleSellItem}
            onClose={() => setActiveTab('game')}
        />
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
                    gold={gameState.players.find(p => p.id === gameState.currentPlayerId)?.lastGoldWin}
                    isAI={currentPlayer?.id !== '1'}
                />

                {/* Main Content */}
                <div className="flex-1 p-4 pb-20">
                    {activeTab === 'game' && <GameContent />}
                    {activeTab === 'inventory' && <InventoryContent />}
                    {activeTab === 'stats' && <StatsContent />}
                    {activeTab === 'shop' && <ShopContent />}
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                    <div className="flex justify-around p-3">
                        <button
                            onClick={() => setActiveTab('game')}
                            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                                activeTab === 'game'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Dices size={20} />
                            <span className="text-xs mt-1 font-medium">Game</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                                activeTab === 'inventory'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Package size={20} />
                            <span className="text-xs mt-1 font-medium">Inventory</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                                activeTab === 'stats'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Trophy size={20} />
                            <span className="text-xs mt-1 font-medium">Stats</span>
                        </button>
                        <button
                            onClick={() => {
                                const shopAvailable = props.isShopAvailable();
                                if (shopAvailable) {
                                    setActiveTab('shop');
                                }
                            }}
                            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                                activeTab === 'shop'
                                    ? 'bg-yellow-600 text-white shadow-lg'
                                    : props.isShopAvailable()
                                        ? 'text-yellow-600 hover:text-yellow-700'
                                        : 'text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <div className="relative">
                                <ShoppingCart size={20} />
                                {props.isShopAvailable() && activeTab !== 'shop' && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                )}
                            </div>
                            <span className="text-xs mt-1 font-medium">Shop</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileLayout;
