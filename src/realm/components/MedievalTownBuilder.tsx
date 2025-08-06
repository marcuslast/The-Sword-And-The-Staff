import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { constructionSystem, ConstructionProject } from '../systems/TimedConstructionSystem';
import { ProgressiveBuilding } from './ProgressiveBuilding';
import { getMedievalBuildingRecipe } from '../config/medievalBuildingRecipes';

interface MedievalTownBuilderProps {
    onBack?: () => void;
}

interface PlotSlot {
    id: string;
    x: number;
    y: number;
    type: 'empty' | string;
    level: number;
    constructionProjectId?: string;
    isSelected?: boolean;
}

interface BuildingOption {
    type: string;
    name: string;
    icon: string;
    description: string;
    cost: {
        wood?: number;
        stone?: number;
        iron?: number;
        gold?: number;
    };
    buildTime: number; // seconds
    category: 'residential' | 'commercial' | 'military' | 'resource' | 'special';
    requires?: string[]; // Required buildings
}

const MEDIEVAL_BUILDINGS: BuildingOption[] = [
    {
        type: 'house',
        name: 'Medieval House',
        icon: '🏠',
        description: 'Basic housing for villagers',
        cost: { wood: 150, stone: 100, gold: 200 },
        buildTime: 120, // 2 minutes
        category: 'residential'
    },
    {
        type: 'tavern',
        name: 'Tavern',
        icon: '🍺',
        description: 'Gathering place generating gold',
        cost: { wood: 300, stone: 200, iron: 50, gold: 500 },
        buildTime: 180, // 3 minutes
        category: 'commercial'
    },
    {
        type: 'farm',
        name: 'Medieval Farm',
        icon: '🌾',
        description: 'Produces food and wood',
        cost: { wood: 200, stone: 150, gold: 300 },
        buildTime: 150, // 2.5 minutes
        category: 'resource'
    },
    {
        type: 'tower',
        name: 'Guard Tower',
        icon: '🗼',
        description: 'Defensive structure',
        cost: { stone: 400, iron: 100, gold: 600 },
        buildTime: 240, // 4 minutes
        category: 'military',
        requires: ['house'] // Need population first
    },
    {
        type: 'castle',
        name: 'Medieval Castle',
        icon: '🏰',
        description: 'Ultimate fortress and seat of power',
        cost: { stone: 1000, iron: 300, wood: 500, gold: 2000 },
        buildTime: 600, // 10 minutes
        category: 'special',
        requires: ['tower', 'house'] // Need defenses and population
    }
];

const TERRAIN_FEATURES = [
    { type: 'tree', name: 'Large Tree', icon: '🌳', cost: { gold: 50 } },
    { type: 'water', name: 'Pond', icon: '💧', cost: { gold: 100 } },
    { type: 'fence', name: 'Fence', icon: '🚧', cost: { wood: 25 } }
];

