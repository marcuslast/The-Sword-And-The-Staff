import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/Auth/AuthButton';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';

interface TownProps {
    onBack: () => void;
}

// Enhanced building visual configurations
const BUILDING_VISUALS: Record<string, {
    baseColor: string;
    accentColor: string;
    shadowColor: string;
    icon: string;
    size: 'small' | 'medium' | 'large' | 'huge';
}> = {
    townhall: {
        baseColor: 'from-amber-600 to-amber-800',
        accentColor: 'border-amber-400',
        shadowColor: 'shadow-amber-900/50',
        icon: '🏛️',
        size: 'huge'
    },
    house: {
        baseColor: 'from-orange-500 to-orange-700',
        accentColor: 'border-orange-400',
        shadowColor: 'shadow-orange-900/50',
        icon: '🏠',
        size: 'small'
    },
    farm: {
        baseColor: 'from-green-500 to-green-700',
        accentColor: 'border-green-400',
        shadowColor: 'shadow-green-900/50',
        icon: '🌾',
        size: 'medium'
    },
    mine: {
        baseColor: 'from-gray-600 to-gray-800',
        accentColor: 'border-gray-500',
        shadowColor: 'shadow-gray-900/50',
        icon: '⛏️',
        size: 'medium'
    },
    lumbermill: {
        baseColor: 'from-yellow-700 to-yellow-900',
        accentColor: 'border-yellow-600',
        shadowColor: 'shadow-yellow-900/50',
        icon: '🪵',
        size: 'medium'
    },
    quarry: {
        baseColor: 'from-stone-600 to-stone-800',
        accentColor: 'border-stone-500',
        shadowColor: 'shadow-stone-900/50',
        icon: '🗿',
        size: 'medium'
    },
    barracks: {
        baseColor: 'from-red-600 to-red-800',
        accentColor: 'border-red-500',
        shadowColor: 'shadow-red-900/50',
        icon: '⚔️',
        size: 'large'
    }
};

