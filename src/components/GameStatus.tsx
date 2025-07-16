import React from 'react';
import { GameState } from '../types/game.types';
import AnimatedDice from './AnimatedDice';

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
                                               }) => {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

    if (!currentPlayer) return null;

    const getPhaseMessage = () => {
        switch (gameState.phase) {
            case 'rolling':
                return 'Roll the dice to start your turn!';
            case 'selecting_tile':
                return `Correct! Choose where to move (up to ${gameState.diceValue} spaces)`;
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

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Current Player: {currentPlayer.username}
                </h2>
                <div
                    className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-white shadow-lg"
                    style={{ backgroundColor: currentPlayer.color }}
                />
                <p className="text-lg text-gray-600">{getPhaseMessage()}</p>
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

            {/* Player Stats */}
            <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-2">Player Stats:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Position: {currentPlayer.position}</div>
                    <div>Health: {currentPlayer.health}/{currentPlayer.maxHealth}</div>
                    <div>Items: {currentPlayer.inventory.length}</div>
                </div>
            </div>
        </div>
    );
};

export default GameStatus;
