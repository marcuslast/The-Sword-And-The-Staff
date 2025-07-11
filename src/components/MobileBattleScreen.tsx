// src/components/MobileBattleScreen.tsx

import React, { useState, useEffect } from 'react';
import { Sword, Shield, Heart, Zap, Trophy, Skull, Sparkles } from 'lucide-react';
import { BattleState, DiceRoll } from '../types/game.types';
import { getDiceIcon } from '../utils/diceUtils';

interface MobileBattleScreenProps {
    battleState: BattleState;
    onAttack: () => void;
    onDefend: () => void;
    onContinue: () => void;
    isPlayerTurn: boolean;
}

// Animated Dice Component
const AnimatedDice: React.FC<{
    roll: DiceRoll | null;
    rolling: boolean;
    size?: 'small' | 'large';
}> = ({ roll, rolling, size = 'large' }) => {
    const [displayValue, setDisplayValue] = useState<number>(1);

    useEffect(() => {
        if (rolling) {
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * 20) + 1);
            }, 100);
            return () => clearInterval(interval);
        } else if (roll) {
            setDisplayValue(roll.value);
        }
    }, [rolling, roll]);

    const sizeClasses = size === 'large'
        ? 'w-24 h-24 text-5xl'
        : 'w-16 h-16 text-3xl';

    return (
        <div className={`relative ${rolling ? 'animate-bounce' : ''}`}>
            <div className={`${sizeClasses} bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl transform transition-all duration-300 ${
                rolling ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
            } ${
                roll?.isCritical ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-yellow-400/50' : ''
            } ${
                roll?.isCriticalFail ? 'ring-4 ring-red-500 ring-opacity-75 shadow-red-500/50' : ''
            }`}>
                {rolling ? '?' : displayValue}
            </div>

            {roll && !rolling && (
                <>
                    {roll.modifier !== 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                            {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                        </div>
                    )}

                    {roll.isCritical && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                CRITICAL!
                            </div>
                        </div>
                    )}

                    {roll.isCriticalFail && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                FAIL!
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Health Bar Component
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

// Combat Log Entry
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
                        {getDiceIcon(round.playerRoll.type)}
                    </span>
                    <span className="font-bold text-sm text-white">
                        {round.playerRoll.value}
                        {round.playerRoll.modifier !== 0 && (
                            <span className="text-xs text-gray-400">
                                {round.playerRoll.modifier > 0 ? '+' : ''}{round.playerRoll.modifier}
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

const MobileBattleScreen: React.FC<MobileBattleScreenProps> = ({
                                                                   battleState,
                                                                   onAttack,
                                                                   onDefend,
                                                                   onContinue,
                                                                   isPlayerTurn
                                                               }) => {
    const [rolling, setRolling] = useState(false);
    const [showEffects, setShowEffects] = useState(false);

    useEffect(() => {
        // Auto-process enemy turns after a delay
        if (battleState.phase === 'enemy_attack' && !isPlayerTurn) {
            const timer = setTimeout(() => {
                // The parent component should handle the enemy attack
                // by watching for phase changes
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [battleState.phase, isPlayerTurn]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
            {/* Battle Header */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700/50">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">⚔️ Battle!</h2>
                    <p className="text-gray-400">Turn {battleState.currentRound}</p>
                </div>

                {/* Enemy Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <Skull size={32} className="text-white" />
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
                </div>

                {/* Player Section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">You</h3>
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
                </div>
            </div>

            {/* Dice Roll Section */}
            {(battleState.phase === 'player_attack' || battleState.phase === 'enemy_attack') && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl border border-gray-700/50">
                    <div className="text-center">
                        {latestRound && (
                            <div className="mb-4">
                                <AnimatedDice
                                    roll={rolling ? null : latestRound.playerRoll}
                                    rolling={rolling}
                                />
                            </div>
                        )}

                        {showEffects && latestRound?.damage && (
                            <div className="animate-bounce">
                                <div className="bg-orange-500/20 border-2 border-orange-500 rounded-2xl px-6 py-3 inline-block">
                                    <span className="text-2xl font-bold text-orange-400">
                                        💥 {latestRound.damage} DAMAGE!
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {battleState.phase === 'player_attack' && isPlayerTurn && !rolling && (
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                </div>
            )}

            {/* Victory/Defeat Screen */}
            {(battleState.phase === 'victory' || battleState.phase === 'defeat') && (
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
                            <p className="text-gray-300 mb-6">You were defeated by {battleState.enemy.name}!</p>
                        </>
                    )}
                    <button
                        onClick={onContinue}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        Continue
                    </button>
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

export default MobileBattleScreen;
