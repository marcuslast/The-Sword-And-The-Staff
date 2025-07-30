import React, { useRef, useState } from 'react';
import {
    Move, Castle, Swords, Sparkles, AlertTriangle, Store
} from 'lucide-react';
import { Tile, Player } from '../types/game.types';
import { getOrderedPathTiles } from '../utils/gameLogic';

interface MobileGameBoardProps {
    board: Tile[];
    players: Player[];
    currentPlayerId: string;
    availableTiles: number[];
    isSelectingTile: boolean;
    onTileSelection: (position: number) => void;
}

const MobileGameBoard: React.FC<MobileGameBoardProps> = ({
                                                             board,
                                                             players,
                                                             currentPlayerId,
                                                             availableTiles,
                                                             isSelectingTile,
                                                             onTileSelection
                                                         }) => {
    const boardRef = useRef<HTMLDivElement>(null);

    if (!board.length) {
        return (
            <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-center">
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
                className={`relative w-full h-full flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-110 ${
                    isAvailable
                        ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse scale-110'
                        : ''
                }`}
                onClick={() => isAvailable && onTileSelection(tilePosition)}
            >
                {/* Tile icons */}
                {tile.type === 'start' && <Move className="text-green-400" size={16} />}
                {tile.type === 'castle' && <Castle className="text-purple-400" size={20} />}
                {tile.type === 'battle' && <Swords className="text-red-400" size={14} />}
                {tile.type === 'bonus' && <Sparkles className="text-yellow-400" size={14} />}
                {tile.type === 'trap' && <AlertTriangle className="text-orange-400" size={14} />}
                {tile.type === 'shop' && <Store className="text-blue-400" size={14} />}
                {tile.type === 'hoard' && <Sparkles className="text-purple-400" size={14} />}

                {/* Players on tile */}
                {playersOnTile.map((player, idx) => (
                    <div
                        key={player.id}
                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform transition-all duration-500"
                        style={{
                            backgroundColor: player.color,
                            top: `${20 + idx * 12}%`,
                            left: `${60 + idx * 12}%`,
                            zIndex: 10 + idx,
                            boxShadow: `0 0 8px ${player.color}`
                        }}
                    />
                ))}

                {/* Path index for debugging */}
                <div className="absolute bottom-0 right-0 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                    {tilePosition >= 0 ? tilePosition : ''}
                </div>

                {/* Available tile glow */}
                {isAvailable && (
                    <div className="absolute inset-0 rounded-xl bg-green-400 opacity-30 animate-pulse" />
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-3xl shadow-2xl" ref={boardRef}>
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />

            {/* Board container with better spacing */}
            <div className="absolute inset-0 p-2">
                <div className="grid grid-cols-10 grid-rows-8 gap-1 h-full w-full">
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

                        // Render path tiles with better styling
                        const tilePosition = pathTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
                        const isAvailable = isSelectingTile && availableTiles.includes(tilePosition);

                        return (
                            <div
                                key={tile.id}
                                className={`relative rounded-xl border-2 transition-all duration-300 shadow-lg ${
                                    tile.type === 'castle'
                                        ? 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 shadow-purple-500/40'
                                        : tile.type === 'start'
                                            ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 shadow-green-500/40'
                                            : tile.type === 'battle'
                                                ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-red-500/30'
                                                : tile.type === 'bonus'
                                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400 shadow-yellow-500/30'
                                                    : tile.type === 'trap'
                                                        ? 'bg-gradient-to-br from-orange-600 to-orange-800 border-orange-400 shadow-orange-500/30'
                                                        : tile.type === 'shop'
                                                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-blue-500/30'
                                                            : tile.type === 'hoard'
                                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-700 border-purple-400 shadow-purple-500/30'
                                                                : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 shadow-gray-500/20'
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

            {/* Instructions */}
            {isSelectingTile && (
                <div className="absolute top-4 left-4 right-4 bg-green-500 bg-opacity-90 text-white p-3 rounded-xl z-40">
                    <div className="text-center font-semibold">
                        🎯 Choose your destination!
                    </div>
                    <div className="text-sm text-center mt-1">
                        Tap any glowing tile to move there
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileGameBoard;
