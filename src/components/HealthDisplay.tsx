import React from 'react';
import { Heart, Shield, Sword, Zap } from 'lucide-react';
import { Player } from '../types/game.types';
import { getStatBreakdowns } from '../utils/equipmentLogic';
import {CHARACTER_IMAGES} from "../utils/characterImage";

interface HealthDisplayProps {
    player: Player;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
    className?: string;
}

interface StatDisplayProps {
    player: Player;
    stat: 'health' | 'attack' | 'defense' | 'speed';
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
    className?: string;
}

// Clean, modern health display
export const HealthDisplay: React.FC<HealthDisplayProps> = ({
                                                                player,
                                                                size = 'medium',
                                                                showIcon = true,
                                                                className = ''
                                                            }) => {
    const breakdowns = getStatBreakdowns(player);
    const healthBreakdown = breakdowns.health;

    const sizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-xl'
    };

    const iconSizes = {
        small: 16,
        medium: 18,
        large: 24
    };

    return (
        <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
            {showIcon && (
                <div className="flex-shrink-0">
                    <Heart size={iconSizes[size]} className="text-red-500" />
                </div>
            )}
            <div className="flex items-center space-x-1">
                <span className="font-bold text-gray-900">
                    {player.health}
                </span>
                <span className="text-gray-400">/</span>
                <span className="font-semibold text-gray-700">
                    {healthBreakdown.base}
                </span>
                {healthBreakdown.bonus > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        +{healthBreakdown.bonus}
                    </span>
                )}
            </div>
        </div>
    );
};

// Clean stat card component
export const StatCard: React.FC<{
    label: string;
    icon: React.ReactNode;
    base: number;
    bonus: number;
    total: number;
    color: string;
    size?: 'small' | 'medium' | 'large';
}> = ({ label, icon, base, bonus, total, color, size = 'medium' }) => {
    const cardSizes = {
        small: 'p-2',
        medium: 'p-3',
        large: 'p-4'
    };

    const textSizes = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
    };

    const numberSizes = {
        small: 'text-lg',
        medium: 'text-xl',
        large: 'text-2xl'
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${cardSizes[size]}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-md ${color}`}>
                        {icon}
                    </div>
                    <span className={`font-medium text-gray-700 ${textSizes[size]}`}>
                        {label}
                    </span>
                </div>
                {bonus > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +{bonus}
                    </span>
                )}
            </div>
            <div className="flex items-baseline space-x-1">
                <span className={`font-bold text-gray-900 ${numberSizes[size]}`}>
                    {total}
                </span>
                {bonus > 0 && (
                    <span className={`text-gray-400 ${textSizes[size]}`}>
                        ({base} + {bonus})
                    </span>
                )}
            </div>
        </div>
    );
};

// Compact stat row for mobile
export const StatRow: React.FC<{
    label: string;
    icon: React.ReactNode;
    base: number;
    bonus: number;
    total: number;
    color: string;
}> = ({ label, icon, base, bonus, total, color }) => {
    return (
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${color}`}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">
                    {total}
                </span>
                {bonus > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +{bonus}
                    </span>
                )}
            </div>
        </div>
    );
};

// Modern stats grid for desktop
interface StatsGridProps {
    player: Player;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
                                                        player,
                                                        size = 'medium',
                                                        className = ''
                                                    }) => {
    const breakdowns = getStatBreakdowns(player);

    const stats = [
        {
            key: 'health',
            label: 'Health',
            icon: <Heart size={16} className="text-white" />,
            color: 'bg-red-500',
            ...breakdowns.health
        },
        {
            key: 'attack',
            label: 'Attack',
            icon: <Sword size={16} className="text-white" />,
            color: 'bg-orange-500',
            ...breakdowns.attack
        },
        {
            key: 'defense',
            label: 'Defense',
            icon: <Shield size={16} className="text-white" />,
            color: 'bg-blue-500',
            ...breakdowns.defense
        },
        {
            key: 'speed',
            label: 'Speed',
            icon: <Zap size={16} className="text-white" />,
            color: 'bg-yellow-500',
            ...breakdowns.speed
        }
    ];

    return (
        <div className={`grid grid-cols-2 gap-3 ${className}`}>
            {stats.map(stat => (
                <StatCard
                    key={stat.key}
                    label={stat.label}
                    icon={stat.icon}
                    base={stat.base}
                    bonus={stat.bonus}
                    total={stat.total}
                    color={stat.color}
                    size={size}
                />
            ))}
        </div>
    );
};