const MedievalTownBuilder: React.FC<MedievalTownBuilderProps> = ({ onBack }) => {
    // Game state
    const [plotSlots, setPlotSlots] = useState<PlotSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<PlotSlot | null>(null);
    const [buildMode, setBuildMode] = useState<string | null>(null);
    const [constructionQueue, setConstructionQueue] = useState<ConstructionProject[]>([]);

    // Resources
    const [resources, setResources] = useState({
        wood: 2000,
        stone: 1500,
        iron: 500,
        gold: 3000,
        population: 0
    });

    // UI state
    const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
    const [showStats, setShowStats] = useState(true);

    // Initialize 12x10 medieval town grid
    useEffect(() => {
        const slots: PlotSlot[] = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 12; x++) {
                slots.push({
                    id: `plot_${x}_${y}`,
                    x,
                    y,
                    type: 'empty',
                    level: 0
                });
            }
        }
        setPlotSlots(slots);
    }, []);

    // Monitor construction projects
    useEffect(() => {
        const interval = setInterval(() => {
            const activeProjects = constructionSystem.getActiveProjects();
            setConstructionQueue(activeProjects);

            // Auto-collect completed buildings
            activeProjects.forEach(project => {
                if (project.status === 'completed') {
                    setPlotSlots(prev => prev.map(slot =>
                        slot.constructionProjectId === project.id
                            ? { ...slot, level: 1, constructionProjectId: undefined }
                            : slot
                    ));

                    // Add population for residential buildings
                    if (project.buildingType === 'house') {
                        setResources(prev => ({ ...prev, population: prev.population + 4 }));
                    }
                }
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Time of day cycle
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setTimeOfDay(prev => {
                const cycle = ['dawn', 'day', 'dusk', 'night'] as const;
                const currentIndex = cycle.indexOf(prev);
                return cycle[(currentIndex + 1) % cycle.length];
            });
        }, 30000); // 30 second cycle

        return () => clearInterval(timeInterval);
    }, []);

    const gridSize = 2.5;
    const availableBuildings = useMemo(() => {
        return MEDIEVAL_BUILDINGS.filter(building => {
            // Check requirements
            if (building.requires) {
                const existingBuildings = plotSlots
                    .filter(slot => slot.type !== 'empty')
                    .map(slot => slot.type);

                return building.requires.every(req => existingBuildings.includes(req));
            }
            return true;
        });
    }, [plotSlots]);

    const canAffordBuilding = (building: BuildingOption): boolean => {
        return Object.entries(building.cost).every(([resource, cost]) => {
            return resources[resource as keyof typeof resources] >= cost;
        });
    };

    const startConstruction = (slotId: string, buildingType: string) => {
        const slot = plotSlots.find(s => s.id === slotId);
        const building = MEDIEVAL_BUILDINGS.find(b => b.type === buildingType);

        if (!slot || !building || slot.type !== 'empty' || !canAffordBuilding(building)) {
            return;
        }

        const recipe = getMedievalBuildingRecipe(buildingType);
        if (!recipe) {
            console.error(`No recipe found for ${buildingType}`);
            return;
        }

        // Deduct resources
        setResources(prev => {
            const newResources = { ...prev };
            Object.entries(building.cost).forEach(([resource, cost]) => {
                newResources[resource as keyof typeof resources] -= cost;
            });
            return newResources;
        });

        // Calculate position
        const position: [number, number, number] = [
            (slot.x - 5.5) * gridSize,
            0,
            (slot.y - 4.5) * gridSize
        ];

        // Start construction with realistic timing
        const workers = Math.ceil(building.buildTime / 60); // More workers for longer projects
        const projectId = constructionSystem.startConstruction(
            buildingType,
            recipe,
            position,
            workers
        );

        // Update slot
        setPlotSlots(prev => prev.map(s =>
            s.id === slotId
                ? { ...s, type: buildingType, constructionProjectId: projectId }
                : s
        ));

        setSelectedSlot(null);
        setBuildMode(null);
    };

    const speedUpConstruction = (projectId: string) => {
        const cost = 200;
        if (resources.gold >= cost) {
            constructionSystem.speedUpConstruction(projectId, 2.0);
            setResources(prev => ({ ...prev, gold: prev.gold - cost }));
        }
    };

    const cancelConstruction = (projectId: string) => {
        const project = constructionSystem.getProject(projectId);
        if (!project) return;

        // Refund 50% of resources
        const building = MEDIEVAL_BUILDINGS.find(b => b.type === project.buildingType);
        if (building) {
            setResources(prev => {
                const newResources = { ...prev };
                Object.entries(building.cost).forEach(([resource, cost]) => {
                    newResources[resource as keyof typeof resources] += Math.floor(cost * 0.5);
                });
                return newResources;
            });
        }

        constructionSystem.cancelConstruction(projectId);
        setPlotSlots(prev => prev.map(slot =>
            slot.constructionProjectId === projectId
                ? { ...slot, type: 'empty', constructionProjectId: undefined }
                : slot
        ));
    };

    const selectSlot = (slot: PlotSlot) => {
        setSelectedSlot(slot);
        if (buildMode && slot.type === 'empty') {
            startConstruction(slot.id, buildMode);
        }
    };

    const getSkyProps = () => {
        switch (timeOfDay) {
            case 'dawn': return { sunPosition: [100, 20, 100] as [number, number, number], turbidity: 8, rayleigh: 6 };
            case 'day': return { sunPosition: [100, 100, 100] as [number, number, number], turbidity: 0.1, rayleigh: 0.5 };
            case 'dusk': return { sunPosition: [100, 10, 100] as [number, number, number], turbidity: 20, rayleigh: 8 };
            case 'night': return { sunPosition: [100, -50, 100] as [number, number, number], turbidity: 50, rayleigh: 10 };
            default: return { sunPosition: [100, 100, 100] as [number, number, number] };
        }
    };

    const getLightIntensity = () => {
        switch (timeOfDay) {
            case 'dawn': return 0.7;
            case 'day': return 1.2;
            case 'dusk': return 0.5;
            case 'night': return 0.2;
            default: return 1.0;
        }
    };

    return (
        <div className="h-screen bg-gradient-to-b from-blue-900 to-green-800 relative overflow-hidden">
            {/* 3D Medieval Scene */}
            <Canvas
                camera={{ position: [15, 12, 15], fov: 50 }}
                shadows="soft"
                className="w-full h-full"
            >
                {/* Dynamic Sky */}
                <Sky {...getSkyProps()} />

                {/* Dynamic Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[50, 50, 0]}
                    intensity={getLightIntensity()}
                    castShadow
                    shadow-mapSize-width={4096}
                    shadow-mapSize-height={4096}
                    shadow-camera-far={100}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                />

                {/* Atmospheric lighting for night */}
                {timeOfDay === 'night' && (
                    <>
                        <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffaa44" />
                        <fog attach="fog" args={['#1a1a2e', 20, 100]} />
                    </>
                )}

                {/* Terrain */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[60, 50]} />
                    <meshStandardMaterial
                        color={timeOfDay === 'night' ? '#1a4a1a' : '#2d5016'}
                        roughness={0.8}
                    />
                </mesh>

                {/* Medieval Town Grid */}
                {plotSlots.map((slot) => {
                    const position: [number, number, number] = [
                        (slot.x - 5.5) * gridSize,
                        0,
                        (slot.y - 4.5) * gridSize
                    ];

                    if (slot.type === 'empty') {
                        return (
                            <group key={slot.id}>
                                {/* Plot marker */}
                                <mesh
                                    position={[position[0], -0.05, position[2]]}
                                    rotation={[-Math.PI / 2, 0, 0]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectSlot(slot);
                                    }}
                                >
                                    <planeGeometry args={[2.2, 2.2]} />
                                    <meshStandardMaterial
                                        color={
                                            selectedSlot?.id === slot.id ? "#4ade80" :
                                                buildMode ? "#3b82f6" : "#10b981"
                                        }
                                        opacity={0.3}
                                        transparent
                                    />
                                </mesh>

                                {/* Plot grid lines */}
                                <lineSegments position={position}>
                                    <edgesGeometry args={[new THREE.PlaneGeometry(2.2, 2.2)]} />
                                    <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
                                </lineSegments>
                            </group>
                        );
                    }

                    const recipe = getMedievalBuildingRecipe(slot.type);
                    if (!recipe) return null;

                    return (
                        <ProgressiveBuilding
                            key={slot.id}
                            buildingId={slot.id}
                            recipe={recipe}
                            position={position}
                            isSelected={selectedSlot?.id === slot.id}
                            onClick={() => selectSlot(slot)}
                            constructionProjectId={slot.constructionProjectId}
                            showConstructionEffects={true}
                        />
                    );
                })}

                {/* Enhanced Camera Controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    maxDistance={40}
                    minDistance={10}
                    maxPolarAngle={Math.PI / 2.2}
                    minPolarAngle={Math.PI / 8}
                    target={[0, 0, 0]}
                    enableDamping={true}
                    dampingFactor={0.05}
                    onChange={() => {
                        // Camera position tracking removed to fix TypeScript issues
                        // You can add camera position tracking later if needed
                    }}
                />
            </Canvas>

            {/* Medieval UI Overlays */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Bar - Medieval Style */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="bg-gradient-to-b from-amber-600 to-amber-800 text-white p-3 rounded-lg border-2 border-amber-400 hover:from-amber-500 hover:to-amber-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                        >
                            <span>⬅</span>
                            <span className="font-bold">Return to Realm</span>
                        </button>
                    )}

                    {/* Time of Day Indicator */}
                    <div className="bg-gradient-to-b from-blue-900/80 to-purple-900/80 backdrop-blur-lg rounded-lg p-3 text-white border border-blue-400/50">
                        <div className="text-center">
                            <div className="text-2xl mb-1">
                                {timeOfDay === 'dawn' ? '🌅' :
                                    timeOfDay === 'day' ? '☀️' :
                                        timeOfDay === 'dusk' ? '🌇' : '🌙'}
                            </div>
                            <div className="text-sm font-semibold capitalize">{timeOfDay}</div>
                        </div>
                    </div>

                    {/* Resource Display - Medieval Style */}
                    {showStats && (
                        <div className="bg-gradient-to-b from-amber-900/90 to-amber-950/90 backdrop-blur-lg rounded-lg p-4 text-white border border-amber-600/50 shadow-lg">
                            <div className="grid grid-cols-5 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-yellow-400">💰</div>
                                    <div className="font-bold">{resources.gold}</div>
                                    <div className="text-xs text-yellow-200">Gold</div>
                                </div>
                                <div className="text-center">
                                    <div>🪵</div>
                                    <div className="font-bold">{resources.wood}</div>
                                    <div className="text-xs text-amber-200">Wood</div>
                                </div>
                                <div className="text-center">
                                    <div>🗿</div>
                                    <div className="font-bold">{resources.stone}</div>
                                    <div className="text-xs text-gray-300">Stone</div>
                                </div>
                                <div className="text-center">
                                    <div>⚒️</div>
                                    <div className="font-bold">{resources.iron}</div>
                                    <div className="text-xs text-slate-300">Iron</div>
                                </div>
                                <div className="text-center">
                                    <div>👥</div>
                                    <div className="font-bold">{resources.population}</div>
                                    <div className="text-xs text-blue-200">People</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Left Panel - Building Menu */}
                {selectedSlot && selectedSlot.type === 'empty' && (
                    <div className="absolute left-4 top-32 space-y-4 pointer-events-auto max-w-sm">
                        <div className="bg-gradient-to-b from-stone-800/95 to-stone-900/95 backdrop-blur-lg rounded-lg p-4 text-white border border-stone-600/50 shadow-xl">
                            <h3 className="font-bold mb-3 text-amber-300">🏗️ Medieval Construction</h3>

                            {/* Building Categories */}
                            {(['residential', 'commercial', 'resource', 'military', 'special'] as const).map(category => {
                                const categoryBuildings = availableBuildings.filter(b => b.category === category);
                                if (categoryBuildings.length === 0) return null;

                                return (
                                    <div key={category} className="mb-4">
                                        <h4 className="text-sm font-semibold mb-2 text-amber-200 capitalize border-b border-amber-600/30 pb-1">
                                            {category === 'residential' ? '🏘️ Housing' :
                                                category === 'commercial' ? '🏪 Commerce' :
                                                    category === 'resource' ? '🌾 Resources' :
                                                        category === 'military' ? '⚔️ Defense' : '🏰 Special'}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {categoryBuildings.map((building) => (
                                                <button
                                                    key={building.type}
                                                    onClick={() => startConstruction(selectedSlot.id, building.type)}
                                                    disabled={!canAffordBuilding(building)}
                                                    className={`p-3 rounded-lg text-left transition-all border ${
                                                        canAffordBuilding(building)
                                                            ? 'bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white border-green-500/50 shadow-lg hover:shadow-green-500/20'
                                                            : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed border-gray-600/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{building.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm">{building.name}</div>
                                                            <div className="text-xs opacity-80 truncate">{building.description}</div>
                                                            <div className="text-xs mt-1">
                                                                {Object.entries(building.cost).map(([resource, cost]) => (
                                                                    <span key={resource} className={
                                                                        resources[resource as keyof typeof resources] >= cost
                                                                            ? 'text-green-300 mr-2'
                                                                            : 'text-red-300 mr-2'
                                                                    }>
                                    {cost} {resource}
                                  </span>
                                                                ))}
                                                            </div>
                                                            <div className="text-xs text-blue-300">
                                                                ⏱️ {Math.floor(building.buildTime / 60)}m {building.buildTime % 60}s
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Right Panel - Construction Queue */}
                {constructionQueue.length > 0 && (
                    <div className="absolute right-4 top-32 space-y-4 pointer-events-auto max-w-sm">
                        <div className="bg-gradient-to-b from-orange-900/95 to-red-900/95 backdrop-blur-lg rounded-lg p-4 text-white border border-orange-600/50 shadow-xl">
                            <h3 className="font-bold mb-3 text-orange-300">🔨 Active Construction</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {constructionQueue.map((project) => {
                                    const progress = constructionSystem.getDetailedProgress(project.id);
                                    if (!progress) return null;

                                    const building = MEDIEVAL_BUILDINGS.find(b => b.type === project.buildingType);
                                    const timeRemaining = Math.max(0, progress.estimatedCompletion - Date.now());
                                    const minutesRemaining = Math.ceil(timeRemaining / 60000);

                                    return (
                                        <div key={project.id} className="bg-gradient-to-r from-amber-800/50 to-orange-800/50 rounded-lg p-3 border border-amber-600/30">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xl">{building?.icon || '🏗️'}</span>
                                                    <div>
                                                        <div className="font-semibold capitalize text-sm">
                                                            {project.buildingType}
                                                        </div>
                                                        <div className="text-xs text-orange-200">
                                                            {progress.currentPhase}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-green-300 font-bold">
                                                    {Math.round(progress.overall * 100)}%
                                                </div>
                                            </div>

                                            {/* Animated Progress Bar */}
                                            <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000 shadow-lg shadow-green-500/20"
                                                    style={{ width: `${progress.overall * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                        <span className="text-yellow-300">
                          ⏱️ {minutesRemaining > 0 ? `${minutesRemaining}m left` : 'Finishing...'}
                        </span>
                                                <div className="space-x-1">
                                                    <button
                                                        onClick={() => speedUpConstruction(project.id)}
                                                        disabled={resources.gold < 200}
                                                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-all"
                                                    >
                                                        ⚡ Rush (200💰)
                                                    </button>
                                                    <button
                                                        onClick={() => cancelConstruction(project.id)}
                                                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-all"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                    <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-full p-3 text-white shadow-xl border border-purple-500/50">
                        <div className="flex items-center space-x-4 px-2">
                            <button
                                onClick={() => setBuildMode(buildMode ? null : 'house')}
                                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                                    buildMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {buildMode ? '❌ Cancel Build' : '🏗️ Build Mode'}
                            </button>
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold transition-all"
                            >
                                📊 Stats
                            </button>
                            <div className="text-sm">
                                🏰 Medieval Town Builder • Click empty plots to build • Use mouse to navigate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedievalTownBuilder;
