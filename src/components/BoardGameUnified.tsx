import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import DesktopLayout from '../layouts/DesktopLayout';
import MobileLayout from '../layouts/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import { AuthButton } from './Auth/AuthButton';
import CharacterSelection from './CharacterSelection';
import useRealmLogic from "../realm/hooks/useRealmLogic";
import GameCompleteRewards from './GameCompleteRewards';
import Realm from '../realm/components/Realm'; // Add this import

const BoardGameUnified: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const gameLogic = useGameLogic();
    const realmLogic = useRealmLogic();
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

                        {/* User greeting with enhanced stats */}
                        {isAuthenticated && user && (
                            <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg">
                                <p className="text-white text-sm">Welcome back,</p>
                                <p className="text-yellow-300 font-bold">{user.displayName}!</p>
                                <div className="flex justify-center space-x-4 mt-2 text-xs text-purple-200">
                                    <span>Games: {user.gameStats.gamesPlayed}</span>
                                    <span>Wins: {user.gameStats.gamesWon}</span>
                                </div>
                                {/* Show realm stats if available */}
                                {realmLogic.inventory && (
                                    <div className="flex justify-center space-x-4 mt-1 text-xs text-yellow-200">
                                        <span>💰 {realmLogic.inventory.gold.toLocaleString()}</span>
                                        <span>🔮 {realmLogic.getTotalOrbs()}</span>
                                    </div>
                                )}
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
                                    onClick={() => {
                                        gameLogic.setGameMode('realm');
                                        realmLogic.setRealmMode('home');
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-blue-400 to-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative"
                                >
                                    Enter Your Realm
                                    {/* Show orb count badge */}
                                    {realmLogic.hasOrbs && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                            {realmLogic.getTotalOrbs()}
                                        </div>
                                    )}
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
                                        <li>• Earn crystal orbs and gold</li>
                                        <li>• Access your personal realm</li>
                                        <li>• Join the leaderboard</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Updated game instructions */}
                    <div className="mt-8 p-4 bg-white/10 backdrop-blur rounded-2xl">
                        <h3 className="font-bold text-white mb-2">How to Play</h3>
                        <ul className="space-y-1 text-purple-200 text-sm">
                            <li>🎲 Roll dice to move along the path</li>
                            <li>⚔️ Equip items and battle enemies</li>
                            <li>💰 Collect gold and upgrade gear</li>
                            <li>🏪 Buy and sell in the shop</li>
                            <li>🏰 First to reach the castle wins!</li>
                            <li>🎁 Win to earn realm rewards!</li>
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

    // Realm mode - render the Realm component
    if (gameLogic.gameMode === 'realm') {
        return (
            <Realm
                onBack={() => gameLogic.setGameMode('menu')}
            />
        );
    }

    // Game playing mode
    if (gameLogic.gameMode === 'playing') {
        const gameComponent = isMobile ?
            <MobileLayout {...gameLogic} /> :
            <DesktopLayout {...gameLogic} />;

        return (
            <>
                {gameComponent}

                {/* 🧪 TEST VICTORY BUTTON */}
                {process.env.NODE_ENV === 'development' && (
                    <button
                        onClick={() => {
                            const humanPlayer = gameLogic.gameState.players.find(p => p.id === '1');
                            if (humanPlayer) {
                                console.log('🧪 Testing victory with rewards...');
                                gameLogic.handleGameVictory({
                                    ...humanPlayer,
                                    gold: humanPlayer.gold + 250,
                                    stats: {
                                        ...humanPlayer.stats,
                                        goldCollected: 300
                                    }
                                });
                            }
                        }}
                        className="fixed top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-50"
                    >
                        🧪 Test Victory
                    </button>
                )}

                {/* Game Complete Rewards Modal */}
                <GameCompleteRewards
                    isVisible={gameLogic.showGameCompleteRewards}
                    rewards={gameLogic.gameCompleteRewards}
                    onDismiss={gameLogic.dismissGameCompleteRewards}
                    onGoToRealm={() => {
                        gameLogic.dismissGameCompleteRewards();
                        gameLogic.setGameMode('realm');
                        realmLogic.setRealmMode('orbs');
                    }}
                />
            </>
        );
    }

    // Return the appropriate layout based on device type and mode
    if (isMobile) {
        return <MobileLayout {...gameLogic} />;
    } else {
        return <DesktopLayout {...gameLogic} />;
    }
};

export default BoardGameUnified;
