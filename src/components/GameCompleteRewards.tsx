import React from 'react';
import { OrbRarity } from '../realm/services/orbApi';

interface GameCompleteRewardsProps {
    isVisible: boolean;
    rewards: {
        gold: number;
        orbs: Array<{ rarity: OrbRarity }>;
    } | null;
    onDismiss: () => void;
    onGoToRealm?: () => void;
}

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

const GameCompleteRewards: React.FC<GameCompleteRewardsProps> = ({
                                                                     isVisible,
                                                                     rewards,
                                                                     onDismiss,
                                                                     onGoToRealm
                                                                 }) => {
    if (!isVisible || !rewards) return null;

    const handleGoToRealm = () => {
        onDismiss();
        if (onGoToRealm) {
            onGoToRealm();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 relative overflow-hidden">
                {/* Animated background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
                        <p className="text-purple-200">You've completed your adventure and earned realm rewards!</p>
                    </div>

                    {/* Rewards Display */}
                    <div className="space-y-6">
                        {/* Gold Reward */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                            <div className="flex items-center justify-center space-x-3">
                                <span className="text-4xl">💰</span>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-300">
                                        +{rewards.gold.toLocaleString()} Gold
                                    </div>
                                    <div className="text-sm text-purple-200">Added to your realm treasury</div>
                                </div>
                            </div>
                        </div>

                        {/* Orb Rewards */}
                        {rewards.orbs && rewards.orbs.length > 0 && (
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                                <div className="text-center mb-4">
                                    <div className="text-xl font-bold text-white">Crystal Orbs Awarded</div>
                                    <div className="text-sm text-purple-200">Open them in your realm!</div>
                                </div>

                                <div className="flex justify-center space-x-4">
                                    {rewards.orbs.map((orb, index) => {
                                        const gradient = RARITY_COLORS[orb.rarity] || RARITY_COLORS.common;
                                        const glow = RARITY_GLOW[orb.rarity] || RARITY_GLOW.common;

                                        return (
                                            <div key={index} className="text-center">
                                                <div className={`
                                                    w-16 h-16 rounded-xl bg-gradient-to-br ${gradient}
                                                    shadow-lg ${glow} flex items-center justify-center text-2xl
                                                    animate-pulse hover:animate-none transition-all duration-300
                                                `}>
                                                    🔮
                                                </div>
                                                <div className="text-xs text-white/80 mt-1 capitalize">
                                                    {orb.rarity}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {onGoToRealm && (
                                <button
                                    onClick={handleGoToRealm}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    Open Orbs in Realm 🏰
                                </button>
                            )}

                            <button
                                onClick={onDismiss}
                                className="w-full py-3 bg-white/20 backdrop-blur text-white rounded-xl font-bold hover:bg-white/30 transition-all duration-200"
                            >
                                Continue
                            </button>
                        </div>
                    </div>

                    {/* Fun Stats */}
                    <div className="mt-6 text-center">
                        <div className="text-xs text-purple-300 bg-white/10 backdrop-blur rounded-lg p-3">
                            <div className="mb-1">🎮 Adventure Complete!</div>
                            <div>Your treasures await in the realm...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCompleteRewards;
