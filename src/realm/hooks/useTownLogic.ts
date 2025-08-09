import { useState, useEffect } from 'react';
import { townAPI, Town, BuildingConfig, BuildingPosition } from '../services/townApi';

interface ExtendedBuildingPosition extends BuildingPosition {
    buildStartTime?: string;
    buildEndTime?: string;
    isBuilding?: boolean;
}

const MOCK_BUILDING_CONFIGS: BuildingConfig[] = [
    {
        type: 'townhall',
        name: 'Town Hall',
        description: 'The heart of your settlement. Unlocks new buildings and upgrades.',
        category: 'special',
        maxLevel: 10,
        emoji: '🏛️',
        imageUrl: '/models/buildings/townhall.glb',
        buildCost: [
            { level: 1, resources: { wood: 200, stone: 150, iron: 50 }, time: 300 },
            { level: 2, resources: { wood: 400, stone: 300, iron: 100 }, time: 600 },
            { level: 3, resources: { wood: 800, stone: 600, iron: 200 }, time: 1200 }
        ]
    },
    {
        type: 'house',
        name: 'Residence',
        description: 'Houses your population. Higher levels support more citizens.',
        category: 'residential',
        maxLevel: 5,
        emoji: '🏠',
        imageUrl: '/models/buildings/house.glb',
        buildCost: [
            { level: 1, resources: { wood: 50, stone: 30 }, time: 60 },
            { level: 2, resources: { wood: 75, stone: 50 }, time: 90 },
            { level: 3, resources: { wood: 100, stone: 70 }, time: 120 }
        ]
    },
    {
        type: 'mansion',
        name: 'Mansion',
        description: 'Luxury housing for wealthy citizens. Generates tax revenue.',
        category: 'residential',
        maxLevel: 3,
        emoji: '🏰',
        buildCost: [
            { level: 1, resources: { wood: 150, stone: 200, iron: 50, gems: 5 }, time: 180 }
        ],
        production: [
            { level: 1, resources: { gold: 10 }, time: 3600 }
        ]
    },
    {
        type: 'farm',
        name: 'Farm',
        description: 'Produces food to feed your population.',
        category: 'resource',
        maxLevel: 5,
        emoji: '🌾',
        imageUrl: '/models/buildings/farm.glb',
        buildCost: [
            { level: 1, resources: { wood: 30, stone: 20 }, time: 45 },
            { level: 2, resources: { wood: 50, stone: 35 }, time: 70 }
        ],
        production: [
            { level: 1, resources: { food: 10 }, time: 3600 },
            { level: 2, resources: { food: 20 }, time: 3600 },
            { level: 3, resources: { food: 35 }, time: 3600 }
        ]
    },
    {
        type: 'mine',
        name: 'Iron Mine',
        description: 'Extracts iron ore from the ground.',
        category: 'resource',
        maxLevel: 5,
        emoji: '⛏️',
        imageUrl: '/models/buildings/mine.glb',
        buildCost: [
            { level: 1, resources: { wood: 100, stone: 80 }, time: 120 },
            { level: 2, resources: { wood: 150, stone: 120 }, time: 180 }
        ],
        production: [
            { level: 1, resources: { iron: 5 }, time: 3600 },
            { level: 2, resources: { iron: 10 }, time: 3600 }
        ]
    },
    {
        type: 'gem_mine',
        name: 'Gem Mine',
        description: 'Rare mine that occasionally produces precious gems.',
        category: 'resource',
        maxLevel: 3,
        emoji: '💎',
        buildCost: [
            { level: 1, resources: { wood: 500, stone: 400, iron: 200 }, time: 600 }
        ],
        production: [
            { level: 1, resources: { gems: 1 }, time: 7200 }
        ]
    },
    {
        type: 'lumbermill',
        name: 'Lumber Mill',
        description: 'Processes trees into usable lumber.',
        category: 'resource',
        maxLevel: 5,
        emoji: '🪵',
        imageUrl: '/models/buildings/lumbermill.glb',
        buildCost: [
            { level: 1, resources: { stone: 60 }, time: 90 }
        ],
        production: [
            { level: 1, resources: { wood: 8 }, time: 3600 },
            { level: 2, resources: { wood: 16 }, time: 3600 }
        ]
    },
    {
        type: 'quarry',
        name: 'Stone Quarry',
        description: 'Extracts stone blocks for construction.',
        category: 'resource',
        maxLevel: 5,
        emoji: '🗿',
        imageUrl: '/models/buildings/quarry.glb',
        buildCost: [
            { level: 1, resources: { wood: 80, iron: 20 }, time: 100 }
        ],
        production: [
            { level: 1, resources: { stone: 6 }, time: 3600 },
            { level: 2, resources: { stone: 12 }, time: 3600 }
        ]
    },
    {
        type: 'barracks',
        name: 'Barracks',
        description: 'Trains and houses your military units.',
        category: 'military',
        maxLevel: 5,
        emoji: '⚔️',
        imageUrl: '/models/buildings/barracks.glb',
        buildCost: [
            { level: 1, resources: { wood: 120, stone: 100, iron: 30 }, time: 180 }
        ]
    },
    {
        type: 'archery_range',
        name: 'Archery Range',
        description: 'Trains ranged units for defense and offense.',
        category: 'military',
        maxLevel: 3,
        emoji: '🏹',
        buildCost: [
            { level: 1, resources: { wood: 150, stone: 50, iron: 20 }, time: 150 }
        ]
    },
    {
        type: 'stable',
        name: 'Stable',
        description: 'Trains cavalry units for rapid deployment.',
        category: 'military',
        maxLevel: 3,
        emoji: '🐎',
        buildCost: [
            { level: 1, resources: { wood: 200, stone: 100, iron: 50, food: 100 }, time: 240 }
        ]
    },
    {
        type: 'market',
        name: 'Market',
        description: 'Trade resources and generate gold from commerce.',
        category: 'special',
        maxLevel: 5,
        emoji: '🏪',
        buildCost: [
            { level: 1, resources: { wood: 100, stone: 100 }, time: 120 }
        ],
        production: [
            { level: 1, resources: { gold: 5 }, time: 3600 }
        ]
    },
    {
        type: 'warehouse',
        name: 'Warehouse',
        description: 'Increases your resource storage capacity.',
        category: 'special',
        maxLevel: 10,
        emoji: '🏭',
        buildCost: [
            { level: 1, resources: { wood: 75, stone: 75 }, time: 90 }
        ]
    },
    {
        type: 'wall',
        name: 'City Wall',
        description: 'Provides defense bonuses against attacks.',
        category: 'military',
        maxLevel: 5,
        emoji: '🏯',
        buildCost: [
            { level: 1, resources: { stone: 200, iron: 50 }, time: 300 }
        ]
    }
];

