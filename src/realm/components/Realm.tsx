import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/Auth/AuthButton';
import useRealmLogic from '../hooks/useRealmLogic';
import { OrbRarity } from '../services/orbApi';
import Town from './Town';

const RARITY_COLORS: Record<OrbRarity, string> = {
    'common': 'from-gray-400 to-gray-600',
    'uncommon': 'from-green-400 to-green-600',
    'rare': 'from-blue-400 to-blue-600',
    'very rare': 'from-purple-400 to-purple-600',
    'legendary': 'from-yellow-400 to-yellow-600'
};

const RARITY_GLOW: Record<OrbRarity, string> = {
    'common': 'shadow-gray-500/50',
    'uncommon': 'shadow-green-500/50',
    'rare': 'shadow-blue-500/50',
    'very rare': 'shadow-purple-500/50',
    'legendary': 'shadow-yellow-500/50'
};

interface RealmProps {
    onBack: () => void;
}

const Realm: React.FC<RealmProps> = ({ onBack }) => {
    const { user } = useAuth();
    const realmLogic = useRealmLogic();
    // Use simple boolean state instead of string literals
    const [showTown, setShowTown] = useState(false);

    // Load inventory on component mount with proper error handling
    useEffect(() => {
        const loadRealmData = async () => {
            try {
                await realmLogic.loadInventory();
            } catch (error) {
                console.error('Failed to load realm data:', error);
                // Error is already handled in realmLogic, just log here
            }
        };

        loadRealmData();
    }, []);

    const handleOpenOrb = async (orbId: string, rarity: string) => {
        try {
            await realmLogic.openOrb(orbId, rarity);
        } catch (error) {
            console.error('Failed to open orb:', error);
            // Error is already handled in realmLogic
        }
    };

    const handleOpenMultiple = async (rarity: string, count: number) => {
        try {
            await realmLogic.openMultipleOrbs(rarity, count);
        } catch (error) {
            console.error('Failed to open multiple orbs:', error);
            // Error is already handled in realmLogic
        }
    };

    const getOrbsByRarity = (rarity: string) => {
        return realmLogic.getOrbsByRarity(rarity);
    };

    // Show loading state while data is being fetched
    if (realmLogic.loading && !realmLogic.inventory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">Loading your realm...</div>
                    <div className="text-purple-200 text-sm">Please wait while we fetch your treasures</div>
                </div>
            </div>
        );
    }

    // Render town view
    if (showTown) {
        return <Town onBack={() => setShowTown(false)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            {/* Authentication Button in top right */}
            <div className="absolute top-6 right-6 z-10">
                <AuthButton />
            </div>

            {/* Back button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={onBack}
                    className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                >
                    <span>←</span>
                    <span>Back</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">🏰 Your Realm</h1>
                    <p className="text-purple-200 text-lg">Manage your realm and discover treasures!</p>

                    {/* Navigation Tabs - using boolean state */}
                    <div className="flex justify-center mt-6 mb-4">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-1 flex">
                            <button
                                onClick={() => setShowTown(false)}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    !showTown
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🔮 Crystal Orbs
                            </button>
                            <button
                                onClick={() => setShowTown(true)}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    showTown
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🏘️ Your Town
                            </button>
                        </div>
                    </div>

                    {user && (
                        <div className="mt-4 p-4 bg-white/20 backdrop-blur rounded-lg inline-block">
                            <p className="text-yellow-300 font-bold text-lg">Welcome, {user.displayName}!</p>
                            {realmLogic.inventory && (
                                <div className="flex items-center space-x-6 mt-2 text-white">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-yellow-400">💰</span>
                                        <span className="font-bold">{realmLogic.inventory.gold.toLocaleString()} Gold</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>🔮</span>
                                        <span>{realmLogic.getTotalOrbs()} Orbs</span>
                                    </div>
                                    {realmLogic.inventory.resources && Object.keys(realmLogic.inventory.resources).length > 0 && (
                                        <div className="flex items-center space-x-4">
                                            {Object.entries(realmLogic.inventory.resources).map(([resource, amount]) => (
                                                <div key={resource} className="flex items-center space-x-1">
                                                    <span>{
                                                        resource === 'wood' ? '🪵' :
                                                            resource === 'stone' ? '🗿' :
                                                                resource === 'iron' ? '⚒️' :
                                                                    resource === 'food' ? '🌾' :
                                                                        resource === 'gems' ? '💎' : '📦'
                                                    }</span>
                                                    <span className="font-bold">{amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {realmLogic.hasError && (
                    <div className="mb-6 max-w-2xl mx-auto">
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                            <p className="text-red-200">{realmLogic.error}</p>
                            <button
                                onClick={realmLogic.clearError}
                                className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Last Game Rewards Display */}
                {realmLogic.lastGameRewards && realmLogic.lastGameRewards.success && (
                    <div className="mb-6 max-w-2xl mx-auto">
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                            <p className="text-green-200 mb-2">🎉 Recent victory rewards!</p>
                            <div className="text-sm text-green-300">
                                +{realmLogic.lastGameRewards.rewards?.gold} Gold, {realmLogic.lastGameRewards.rewards?.orbs.length} Orbs
                            </div>
                            <button
                                onClick={realmLogic.clearLastGameRewards}
                                className="mt-2 text-sm text-green-300 hover:text-green-100 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Content based on current view */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Orb Collection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-6">Crystal Orb Collection</h2>

                            {!realmLogic.hasOrbs ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔮</div>
                                    <p className="text-white/80 text-lg">No orbs to open</p>
                                    <p className="text-white/60">Complete adventures to earn crystal orbs!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(Object.entries(RARITY_COLORS) as [OrbRarity, string][]).map(([rarity, gradient]) => {
                                        const orbsOfRarity = getOrbsByRarity(rarity);
                                        if (orbsOfRarity.length === 0) return null;

                                        return (
                                            <div key={rarity} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-white capitalize">
                                                        {rarity} Orbs ({orbsOfRarity.length})
                                                    </h3>
                                                    {orbsOfRarity.length > 1 && (
                                                        <button
                                                            onClick={() => handleOpenMultiple(rarity, Math.min(orbsOfRarity.length, 5))}
                                                            disabled={realmLogic.isLoading}
                                                            className="bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30 transition-all text-sm disabled:opacity-50"
                                                        >
                                                            Open {Math.min(orbsOfRarity.length, 5)}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                    {orbsOfRarity.slice(0, 12).map((orb) => (
                                                        <button
                                                            key={orb.id}
                                                            onClick={() => handleOpenOrb(orb.id, orb.rarity)}
                                                            disabled={realmLogic.openingOrbs.has(orb.id) || realmLogic.isLoading}
                                                            className={`
                                                                    relative overflow-hidden rounded-xl p-4 transition-all duration-300
                                                                    bg-gradient-to-br ${gradient} ${RARITY_GLOW[rarity]}
                                                                    hover:scale-105 hover:shadow-xl active:scale-95
                                                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                                                    border-2 border-white/20 hover:border-white/40
                                                                `}
                                                        >
                                                            <div className="text-2xl mb-1">🔮</div>
                                                            {realmLogic.openingOrbs.has(orb.id) ? (
                                                                <div className="text-xs text-white animate-pulse">Opening...</div>
                                                            ) : (
                                                                <div className="text-xs text-white opacity-90 capitalize">{rarity}</div>
                                                            )}

                                                            {/* Sparkle effect */}
                                                            <div className="absolute inset-0 opacity-30">
                                                                <div className="absolute top-2 right-2 text-white/60">✨</div>
                                                                <div className="absolute bottom-2 left-2 text-white/40">💫</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div className="space-y-6">
                        {/* Recent Openings */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20">
                            <h3 className="font-bold text-white mb-3">Recent Openings</h3>
                            {realmLogic.recentOpenings.length === 0 ? (
                                <p className="text-white/60 text-sm">No recent orb openings</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {realmLogic.recentOpenings.slice(0, 10).map((opening, index) => (
                                        <div
                                            key={`${opening.id}-${index}`}
                                            className="bg-white/10 rounded-lg p-2 text-sm"
                                        >
                                            <div className="flex justify-between items-center">
                                                    <span className={`capitalize ${
                                                        opening.rarity === 'common' ? 'text-gray-300' :
                                                            opening.rarity === 'uncommon' ? 'text-green-300' :
                                                                opening.rarity === 'rare' ? 'text-blue-300' :
                                                                    opening.rarity === 'very rare' ? 'text-purple-300' :
                                                                        'text-yellow-300'
                                                    }`}>
                                                        {opening.rarity} Orb
                                                    </span>
                                                <span className="text-yellow-300">+{opening.contents.gold} 💰</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Instructions */}
                <div className="mt-8 text-center">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto">
                        <h3 className="font-bold text-white mb-3">How to Build Your Realm</h3>
                        <ul className="space-y-2 text-purple-200 text-sm">
                            <li>🎮 Complete solo adventures to earn 2 crystal orbs</li>
                            <li>🏆 Higher rarity orbs contain more gold and better rewards</li>
                            <li>💎 Legendary orbs are extremely rare but contain amazing treasures</li>
                            <li>🔮 Open multiple orbs of the same rarity for efficiency</li>
                            <li>🏘️ Use resources from orbs to build and upgrade your town!</li>
                            <li>⚔️ Train troops in military buildings to build your army!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Realm;
