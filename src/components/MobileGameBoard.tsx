
import React, { useRef, useState } from 'react';
import {
    Move, Castle, Swords, Sparkles, AlertTriangle
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
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Debug logging
    console.log('MobileGameBoard render:', {
        originalBoardLength: board.length,
        playersLength: players.length,
        currentPlayerId,
        availableTiles,
        isSelectingTile,
        pathTilesCount: board.filter(t => t.isPath).length,
        firstFewTiles: board.slice(0, 5).map(t => ({ id: t.id, type: t.type, isPath: t.isPath, x: t.x, y: t.y }))
    });

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

    // Create a 2D array to properly position tiles
    const createGridBoard = () => {
        const gridBoard: (Tile | null)[][] = [];
        for (let y = 0; y < 8; y++) {
            gridBoard[y] = [];
            for (let x = 0; x < 10; x++) {
                gridBoard[y][x] = null;
            }
        }

        // Place tiles in their correct positions
        board.forEach(tile => {
            if (tile.y >= 0 && tile.y < 8 && tile.x >= 0 && tile.x < 10) {
                gridBoard[tile.y][tile.x] = tile;
            }
        });

        return gridBoard;
    };

    const gridBoard = createGridBoard();

    const getTileContent = (tile: Tile | null) => {
        if (!tile) {
            return (
                <div className="relative w-full h-full flex items-center justify-center min-h-[30px]">
                    {/* Empty tile */}
                </div>
            );
        }

        try {
            const pathTiles = getOrderedPathTiles(board);
            const playersOnTile = players.filter(p => {
                const playerTile = pathTiles[p.position];
                return playerTile && playerTile.x === tile.x && playerTile.y === tile.y;
            });

            const tilePosition = pathTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
            const isAvailable = isSelectingTile && availableTiles.includes(tilePosition);

            return (
                <div
                    className={`relative w-full h-full flex items-center justify-center transition-all duration-300 min-h-[30px] cursor-pointer
                        ${isAvailable ? 'ring-2 ring-green-400 ring-opacity-75 animate-pulse' : ''}`}
                    onClick={() => isAvailable && onTileSelection(tilePosition)}
                >
                    {/* Tile icons */}
                    {tile.type === 'start' && <Move className="text-green-400" size={12} />}
                    {tile.type === 'castle' && <Castle className="text-purple-400" size={14} />}
                    {tile.type === 'battle' && <Swords className="text-red-400" size={12} />}
                    {tile.type === 'bonus' && <Sparkles className="text-yellow-400" size={12} />}
                    {tile.type === 'trap' && <AlertTriangle className="text-orange-400" size={12} />}

                    {/* Players on tile */}
                    {playersOnTile.map((player, idx) => (
                        <div
                            key={player.id}
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform transition-all duration-500"
                            style={{
                                backgroundColor: player.color,
                                top: `${20 + idx * 15}%`,
                                left: `${20 + idx * 15}%`,
                                zIndex: 10 + idx,
                                boxShadow: `0 0 8px ${player.color}`
                            }}
                        />
                    ))}

                    {/* Show tile coordinates for debugging */}
                    {tile.isPath && (
                        <div className="absolute bottom-0 right-0 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                            {tilePosition >= 0 ? tilePosition : `${tile.x},${tile.y}`}
                        </div>
                    )}
                </div>
            );
        } catch (error) {
            console.error('Error in getTileContent:', error);
            return (
                <div className="relative w-full h-full flex items-center justify-center min-h-[30px]">
                    <div className="text-red-400 text-xs">ERR</div>
                </div>
            );
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-3xl shadow-2xl" ref={boardRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />

            {/* Board container */}
            <div
                className="absolute inset-0 p-2 transition-transform duration-200"
                style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
                }}
            >
                {/* Grid layout - 10 columns, 8 rows */}
                <div className="grid grid-cols-10 grid-rows-8 gap-1 h-full w-full">
                    {gridBoard.map((row, y) =>
                        row.map((tile, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`relative rounded-lg transition-all duration-300 border border-gray-700 ${
                                    tile?.isPath
                                        ? tile.type === 'castle'
                                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg'
                                            : tile.type === 'start'
                                                ? 'bg-gradient-to-br from-green-600 to-green-800 shadow-lg'
                                                : tile.type === 'battle'
                                                    ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-md'
                                                    : tile.type === 'bonus'
                                                        ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-md'
                                                        : tile.type === 'trap'
                                                            ? 'bg-gradient-to-br from-orange-600 to-orange-800 shadow-md'
                                                            : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-md'
                                        : 'bg-gray-800/30'
                                }`}
                            >
                                {getTileContent(tile)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileGameBoard;