const useTownLogic = () => {
    // Town state
    const [town, setTown] = useState<Town | null>(null);
    const [buildingConfigs, setBuildingConfigs] = useState<BuildingConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [selectedBuilding, setSelectedBuilding] = useState<{ x: number; y: number } | null>(null);
    const [buildMode, setBuildMode] = useState<string | null>(null);
    const [showBuildMenu, setShowBuildMenu] = useState(false);

    // Resource collection state
    const [pendingResources, setPendingResources] = useState<Record<string, number>>({});
    const [collectingResources, setCollectingResources] = useState(false);

    // Building timers state
    const [buildingTimers, setBuildingTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
    const [activeBuildQueue, setActiveBuildQueue] = useState<Array<{
        x: number;
        y: number;
        type: string;
        endTime: string;
    }>>([]);

    // Create initial mock town for fallback
    const createMockTown = (): Town => {
        const buildings: ExtendedBuildingPosition[] = [
            { x: 10, y: 10, type: 'townhall', level: 1 },
            { x: 9, y: 10, type: 'house', level: 1 },
            { x: 11, y: 10, type: 'farm', level: 1 },
            { x: 10, y: 9, type: 'lumbermill', level: 1 },
            { x: 10, y: 11, type: 'quarry', level: 1 }
        ];

        const layout = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 20; x++) {
                const building = buildings.find(b => b.x === x && b.y === y);
                if (building) {
                    row.push({
                        type: building.type,
                        level: building.level,
                        id: `${x}-${y}`,
                        isBuilding: building.isBuilding,
                        isUpgrading: building.isUpgrading,
                        buildEndTime: building.buildEndTime,
                        upgradeEndTime: building.upgradeEndTime
                    });
                } else {
                    row.push({ type: 'empty', level: 0, id: `${x}-${y}` });
                }
            }
            layout.push(row);
        }

        return {
            id: 'mock-town',
            name: 'My Kingdom',
            level: 1,
            mapSize: { width: 20, height: 20 },
            buildings,
            layout,
            lastCollected: new Date().toISOString()
        };
    };

    // Load town data
    const loadTown = async (showLoading: boolean = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            console.log('🏰 Loading town data...');

            const data = await townAPI.getTown();
            console.log('✅ Successfully loaded town from API:', data);

            setTown(data.town);
            setBuildingConfigs(data.buildingConfigs);
            setPendingResources(data.town.pendingProduction || {});

            // Check for any ongoing building operations
            checkBuildingTimers(data.town);

            return data;

        } catch (error) {
            console.error('❌ Failed to load town from API:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const isHTMLError = errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token');

            if (isHTMLError) {
                setError('⚠️ Backend API not available. Using mock data for testing.');
                console.log('🔧 Using mock town data due to API issues');

                // Use mock data
                const mockTown = createMockTown();
                setTown(mockTown);
                setBuildingConfigs(MOCK_BUILDING_CONFIGS);
                setPendingResources({});

                return { town: mockTown, buildingConfigs: MOCK_BUILDING_CONFIGS };
            } else {
                setError(`Failed to load town: ${errorMessage}`);
                throw error;
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Check and restore building timers
    const checkBuildingTimers = (townData: Town) => {
        const now = Date.now();
        const queue: typeof activeBuildQueue = [];

        townData.buildings.forEach((building: any) => {
            if (building.isBuilding && building.buildEndTime) {
                const endTime = new Date(building.buildEndTime).getTime();
                if (endTime > now) {
                    queue.push({
                        x: building.x,
                        y: building.y,
                        type: building.type,
                        endTime: building.buildEndTime
                    });
                    startBuildingTimer(building.x, building.y, building.buildEndTime);
                } else {
                    // Building should be completed
                    completeBuildingConstruction(building.x, building.y);
                }
            }

            if (building.isUpgrading && building.upgradeEndTime) {
                const endTime = new Date(building.upgradeEndTime).getTime();
                if (endTime > now) {
                    queue.push({
                        x: building.x,
                        y: building.y,
                        type: building.type,
                        endTime: building.upgradeEndTime
                    });
                    startUpgradeTimer(building.x, building.y, building.upgradeEndTime);
                } else {
                    // Upgrade should be completed
                    completeUpgrade(building.x, building.y);
                }
            }
        });

        setActiveBuildQueue(queue);
    };

    // Start a building timer
    const startBuildingTimer = (x: number, y: number, endTime: string) => {
        const timerId = `build-${x}-${y}`;

        // Clear any existing timer
        const existingTimer = buildingTimers.get(timerId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timeLeft = new Date(endTime).getTime() - Date.now();
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                completeBuildingConstruction(x, y);
            }, timeLeft);

            setBuildingTimers(prev => new Map(prev).set(timerId, timer));
        }
    };

    // Start an upgrade timer
    const startUpgradeTimer = (x: number, y: number, endTime: string) => {
        const timerId = `upgrade-${x}-${y}`;

        const existingTimer = buildingTimers.get(timerId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timeLeft = new Date(endTime).getTime() - Date.now();
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                completeUpgrade(x, y);
            }, timeLeft);

            setBuildingTimers(prev => new Map(prev).set(timerId, timer));
        }
    };

    // Complete building construction
    const completeBuildingConstruction = (x: number, y: number) => {
        setTown(prev => {
            if (!prev) return null;

            const updatedBuildings = prev.buildings.map(b =>
                b.x === x && b.y === y
                    ? { ...b, isBuilding: false, buildEndTime: undefined }
                    : b
            );

            const updatedLayout = [...prev.layout];
            if (updatedLayout[y] && updatedLayout[y][x]) {
                updatedLayout[y][x] = {
                    ...updatedLayout[y][x],
                    isBuilding: false,
                    buildEndTime: undefined
                };
            }

            return {
                ...prev,
                buildings: updatedBuildings,
                layout: updatedLayout
            };
        });

        // Remove from active queue
        setActiveBuildQueue(prev => prev.filter(item => !(item.x === x && item.y === y)));

        // Clear timer
        const timerId = `build-${x}-${y}`;
        setBuildingTimers(prev => {
            const newMap = new Map(prev);
            const timer = newMap.get(timerId);
            if (timer) clearTimeout(timer);
            newMap.delete(timerId);
            return newMap;
        });

        // Show completion notification
        setError('🎉 Building construction completed!');
        setTimeout(() => setError(null), 3000);
    };

    // Complete upgrade
    const completeUpgrade = (x: number, y: number) => {
        setTown(prev => {
            if (!prev) return null;

            const updatedBuildings = prev.buildings.map(b =>
                b.x === x && b.y === y
                    ? { ...b, level: b.level + 1, isUpgrading: false, upgradeEndTime: undefined }
                    : b
            );

            const updatedLayout = [...prev.layout];
            if (updatedLayout[y] && updatedLayout[y][x]) {
                updatedLayout[y][x] = {
                    ...updatedLayout[y][x],
                    level: updatedLayout[y][x].level + 1,
                    isUpgrading: false,
                    upgradeEndTime: undefined
                };
            }

            return {
                ...prev,
                buildings: updatedBuildings,
                layout: updatedLayout
            };
        });

        // Remove from active queue
        setActiveBuildQueue(prev => prev.filter(item => !(item.x === x && item.y === y)));

        // Clear timer
        const timerId = `upgrade-${x}-${y}`;
        setBuildingTimers(prev => {
            const newMap = new Map(prev);
            const timer = newMap.get(timerId);
            if (timer) clearTimeout(timer);
            newMap.delete(timerId);
            return newMap;
        });

        // Show completion notification
        setError('🎉 Building upgrade completed!');
        setTimeout(() => setError(null), 3000);
    };

    // Speed up building with gems
    const speedUpBuilding = async (x: number, y: number, _gemCost: number): Promise<boolean> => {
        try {
            setError(null);
            const resp = await townAPI.speedUpBuilding({ x, y });
            const b = resp.building;

            // Update town to reflect completed state
            setTown(prev => {
                if (!prev) return null;

                const newBuildings = prev.buildings.map(bb =>
                    bb.x === x && bb.y === y ? { ...bb, ...b } : bb
                );

                const newLayout = [...prev.layout];
                if (newLayout[y] && newLayout[y][x]) {
                    newLayout[y][x] = { ...newLayout[y][x], type: b.type, level: b.level, isBuilding: false, isUpgrading: false };
                }

                return { ...prev, buildings: newBuildings, layout: newLayout };
            });

            // Clear any timers for this cell
            completeBuildingConstruction(x, y);
            completeUpgrade(x, y);

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to speed up building';
            setError(errorMessage);
            return false;
        }
    };

    // Collect resources
    const collectResources = async (): Promise<boolean> => {
        if (!town) return false;

        try {
            setCollectingResources(true);
            setError(null);

            console.log('🌾 Collecting resources...');

            const response = await townAPI.collectResources();
            console.log('✅ Resources collected:', response.collected);

            // Clear pending resources after collection
            setPendingResources({});

            // Update last collected time
            setTown(prev => prev ? {
                ...prev,
                lastCollected: new Date().toISOString()
            } : null);

            return true;

        } catch (error) {
            console.error('❌ Failed to collect resources:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to collect resources';

            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating resource collection locally');

                // Mock resource collection
                const mockCollected = { ...pendingResources };
                setPendingResources({});

                setError('⚠️ Resources collected locally - backend not available');
                return true;
            }

            setError(errorMessage);
            return false;
        } finally {
            setCollectingResources(false);
        }
    };

    // Build a new building with timer
    const buildBuilding = async (x: number, y: number, type: string): Promise<boolean> => {
        if (!town) return false;

        try {
            setError(null);
            const resp = await townAPI.buildBuilding({ x, y, type });
            const b = resp.building;

            setTown(prev => {
                if (!prev) return null;
                const newBuildings = [...prev.buildings];
                const idx = newBuildings.findIndex(bb => bb.x === x && bb.y === y);
                if (idx >= 0) newBuildings[idx] = b;
                else newBuildings.push(b);

                const newLayout = [...prev.layout];
                if (!newLayout[y]) newLayout[y] = [];
                newLayout[y][x] = {
                    type: b.type,
                    level: b.level,
                    id: `${x}-${y}`,
                    isBuilding: (b as any).isBuilding,
                    buildEndTime: (b as any).buildEndTime
                };

                return { ...prev, buildings: newBuildings, layout: newLayout };
            });

            // Start client-side completion timer for UX
            if ((b as any).isBuilding && b.buildEndTime) {
                startBuildingTimer(x, y, b.buildEndTime);
                setActiveBuildQueue(prev => [...prev, { x, y, type, endTime: b.buildEndTime! }]);
            }

            setBuildMode(null);
            setShowBuildMenu(false);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to build building';
            setError(errorMessage);
            return false;
        }
    };

    // Upgrade a building with timer
    const upgradeBuilding = async (x: number, y: number): Promise<boolean> => {
        if (!town) return false;

        try {
            setError(null);

            const resp = await townAPI.upgradeBuilding({ x, y });
            const b = resp.building;

            setTown(prev => {
                if (!prev) return null;

                const newBuildings = prev.buildings.map(bb =>
                    bb.x === x && bb.y === y ? { ...bb, ...b } : bb
                );

                const newLayout = [...prev.layout];
                newLayout[y][x] = {
                    ...newLayout[y][x],
                    isUpgrading: (b as any).isUpgrading,
                    upgradeEndTime: b.upgradeEndTime
                };

                return { ...prev, buildings: newBuildings, layout: newLayout };
            });

            if ((b as any).isUpgrading && b.upgradeEndTime) {
                startUpgradeTimer(x, y, b.upgradeEndTime);
                setActiveBuildQueue(prev => [...prev, { x, y, type: b.type, endTime: b.upgradeEndTime! }]);
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade building';
            setError(errorMessage);
            return false;
        }
    };

    // Handle cell click
    const handleCellClick = (x: number, y: number) => {
        if (!town) return;

        // Check if coordinates are within bounds
        if (y >= 20 || x >= 20) return;

        const building = town.layout[y]?.[x];
        if (!building) return;

        if (buildMode && building.type === 'empty') {
            buildBuilding(x, y, buildMode);
        } else {
            setSelectedBuilding({ x, y });
            setShowBuildMenu(building.type === 'empty');
        }
    };

    // Get building config by type
    const getBuildingConfig = (type: string): BuildingConfig | undefined => {
        return buildingConfigs.find(config => config.type === type);
    };

    // Get buildings by category
    const getBuildingsByCategory = (category: string): BuildingConfig[] => {
        return buildingConfigs.filter(config => config.category === category);
    };

    // Calculate gem cost for speedup
    const calculateSpeedupCost = (endTime: string): number => {
        const now = Date.now();
        const end = new Date(endTime).getTime();
        const timeLeft = Math.max(0, end - now);
        return Math.ceil(timeLeft / 60000); // 1 gem per minute
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Auto-load town on mount
    useEffect(() => {
        const initializeTown = async () => {
            try {
                await loadTown();
            } catch (error) {
                console.error('Failed to initialize town:', error);
            }
        };

        initializeTown();

        // Cleanup timers on unmount
        return () => {
            buildingTimers.forEach(timer => clearTimeout(timer));
        };
    }, []);

    // Calculate pending resources over time
    useEffect(() => {
        if (!town || !buildingConfigs.length) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const lastCollected = new Date(town.lastCollected).getTime();
            const timeDiff = now - lastCollected;

            const newPending: Record<string, number> = {};

            town.buildings.forEach(building => {
                if (building.type === 'empty' || (building as any).isUpgrading || (building as any).isBuilding) return;

                const config = getBuildingConfig(building.type);
                if (!config?.production) return;

                const levelProduction = config.production.find(p => p.level === building.level);
                if (!levelProduction) return;

                const cycles = Math.floor(timeDiff / (levelProduction.time * 1000));

                Object.entries(levelProduction.resources).forEach(([resource, amount]) => {
                    newPending[resource] = (newPending[resource] || 0) + (amount * cycles);
                });
            });

            setPendingResources(newPending);
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [town, buildingConfigs]);

    return {
        // State
        town,
        buildingConfigs,
        loading,
        error,
        selectedBuilding,
        buildMode,
        showBuildMenu,
        pendingResources,
        collectingResources,
        activeBuildQueue,

        // Actions
        loadTown,
        collectResources,
        buildBuilding,
        upgradeBuilding,
        speedUpBuilding,
        handleCellClick,

        // UI actions
        setSelectedBuilding,
        setBuildMode,
        setShowBuildMenu,

        // Utilities
        getBuildingConfig,
        getBuildingsByCategory,
        calculateSpeedupCost,
        clearError,

        // Computed values
        isLoading: loading || collectingResources,
        hasError: !!error,
        hasPendingResources: Object.values(pendingResources).some(amount => amount > 0),
        hasBuildingsInProgress: activeBuildQueue.length > 0
    };
};

export default useTownLogic;