// Mobile-optimized stats list
export const StatsList: React.FC<StatsGridProps> = ({
                                                        player,
                                                        className = ''
                                                    }) => {
    const breakdowns = getStatBreakdowns(player);

    const stats = [
        {
            key: 'health',
            label: 'Health',
            icon: <Heart size={14} className="text-white" />,
            color: 'bg-red-500',
            ...breakdowns.health
        },
        {
            key: 'attack',
            label: 'Attack',
            icon: <Sword size={14} className="text-white" />,
            color: 'bg-orange-500',
            ...breakdowns.attack
        },
        {
            key: 'defense',
            label: 'Defense',
            icon: <Shield size={14} className="text-white" />,
            color: 'bg-blue-500',
            ...breakdowns.defense
        },
        {
            key: 'speed',
            label: 'Speed',
            icon: <Zap size={14} className="text-white" />,
            color: 'bg-yellow-500',
            ...breakdowns.speed
        }
    ];

    return (
        <div className={`space-y-2 ${className}`}>
            {stats.map(stat => (
                <StatRow
                    key={stat.key}
                    label={stat.label}
                    icon={stat.icon}
                    base={stat.base}
                    bonus={stat.bonus}
                    total={stat.total}
                    color={stat.color}
                />
            ))}
        </div>
    );
};

// Health bar with clean design
interface HealthBarProps {
    player: Player;
    showText?: boolean;
    className?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({
                                                        player,
                                                        showText = true,
                                                        className = ''
                                                    }) => {
    const breakdowns = getStatBreakdowns(player);
    const healthBreakdown = breakdowns.health;
    const percentage = (player.health / healthBreakdown.total) * 100;

    return (
        <div className={`w-full ${className}`}>
            {showText && (
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                        <Heart size={16} className="text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Health</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-gray-900">
                            {player.health}
                        </span>
                        <span className="text-xs text-gray-400">/</span>
                        <span className="text-sm font-medium text-gray-700">
                            {healthBreakdown.base}
                        </span>
                        {healthBreakdown.bonus > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                +{healthBreakdown.bonus}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out relative"
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
            </div>
        </div>
    );
};

// Compact player summary for lists
interface PlayerSummaryProps {
    player: Player;
    isCurrentPlayer?: boolean;
    className?: string;
}

export const PlayerSummary: React.FC<PlayerSummaryProps> = ({
                                                                player,
                                                                isCurrentPlayer = false,
                                                                className = ''
                                                            }) => {
    const breakdowns = getStatBreakdowns(player);

    return (
        <div className={`bg-white rounded-lg border shadow-sm p-3 ${
            isCurrentPlayer ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
        } ${className}`}>
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <img
                        src={CHARACTER_IMAGES[player.character]}
                        alt={player.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{player.username}</h4>
                        {isCurrentPlayer && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Current Turn
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">Position: {player.position}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-red-50 rounded-lg p-2">
                    <Heart size={14} className="text-red-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-gray-900">
                        {player.health}/{breakdowns.health.total}
                    </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                    <Sword size={14} className="text-orange-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-gray-900">
                        {breakdowns.attack.total}
                    </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                    <Shield size={14} className="text-blue-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-gray-900">
                        {breakdowns.defense.total}
                    </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                    <Zap size={14} className="text-yellow-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-gray-900">
                        {breakdowns.speed.total}
                    </div>
                </div>
            </div>
        </div>
    );
};
