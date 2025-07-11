
import React from 'react';
import {
    Move, Castle, Swords, AlertTriangle, Sparkles
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

    const pathTiles = getOrderedPathTiles(board);

    // Function to check if a tile is available for selection
    const isTileAvailable = (tile: Tile): boolean => {
        // Only allow selection if explicitly in selection mode
        if (!isSelectingTile) return false;

        const tileIndex = pathTiles.findIndex(t => t.id === tile.id);
        return availableTiles.includes(tileIndex);
    };


    // Function to get the path index of a tile
    const getTilePathIndex = (tile: Tile): number => {
        return pathTiles.findIndex(t => t.id === tile.id);
    };

    const getTileContent = (tile: Tile) => {
        const tilePathIndex = getTilePathIndex(tile);
        const playersOnTile = players.filter(p => p.position === tilePathIndex);

        return (
            <>
                {tile.type === 'start' && <Move className="text-green-600" size={16} />}
                {tile.type === 'castle' && <Castle className="text-purple-600" size={20} />}
                {tile.type === 'battle' && tile.enemy && <Swords className="text-red-600" size={16} />}
                {tile.type === 'bonus' && <Sparkles className="text-yellow-600" size={16} />}
                {tile.type === 'trap' && tile.trap && <AlertTriangle className="text-orange-600" size={16} />}

                {/* Enhanced Player Indicators */}
                {playersOnTile.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-0.5 w-full h-full p-1">
                            {playersOnTile.map((player, idx) => (
                                <div
                                    key={player.id}
                                    className={`
                                        w-full h-full rounded-full border-2 border-white shadow-lg
                                        ${player.id === currentPlayerId ? 'animate-pulse border-yellow-400' : ''}
                                        flex items-center justify-center text-xs font-bold text-white
                                    `}
                                    style={{ backgroundColor: player.color }}
                                    title={`${player.username} (Position: ${player.position})`}
                                >
                                    {player.username.charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Debug: Show tile path index */}
                {tile.isPath && (
                    <div className="absolute top-0 left-0 text-xs bg-black text-white px-1 rounded">
                        {tilePathIndex}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="grid grid-cols-10 gap-1 bg-gray-700 p-4 rounded-lg">
            {board.map((tile) => {
                const isAvailable = isTileAvailable(tile);
                const tilePathIndex = getTilePathIndex(tile);

                return (
                    <div
                        key={tile.id}
                        onClick={() => {
                            console.log('Tile clicked:', tile, 'Path index:', tilePathIndex, 'Available:', isAvailable);
                            if (isAvailable && onTileSelection) {
                                onTileSelection(tilePathIndex);
                            } else {
                                onTileClick?.(tile);
                            }
                        }}
                        className={`relative w-16 h-16 rounded flex items-center justify-center cursor-pointer transition-all duration-300
                            ${tile.isPath
                            ? tile.type === 'castle'
                                ? 'bg-purple-500'
                                : tile.type === 'start'
                                    ? 'bg-green-500'
                                    : 'bg-yellow-100'
                            : 'bg-gray-600'
                        }
                            ${tile.type === 'battle' && 'border-2 border-red-500'}
                            ${tile.type === 'trap' && tile.trap && 'border-2 border-orange-500'}
                            ${tile.type === 'bonus' && 'border-2 border-yellow-500'}
                            ${isAvailable
                            ? 'animate-pulse bg-green-400 border-4 border-green-600 shadow-lg scale-105 cursor-pointer'
                            : 'hover:opacity-80'
                        }
                        `}
                    >
                        {getTileContent(tile)}

                        {/* Available tile indicator */}
                        {isAvailable && (
                            <div className="absolute inset-0 rounded bg-green-400 opacity-50 animate-pulse" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GameBoard;
