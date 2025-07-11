// src/components/DesktopBattleScreen.tsx

import React, { useState, useEffect } from 'react';
import { Sword, Shield, Heart, Zap, Trophy, Skull, Sparkles } from 'lucide-react';
import { BattleState, DiceRoll } from '../types/game.types';
import { getDiceIcon } from '../utils/diceUtils';

interface DesktopBattleScreenProps {
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
}> = ({ roll, rolling }) => {
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

    return (
        <div className={`relative ${rolling ? 'animate-bounce' : ''}`}>
            <div className={`w-32 h-32 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-bold shadow-2xl transform transition-all duration-300 ${
                rolling ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
            } ${
                roll?.isCritical ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-yellow-400/50' : ''
            } ${
                roll?.isCriticalFail ? 'ring-4 ring-red-500 ring-opacity-75 shadow-red-500/50' : ''
            }`}>
                <span className="text-6xl">{rolling ? '?' : displayValue}</span>
            </div>

            {roll && !rolling && (
                <>
                    {roll.modifier !== 0 && (
                        <div className="absolute -bottom-4 -right-4 bg-gray-800 text-white text-lg px-3 py-2 rounded-full">
                            {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                        </div>
                    )}

                    {roll.isCritical && (
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                            <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse shadow-lg">
                                CRITICAL HIT!
                            </div>
                        </div>
                    )}

                    {roll.isCriticalFail && (
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                            <div className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse shadow-lg">
                                CRITICAL FAIL!
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
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium text-gray-700">{label}</span>
                <span className="text-lg font-bold">{current}/{max}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
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

const DesktopBattleScreen: React.FC<DesktopBattleScreenProps> = ({
                                                                     battleState,
                                                                     onAttack,
                                                                     onDefend,
                                                                     onContinue,
                                                                     isPlayerTurn
                                                                 }) => {
    const [rolling, setRolling] = useState(false);
    const [showEffects, setShowEffects] = useState(false);

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

    if (battleState.phase === 'victory' || battleState.phase === 'defeat') {
        return (
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl mx-auto text-center">
                {battleState.phase === 'victory' ? (
                    <>
                        <Trophy size={80} className="text-yellow-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-4xl font-bold text-yellow-600 mb-4">VICTORY!</h2>
                        <p className="text-xl text-gray-700 mb-6">You defeated {battleState.enemy.name}!</p>
                        <div className="bg-purple-100 rounded-lg p-6 mb-6">
                            <p className="text-lg text-gray-600 mb-2">Reward Earned:</p>
                            <p className="text-2xl font-bold text-purple-800">
                                {battleState.enemy.reward.name}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Skull size={80} className="text-red-600 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-4xl font-bold text-red-600 mb-4">DEFEATED!</h2>
                        <p className="text-xl text-gray-700 mb-6">You were defeated by {battleState.enemy.name}!</p>
                    </>
                )}
                <button
                    onClick={onContinue}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">⚔️ BATTLE!</h2>

            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Player Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mr-4">
                            <Shield size={40} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-blue-800">You</h3>
                            <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                    <Sword size={16} className="mr-1" />
                                    ATK: {battleState.playerStats.attack}
                                </span>
                                <span className="flex items-center">
                                    <Shield size={16} className="mr-1" />
                                    DEF: {battleState.playerStats.defense}
                                </span>
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

                {/* Enemy Section */}
                <div className="bg-red-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mr-4">
                            <Skull size={40} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-red-800">{battleState.enemy.name}</h3>
                            <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                    <Zap size={16} className="mr-1" />
                                    Power: {battleState.enemy.power}
                                </span>
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
            </div>

            {/* Dice Roll Section */}
            <div className="text-center mb-8">
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
                        <div className="bg-orange-100 border-2 border-orange-500 rounded-lg px-8 py-4 inline-block">
                            <span className="text-3xl font-bold text-orange-600">
                                💥 {latestRound.damage} DAMAGE!
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {battleState.phase === 'player_attack' && isPlayerTurn && !rolling && (
                <div className="flex justify-center space-x-6 mb-8">
                    <button
                        onClick={() => handleAction('attack')}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                    >
                        <Sword size={24} />
                        <span className="text-xl">Attack!</span>
                    </button>
                    <button
                        onClick={() => handleAction('defend')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                    >
                        <Shield size={24} />
                        <span className="text-xl">Defend</span>
                    </button>
                </div>
            )}

            {/* Combat Log */}
            <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                    <Sparkles size={24} className="mr-2 text-purple-600" />
                    Combat Log
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {battleState.rounds.map((round, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded ${
                                round.isPlayerTurn ? 'bg-blue-100' : 'bg-red-100'
                            } text-sm`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-medium">
                                    {round.description}
                                </span>
                                <span className="text-xs text-gray-600">
                                    Roll: {round.playerRoll.value}+{round.playerRoll.modifier}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesktopBattleScreen;