// Building timer component
const BuildingTimer: React.FC<{
    endTime: string;
    onSpeedUp: () => void;
    canAffordSpeedup: boolean;
}> = ({ endTime, onSpeedUp, canAffordSpeedup }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const end = new Date(endTime).getTime();
            const diff = Math.max(0, end - now);
            setTimeLeft(diff);

            if (diff === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const gemCost = Math.ceil(timeLeft / 60000); // 1 gem per minute

    return (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 bg-black/80 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap">
            <div className="flex items-center gap-2">
                <span>⏱️ {formatTime(timeLeft)}</span>
                <button
                    onClick={onSpeedUp}
                    disabled={!canAffordSpeedup}
                    className={`px-2 py-0.5 rounded ${
                        canAffordSpeedup
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-gray-600 cursor-not-allowed'
                    }`}
                >
                    💎 {gemCost}
                </button>
            </div>
        </div>
    );
};

// Enhanced building cell with timers for both construction and upgrade
const IsometricBuildingCell: React.FC<{
    building: any;
    x: number;
    y: number;
    isSelected: boolean;
    onClick: (x: number, y: number) => void;
    buildingConfig?: any;
    scale: number;
    onSpeedUp?: (x: number, y: number, endTime: string) => void;
    canAffordSpeedup?: (endTime: string) => boolean;
}> = ({ building, x, y, isSelected, onClick, buildingConfig, scale, onSpeedUp, canAffordSpeedup }) => {
    const visual = BUILDING_VISUALS[building.type] || {
        baseColor: 'from-gray-600 to-gray-700',
        accentColor: 'border-gray-500',
        shadowColor: 'shadow-gray-900/50',
        icon: '🏗️',
        size: 'medium'
    };

    const sizeMultiplier = {
        small: 1,
        medium: 1.2,
        large: 1.4,
        huge: 1.6
    }[visual.size];

    const baseSize = 60 * scale * sizeMultiplier;

    return (
        <div
            className="absolute transition-all duration-300 cursor-pointer"
            style={{
                left: `${x * 70 * scale}px`,
                top: `${y * 70 * scale}px`,
                width: `${baseSize}px`,
                height: `${baseSize}px`,
                zIndex: y * 10 + (isSelected ? 100 : 0),
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={() => onClick(x, y)}
        >
            <div className={`absolute inset-0 rounded-lg ${
                building.type === 'empty'
                    ? 'bg-gradient-to-br from-green-700/30 to-green-800/30 border-2 border-green-600/20'
                    : ''
            }`}>
                {building.type !== 'empty' && (
                    <>
                        <div className={`absolute -bottom-2 -right-2 w-full h-full rounded-lg bg-black/30 blur-md ${visual.shadowColor}`} />
                        <div className={`absolute inset-0 bg-gradient-to-br ${visual.baseColor} rounded-lg border-2 ${visual.accentColor} ${
                            isSelected ? 'ring-4 ring-yellow-400/50' : ''
                        }`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl" style={{ fontSize: `${baseSize * 0.5}px` }}>
                                    {visual.icon}
                                </span>
                            </div>

                            {building.level > 0 && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg">
                                    {building.level}
                                </div>
                            )}

                            {buildingConfig?.production && building.level > 0 && (
                                <div className="absolute top-2 left-2 animate-pulse">
                                    <div className="bg-green-500 rounded-full w-3 h-3 shadow-lg shadow-green-500/50" />
                                </div>
                            )}

                            {/* Construction timer */}
                            {building.isBuilding && building.buildEndTime && (
                                <BuildingTimer
                                    endTime={building.buildEndTime}
                                    onSpeedUp={() => onSpeedUp?.(x, y, building.buildEndTime)}
                                    canAffordSpeedup={canAffordSpeedup?.(building.buildEndTime) ?? true}
                                />
                            )}

                            {/* Upgrade timer */}
                            {building.isUpgrading && building.upgradeEndTime && (
                                <BuildingTimer
                                    endTime={building.upgradeEndTime}
                                    onSpeedUp={() => onSpeedUp?.(x, y, building.upgradeEndTime)}
                                    canAffordSpeedup={canAffordSpeedup?.(building.upgradeEndTime) ?? true}
                                />
                            )}
                        </div>
                    </>
                )}

                {building.type === 'empty' && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-green-400 text-2xl animate-bounce">+</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Town: React.FC<TownProps> = ({ onBack }) => {
    const { user } = useAuth();
    const townLogic = useTownLogic();
    const realmLogic = useRealmLogic();

    // Map viewport and controls
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mapScale, setMapScale] = useState(1);

    // Extended map size (20x20 instead of 10x8)
    const MAP_WIDTH = 20;
    const MAP_HEIGHT = 20;
    const CELL_SIZE = 70; // Base cell size in pixels

    // Handle map dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === mapRef.current || (e.target as HTMLElement).closest('.map-cell')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - mapPosition.x,
                y: e.clientY - mapPosition.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setMapPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle zoom
    const handleZoom = (delta: number) => {
        setMapScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
    };

    const calculateSpeedupGemCost = (endTime: string) => {
        return townLogic.calculateSpeedupCost(endTime);
    };

    const canAffordSpeedup = (endTime: string) => {
        const cost = calculateSpeedupGemCost(endTime);
        const gems = realmLogic.inventory?.resources?.gems ?? 0;
        return gems >= cost;
    };

    const handleSpeedUp = async (x: number, y: number, endTime: string) => {
        const cost = calculateSpeedupGemCost(endTime);
        if (!canAffordSpeedup(endTime)) return;
        await townLogic.speedUpBuilding(x, y, cost);
        // You may want to refresh realm inventory here
        try {
            await realmLogic.loadInventory(false);
        } catch {}
    };

    // Generate extended map layout (unchanged)
    const generateExtendedMap = () => {
        if (!townLogic.town) return [];
        const extendedMap = [];
        for (let y = 0; y < 20; y++) {
            const row: any[] = [];
            for (let x = 0; x < 20; x++) {
                const building = townLogic.town.buildings.find(b => b.x === x && b.y === y);
                if (building) {
                    row.push({
                        type: building.type,
                        level: building.level,
                        id: `${x}-${y}`,
                        isBuilding: (building as any).isBuilding,
                        buildEndTime: (building as any).buildEndTime,
                        isUpgrading: building.isUpgrading,
                        upgradeEndTime: building.upgradeEndTime
                    });
                } else {
                    row.push({ type: 'empty', level: 0, id: `${x}-${y}` });
                }
            }
            extendedMap.push(row);
        }
        return extendedMap;
    };

    const extendedMap = generateExtendedMap();

    if (townLogic.loading && !townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🏰</div>
                    <div className="text-white text-xl mb-4">Loading your kingdom...</div>
                    <div className="text-green-200 text-sm">Preparing your lands for glory</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 overflow-hidden relative">
            {/* Fixed UI Elements */}
            <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                <div className="p-4 pointer-events-auto">
                    {/* Top Bar */}
                    <div className="flex justify-between items-start mb-4">
                        {/* Back button */}
                        <button
                            onClick={onBack}
                            className="bg-black/50 backdrop-blur-lg text-white p-3 rounded-xl hover:bg-black/60 transition-all duration-200 flex items-center space-x-2 shadow-xl"
                        >
                            <span>←</span>
                            <span>Back</span>
                        </button>

                        {/* Auth button */}
                        <AuthButton />
                    </div>

                    {/* Resources Bar */}
                    {realmLogic.inventory && (
                        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 mx-auto max-w-4xl shadow-2xl border border-white/10">
                            <div className="flex items-center justify-around text-white">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">💰</span>
                                    <div>
                                        <div className="font-bold text-lg">{realmLogic.inventory.gold.toLocaleString()}</div>
                                        <div className="text-xs opacity-70">Gold</div>
                                    </div>
                                </div>
                                {realmLogic.inventory.resources && Object.entries(realmLogic.inventory.resources).map(([resource, amount]) => (
                                    <div key={resource} className="flex items-center space-x-2">
                                        <span className="text-2xl">{
                                            resource === 'wood' ? '🪵' :
                                                resource === 'stone' ? '🗿' :
                                                    resource === 'iron' ? '⚒️' :
                                                        resource === 'food' ? '🌾' :
                                                            resource === 'gems' ? '💎' : '📦'
                                        }</span>
                                        <div>
                                            <div className="font-bold">{amount}</div>
                                            <div className="text-xs opacity-70 capitalize">{resource}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                <button
                    onClick={() => handleZoom(0.1)}
                    className="bg-black/50 backdrop-blur text-white p-3 rounded-xl hover:bg-black/60 transition-all shadow-xl"
                >
                    🔍+
                </button>
                <button
                    onClick={() => handleZoom(-0.1)}
                    className="bg-black/50 backdrop-blur text-white p-3 rounded-xl hover:bg-black/60 transition-all shadow-xl"
                >
                    🔍-
                </button>
                <button
                    onClick={() => {
                        setMapPosition({ x: 0, y: 0 });
                        setMapScale(1);
                    }}
                    className="bg-black/50 backdrop-blur text-white p-3 rounded-xl hover:bg-black/60 transition-all shadow-xl"
                >
                    🎯
                </button>
            </div>

            {/* Scrollable Map */}
            <div
                ref={mapRef}
                className="absolute inset-0 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(251, 146, 60, 0.05) 0%, transparent 50%)
                    `
                }}
            >
                {/* Map Grid Container */}
                <div
                    className="relative"
                    style={{
                        transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
                        transformOrigin: 'center center',
                        width: `${MAP_WIDTH * CELL_SIZE}px`,
                        height: `${MAP_HEIGHT * CELL_SIZE}px`,
                        left: '50%',
                        top: '50%',
                        marginLeft: `-${(MAP_WIDTH * CELL_SIZE) / 2}px`,
                        marginTop: `-${(MAP_HEIGHT * CELL_SIZE) / 2}px`,
                    }}
                >
                    {/* Grid Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `
                                linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                        }}
                    />

                    {/* Render buildings */}
                    {extendedMap.map((row, y) =>
                        row.map((cell, x) => {
                            const buildingConfig = townLogic.getBuildingConfig(cell.type);
                            const isSelected = townLogic.selectedBuilding?.x === x && townLogic.selectedBuilding?.y === y;

                            return (
                                <IsometricBuildingCell
                                    key={cell.id}
                                    building={cell}
                                    x={x}
                                    y={y}
                                    isSelected={isSelected}
                                    onClick={(x, y) => {
                                        if (!isDragging) {
                                            townLogic.handleCellClick(x, y);
                                        }
                                    }}
                                    buildingConfig={buildingConfig}
                                    scale={1}
                                    onSpeedUp={handleSpeedUp}
                                    canAffordSpeedup={canAffordSpeedup}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom UI Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                <div className="p-4 pointer-events-auto">
                    {/* Pending Resources Alert */}
                    {townLogic.hasPendingResources && (
                        <div className="bg-green-600/90 backdrop-blur-lg rounded-xl p-4 mb-4 mx-auto max-w-md shadow-2xl border border-green-400/30">
                            <p className="text-white font-bold mb-2">🌾 Resources Ready!</p>
                            <div className="text-green-100 text-sm mb-3">
                                {Object.entries(townLogic.pendingResources)
                                    .filter(([_, amount]) => amount > 0)
                                    .map(([resource, amount]) => `+${amount} ${resource}`)
                                    .join(', ')}
                            </div>
                            <button
                                onClick={townLogic.collectResources}
                                disabled={townLogic.collectingResources}
                                className="w-full bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all disabled:opacity-50 font-semibold"
                            >
                                {townLogic.collectingResources ? 'Collecting...' : 'Collect All'}
                            </button>
                        </div>
                    )}

                    {/* Build Menu - Show when in build mode or when empty cell is selected */}
                    {(townLogic.buildMode || (townLogic.showBuildMenu && townLogic.selectedBuilding)) && (
                        <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 mx-auto max-w-6xl shadow-2xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-xl">🏗️ Construction Menu</h3>
                                <button
                                    onClick={() => {
                                        townLogic.setBuildMode(null);
                                        townLogic.setShowBuildMenu(false);
                                    }}
                                    className="text-white/60 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                                {townLogic.buildingConfigs.map((building) => {
                                    const canAfford = true; // Simplified for demo
                                    const visual = BUILDING_VISUALS[building.type] || BUILDING_VISUALS.house;
                                    const cost = building.buildCost[0]?.resources || {};

                                    return (
                                        <button
                                            key={building.type}
                                            onClick={() => {
                                                if (townLogic.selectedBuilding) {
                                                    townLogic.buildBuilding(
                                                        townLogic.selectedBuilding.x,
                                                        townLogic.selectedBuilding.y,
                                                        building.type
                                                    );
                                                }
                                            }}
                                            disabled={!canAfford}
                                            className={`relative p-4 rounded-xl transition-all border-2 ${
                                                canAfford
                                                    ? `bg-gradient-to-br ${visual.baseColor} ${visual.accentColor} hover:scale-105 text-white`
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
                                            }`}
                                        >
                                            <div className="text-4xl mb-2">{visual.icon}</div>
                                            <div className="font-bold mb-1">{building.name}</div>
                                            <div className="text-xs opacity-80 mb-2">{building.description}</div>
                                            <div className="text-xs space-y-1">
                                                {Object.entries(cost).map(([resource, amount]) => (
                                                    <div key={resource} className="flex justify-between">
                                                        <span>{resource}:</span>
                                                        <span>{amount}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-yellow-300">
                                                    <span>Time:</span>
                                                    <span>{building.buildCost[0]?.time}s</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Selected Building Info */}
                    {townLogic.selectedBuilding && townLogic.town &&
                        extendedMap[townLogic.selectedBuilding.y]?.[townLogic.selectedBuilding.x]?.type !== 'empty' && (
                            <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 mx-auto max-w-2xl shadow-2xl border border-white/10">
                                {(() => {
                                    const building = extendedMap[townLogic.selectedBuilding.y][townLogic.selectedBuilding.x];
                                    const config = townLogic.getBuildingConfig(building.type);
                                    const visual = BUILDING_VISUALS[building.type];

                                    return (
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${visual?.baseColor || 'from-gray-600 to-gray-800'}`}>
                                                        <span className="text-4xl">{visual?.icon || '🏗️'}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold text-xl">
                                                            {config?.name || 'Unknown Building'}
                                                        </h3>
                                                        <div className="text-white/60">Level {building.level}</div>
                                                    </div>
                                                </div>

                                                <p className="text-white/80 mb-3">
                                                    {config?.description || 'A mysterious structure.'}
                                                </p>

                                                {config?.production && (
                                                    <div className="bg-green-500/20 rounded-lg p-3 mb-3">
                                                        <div className="text-green-300 text-sm font-semibold">
                                                            📈 Production (per hour):
                                                        </div>
                                                        <div className="text-white mt-1">
                                                            {Object.entries(config.production[0]?.resources || {})
                                                                .map(([resource, amount]) => `${amount * building.level} ${resource}`)
                                                                .join(', ')}
                                                        </div>
                                                    </div>
                                                )}

                                                {building.isUpgrading && (
                                                    <div className="bg-blue-500/20 rounded-lg p-3">
                                                        <div className="text-blue-300 text-sm">
                                                            🔨 Upgrading to Level {building.level + 1}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                {!building.isUpgrading && (
                                                    <button
                                                        onClick={() => townLogic.upgradeBuilding(
                                                            townLogic.selectedBuilding!.x,
                                                            townLogic.selectedBuilding!.y
                                                        )}
                                                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
                                                    >
                                                        ⬆️ Upgrade
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => townLogic.setSelectedBuilding(null)}
                                                    className="bg-white/10 text-white px-6 py-2 rounded-xl hover:bg-white/20 transition-all"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                </div>
            </div>

            {/* Map Navigation Hint */}
            <div className="absolute top-32 left-4 z-20">
                <div className="bg-black/40 backdrop-blur rounded-lg p-3 text-white/80 text-sm">
                    <div className="font-semibold mb-1">🗺️ Map Controls</div>
                    <div className="space-y-1 text-xs">
                        <div>• Drag to move around</div>
                        <div>• Scroll or use buttons to zoom</div>
                        <div>• Click buildings to manage</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Town;
