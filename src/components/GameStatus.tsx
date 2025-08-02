import React from 'react';
import { GameState } from '../types/game.types';
import AnimatedDice from './AnimatedDice';
import { Heart, Sword, Shield, Zap } from 'lucide-react';
import { getStatBreakdowns } from '../utils/equipmentLogic';
import {CHARACTER_IMAGES} from "../utils/characterImage";

interface GameStatusProps {
    gameState: GameState;
    diceRolling: boolean;
    onRollDice: () => void;
    isSelectingTile: boolean;
    availableTiles: number[];
    onHeal?: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({
                                                   gameState,
                                                   diceRolling,
                                                   onRollDice,
                                                   isSelectingTile,
                                                   availableTiles,
                                                   onHeal,
                                               }) => {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

    if (!currentPlayer) return null;

    const getPhaseMessage = () => {
        switch (gameState.phase) {
            case 'rolling':
                return 'Roll the dice to start your turn!';
            case 'selecting_tile':
                return `Choose where to move (up to ${gameState.diceValue} spaces)`;
            case 'moving':
                return 'Moving to selected tile...';
            case 'battle':
                return 'Battle in progress...';
            case 'trap':
                return 'Trap activated!';
            case 'reward':
                return 'Receiving reward...';
            case 'game_over':
                return `Game Over! ${gameState.winner?.username} wins!`;
            default:
                return 'Game in progress...';
        }
    };

    const statBreakdowns = getStatBreakdowns(currentPlayer);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6">
            {/* Current Player Header */}
            <div className="text-center border-b border-gray-200 pb-4">
                <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        <img
                            src={CHARACTER_IMAGES[currentPlayer.character]}
                            alt={currentPlayer.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {currentPlayer.username}
                        </h2>
                        <p className="text-sm text-gray-600">Position: {currentPlayer.position}</p>
                    </div>
                </div>
                <p className="text-base text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                    {getPhaseMessage()}
                </p>
            </div>

            {/* Dice Section */}
            {(gameState.phase === 'rolling' || (gameState.diceValue !== null && gameState.phase !== 'selecting_tile')) && (
                <div className="flex justify-center">
                    <AnimatedDice
                        value={gameState.diceValue}
                        rolling={diceRolling}
                        onRoll={onRollDice}
                        disabled={gameState.phase !== 'rolling'}
                    />
                </div>
            )}

            {/* Heal Button */}
            {gameState.phase === 'rolling' && currentPlayer.id === '1' &&
                currentPlayer.health < statBreakdowns.health.total && onHeal && (
                    <div className="flex justify-center">
                        <button
                            onClick={onHeal}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
                        >
                            <Heart className="inline mr-2" size={16} />
                            Heal 33%
                        </button>
                    </div>
                )}

            {/* Tile Selection Info */}
            {isSelectingTile && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">🎯 Choose Your Move!</h3>
                    <p className="text-green-700">
                        Click on any <span className="font-bold text-green-600">flashing green tile</span> to move there.
                        <br />
                        Available moves: {availableTiles.length} tiles
                    </p>
                </div>
            )}

            {/* Clean Player Stats */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">
                    Player Stats
                </h3>

                {/* Health Display */}
                <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <Heart size={16} className="text-red-500" />
                            <span className="text-sm font-medium text-gray-700">Health</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-gray-900">
                                {currentPlayer.health}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-sm font-medium text-gray-700">
                                {statBreakdowns.health.base}
                            </span>
                            {statBreakdowns.health.bonus > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    +{statBreakdowns.health.bonus}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                            style={{ width: `${(currentPlayer.health / statBreakdowns.health.total) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Other Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Attack */}
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <Sword size={16} className="text-orange-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-gray-900">{statBreakdowns.attack.total}</div>
                        {statBreakdowns.attack.bonus > 0 && (
                            <div className="text-xs text-green-600 font-medium">+{statBreakdowns.attack.bonus}</div>
                        )}
                        <div className="text-xs text-gray-500">ATK</div>
                    </div>

                    {/* Defense */}
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Shield size={16} className="text-blue-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-gray-900">{statBreakdowns.defense.total}</div>
                        {statBreakdowns.defense.bonus > 0 && (
                            <div className="text-xs text-green-600 font-medium">+{statBreakdowns.defense.bonus}</div>
                        )}
                        <div className="text-xs text-gray-500">DEF</div>
                    </div>

                    {/* Speed */}
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <Zap size={16} className="text-yellow-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-gray-900">{statBreakdowns.speed.total}</div>
                        {statBreakdowns.speed.bonus > 0 && (
                            <div className="text-xs text-green-600 font-medium">+{statBreakdowns.speed.bonus}</div>
                        )}
                        <div className="text-xs text-gray-500">SPD</div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-gray-900">{currentPlayer.position}</div>
                        <div className="text-xs text-gray-600">Position</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-gray-900">{currentPlayer.inventory.length}</div>
                        <div className="text-xs text-gray-600">Items</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-yellow-600">{currentPlayer.gold}</div>
                        <div className="text-xs text-gray-600">Gold</div>
                    </div>
                </div>

                {/* Equipment bonus summary */}
                {(statBreakdowns.attack.bonus > 0 || statBreakdowns.defense.bonus > 0 ||
                    statBreakdowns.health.bonus > 0 || statBreakdowns.speed.bonus > 0) && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <h4 className="font-semibold text-sm mb-2 text-green-800">🛡️ Equipment Bonuses</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {statBreakdowns.health.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>❤️ Health:</span>
                                    <span className="font-bold">+{statBreakdowns.health.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.attack.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>⚔️ Attack:</span>
                                    <span className="font-bold">+{statBreakdowns.attack.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.defense.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>🛡️ Defense:</span>
                                    <span className="font-bold">+{statBreakdowns.defense.bonus}</span>
                                </div>
                            )}
                            {statBreakdowns.speed.bonus > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>👟 Speed:</span>
                                    <span className="font-bold">+{statBreakdowns.speed.bonus}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameStatus;
