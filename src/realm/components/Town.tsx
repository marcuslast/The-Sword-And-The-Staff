import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';

interface TownProps {
    onBack?: () => void;
}

const getBuildingImageUrl = (type: string): string => {
    return `/assets/buildings/${type}.png`;
};

const getTroopImageUrl = (troopType: string): string => {
    return `/components/training/${troopType}.jpg`;
};

interface BuildingTimerProps {
    endTime: string;
    onComplete?: () => void;
}

interface BuildingCellProps {
    building: any;
    x: number;
    y: number;
    isSelected: boolean;
    onClick: (x: number, y: number) => void;
    config?: any;
}

const BUILDING_VISUALS: Record<string, {
    color: string;
    icon: string;
    shadowColor: string;
}> = {
    townhall: {
        color: 'from-amber-500 to-amber-700',
        icon: '🏛️',
        shadowColor: 'shadow-amber-900/50'
    },
    house: {
        color: 'from-orange-500 to-orange-700',
        icon: '🏠',
        shadowColor: 'shadow-orange-900/50'
    },
    farm: {
        color: 'from-green-500 to-green-700',
        icon: '🌾',
        shadowColor: 'shadow-green-900/50'
    },
    mine: {
        color: 'from-gray-500 to-gray-700',
        icon: '⛏️',
        shadowColor: 'shadow-gray-900/50'
    },
    lumbermill: {
        color: 'from-yellow-700 to-yellow-900',
        icon: '🪵',
        shadowColor: 'shadow-yellow-900/50'
    },
    quarry: {
        color: 'from-stone-500 to-stone-700',
        icon: '🗿',
        shadowColor: 'shadow-stone-900/50'
    },
    barracks: {
        color: 'from-red-500 to-red-700',
        icon: '⚔️',
        shadowColor: 'shadow-red-900/50'
    },
    archery_range: {
        color: 'from-teal-500 to-teal-700',
        icon: '🏹',
        shadowColor: 'shadow-teal-900/50'
    },
    siege_workshop: {
        color: 'from-purple-600 to-purple-800',
        icon: '🛡️',
        shadowColor: 'shadow-purple-900/50'
    },
    warrior_lodge: {
        color: 'from-red-600 to-red-800',
        icon: '🪓',
        shadowColor: 'shadow-red-900/50'
    },
    stable: {
        color: 'from-amber-600 to-amber-800',
        icon: '🐎',
        shadowColor: 'shadow-amber-900/50'
    },
    training_grounds: {
        color: 'from-indigo-600 to-indigo-800',
        icon: '🏇',
        shadowColor: 'shadow-indigo-900/50'
    },
    spy_den: {
        color: 'from-gray-700 to-gray-900',
        icon: '🥷',
        shadowColor: 'shadow-gray-900/50'
    },
    wall: {
        color: 'from-gray-600 to-gray-800',
        icon: '🏯',
        shadowColor: 'shadow-gray-900/50'
    },
    tower: {
        color: 'from-purple-600 to-purple-800',
        icon: '🏰',
        shadowColor: 'shadow-purple-900/50'
    },
    market: {
        color: 'from-purple-500 to-purple-700',
        icon: '🏪',
        shadowColor: 'shadow-purple-900/50'
    },
    warehouse: {
        color: 'from-indigo-500 to-indigo-700',
        icon: '🏭',
        shadowColor: 'shadow-indigo-900/50'
    },
    mansion: {
        color: 'from-pink-500 to-pink-700',
        icon: '🏰',
        shadowColor: 'shadow-pink-900/50'
    },
    gem_mine: {
        color: 'from-cyan-500 to-cyan-700',
        icon: '💎',
        shadowColor: 'shadow-cyan-900/50'
    }
};

const TROOP_ICONS: Record<string, string> = {
    swordsmen: '⚔️',
    archers: '🏹',
    ballistas: '🛡️',
    berserkers: '🪓',
    horsemen: '🐎',
    lancers: '🏇',
    spies: '🥷'
};

