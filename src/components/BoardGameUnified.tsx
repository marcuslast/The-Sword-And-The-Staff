import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import DesktopLayout from '../layouts/DesktopLayout';
import MobileLayout from '../layouts/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { AuthButton } from './Auth/AuthButton';
import CharacterSelection from './CharacterSelection';

const BoardGameUnified: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const gameLogic = useGameLogic();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Enhanced menu screen with authentication
    if (gameLogic.gameMode === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                {/* Authentication Button in top right */}
                <div className="absolute top-6 right-6">
                    <AuthButton />
                </div>

                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                            <span className="text-4xl">🏰</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">The Sword and The Staff</h1>
                        <p className="text-purple-200">The Last Adventure Begin</p>

                        {/* User greeting if authenticated */}
                        {isAuthenticated && user && (
                            <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg">
                                <p className="text-white text-sm">Welcome back,</p>
                                <p className="text-yellow-300 font-bold">{user.displayName}!</p>
                                <div className="flex justify-center space-x-4 mt-2 text-xs text-purple-200">
                                    <span>Games: {user.gameStats.gamesPlayed}</span>
                                    <span>Wins: {user.gameStats.gamesWon}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Only show game setup if authenticated */}
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => gameLogic.setGameMode('setup')}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    Start Solo Adventure (AI)
                                </button>

                                <button
                                    onClick={() => gameLogic.setGameMode('realm')}
                                    className="w-full py-4 bg-gradient-to-r from-blue-400 to-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    Enter Your Realm
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="text-white/80 mb-4">Please login to start your adventure!</p>
                                <div className="text-sm text-purple-200 bg-white/10 backdrop-blur rounded-lg p-4">
                                    <p className="mb-2">🎮 Create your account to:</p>
                                    <ul className="text-left space-y-1">
                                        <li>• Save your game progress</li>
                                        <li>• Track your victories</li>
                                        <li>• Invite friends to play</li>
                                        <li>• Join the leaderboard</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Game instructions */}
                    <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-2xl">
                        <h3 className="font-bold text-white mb-2">How to Play</h3>
                        <ul className="space-y-1 text-purple-200 text-sm">
                            <li>🎲 Roll dice to move along the path</li>
                            <li>⚔️ Equip items and battle enemies</li>
                            <li>💰 Collect rewards and upgrade gear</li>
                            <li>💰 Buy and sell in the shop</li>
                            <li>🏰 First to reach the castle wins!</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Enhanced setup screen with beautiful character selection
    if (gameLogic.gameMode === 'setup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
                {/* Authentication Button in top right */}
                <div className="absolute top-6 right-6 z-10">
                    <AuthButton />
                </div>

                {/* Back button */}
                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => gameLogic.setGameMode('menu')}
                        className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>
                </div>

                <div className="max-w-6xl mx-auto pt-20">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-white mb-2">Game Setup</h1>
                                <p className="text-purple-200">Choose your character and configure your adventure</p>

                                {/* User info */}
                                {user && (
                                    <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg inline-block">
                                        <p className="text-yellow-300 font-bold">Playing as: {user.displayName}</p>
                                    </div>
                                )}
                            </div>

                            {/* Character Selection */}
                            <div className="mb-8">
                                <CharacterSelection
                                    selectedCharacter={gameLogic.playerSetup.character}
                                    onSelect={(character) => gameLogic.setPlayerSetup(prev => ({ ...prev, character }))}
                                />
                            </div>

                            {/* Game Configuration */}
                            <div className="space-y-6 max-w-md mx-auto">
                                <div>
                                    <label className="block text-white font-bold mb-2">Character Name</label>
                                    <input
                                        type="text"
                                        value={gameLogic.playerSetup.name}
                                        onChange={(e) => gameLogic.setPlayerSetup(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-xl text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                        placeholder="Enter character name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white font-bold mb-2">Number of Players</label>
                                    <select
                                        value={gameLogic.playerSetup.playerCount}
                                        onChange={(e) => gameLogic.setPlayerSetup(prev => ({ ...prev, playerCount: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none"
                                    >
                                        <option value={2} className="text-gray-900">2 Players</option>
                                        <option value={3} className="text-gray-900">3 Players</option>
                                        <option value={4} className="text-gray-900">4 Players</option>
                                    </select>
                                </div>

                                <button
                                    onClick={gameLogic.startGame}
                                    disabled={!gameLogic.playerSetup.name.trim() || !gameLogic.playerSetup.character}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                                >
                                    Begin Quest
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Return the appropriate layout based on device type
    if (isMobile) {
        return <MobileLayout {...gameLogic} />;
    } else {
        return <DesktopLayout {...gameLogic} />;
    }
};

export default BoardGameUnified;
