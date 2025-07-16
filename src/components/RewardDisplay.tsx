
import React, { useState, useEffect } from 'react';
import {
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull, Package,
    Sparkles, Trophy, X, Check
} from 'lucide-react';
import { Item } from '../types/game.types';

interface RewardDisplayProps {
    item: Item | null;
    onClose: () => void;
    gold?: number;
    isAI?: boolean;
}

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
    'common': {
        multiplier: 1,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        glowColor: 'shadow-gray-300/50',
        particleColor: '#9CA3AF',
        chance: 50
    },
    'uncommon': {
        multiplier: 2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-400',
        glowColor: 'shadow-green-400/50',
        particleColor: '#22C55E',
        chance: 30
    },
    'rare': {
        multiplier: 2.5,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-400',
        glowColor: 'shadow-blue-400/50',
        particleColor: '#3B82F6',
        chance: 12
    },
    'very rare': {
        multiplier: 3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-400',
        glowColor: 'shadow-purple-400/50',
        particleColor: '#8B5CF6',
        chance: 6
    },
    'legendary': {
        multiplier: 5,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-400',
        glowColor: 'shadow-amber-400/50',
        particleColor: '#F59E0B',
        chance: 2
    }
};

// Floating particle component
const FloatingParticle: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
    return (
        <div
            className="absolute w-2 h-2 rounded-full animate-ping opacity-70"
            style={{
                backgroundColor: color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${delay}ms`,
                animationDuration: `${2000 + Math.random() * 1000}ms`
            }}
        />
    );
};

// Sparkle effect component
const SparkleEffect: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-pulse"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2000}ms`,
                        animationDuration: `${1000 + Math.random() * 1000}ms`
                    }}
                >
                    <Sparkles
                        size={12 + Math.random() * 8}
                        className="text-yellow-400 drop-shadow-lg"
                    />
                </div>
            ))}
        </div>
    );
};

const RewardDisplay: React.FC<RewardDisplayProps> = ({ item, onClose, gold, isAI = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (item) {
            setIsVisible(true);
            setTimeout(() => setShowContent(true), 300);

            // Auto-close for AI after 5 seconds
            if (isAI) {
                const timer = setTimeout(() => {
                    handleClose();
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
            setShowContent(false);
        }
    }, [item, isAI]); // Add isAI to dependencies

    if (!item) return null;

    const rarityConfig = RARITIES[item.rarity];

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
            isVisible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
        }`}>
            {/* Particle effects background */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <FloatingParticle
                        key={i}
                        color={rarityConfig.particleColor}
                        delay={i * 100}
                    />
                ))}
            </div>

            {/* Main reward card */}
            <div className={`relative bg-white rounded-3xl shadow-2xl max-w-sm w-full transform transition-all duration-700 ${
                showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
            } ${rarityConfig.glowColor} shadow-xl`}>

                {/* Sparkle effects for legendary items */}
                {item.rarity === 'legendary' && <SparkleEffect />}

                {/* Header with celebration */}
                <div className="relative p-6 pb-4">
                    <div className="text-center">
                        {/* Celebration emojis */}
                        <div className="flex justify-center space-x-2 mb-4 text-4xl">
                            <span className="animate-bounce">🎉</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎁</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {item.rarity === 'legendary' ? 'LEGENDARY ITEM!' : 'Item Received!'}
                        </h2>

                        {/* Rarity indicator */}
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide mb-4 ${
                            rarityConfig.bgColor
                        } ${rarityConfig.color} ${rarityConfig.borderColor} border-2`}>
                            {item.rarity} {item.type}
                        </div>
                    </div>
                </div>

                {/* Item showcase */}
                <div className="px-6 pb-4">
                    <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-4 ${
                        rarityConfig.borderColor
                    } ${rarityConfig.glowColor} shadow-lg`}>

                        {/* Item icon with glow effect */}
                        <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${rarityConfig.bgColor} ${
                                rarityConfig.glowColor
                            } shadow-2xl transform transition-transform duration-300 hover:scale-110`}>
                                <ItemIcon icon={item.icon} size={48} />
                            </div>
                        </div>

                        {/* Item name */}
                        <h3 className={`text-xl font-bold text-center mb-3 ${rarityConfig.color}`}>
                            {item.name}
                        </h3>

                        {/* Stats display */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600 font-medium">Power</span>
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        {[...Array(Math.min(5, Math.ceil(item.stats / 10)))].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full ${
                                                    rarityConfig.bgColor
                                                } animate-pulse`}
                                                style={{ animationDelay: `${i * 100}ms` }}
                                            />
                                        ))}
                                    </div>
                                    <span className={`font-bold text-lg ${rarityConfig.color}`}>
                                        +{item.stats}
                                    </span>
                                </div>
                            </div>

                            {item.effect && (
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                    <span className="text-gray-600 font-medium">Effect</span>
                                    <span className={`font-bold capitalize ${rarityConfig.color}`}>
                                        {item.effect}
                                    </span>
                                </div>
                            )}

                            {/* Gold reward display */}
                            {gold && (
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm mt-3">
                                    <span className="text-gray-600 font-medium">Gold Reward</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-yellow-600 font-bold">+{gold}</span>
                                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Rarity multiplier */}
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                <span className="text-gray-600 font-medium">Rarity Bonus</span>
                                <span className={`font-bold ${rarityConfig.color}`}>
                                    x{rarityConfig.multiplier}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="p-6 pt-0">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                item.rarity === 'legendary'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                                    : item.rarity === 'very rare'
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25'
                                        : item.rarity === 'rare'
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25'
                                            : item.rarity === 'uncommon'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25'
                                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg shadow-gray-500/25'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <Check size={20} />
                                <span>Awesome!</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default RewardDisplay;