// Timer component
const BuildingTimer: React.FC<{ startTime?: string; endTime: string; label: string; onComplete?: () => void }> = ({ startTime, endTime, label, onComplete }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const endMs = new Date(endTime).getTime();
    const startMs = startTime ? new Date(startTime).getTime() : undefined;
    const totalMs = startMs ? Math.max(0, endMs - startMs) : undefined;
    const remainingMs = Math.max(0, endMs - now);
    const done = remainingMs <= 0;

    useEffect(() => {
        if (done) {
            onComplete?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    const format = (ms: number): string => {
        const totalSec = Math.ceil(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const progress = totalMs ? Math.min(1, Math.max(0, 1 - remainingMs / totalMs)) : 0;

    if (done) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ clipPath: HEX_CLIP }}
        >
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" />
            <div className="relative z-10 flex flex-col items-center justify-center text-white px-2">
                <div className="text-xs font-semibold uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded-full mb-1">
                    {label}
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center text-white px-1 scale-[0.85] sm:scale-100">
                    {format(remainingMs)}
                </div>
                {typeof totalMs === 'number' && totalMs > 0 && (
                    <div className="mt-2 w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-400/90"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Training Timer component
const TrainingTimer: React.FC<{ endTime: string; onComplete?: () => void }> = ({ endTime, onComplete }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const endMs = new Date(endTime).getTime();
    const remainingMs = Math.max(0, endMs - now);
    const done = remainingMs <= 0;

    useEffect(() => {
        if (done) {
            onComplete?.();
        }
    }, [done, onComplete]);

    const format = (ms: number): string => {
        const totalSec = Math.ceil(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    if (done) return <span className="text-green-400 font-semibold">Complete!</span>;

    return <span className="text-yellow-400 font-mono">{format(remainingMs)}</span>;
};

// Near your hex constants
const HEX_RATIO = 0.866025403784; // width / height for point-top hex (≈ √3 / 2)
// Use exact hex clip so edges meet cleanly
const HEX_CLIP = 'polygon(50% 0%, 100% 25.2%, 100% 74.8%, 50% 100%, 0% 74.8%, 0% 25.2%)';

// Building cell as a hex
const BuildingCell: React.FC<BuildingCellProps & { onTimerComplete?: () => void }> = ({ building, x, y, isSelected, onClick, config, onTimerComplete }) => {
    const isEmpty = building.type === 'empty';
    const isConstructing = building.isBuilding;
    const isUpgrading = building.isUpgrading;
    const visual = BUILDING_VISUALS[building.type] || {
        color: 'from-gray-500 to-gray-700',
        icon: '🏗️',
        shadowColor: 'shadow-gray-900/50'
    };

    const endTime = isConstructing ? building.buildEndTime : isUpgrading ? building.upgradeEndTime : undefined;
    const startTime = isConstructing ? building.buildStartTime : isUpgrading ? building.upgradeStartTime : undefined;
    const statusLabel = isConstructing ? 'Building' : isUpgrading ? 'Upgrading' : '';

    return (
        <button
            onClick={() => onClick(x, y)}
            className={`
                relative w-full h-full transition-opacity duration-200
                ${isEmpty ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 hover:opacity-90' : `bg-gradient-to-br ${visual.color} ${visual.shadowColor}`}
                ${isConstructing || isUpgrading ? 'animate-pulse' : ''}
                text-white overflow-hidden
            `}
            style={{
                clipPath: HEX_CLIP,
                transform: 'translateZ(0)'
            }}
        >
            {/* Content */}
            <div className="absolute inset-0">
                {/* Fallback icon */}
                {!isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl md:text-3xl lg:text-4xl drop-shadow-sm">
                            {visual.icon}
                        </span>
                    </div>
                )}

                {/* Empty slot indicator */}
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-green-400 text-xl md:text-2xl">+</span>
                    </div>
                )}

                {/* Level indicator */}
                {!isEmpty && building.level > 0 && (
                    <div className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-10">
                        {building.level}
                    </div>
                )}

                {/* Construction/Upgrade gray overlay with countdown */}
                {(isConstructing || isUpgrading) && endTime && (
                    <BuildingTimer
                        startTime={startTime}
                        endTime={endTime}
                        label={statusLabel}
                        onComplete={onTimerComplete}
                    />
                )}

                {/* Production indicator (hidden while busy) */}
                {config?.production && building.level > 0 && !isConstructing && !isUpgrading && (
                    <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                    </div>
                )}

                {/* Selected outline following hex shape */}
                {isSelected && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            clipPath: HEX_CLIP,
                            boxShadow: 'inset 0 0 0 3px rgba(250, 204, 21, 0.6)'
                        }}
                    />
                )}
            </div>
        </button>
    );
}

// Helpers to build a rounded hex-shaped mask using axial coords (odd-q, point-top)
function offsetToAxialOddQ(x: number, y: number) {
    // point-top, column-based odd-q layout
    const q = x;
    const r = y - (x - (x & 1)) / 2;
    return { q, r };
}
function cubeDistance(a: { q: number; r: number }, b: { q: number; r: number }) {
    const aCube = { x: a.q, z: a.r, y: -a.q - a.r };
    const bCube = { x: b.q, z: b.r, y: -b.q - b.r };
    return Math.max(
        Math.abs(aCube.x - bCube.x),
        Math.abs(aCube.y - bCube.y),
        Math.abs(aCube.z - bCube.z)
    );
}

// Add this helper (odd-r, pointy-top)
function offsetToAxialOddR(x: number, y: number) {
    // pointy-top, row-based odd-r layout
    const q = x - (y - (y & 1)) / 2;
    const r = y;
    return { q, r };
}

export const Town: React.FC<TownProps> = ({ onBack = () => {} }) => {
    const { user } = useAuth();
    const [hexW, setHexW] = useState(0);
    const townLogic = useTownLogic();
    const realmLogic = useRealmLogic();
    const [selectedBuilding, setSelectedBuilding] = useState<{ x: number; y: number } | null>(null);
    const [showBuildMenu, setShowBuildMenu] = useState(false);
    const [showTrainingMenu, setShowTrainingMenu] = useState(false);
    const [activeView, setActiveView] = useState<'town' | 'army' | 'training'>('town');
    const [selectedTroopType, setSelectedTroopType] = useState<string>('');
    const [trainingQuantity, setTrainingQuantity] = useState<number>(1);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Only load inventory here
                await realmLogic.loadInventory(false);
            } catch (error) {
                console.error('Failed to load realm inventory:', error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!townLogic.town) return;

        function updateHexSize() {
            const horizontalMargin = 16; // px margin on each side
            const verticalMargin = 220; // space for header/resources bar

            const vw = window.innerWidth - horizontalMargin * 2;
            const vh = window.innerHeight - verticalMargin;

            // Mask radius logic
            const mapWidth = townLogic.town.mapSize.width;
            const mapHeight = townLogic.town.mapSize.height;
            const radius = Math.floor(Math.min(mapWidth, mapHeight) / 2);

            // Effective playable area in hex counts
            const activeWidthHexes = radius * 2 + 1 + 0.5;
            const activeHeightHexes = 0.75 * (radius * 2) + 1;

            const maxHexWFromWidth = vw / activeWidthHexes;
            const maxHexWFromHeight = (vh / activeHeightHexes) * HEX_RATIO;

            const finalHexW = Math.min(maxHexWFromWidth, maxHexWFromHeight);

            setHexW(finalHexW);
        }

        updateHexSize();
        window.addEventListener("resize", updateHexSize);
        return () => window.removeEventListener("resize", updateHexSize);
    }, [townLogic.town]);

    const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCellClick = (x: number, y: number) => {
        if (!townLogic.town) return;

        const building = townLogic.town.buildings.find(b => b.x === x && b.y === y);

        if (!building || building.type === 'empty') {
            setSelectedBuilding({ x, y });
            setShowBuildMenu(true);
            setShowTrainingMenu(false);
        } else {
            // Always select the building and close build menu for non-empty tiles
            setSelectedBuilding({ x, y });
            setShowBuildMenu(false);
            setShowTrainingMenu(false);

            // Force a refresh to get latest building data if it's under construction
            if (building.isBuilding || building.isUpgrading) {
                townLogic.refresh();
            }
        }
    };

    const handleBuild = async (type: string) => {
        if (!selectedBuilding) return;
        const success = await townLogic.buildBuilding(selectedBuilding.x, selectedBuilding.y, type);
        if (success) {
            showNotification('Construction started!', 'success');
            setShowBuildMenu(false);
            setSelectedBuilding(null);
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const handleUpgrade = async () => {
        if (!selectedBuilding) return;
        const success = await townLogic.upgradeBuilding(selectedBuilding.x, selectedBuilding.y);
        if (success) {
            showNotification('Upgrade started!', 'success');
            setSelectedBuilding(null);
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const handleSpeedUp = async () => {
        if (!selectedBuilding) return;
        const building = townLogic.town?.buildings.find(
            b => b.x === selectedBuilding.x && b.y === selectedBuilding.y
        );
        if (!building) return;
        const endTime = building.isBuilding ? building.buildEndTime : building.upgradeEndTime;
        if (!endTime) return;

        const gemCost = townLogic.calculateSpeedupCost(endTime);
        const gems = realmLogic.inventory?.resources?.gems || 0;

        if (gems < gemCost) {
            showNotification(`Need ${gemCost} gems, have ${gems}`, 'error');
            return;
        }

        const success = await townLogic.speedUpBuilding(selectedBuilding.x, selectedBuilding.y, gemCost);
        if (success) {
            showNotification('Speed up complete!', 'success');
            await realmLogic.loadInventory(false);
        }
    };

    const handleCollectResources = async () => {
        const success = await townLogic.collectResources();
        if (success) {
            showNotification('Resources collected!', 'success');
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const handleTrainTroops = async () => {
        if (!selectedBuilding || !selectedTroopType || trainingQuantity < 1) return;

        const success = await townLogic.trainTroops(
            selectedBuilding.x,
            selectedBuilding.y,
            selectedTroopType,
            trainingQuantity
        );

        if (success) {
            showNotification(`Training ${trainingQuantity} ${selectedTroopType} started!`, 'success');
            setShowTrainingMenu(false);
            setSelectedBuilding(null);
            setSelectedTroopType('');
            setTrainingQuantity(1);
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const handleSpeedUpTraining = async (trainingId: string) => {
        const success = await townLogic.speedUpTraining(trainingId);
        if (success) {
            showNotification('Training completed instantly!', 'success');
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const handleCancelTraining = async (trainingId: string) => {
        const success = await townLogic.cancelTraining(trainingId);
        if (success) {
            showNotification('Training cancelled, 50% resources refunded', 'info');
            await realmLogic.loadInventory(false);
        } else if (townLogic.error) {
            showNotification(townLogic.error, 'error');
        }
    };

    const canAffordBuilding = (buildingType: string): boolean => {
        const config = townLogic.getBuildingConfig(buildingType);
        if (!config || !realmLogic.inventory?.resources) return false;

        const cost = config.buildCost[0]?.resources || {};
        const resources = realmLogic.inventory.resources;

        for (const [resource, amount] of Object.entries(cost)) {
            const playerAmount = (resources as any)[resource] || 0;
            if (playerAmount < amount) return false;
        }
        return true;
    };

    const canAffordTraining = (troopType: string, quantity: number): boolean => {
        const config = townLogic.getTroopConfig(troopType);
        const building = selectedBuilding ? townLogic.town?.buildings.find(
            b => b.x === selectedBuilding.x && b.y === selectedBuilding.y
        ) : null;

        if (!config || !building || !realmLogic.inventory?.resources) return false;

        const buildingLevel = building.level || 1;
        const cost = config.levels[buildingLevel - 1]?.trainingCost;
        if (!cost) return false;

        const resources = realmLogic.inventory.resources;

        for (const [resource, amount] of Object.entries(cost)) {
            const totalCost = amount * quantity;
            const playerAmount = (resources as any)[resource] || 0;
            if (playerAmount < totalCost) return false;
        }
        return true;
    };

    const getTotalTroops = (): number => {
        if (!townLogic.army) return 0;
        let total = 0;
        const army = townLogic.army as unknown as Record<string, Record<string, number>>;
        Object.values(army).forEach((troopLevels) => {
            Object.values(troopLevels).forEach((count) => {
                total += Number(count) || 0; // Fix: Properly convert to number
            });
        });
        return total;
    };


    if (townLogic.loading && !townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🏰</div>
                    <div className="text-white text-xl">Loading your kingdom...</div>
                </div>
            </div>
        );
    }

    if (!townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
                <div className="text-white text-xl">Failed to load town data</div>
            </div>
        );
    }

    // Create full rectangular grid, then we'll mask to a rounded hex area
    const createGrid = () => {
        const h = townLogic.town!.mapSize.height;
        const w = townLogic.town!.mapSize.width;

        const grid = Array.from({ length: h }, () =>
            Array.from({ length: w }, () => ({ type: 'empty', level: 0 }))
        );

        townLogic.town!.buildings.forEach(building => {
            if (building.y < h && building.x < w) {
                grid[building.y][building.x] = building;
            }
        });

        return grid;
    };

    const grid = createGrid();

    // Rounded hex mask (so map looks more circular)
    const width = townLogic.town.mapSize.width;
    const height = townLogic.town.mapSize.height;

    const centerOffset = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
    const centerAxial = offsetToAxialOddR(centerOffset.x, centerOffset.y);
    const radius = Math.floor(Math.min(width, height) / 2); // tweak if you want tighter/looser mask

    const isInRoundedHex = (x: number, y: number) => {
        const a = offsetToAxialOddR(x, y);
        return cubeDistance(a, centerAxial) <= radius;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
                        >
                            <span>←</span>
                            <span className="hidden sm:inline">Back to Realm</span>
                        </button>

                        <h1 className="text-white font-bold text-lg sm:text-xl">
                            🏰 {townLogic.town.name || 'My Town'}
                        </h1>

                        <div className="text-white text-sm">
                            Level {townLogic.town.level}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources Bar */}
            <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center gap-4 overflow-x-auto">
                        <div className="flex items-center gap-1 text-white whitespace-nowrap">
                            <span className="text-lg">💰</span>
                            <span className="font-bold">{realmLogic.inventory?.gold || 0}</span>
                        </div>
                        {realmLogic.inventory?.resources && Object.entries(realmLogic.inventory.resources).map(([resource, amount]) => (
                            <div key={resource} className="flex items-center gap-1 text-white whitespace-nowrap">
                                <span className="text-lg">
                                    {resource === 'wood' ? '🪵' :
                                        resource === 'stone' ? '🗿' :
                                            resource === 'iron' ? '⚒️' :
                                                resource === 'food' ? '🌾' :
                                                    resource === 'gems' ? '💎' : '📦'}
                                </span>
                                <span className="font-bold">{amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex justify-center">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-1 flex">
                            <button
                                onClick={() => setActiveView('town')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    activeView === 'town'
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🏘️ Town
                            </button>
                            <button
                                onClick={() => setActiveView('army')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    activeView === 'army'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                ⚔️ Army ({getTotalTroops()})
                            </button>
                            <button
                                onClick={() => setActiveView('training')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    activeView === 'training'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🎯 Training ({townLogic.activeTraining.length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Resources Alert */}
            {townLogic.hasPendingResources && (
                <div className="bg-green-600/90 backdrop-blur-lg mx-4 mt-4 rounded-xl p-3 max-w-md mx-auto">
                    <p className="text-white font-bold mb-1">🌾 Resources Ready!</p>
                    <div className="text-green-100 text-sm mb-2">
                        {Object.entries(townLogic.pendingResources)
                            .filter(([_, amount]) => amount > 0)
                            .map(([resource, amount]) => `+${amount} ${resource}`)
                            .join(', ')}
                    </div>
                    <button
                        onClick={handleCollectResources}
                        disabled={townLogic.collectingResources}
                        className="w-full bg-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all disabled:opacity-50 font-semibold text-sm"
                    >
                        {townLogic.collectingResources ? 'Collecting...' : 'Collect All'}
                    </button>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className={`px-6 py-3 rounded-lg shadow-xl ${
                        notification.type === 'error' ? 'bg-red-600' :
                            notification.type === 'success' ? 'bg-green-600' :
                                'bg-blue-600'
                    } text-white font-semibold`}>
                        {notification.message}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeView === 'town' && (
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 mb-6">
                        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] overflow-x-auto">
                            <div
                                className="relative mx-auto"
                                style={{
                                    ['--hex-w' as any]: `${hexW}px`,
                                    ['--hex-h' as any]: `${hexW / HEX_RATIO}px`,
                                    // Width/height now come from actual map size, but scaling already ensures it fits
                                    width: `calc((${townLogic.town.mapSize.width} + 0.5) * var(--hex-w))`,
                                    height: `calc((0.75 * (${townLogic.town.mapSize.height} - 1) + 1) * var(--hex-h))`,
                                }}
                            >
                                {grid.map((row, y) =>
                                    row.map((cell, x) => {
                                        if (!isInRoundedHex(x, y)) return null;

                                        // odd-r, pointy-top placement:
                                        // - each row moves down by 0.75 * H
                                        // - each column moves right by 1.0 * W
                                        // - odd rows get an extra +0.5 * W shift
                                        const left = y % 2 === 1
                                            ? `calc(${x} * var(--hex-w) + (var(--hex-w) / 2))`
                                            : `calc(${x} * var(--hex-w))`;
                                        const top = `calc(${y} * (var(--hex-h) * 0.75))`;

                                        const config = townLogic.getBuildingConfig(cell.type);

                                        return (
                                            <div
                                                key={`${x}-${y}`}
                                                className="absolute"
                                                style={{
                                                    left,
                                                    top,
                                                    width: 'var(--hex-w)',
                                                    height: 'var(--hex-h)',
                                                    // optional: reduce subpixel jitter on some GPUs
                                                    transform: 'translateZ(0)'
                                                }}
                                            >
                                                <BuildingCell
                                                    building={cell}
                                                    x={x}
                                                    y={y}
                                                    isSelected={selectedBuilding?.x === x && selectedBuilding?.y === y}
                                                    onClick={handleCellClick}
                                                    config={config}
                                                    onTimerComplete={() => {
                                                        // Lightweight refresh instead of full page reload
                                                        townLogic.refresh();
                                                    }}
                                                />

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'army' && (
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">🏹 Your Army</h2>

                        {getTotalTroops() === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">⚔️</div>
                                <p className="text-white/80 text-lg">No troops trained yet</p>
                                <p className="text-white/60">Train troops in military buildings!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(townLogic.army || {}).map(([troopType, troopLevels]) => {
                                    const totalCount = Object.values(troopLevels as Record<string, number>).reduce((sum, count) => sum + (Number(count) || 0), 0);
                                    if (totalCount === 0) return null;

                                    const config = townLogic.getTroopConfig(troopType);
                                    const icon = TROOP_ICONS[troopType] || '⚔️';

                                    return (
                                        <div key={troopType} className="bg-white/10 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 relative">
                                                    <img
                                                        src={getTroopImageUrl(troopType)}
                                                        alt={config?.name || troopType}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const nextSibling = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                            if (nextSibling) nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <span className="fallback-icon text-3xl absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                                        {icon}
                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold capitalize">{config?.name || troopType}</h3>
                                                    <p className="text-white/60 text-sm">Total: {totalCount}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {Object.entries(troopLevels as Record<string, number>).map(([level, count]) => {
                                                    const numCount = Number(count) || 0;
                                                    if (numCount === 0) return null;
                                                    return (
                                                        <div key={level} className="flex justify-between text-sm">
                                                            <span className="text-white/80">Level {level}:</span>
                                                            <span className="text-white font-semibold">{numCount}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'training' && (
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">🎯 Training Queue</h2>

                        {townLogic.activeTraining.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-white/80 text-lg">No troops in training</p>
                                <p className="text-white/60">Click on military buildings to train troops!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {townLogic.activeTraining.map((training) => {
                                    const config = townLogic.getTroopConfig(training.troopType);
                                    const icon = TROOP_ICONS[training.troopType] || '⚔️';
                                    const gemCost = townLogic.calculateSpeedupCost(training.endTime);

                                    return (
                                        <div key={training._id} className="bg-white/10 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 relative">
                                                        <img
                                                            src={getTroopImageUrl(training.troopType)}
                                                            alt={config?.name || training.troopType}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const nextSibling = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                                if (nextSibling) nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <span className="fallback-icon text-3xl absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                                            {icon}
                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold">
                                                            {training.quantity}x {config?.name || training.troopType}
                                                        </h3>
                                                        <p className="text-white/60 text-sm">Level {training.level}</p>
                                                        <p className="text-white/60 text-sm">
                                                            Building: ({training.buildingX}, {training.buildingY})
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="mb-2">
                                                        <TrainingTimer
                                                            endTime={training.endTime}
                                                            onComplete={() => townLogic.refresh()}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSpeedUpTraining(training._id!)}
                                                            disabled={townLogic.speedingUpTraining}
                                                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-all disabled:opacity-50"
                                                        >
                                                            💎 Speed Up ({gemCost})
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelTraining(training._id!)}
                                                            disabled={townLogic.cancellingTraining}
                                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-all disabled:opacity-50"
                                                        >
                                                            ❌ Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Build Menu */}
            {showBuildMenu && selectedBuilding && activeView === 'town' && (
                <div className="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 transform">
                    <div className="bg-black/90 backdrop-blur-lg border-t border-white/20 p-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-lg">Choose Building</h3>
                                <button
                                    onClick={() => {
                                        setShowBuildMenu(false);
                                        setSelectedBuilding(null);
                                    }}
                                    className="text-white/60 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                {townLogic.buildingConfigs.map(config => {
                                    const cost = config.buildCost[0]?.resources || {};
                                    const canAfford = canAffordBuilding(config.type);
                                    const visual = BUILDING_VISUALS[config.type] || {
                                        color: 'from-gray-500 to-gray-700',
                                        icon: '🏗️'
                                    };

                                    return (
                                        <button
                                            key={config.type}
                                            onClick={() => handleBuild(config.type)}
                                            disabled={!canAfford}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                canAfford
                                                    ? `bg-gradient-to-br ${visual.color} border-white/20 hover:scale-105 text-white`
                                                    : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed text-gray-400'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{visual.icon}</div>
                                            <div className="font-bold text-sm">{config.name}</div>
                                            <div className="text-xs opacity-80 mt-1">
                                                {Object.entries(cost).map(([r, a]) => `${a} ${r}`).join(', ')}
                                            </div>
                                            <div className="text-xs opacity-60 mt-1">
                                                ⏱️ {config.buildCost[0]?.time}s
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Training Menu */}
            {showTrainingMenu && selectedBuilding && activeView === 'town' && (() => {
                const building = townLogic.town!.buildings.find(
                    b => b.x === selectedBuilding.x && b.y === selectedBuilding.y
                );
                if (!building || building.type === 'empty') return null;

                const availableTroops = townLogic.troopConfigs.filter(
                    config => config.buildingRequired === building.type
                );

                if (availableTroops.length === 0) return null;

                return (
                    <div className="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 transform">
                        <div className="bg-black/90 backdrop-blur-lg border-t border-white/20 p-4">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold text-lg">Train Troops</h3>
                                    <button
                                        onClick={() => {
                                            setShowTrainingMenu(false);
                                            setSelectedBuilding(null);
                                            setSelectedTroopType('');
                                        }}
                                        className="text-white/60 hover:text-white text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Troop Selection */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {availableTroops.map(config => {
                                            const buildingLevel = building.level || 1;
                                            const cost = config.levels[buildingLevel - 1]?.trainingCost;
                                            const icon = TROOP_ICONS[config.type] || '⚔️';
                                            const isSelected = selectedTroopType === config.type;

                                            return (
                                                <button
                                                    key={config.type}
                                                    onClick={() => setSelectedTroopType(config.type)}
                                                    className={`p-3 rounded-lg border-2 transition-all ${
                                                        isSelected
                                                            ? 'bg-blue-600 border-blue-400 text-white'
                                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 mx-auto mb-1 relative">
                                                        <img
                                                            src={getTroopImageUrl(config.type)}
                                                            alt={config.name}
                                                            className="w-8 h-8 rounded object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const nextSibling = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                                if (nextSibling) nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <span className="fallback-icon text-2xl absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                        {icon}
                    </span>
                                                    </div>
                                                    <div className="font-bold text-sm">{config.name}</div>
                                                    <div className="text-xs opacity-80 mt-1">
                                                        Level {buildingLevel}
                                                    </div>
                                                    {cost && (
                                                        <div className="text-xs opacity-60 mt-1">
                                                            {Object.entries(cost).map(([r, a]) => `${a} ${r}`).join(', ')}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Quantity and Train Button */}
                                    {selectedTroopType && (
                                        <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-white font-semibold">Quantity:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={trainingQuantity}
                                                    onChange={(e) => setTrainingQuantity(parseInt(e.target.value) || 1)}
                                                    className="bg-white/20 text-white px-3 py-1 rounded border border-white/30 w-20 text-center"
                                                />
                                            </div>

                                            <button
                                                onClick={handleTrainTroops}
                                                disabled={!canAffordTraining(selectedTroopType, trainingQuantity) || townLogic.training}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {townLogic.training ? 'Starting...' : `Train ${trainingQuantity}x ${selectedTroopType}`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Building Info Panel */}
            {selectedBuilding && !showBuildMenu && !showTrainingMenu && activeView === 'town' && (() => {
                const building = townLogic.town!.buildings.find(
                    b => b.x === selectedBuilding.x && b.y === selectedBuilding.y
                );
                if (!building || building.type === 'empty') return null;

                const config = townLogic.getBuildingConfig(building.type);
                if (!config) return null;

                const visual = BUILDING_VISUALS[building.type] || {
                    color: 'from-gray-500 to-gray-700',
                    icon: '🏗️'
                };

                const canUpgrade = !building.isUpgrading && !building.isBuilding &&
                    building.level < config.maxLevel;
                const nextLevelCost = config.buildCost[Math.min(building.level, config.buildCost.length - 1)]?.resources || {};

                // Check if this is a military building that can train troops
                const availableTroops = townLogic.troopConfigs.filter(
                    troopConfig => troopConfig.buildingRequired === building.type
                );
                const canTrainTroops = availableTroops.length > 0 && !building.isBuilding && !building.isUpgrading;

                return (
                    <div className="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 transform">
                        <div className="bg-black/90 backdrop-blur-lg border-t border-white/20 p-4">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{visual.icon}</span>
                                            <div>
                                                <h3 className="font-bold text-lg">{config.name}</h3>
                                                <p className="text-sm opacity-80">Level {building.level}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBuilding(null)}
                                            className="text-white/60 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <p className="text-sm opacity-80 mb-4">{config.description}</p>

                                    {config.production && building.level > 0 && (
                                        <div className="bg-green-500/20 rounded-lg p-3 mb-4">
                                            <div className="text-sm font-semibold mb-1">Production:</div>
                                            <div className="text-sm">
                                                {Object.entries(config.production[0]?.resources || {})
                                                    .map(([r, a]) => `+${(a as number) * building.level} ${r}/hour`)
                                                    .join(', ')}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {canUpgrade && (
                                            <button
                                                onClick={handleUpgrade}
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                                            >
                                                ⬆️ Upgrade to Level {building.level + 1}
                                            </button>
                                        )}

                                        {canTrainTroops && (
                                            <button
                                                onClick={() => {
                                                    setShowTrainingMenu(true);
                                                    setSelectedTroopType('');
                                                }}
                                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                                            >
                                                ⚔️ Train Troops
                                            </button>
                                        )}
                                    </div>

                                    {canUpgrade && (
                                        <div className="text-xs opacity-60 mt-2 text-center">
                                            Upgrade cost: {Object.entries(nextLevelCost).map(([r, a]) => `${a} ${r}`).join(', ')}
                                        </div>
                                    )}

                                    {building.level >= config.maxLevel && (
                                        <div className="text-center py-3 text-yellow-400">
                                            ⭐ Max Level Reached
                                        </div>
                                    )}

                                    {(building.isUpgrading || building.isBuilding) && (
                                        <div className="text-center py-3">
                                            <div className="text-yellow-400 mb-2">
                                                <div className="animate-spin inline-block text-2xl mb-2">⏳</div>
                                                <div>{building.isUpgrading ? 'Upgrading...' : 'Building...'}</div>
                                            </div>
                                            {(building.buildEndTime || building.upgradeEndTime) && (
                                                <button
                                                    onClick={handleSpeedUp}
                                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all text-sm"
                                                >
                                                    💎 Speed Up ({townLogic.calculateSpeedupCost(
                                                    building.buildEndTime || building.upgradeEndTime || ''
                                                )} gems)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Town;
