import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';
import TrainingCenter from "./TroopTrainingCenter";
import '../../town.css';

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
    vault: {
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
                ${isEmpty ? 'empty-town-cell hover:opacity-90' : `bg-gradient-to-br ${visual.color} ${visual.shadowColor}`}
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
    const [activeView, setActiveView] = useState<'town' | 'army' | 'training' | 'center'>('town');
    const [selectedTroopType, setSelectedTroopType] = useState<string>('');
    const [trainingQuantity, setTrainingQuantity] = useState<number>(1);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
    const [showTrainingCenter, setShowTrainingCenter] = useState(false);

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

    // FIXED: Building cost checking - find level 1 cost instead of assuming index 0
    const canAffordBuilding = (buildingType: string): boolean => {
        const config = townLogic.getBuildingConfig(buildingType);
        if (!config || !realmLogic.inventory) return false;

        // Fix: Find the cost for level 1, not just take index 0
        const level1Cost = config.buildCost.find(c => c.level === 1);
        if (!level1Cost) return false;

        const cost = level1Cost.resources || {};
        const resources = (realmLogic.inventory.resources || {}) as Record<string, number>;
        const gold = realmLogic.inventory.gold ?? 0;

        for (const [resource, amount] of Object.entries(cost)) {
            const playerAmount = resource === 'gold'
                ? gold
                : resources[resource] ?? 0;
            if (playerAmount < amount) return false;
        }
        return true;
    };

    // FIXED: Training cost checking with proper level lookup
    const canAffordTraining = (troopType: string, quantity: number): boolean => {
        const config = townLogic.getTroopConfig(troopType);
        const building = selectedBuilding
            ? townLogic.town?.buildings.find(b => b.x === selectedBuilding.x && b.y === selectedBuilding.y)
            : null;

        if (!config || !building || !realmLogic.inventory) return false;

        const buildingLevel = building.level || 1;
        // Fix: Find the correct level in the troop config
        const levelConfig = config.levels.find(l => l.level === buildingLevel);
        if (!levelConfig) return false;

        const cost = levelConfig.trainingCost || {};
        const resources = (realmLogic.inventory.resources || {}) as Record<string, number>;
        const gold = realmLogic.inventory.gold ?? 0;

        for (const [resource, amount] of Object.entries(cost)) {
            const totalCost = amount * quantity;
            const playerAmount = resource === 'gold'
                ? gold
                : resources[resource] ?? 0;
            if (playerAmount < totalCost) return false;
        }
        return true;
    };

    // NEW: Helper function to get training cost for preview
    const getTrainingCost = (troopType: string, quantity: number): Record<string, number> | null => {
        const config = townLogic.getTroopConfig(troopType);
        const building = selectedBuilding
            ? townLogic.town?.buildings.find(b => b.x === selectedBuilding.x && b.y === selectedBuilding.y)
            : null;

        if (!config || !building) return null;

        const buildingLevel = building.level || 1;
        const levelConfig = config.levels.find(l => l.level === buildingLevel);
        if (!levelConfig) return null;

        const cost = levelConfig.trainingCost || {};
        const totalCost: Record<string, number> = {};

        for (const [resource, amount] of Object.entries(cost)) {
            totalCost[resource] = amount * quantity;
        }

        return totalCost;
    };

    // NEW: Helper function to get building cost for preview
    const getBuildingCost = (buildingType: string): Record<string, number> | null => {
        const config = townLogic.getBuildingConfig(buildingType);
        if (!config) return null;

        const level1Cost = config.buildCost.find(c => c.level === 1);
        return level1Cost?.resources || null;
    };

    // Helper function for resource icons
    const getResourceIcon = (resource: string): string => {
        const icons: Record<string, string> = {
            food: '🌾',
            wood: '🪵',
            stone: '🗿',
            iron: '⚒️',
            gold: '💰',
            gems: '💎'
        };
        return icons[resource] || '📦';
    };

    const getTotalTroops = (): number => {
        if (!townLogic.army) return 0;
        let total = 0;
        const army = townLogic.army as unknown as Record<string, Record<string, number>>;
        Object.values(army).forEach((troopLevels) => {
            Object.values(troopLevels).forEach((count) => {
                total += Number(count) || 0;
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

    // Determine background styling based on active view
    const getContainerClass = () => {
        if (activeView === 'army') return 'army-view';
        if (activeView === 'training') return 'training-queue-view';
        return 'min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900';
    };

    return (
        <div className={getContainerClass()}>
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
                            <button
                                onClick={() => setShowTrainingCenter(true)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    activeView === 'center'
                                        ? 'bg-orange-600 text-white shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                🏛️ Training Center
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
            <div className="max-w-7xl mx-auto px-4 py-6 town-container">
                {activeView === 'town' && (
                    <div className="rounded-2xl p-4 mb-6">
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
                    <div className="space-y-6 army-background">
                        {/* Army Overview Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Total Troops */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold text-white mb-2">{getTotalTroops()}</div>
                                <div className="text-blue-100 text-sm">Total Units</div>
                                <div className="text-blue-200 text-xs mt-1">Ready for Battle</div>
                            </div>

                            {/* Army Power */}
                            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold text-white mb-2">
                                    {(() => {
                                        let totalPower = 0;
                                        if (townLogic.army && townLogic.troopConfigs) {
                                            Object.entries(townLogic.army).forEach(([troopType, troopLevels]) => {
                                                const config = townLogic.getTroopConfig(troopType);
                                                if (config) {
                                                    Object.entries(troopLevels as Record<string, number>).forEach(([level, count]) => {
                                                        const levelStats = config.levels?.[parseInt(level) - 1]?.stats;
                                                        if (levelStats) {
                                                            const unitPower = levelStats.attack + levelStats.defense + (levelStats.health / 10);
                                                            totalPower += unitPower * (Number(count) || 0);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        return Math.round(totalPower).toLocaleString();
                                    })()}
                                </div>
                                <div className="text-red-100 text-sm">Combat Power</div>
                                <div className="text-red-200 text-xs mt-1">Attack + Defense + HP/10</div>
                            </div>

                            {/* Active Troop Types */}
                            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold text-white mb-2">
                                    {Object.values(townLogic.army || {}).filter(troopLevels =>
                                        Object.values(troopLevels as Record<string, number>).some(count => (Number(count) || 0) > 0)
                                    ).length}
                                </div>
                                <div className="text-green-100 text-sm">Troop Types</div>
                                <div className="text-green-200 text-xs mt-1">Trained & Ready</div>
                            </div>

                            {/* Highest Level */}
                            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold text-white mb-2">
                                    {(() => {
                                        let maxLevel = 0;
                                        if (townLogic.army) {
                                            Object.values(townLogic.army).forEach(troopLevels => {
                                                Object.keys(troopLevels as Record<string, number>).forEach(level => {
                                                    const levelNum = parseInt(level);
                                                    if (levelNum > maxLevel && (troopLevels as any)[level] > 0) {
                                                        maxLevel = levelNum;
                                                    }
                                                });
                                            });
                                        }
                                        return maxLevel;
                                    })()}
                                </div>
                                <div className="text-purple-100 text-sm">Highest Level</div>
                                <div className="text-purple-200 text-xs mt-1">Elite Forces</div>
                            </div>
                        </div>

                        {/* Main Army Display */}
                        {getTotalTroops() === 0 ? (
                            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-12 text-center">
                                <div className="text-8xl mb-6">⚔️</div>
                                <h3 className="text-2xl font-bold text-white mb-4">No Army Yet</h3>
                                <p className="text-white/80 text-lg mb-2">Your kingdom needs defenders!</p>
                                <p className="text-white/60 mb-6">Train troops in military buildings to build your army.</p>
                                <button
                                    onClick={() => setActiveView('town')}
                                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition-all"
                                >
                                    🏗️ View Military Buildings
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Troop Cards Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Object.entries(townLogic.army || {})
                                        .filter(([_, troopLevels]) =>
                                            Object.values(troopLevels as Record<string, number>).some(count => (Number(count) || 0) > 0)
                                        )
                                        .map(([troopType, troopLevels]) => {
                                            const config = townLogic.getTroopConfig(troopType);
                                            const icon = TROOP_ICONS[troopType] || '⚔️';
                                            const totalCount = Object.values(troopLevels as Record<string, number>).reduce((sum, count) => sum + (Number(count) || 0), 0);

                                            // Calculate total power for this troop type
                                            let troopPower = 0;
                                            if (config) {
                                                Object.entries(troopLevels as Record<string, number>).forEach(([level, count]) => {
                                                    const levelStats = config.levels?.[parseInt(level) - 1]?.stats;
                                                    if (levelStats) {
                                                        const unitPower = levelStats.attack + levelStats.defense + (levelStats.health / 10);
                                                        troopPower += unitPower * (Number(count) || 0);
                                                    }
                                                });
                                            }

                                            // Get highest level stats for display
                                            const levels = Object.keys(troopLevels as Record<string, number>)
                                                .filter(level => (troopLevels as any)[level] > 0)
                                                .map(Number)
                                                .sort((a, b) => b - a);
                                            const highestLevel = levels[0];
                                            const highestLevelStats = config?.levels?.[highestLevel - 1]?.stats;

                                            return (
                                                <div key={troopType} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all group">
                                                    {/* Header with Image */}
                                                    <div className="relative p-6 pb-4">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center relative">
                                                                <img
                                                                    src={`/components/training/${troopType}.jpg`}
                                                                    alt={config?.name || troopType}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                                                        if (nextSibling) nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div className="hidden w-full h-full items-center justify-center text-3xl">
                                                                    {icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-white">{config?.name || troopType}</h3>
                                                                <p className="text-gray-400 text-sm">{config?.description || 'Elite fighting force'}</p>
                                                                <div className="flex items-center gap-4 mt-2">
                                                                    <span className="text-yellow-400 font-bold text-lg">{totalCount.toLocaleString()}</span>
                                                                    <span className="text-red-400 font-semibold">{Math.round(troopPower).toLocaleString()} Power</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Level Breakdown */}
                                                    <div className="px-6 pb-4">
                                                        <div className="bg-black/30 rounded-lg p-4">
                                                            <h4 className="text-gray-300 text-sm font-semibold mb-3">Unit Levels:</h4>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {Object.entries(troopLevels as Record<string, number>)
                                                                    .filter(([_, count]) => (Number(count) || 0) > 0)
                                                                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                                                    .map(([level, count]) => (
                                                                        <div key={level} className="bg-gray-800/60 rounded-lg p-2 text-center">
                                                                            <div className="text-white text-sm font-bold">Lvl {level}</div>
                                                                            <div className="text-yellow-400 text-xs font-semibold">{(Number(count) || 0).toLocaleString()}</div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Stats Display (Highest Level) */}
                                                    {highestLevelStats && (
                                                        <div className="px-6 pb-4">
                                                            <div className="bg-black/30 rounded-lg p-4">
                                                                <h4 className="text-gray-300 text-sm font-semibold mb-3">Elite Stats (Level {highestLevel}):</h4>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-red-400">⚔️</span>
                                                                        <span className="text-white text-sm">{highestLevelStats.attack}</span>
                                                                        <span className="text-gray-400 text-xs">ATK</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-blue-400">🛡️</span>
                                                                        <span className="text-white text-sm">{highestLevelStats.defense}</span>
                                                                        <span className="text-gray-400 text-xs">DEF</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-green-400">❤️</span>
                                                                        <span className="text-white text-sm">{highestLevelStats.health}</span>
                                                                        <span className="text-gray-400 text-xs">HP</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-yellow-400">⚡</span>
                                                                        <span className="text-white text-sm">{highestLevelStats.speed}</span>
                                                                        <span className="text-gray-400 text-xs">SPD</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Quick Actions */}
                                                    <div className="px-6 pb-6">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    // Find a building that can train this troop type
                                                                    const availableBuilding = townLogic.town?.buildings.find(building =>
                                                                        building.type === config?.buildingRequired &&
                                                                        building.level > 0 &&
                                                                        !building.isBuilding &&
                                                                        !building.isUpgrading
                                                                    );

                                                                    if (availableBuilding) {
                                                                        setSelectedBuilding({ x: availableBuilding.x, y: availableBuilding.y });
                                                                        setSelectedTroopType(troopType);
                                                                        setShowTrainingMenu(true);
                                                                        setActiveView('town');
                                                                    } else {
                                                                        showNotification(`No available ${config?.buildingRequired.replace('_', ' ')} to train more ${config?.name}`, 'error');
                                                                    }
                                                                }}
                                                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm py-2 px-3 rounded-lg font-semibold transition-all"
                                                            >
                                                                🎯 Train More
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // Show detailed stats
                                                                    showNotification(`${config?.name}: ${totalCount} units with ${Math.round(troopPower)} total power`, 'info');
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-all"
                                                                title="View Details"
                                                            >
                                                                📊
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* Army Analysis */}
                                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4">⚡ Army Analysis</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Composition Chart */}
                                        <div className="bg-gray-800/50 rounded-xl p-4">
                                            <h4 className="text-gray-300 text-sm font-semibold mb-3">Force Composition</h4>
                                            <div className="space-y-2">
                                                {Object.entries(townLogic.army || {})
                                                    .filter(([_, troopLevels]) =>
                                                        Object.values(troopLevels as Record<string, number>).some(count => (Number(count) || 0) > 0)
                                                    )
                                                    .map(([troopType, troopLevels]) => {
                                                        const count = Object.values(troopLevels as Record<string, number>).reduce((sum, c) => sum + (Number(c) || 0), 0);
                                                        const percentage = getTotalTroops() > 0 ? Math.round((count / getTotalTroops()) * 100) : 0;
                                                        const config = townLogic.getTroopConfig(troopType);

                                                        return (
                                                            <div key={troopType} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">{TROOP_ICONS[troopType] || '⚔️'}</span>
                                                                    <span className="text-white text-sm">{config?.name || troopType}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 bg-gray-700 rounded-full h-2">
                                                                        <div
                                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-gray-300 text-xs w-10 text-right">{percentage}%</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        {/* Combat Readiness */}
                                        <div className="bg-gray-800/50 rounded-xl p-4">
                                            <h4 className="text-gray-300 text-sm font-semibold mb-3">Combat Readiness</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Offensive Power</span>
                                                    <span className="text-red-400 font-semibold">
                                        {(() => {
                                            let totalAttack = 0;
                                            if (townLogic.army && townLogic.troopConfigs) {
                                                Object.entries(townLogic.army).forEach(([troopType, troopLevels]) => {
                                                    const config = townLogic.getTroopConfig(troopType);
                                                    if (config) {
                                                        Object.entries(troopLevels as Record<string, number>).forEach(([level, count]) => {
                                                            const levelStats = config.levels?.[parseInt(level) - 1]?.stats;
                                                            if (levelStats) {
                                                                totalAttack += levelStats.attack * (Number(count) || 0);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            return Math.round(totalAttack).toLocaleString();
                                        })()}
                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Defensive Power</span>
                                                    <span className="text-blue-400 font-semibold">
                                        {(() => {
                                            let totalDefense = 0;
                                            if (townLogic.army && townLogic.troopConfigs) {
                                                Object.entries(townLogic.army).forEach(([troopType, troopLevels]) => {
                                                    const config = townLogic.getTroopConfig(troopType);
                                                    if (config) {
                                                        Object.entries(troopLevels as Record<string, number>).forEach(([level, count]) => {
                                                            const levelStats = config.levels?.[parseInt(level) - 1]?.stats;
                                                            if (levelStats) {
                                                                totalDefense += levelStats.defense * (Number(count) || 0);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            return Math.round(totalDefense).toLocaleString();
                                        })()}
                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Total Health</span>
                                                    <span className="text-green-400 font-semibold">
                                        {(() => {
                                            let totalHealth = 0;
                                            if (townLogic.army && townLogic.troopConfigs) {
                                                Object.entries(townLogic.army).forEach(([troopType, troopLevels]) => {
                                                    const config = townLogic.getTroopConfig(troopType);
                                                    if (config) {
                                                        Object.entries(troopLevels as Record<string, number>).forEach(([level, count]) => {
                                                            const levelStats = config.levels?.[parseInt(level) - 1]?.stats;
                                                            if (levelStats) {
                                                                totalHealth += levelStats.health * (Number(count) || 0);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            return Math.round(totalHealth).toLocaleString();
                                        })()}
                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="bg-gray-800/50 rounded-xl p-4">
                                            <h4 className="text-gray-300 text-sm font-semibold mb-3">Army Actions</h4>
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => setShowTrainingCenter(true)}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    🏛️ Training Center
                                                </button>
                                                <button
                                                    onClick={() => setActiveView('training')}
                                                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    ⏱️ View Training Queue
                                                </button>
                                                <button
                                                    onClick={() => setActiveView('town')}
                                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    🏗️ Military Buildings
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const armyDetails = Object.entries(townLogic.army || {})
                                                            .filter(([_, levels]) => Object.values(levels as Record<string, number>).some(c => c > 0))
                                                            .map(([type, levels]) => {
                                                                const config = townLogic.getTroopConfig(type);
                                                                const total = Object.values(levels as Record<string, number>).reduce((s, c) => s + c, 0);
                                                                return `${config?.name || type}: ${total}`;
                                                            })
                                                            .join(', ');

                                                        showNotification(`Army: ${armyDetails || 'No troops'}`, 'info');
                                                    }}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    📋 Army Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showTrainingCenter && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-black rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-y-auto relative">
                            {/* Keep the X if you like, or rely solely on the Back button inside */}
                            <button
                                onClick={() => setShowTrainingCenter(false)}
                                className="absolute top-4 right-4 text-white text-3xl hover:text-red-400"
                                aria-label="Close training center"
                            >
                                ×
                            </button>

                            {/* Pass the back handler down */}
                            <TrainingCenter onBack={() => setShowTrainingCenter(false)} />
                        </div>
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

                            {/* ENHANCED Build Menu with Better Cost Preview */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                {townLogic.buildingConfigs.map(config => {
                                    const cost = getBuildingCost(config.type);
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

                                            {/* Enhanced Cost Display */}
                                            {cost && (
                                                <div className="text-xs opacity-80 mt-1 space-y-1">
                                                    {Object.entries(cost).map(([resource, amount]) => {
                                                        const playerAmount = resource === 'gold'
                                                            ? (realmLogic.inventory?.gold ?? 0)
                                                            // @ts-ignore
                                                            : (realmLogic.inventory?.resources?.[resource] ?? 0);
                                                        const hasEnough = playerAmount >= amount;

                                                        return (
                                                            <div
                                                                key={resource}
                                                                className={`${hasEnough ? 'text-green-300' : 'text-red-300'}`}
                                                            >
                                                                {amount} {resource}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Build Time */}
                                            <div className="text-xs opacity-60 mt-1">
                                                ⏱️ {config.buildCost.find(c => c.level === 1)?.time || 0}s
                                            </div>

                                            {/* Insufficient Resources Indicator */}
                                            {!canAfford && (
                                                <div className="text-xs text-red-400 mt-1">
                                                    Insufficient resources
                                                </div>
                                            )}
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
                                            const levelConfig = config.levels.find(l => l.level === buildingLevel);
                                            const cost = levelConfig?.trainingCost;
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

                                    {/* ENHANCED Quantity and Train Button with Cost Preview */}
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

                                            {/* Enhanced Cost Preview */}
                                            <div className="flex-1">
                                                {(() => {
                                                    const cost = getTrainingCost(selectedTroopType, trainingQuantity);
                                                    const canAfford = canAffordTraining(selectedTroopType, trainingQuantity);

                                                    return (
                                                        <div className="bg-black/30 rounded-lg p-3">
                                                            <div className="text-sm text-white/80 mb-1">Total Cost:</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {cost ? Object.entries(cost).map(([resource, amount]) => {
                                                                    const playerAmount = resource === 'gold'
                                                                        ? (realmLogic.inventory?.gold ?? 0)
                                                                        // @ts-ignore
                                                                        : (realmLogic.inventory?.resources?.[resource] ?? 0);
                                                                    const hasEnough = playerAmount >= amount;

                                                                    return (
                                                                        <span
                                                                            key={resource}
                                                                            className={`text-xs px-2 py-1 rounded ${
                                                                                hasEnough
                                                                                    ? 'bg-green-600/30 text-green-200'
                                                                                    : 'bg-red-600/30 text-red-200'
                                                                            }`}
                                                                        >
                                                                            {amount} {resource}
                                                                            {!hasEnough && (
                                                                                <span className="text-red-300 ml-1">
                                                                                    (need {amount - playerAmount} more)
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    );
                                                                }) : (
                                                                    <span className="text-white/60 text-xs">Cost calculation error</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <button
                                                onClick={handleTrainTroops}
                                                disabled={!canAffordTraining(selectedTroopType, trainingQuantity) || townLogic.training}
                                                className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {townLogic.training ? 'Starting...' : `Train ${trainingQuantity}x`}
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
                const nextLevelCost = config.buildCost.find(c => c.level === building.level + 1)?.resources || {};

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
