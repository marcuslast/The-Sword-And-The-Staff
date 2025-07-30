import React from 'react';
import {
    Move, Castle, Swords, AlertTriangle, Sparkles, Store
} from 'lucide-react';
import { Tile, Player } from '../types/game.types';
import { getOrderedPathTiles } from '../utils/gameLogic';

interface GameBoardProps {
    board: Tile[];
    players: Player[];
    currentPlayerId: string;
    onTileClick?: (tile: Tile) => void;
    availableTiles?: number[];
    isSelectingTile?: boolean;
    onTileSelection?: (position: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
                                                 board,
                                                 players,
                                                 currentPlayerId,
                                                 onTileClick,
                                                 availableTiles = [],
                                                 isSelectingTile = false,
                                                 onTileSelection
                                             }) => {
    if (!board.length) {
        return (
            <div className="relative w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>No board data available</p>
                </div>
            </div>
        );
    }

    const pathTiles = getOrderedPathTiles(board);

    const getTileContent = (tile: Tile) => {
        const playersOnTile = players.filter(p => {
            const playerTile = pathTiles[p.position];
            return playerTile && playerTile.x === tile.x && playerTile.y === tile.y;
        });

        const tilePosition = pathTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
        const isAvailable = isSelectingTile && availableTiles.includes(tilePosition);

        return (
            <div
                className={`relative w-full h-full flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isAvailable
                        ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse scale-110'
                        : ''
                }`}
                onClick={() => {
                    if (isAvailable && onTileSelection) {
                        onTileSelection(tilePosition);
                    } else {
                        onTileClick?.(tile);
                    }
                }}
            >
                {/* Tile icons */}
                {tile.type === 'start' && <Move className="text-green-300" size={20} />}
                {tile.type === 'castle' && <Castle className="text-purple-300" size={24} />}
                {tile.type === 'battle' && <Swords className="text-red-300" size={18} />}
                {tile.type === 'bonus' && <Sparkles className="text-yellow-300" size={18} />}
                {tile.type === 'trap' && <AlertTriangle className="text-orange-300" size={18} />}
                {tile.type === 'shop' && <Store className="text-blue-300" size={18} />}
                {tile.type === 'hoard' && <Sparkles className="text-purple-300" size={18} />}

                {/* Players on tile */}
                {playersOnTile.map((player, idx) => (
                    <div
                        key={player.id}
                        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transform transition-all duration-500"
                        style={{
                            backgroundColor: player.color,
                            top: `${-8 + idx * 8}px`,
                            left: `${35 + idx * 8}px`,
                            zIndex: 10 + idx,
                            boxShadow: `0 0 10px ${player.color}60`
                        }}
                        title={`${player.username} (Position: ${player.position})`}
                    />
                ))}

                {/* Path index for debugging */}
                <div className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-60 px-1 rounded">
                    {tilePosition >= 0 ? tilePosition : ''}
                </div>

                {/* Available tile glow */}
                {isAvailable && (
                    <div className="absolute inset-0 rounded-lg bg-green-400 opacity-30 animate-pulse" />
                )}

                {/* Special tile indicators */}
                {tile.type === 'battle' && tile.enemy && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-600 rounded-full animate-bounce" />
                )}
                {tile.type === 'shop' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full h-96 bg-gray-800 rounded-lg p-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/10 to-blue-900/10 rounded-lg" />

            {/* Board grid with better spacing */}
            <div className="relative w-full h-full">
                <div className="grid grid-cols-10 grid-rows-8 gap-2 h-full w-full">
                    {board.map((tile) => {
                        // Only render path tiles, leave empty space for non-path tiles
                        if (!tile.isPath) {
                            return (
                                <div
                                    key={tile.id}
                                    className="relative"
                                />
                            );
                        }

                        // Render path tiles with enhanced styling
                        const tilePosition = pathTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
                        const isAvailable = isSelectingTile && availableTiles.includes(tilePosition);

                        return (
                            <div
                                key={tile.id}
                                className={`relative rounded-lg border-2 transition-all duration-300 shadow-lg ${
                                    tile.type === 'castle'
                                        ? 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 shadow-purple-500/50'
                                        : tile.type === 'start'
                                            ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 shadow-green-500/50'
                                            : tile.type === 'battle'
                                                ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-red-500/40'
                                                : tile.type === 'bonus'
                                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400 shadow-yellow-500/40'
                                                    : tile.type === 'trap'
                                                        ? 'bg-gradient-to-br from-orange-600 to-orange-800 border-orange-400 shadow-orange-500/40'
                                                        : tile.type === 'shop'
                                                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-blue-500/40'
                                                            : tile.type === 'hoard'
                                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-700 border-purple-400 shadow-purple-500/40'
                                                                : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 shadow-gray-500/30'
                                } ${
                                    isAvailable ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse' : ''
                                }`}
                            >
                                {getTileContent(tile)}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Instructions overlay */}
            {isSelectingTile && (
                <div className="absolute top-4 left-4 right-4 bg-green-600 bg-opacity-95 text-white p-4 rounded-xl z-40 shadow-lg">
                    <div className="text-center">
                        <div className="font-bold text-lg mb-1">🎯 Choose Your Destination!</div>
                        <div className="text-sm opacity-90">
                            Click on any glowing tile to move there
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-xs space-y-1 z-30">
                <div className="font-semibold mb-2">Legend:</div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Start</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span>Castle</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded"></div>
                    <span>Battle</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>Bonus</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Shop</span>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
