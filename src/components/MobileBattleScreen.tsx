import React, { useState, useEffect } from 'react';
import {
    Sword,
    Shield,
    Heart,
    Zap,
    Trophy,
    Skull,
    Sparkles,
    Clock,
    Flame,
    Droplets,
    Snowflake,
    Star,
    Eye
} from 'lucide-react';
import { BattleState, DiceRoll, Player, Item, BattleEffect } from '../types/game.types';
import { getDiceIcon } from '../utils/diceUtils';
import { CHARACTER_IMAGES } from '../utils/characterImage';

interface MobileBattleScreenProps {
    battleState: BattleState;
    onAttack: () => void;
    onDefend: () => void;
    onContinue: () => void;
    isPlayerTurn: boolean;
    currentPlayer: Player;
    onUseItem: (item: Item) => void;
    availableItems: Item[];
}

// Enhanced Item Selection Modal with categories
const ItemSelectionModal: React.FC<{
    items: Item[];
    onSelect: (item: Item) => void;
    onClose: () => void;
}> = ({ items, onSelect, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'healing' | 'damage' | 'buff' | 'coating'>('all');

    const categorizeItems = (items: Item[]) => {
        return {
            all: items,
            healing: items.filter(item =>
                item.effect?.includes('healing') || item.type === 'potion'
            ),
            damage: items.filter(item =>
                item.effect?.includes('damage') && !item.effect?.includes('weapon')
            ),
            buff: items.filter(item =>
                item.effect?.includes('boost') || item.effect?.includes('rage') ||
                item.effect?.includes('strength') || item.effect?.includes('defense') ||
                item.effect?.includes('invisibility')
            ),
            coating: items.filter(item =>
                item.effect?.includes('weapon_')
            )
        };
    };

    const categorizedItems = categorizeItems(items);
    const displayItems = categorizedItems[selectedCategory];

    const getItemEffectIcon = (effect?: string) => {
        if (!effect) return <Heart size={16} />;

        if (effect.includes('healing')) return <Heart size={16} className="text-green-500" />;
        if (effect.includes('fire')) return <Flame size={16} className="text-red-500" />;
        if (effect.includes('cold') || effect.includes('frost')) return <Snowflake size={16} className="text-blue-500" />;
        if (effect.includes('lightning')) return <Zap size={16} className="text-yellow-500" />;
        if (effect.includes('poison')) return <Droplets size={16} className="text-purple-500" />;
        if (effect.includes('weapon')) return <Sword size={16} className="text-orange-500" />;
        if (effect.includes('boost') || effect.includes('strength')) return <Star size={16} className="text-blue-500" />;
        return <Heart size={16} />;
    };

    const getItemDescription = (item: Item) => {
        switch (item.effect) {
            case 'healing': return `Restores ${item.stats} HP`;
            case 'full_healing': return 'Fully restores HP';
            case 'acid_damage': return `${item.stats} acid damage to enemy`;
            case 'fire_damage': return `${item.stats} fire damage to enemy`;
            case 'cold_damage': return `${item.stats} cold damage to enemy`;
            case 'lightning_damage': return `${item.stats} lightning damage to enemy`;
            case 'weapon_poison': return `Coat weapon with poison (+${item.stats} damage, 3 turns)`;
            case 'weapon_sharpness': return `Sharpen weapon (+${item.stats} damage, 4 turns)`;
            case 'weapon_fire': return `Ignite weapon (+${item.stats} fire damage, 5 turns)`;
            case 'strength_boost': return `+${item.stats} attack for 3 turns`;
            case 'defense_boost': return `+${item.stats} defense for 3 turns`;
            case 'rage_mode': return `+${item.stats} attack, -5 defense for 4 turns`;
            case 'enemy_weakness': return `Weaken enemy (-${item.stats} attack, 3 turns)`;
            case 'invisibility': return 'Become invisible for 2 turns';
            case 'fire_breath': return `${item.stats} fire damage + burning effect`;
            default: return item.type === 'potion' ? `+${item.stats} HP` : 'Unknown effect';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-4 w-full max-w-sm max-h-[80vh] overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-3">Select Item to Use</h3>

                {/* Category Tabs */}
                <div className="flex space-x-1 mb-3 overflow-x-auto">
                    {(['all', 'healing', 'damage', 'buff', 'coating'] as const).map(category =>
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                                selectedCategory === category
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                            }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                            <span className="ml-1 text-xs opacity-75">
                                ({categorizedItems[category].length})
                            </span>
                        </button>
                    )}
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {displayItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {getItemEffectIcon(item.effect)}
                                    <span className="font-medium text-white">{item.name}</span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-500 rounded text-white capitalize">
                                    {item.rarity}
                                </span>
                            </div>
                            <div className="text-xs text-gray-300 text-left">
                                {getItemDescription(item)}
                            </div>
                        </button>
                    ))}

                    {displayItems.length === 0 && (
                        <div className="text-center text-gray-400 py-4">
                            No {selectedCategory} items available
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-3 w-full bg-gray-600 text-white py-2 rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// Effect Display Component
const EffectDisplay: React.FC<{
    effects: BattleEffect[];
    title: string;
    className?: string;
}> = ({ effects, title, className = "" }) => {
    if (effects.length === 0) return null;

    const getEffectIcon = (effect: BattleEffect) => {
        if (effect.name.includes('Poison')) return <Droplets size={14} className="text-purple-400" />;
        if (effect.name.includes('Fire') || effect.name.includes('Flame')) return <Flame size={14} className="text-red-400" />;
        if (effect.name.includes('Cold') || effect.name.includes('Frost')) return <Snowflake size={14} className="text-blue-400" />;
        if (effect.name.includes('Sharp')) return <Sword size={14} className="text-gray-400" />;
        if (effect.name.includes('Strength') || effect.name.includes('Rage')) return <Sword size={14} className="text-red-400" />;
        if (effect.name.includes('Defense')) return <Shield size={14} className="text-blue-400" />;
        if (effect.name.includes('Blessed') || effect.name.includes('Holy')) return <Star size={14} className="text-yellow-400" />;
        if (effect.name.includes('Invisible')) return <Eye size={14} className="text-gray-400" />;
        return <Clock size={14} className="text-gray-400" />;
    };

    return (
        <div className={`bg-gray-800/50 rounded-lg p-3 ${className}`}>
            <h4 className="text-sm font-medium text-gray-300 mb-2">{title}</h4>
            <div className="space-y-1">
                {effects.map((effect, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                        {getEffectIcon(effect)}
                        <span className="text-white font-medium">{effect.name}</span>
                        <span className="text-gray-400">({effect.duration} turns)</span>
                        <span className="ml-auto text-gray-300">{effect.description}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Battle Screen Component
const MobileBattleScreen: React.FC<MobileBattleScreenProps> = ({
                                                                   battleState,
                                                                   onAttack,
                                                                   onDefend,
                                                                   onContinue,
                                                                   isPlayerTurn,
                                                                   currentPlayer,
                                                                   availableItems,
                                                                   onUseItem
                                                               }) => {
    const [rolling, setRolling] = useState(false);
    const [showEffects, setShowEffects] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);

    const latestRound = battleState.rounds[battleState.rounds.length - 1];

    const handleAction = (action: 'attack' | 'defend') => {
        setRolling(true);
        setShowEffects(false);

        setTimeout(() => {
            setRolling(false);
            setShowEffects(true);
            if (action === 'attack') {
                onAttack();
            } else {
                onDefend();
            }
        }, 1500);
    };

    // Filter items that can be used in battle
    const battleItems = availableItems.filter(item =>
        item.type === 'potion' ||
        item.type === 'consumable' ||
        item.type === 'mythic' ||
        (item.effect && !item.effect.includes('passive'))
    );

    // Show battle results
    if (battleState.phase === 'victory' || battleState.phase === 'defeat') {
        return (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 mb-6 shadow-2xl border border-gray-700/50 text-center">
                {battleState.phase === 'victory' ? (
                    <>
                        <Trophy size={64} className="text-yellow-500 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-3xl font-bold text-yellow-500 mb-2">VICTORY!</h3>
                        <p className="text-gray-300 mb-6">You defeated {battleState.enemy.name}!</p>
                        <div className="bg-purple-900/50 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-gray-400 mb-2">Reward:</p>
                            <p className="text-lg font-bold text-purple-300">
                                {battleState.enemy.reward.name}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Skull size={64} className="text-red-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-3xl font-bold text-red-500 mb-2">DEFEATED!</h3>
                        <p className="text-gray-300 mb-6">
                            You were defeated by {battleState.enemy.name} and sent back to the start!
                        </p>
                        <div className="bg-red-900/50 rounded-2xl p-4 mb-6">
                            <p className="text-lg text-red-300">
                                All your items have been lost!
                            </p>
                        </div>
                    </>
                )}

                <button
                    onClick={onContinue}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Battle Header */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-gray-700/50">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">⚔️ Battle!</h2>
                    <p className="text-gray-400">Round {battleState.currentRound}</p>
                </div>

                {/* Enemy Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                {battleState.enemy.image ? (
                                    <img
                                        src={battleState.enemy.image}
                                        alt={battleState.enemy.name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <Skull size={32} className="text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{battleState.enemy.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <Sword size={14} />
                                    <span>Power: {battleState.enemy.power}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <HealthBar
                        current={battleState.enemyHealth}
                        max={battleState.enemyMaxHealth}
                        label="Enemy Health"
                        color="bg-gradient-to-r from-red-500 to-red-600"
                    />

                    {/* Enemy Effects */}
                    <EffectDisplay
                        effects={battleState.enemyEffects || []}
                        title="Enemy Effects"
                        className="mt-2"
                    />
                </div>

                {/* Player Section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                <img
                                    src={CHARACTER_IMAGES[currentPlayer.character]}
                                    alt={currentPlayer.username}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    {currentPlayer.username} {currentPlayer.id !== '1' ? '(AI)' : ''}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span className="flex items-center space-x-1">
                                        <Sword size={14} />
                                        <span>{battleState.playerStats.attack}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Shield size={14} />
                                        <span>{battleState.playerStats.defense}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <HealthBar
                        current={battleState.playerHealth}
                        max={battleState.playerMaxHealth}
                        label="Your Health"
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                    />

                    {/* Player Effects */}
                    <EffectDisplay
                        effects={battleState.playerEffects || []}
                        title="Active Effects"
                        className="mt-2"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            {battleState.phase === 'player_attack' && isPlayerTurn && !rolling && (
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleAction('attack')}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Sword size={20} />
                        <span>Attack!</span>
                    </button>
                    <button
                        onClick={() => handleAction('defend')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Shield size={20} />
                        <span>Defend</span>
                    </button>
                    <button
                        onClick={() => setShowItemModal(true)}
                        disabled={battleItems.length === 0}
                        className={`bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 ${
                            battleItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Heart size={20} />
                        <span>{battleItems.length === 0 ? 'No Items' : `Items (${battleItems.length})`}</span>
                    </button>
                </div>
            )}

            {/* Item Selection Modal */}
            {showItemModal && (
                <ItemSelectionModal
                    items={battleItems}
                    onSelect={(item) => {
                        onUseItem(item);
                        setShowItemModal(false);
                    }}
                    onClose={() => setShowItemModal(false)}
                />
            )}

            {/* Waiting for Enemy */}
            {battleState.phase === 'enemy_attack' && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 text-center text-gray-300">
                    <div className="animate-pulse">
                        <Skull size={48} className="mx-auto mb-2 text-red-500" />
                        <p className="text-lg font-medium">{battleState.enemy.name} is attacking...</p>
                    </div>
                </div>
            )}

            {/* Combat Log */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-gray-700/50">
                <h3 className="font-bold text-white mb-4 flex items-center">
                    <Sparkles size={20} className="mr-2" />
                    Combat Log
                </h3>
                <div className="max-h-60 overflow-y-auto">
                    {battleState.rounds.map((round, index) => (
                        <CombatLogEntry key={index} round={round} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Keep the existing HealthBar and CombatLogEntry components...
const HealthBar: React.FC<{
    current: number;
    max: number;
    label: string;
    color?: string;
}> = ({ current, max, label, color = 'bg-red-500' }) => {
    const percentage = (current / max) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-bold text-white">{current}/{max}</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500 ease-out relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
            </div>
        </div>
    );
};

const CombatLogEntry: React.FC<{ round: any; index: number }> = ({ round, index }) => {
    return (
        <div className={`p-3 rounded-lg mb-2 ${
            round.isPlayerTurn ? 'bg-blue-900/30' : 'bg-red-900/30'
        } border ${
            round.isPlayerTurn ? 'border-blue-700/50' : 'border-red-700/50'
        } animate-slideIn`}
             style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400">
                    {round.isPlayerTurn ? '⚔️ Your Turn' : '👹 Enemy Turn'}
                </span>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                        {getDiceIcon(round.playerRoll?.type || 'd20')}
                    </span>
                    <span className="font-bold text-sm text-white">
                        {round.playerRoll?.value || round.enemyRoll?.value}
                        {((round.playerRoll?.modifier || round.enemyRoll?.modifier) !== 0) && (
                            <span className="text-xs text-gray-400">
                                {(round.playerRoll?.modifier || round.enemyRoll?.modifier) > 0 ? '+' : ''}{round.playerRoll?.modifier || round.enemyRoll?.modifier}
                            </span>
                        )}
                    </span>
                </div>
            </div>
            <p className="text-sm text-gray-300">{round.description}</p>
            {round.damage && (
                <div className="mt-1">
                    <span className="text-xs font-bold text-orange-400">
                        💥 {round.damage} damage!
                    </span>
                </div>
            )}
        </div>
    );
};

export default MobileBattleScreen;
