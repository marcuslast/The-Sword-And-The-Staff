import { useState, useEffect } from 'react';
import { townAPI, Town, BuildingConfig, BuildingPosition } from '../services/townApi';

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
            { level: 2, resources: { wood: 75, stone: 50 }, time: 90 }
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
            { level: 1, resources: { wood: 30, stone: 20 }, time: 45 }
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
            { level: 1, resources: { wood: 100, stone: 80 }, time: 120 }
        ],
        production: [
            { level: 1, resources: { iron: 5 }, time: 3600 },
            { level: 2, resources: { iron: 10 }, time: 3600 }
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

    // Create initial mock town for fallback
    const createMockTown = (): Town => {
        const buildings: BuildingPosition[] = [
            { x: 4, y: 3, type: 'townhall', level: 1 },
            { x: 3, y: 3, type: 'house', level: 1 },
            { x: 5, y: 3, type: 'farm', level: 1 }
        ];

        const layout = [];
        for (let y = 0; y < 8; y++) {
            const row = [];
            for (let x = 0; x < 10; x++) {
                const building = buildings.find(b => b.x === x && b.y === y);
                if (building) {
                    row.push({ type: building.type, level: building.level, id: `${x}-${y}` });
                } else {
                    row.push({ type: 'empty', level: 0, id: `${x}-${y}` });
                }
            }
            layout.push(row);
        }

        return {
            id: 'mock-town',
            name: 'My Town',
            level: 1,
            mapSize: { width: 10, height: 8 },
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

    // Build a new building
    const buildBuilding = async (x: number, y: number, type: string): Promise<boolean> => {
        if (!town) return false;

        try {
            setError(null);

            console.log(`🏗️ Building ${type} at (${x}, ${y})`);

            const response = await townAPI.buildBuilding({ x, y, type });
            console.log('✅ Building constructed:', response);

            // Update town state
            setTown(prev => {
                if (!prev) return null;

                const newBuildings = [...prev.buildings];
                const existingIndex = newBuildings.findIndex(b => b.x === x && b.y === y);

                if (existingIndex >= 0) {
                    newBuildings[existingIndex] = response.building;
                } else {
                    newBuildings.push(response.building);
                }

                // Update layout
                const newLayout = [...prev.layout];
                newLayout[y][x] = { type, level: 1, id: `${x}-${y}` };

                return {
                    ...prev,
                    buildings: newBuildings,
                    layout: newLayout
                };
            });

            setBuildMode(null);
            setShowBuildMenu(false);
            return true;

        } catch (error) {
            console.error('❌ Failed to build building:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to build building';

            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating building construction locally');

                // Mock building construction
                setTown(prev => {
                    if (!prev) return null;

                    const newBuildings = [...prev.buildings];
                    const existingIndex = newBuildings.findIndex(b => b.x === x && b.y === y);

                    const newBuilding: BuildingPosition = { x, y, type, level: 1 };

                    if (existingIndex >= 0) {
                        newBuildings[existingIndex] = newBuilding;
                    } else {
                        newBuildings.push(newBuilding);
                    }

                    const newLayout = [...prev.layout];
                    newLayout[y][x] = { type, level: 1, id: `${x}-${y}` };

                    return {
                        ...prev,
                        buildings: newBuildings,
                        layout: newLayout
                    };
                });

                setBuildMode(null);
                setShowBuildMenu(false);
                setError('⚠️ Building constructed locally - backend not available');
                return true;
            }

            setError(errorMessage);
            return false;
        }
    };

    // Upgrade a building
    const upgradeBuilding = async (x: number, y: number): Promise<boolean> => {
        if (!town) return false;

        try {
            setError(null);

            console.log(`⬆️ Upgrading building at (${x}, ${y})`);

            const response = await townAPI.upgradeBuilding({ x, y });
            console.log('✅ Building upgraded:', response);

            // Update town state
            setTown(prev => {
                if (!prev) return null;

                const newBuildings = prev.buildings.map(building =>
                    building.x === x && building.y === y
                        ? response.building
                        : building
                );

                const newLayout = [...prev.layout];
                newLayout[y][x] = {
                    ...newLayout[y][x],
                    level: response.building.level
                };

                return {
                    ...prev,
                    buildings: newBuildings,
                    layout: newLayout
                };
            });

            return true;

        } catch (error) {
            console.error('❌ Failed to upgrade building:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade building';

            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating building upgrade locally');

                // Mock building upgrade
                setTown(prev => {
                    if (!prev) return null;

                    const newBuildings = prev.buildings.map(building =>
                        building.x === x && building.y === y
                            ? { ...building, level: building.level + 1 }
                            : building
                    );

                    const newLayout = [...prev.layout];
                    const currentBuilding = newBuildings.find(b => b.x === x && b.y === y);
                    if (currentBuilding) {
                        newLayout[y][x] = {
                            ...newLayout[y][x],
                            level: currentBuilding.level
                        };
                    }

                    return {
                        ...prev,
                        buildings: newBuildings,
                        layout: newLayout
                    };
                });

                setError('⚠️ Building upgraded locally - backend not available');
                return true;
            }

            setError(errorMessage);
            return false;
        }
    };

    // Handle cell click
    const handleCellClick = (x: number, y: number) => {
        if (!town) return;

        const building = town.layout[y][x];

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
                if (building.type === 'empty' || building.isUpgrading) return;

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

        // Actions
        loadTown,
        collectResources,
        buildBuilding,
        upgradeBuilding,
        handleCellClick,

        // UI actions
        setSelectedBuilding,
        setBuildMode,
        setShowBuildMenu,

        // Utilities
        getBuildingConfig,
        getBuildingsByCategory,
        clearError,

        // Computed values
        isLoading: loading || collectingResources,
        hasError: !!error,
        hasPendingResources: Object.values(pendingResources).some(amount => amount > 0)
    };
};

export default useTownLogic;
