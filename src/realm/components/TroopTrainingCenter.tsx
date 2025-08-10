import React, { useState, useEffect } from 'react';

interface TroopStats {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    carryCapacity: number;
}

interface TroopLevelConfig {
    level: number;
    stats: TroopStats;
    trainingCost: Record<string, number>;
    trainingTime: number;
    populationCost: number;
}

interface TroopConfig {
    type: string;
    name: string;
    description: string;
    buildingRequired: string;
    imageUrl: string;
    levels: TroopLevelConfig[];
}

interface TrainingQueueItem {
    _id?: string;
    troopType: string;
    level: number;
    quantity: number;
    startTime: string;
    endTime: string;
    buildingX: number;
    buildingY: number;
}

const TROOP_ICONS: Record<string, string> = {
    swordsmen: '⚔️',
    archers: '🏹',
    ballistas: '🛡️',
    berserkers: '🪓',
    horsemen: '🐎',
    lancers: '🏇',
    spies: '🥷'
};

const BUILDING_ICONS: Record<string, string> = {
    barracks: '⚔️',
    archery_range: '🏹',
    siege_workshop: '🛡️',
    warrior_lodge: '🪓',
    stable: '🐎',
    training_grounds: '🏇',
    spy_den: '🥷'
};

// Mock data for demonstration
const mockTroopConfigs: TroopConfig[] = [
    {
        type: 'swordsmen',
        name: 'Swordsmen',
        description: 'Balanced infantry units with good attack and defense',
        buildingRequired: 'barracks',
        imageUrl: '/components/training/swordsmen.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 25, defense: 20, health: 100, speed: 10, carryCapacity: 50 },
                trainingCost: { food: 30, wood: 20, iron: 15, gold: 5 },
                trainingTime: 180,
                populationCost: 1
            },
            {
                level: 2,
                stats: { attack: 29, defense: 23, health: 115, speed: 10, carryCapacity: 58 },
                trainingCost: { food: 39, wood: 26, iron: 20, gold: 7 },
                trainingTime: 216,
                populationCost: 1
            }
        ]
    },
    {
        type: 'archers',
        name: 'Archers',
        description: 'Ranged units with high attack but low defense',
        buildingRequired: 'archery_range',
        imageUrl: '/components/training/archers.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 35, defense: 10, health: 80, speed: 12, carryCapacity: 40 },
                trainingCost: { food: 25, wood: 30, iron: 10, gold: 8 },
                trainingTime: 150,
                populationCost: 1
            }
        ]
    },
    {
        type: 'ballistas',
        name: 'Ballistas',
        description: 'Heavy siege engines with massive attack power',
        buildingRequired: 'siege_workshop',
        imageUrl: '/components/training/ballistas.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 60, defense: 15, health: 120, speed: 5, carryCapacity: 100 },
                trainingCost: { food: 40, wood: 80, stone: 40, iron: 60, gold: 25 },
                trainingTime: 600,
                populationCost: 3
            }
        ]
    },
    {
        type: 'berserkers',
        name: 'Berserkers',
        description: 'Fierce warriors with devastating attack but low defense',
        buildingRequired: 'warrior_lodge',
        imageUrl: '/components/training/berserkers.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 45, defense: 8, health: 110, speed: 15, carryCapacity: 30 },
                trainingCost: { food: 50, wood: 15, iron: 25, gold: 12 },
                trainingTime: 240,
                populationCost: 1
            }
        ]
    },
    {
        type: 'horsemen',
        name: 'Horsemen',
        description: 'Fast cavalry units perfect for quick strikes',
        buildingRequired: 'stable',
        imageUrl: '/components/training/horsemen.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 30, defense: 25, health: 90, speed: 20, carryCapacity: 60 },
                trainingCost: { food: 60, wood: 25, iron: 20, gold: 15 },
                trainingTime: 300,
                populationCost: 2
            }
        ]
    },
    {
        type: 'lancers',
        name: 'Lancers',
        description: 'Heavy cavalry with excellent defense and good attack',
        buildingRequired: 'training_grounds',
        imageUrl: '/components/training/lancers.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 35, defense: 35, health: 130, speed: 15, carryCapacity: 80 },
                trainingCost: { food: 70, wood: 30, stone: 20, iron: 35, gold: 20 },
                trainingTime: 420,
                populationCost: 2
            }
        ]
    },
    {
        type: 'spies',
        name: 'Spies',
        description: 'Stealthy units for reconnaissance and sabotage',
        buildingRequired: 'spy_den',
        imageUrl: '/components/training/spies.jpg',
        levels: [
            {
                level: 1,
                stats: { attack: 15, defense: 15, health: 60, speed: 25, carryCapacity: 20 },
                trainingCost: { food: 20, wood: 10, iron: 5, gold: 30 },
                trainingTime: 120,
                populationCost: 1
            }
        ]
    }
];

const mockResources = {
    gold: 50000,
    food: 25000,
    wood: 20000,
    stone: 15000,
    iron: 10000,
    gems: 5000
};

const mockTrainingQueue: TrainingQueueItem[] = [
    {
        _id: '1',
        troopType: 'swordsmen',
        level: 1,
        quantity: 5,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 900000).toISOString(), // 15 minutes
        buildingX: 2,
        buildingY: 4
    },
    {
        _id: '2',
        troopType: 'archers',
        level: 1,
        quantity: 3,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 450000).toISOString(), // 7.5 minutes
        buildingX: 6,
        buildingY: 4
    }
];

const TroopTrainingCenter: React.FC = () => {
    const [selectedTroop, setSelectedTroop] = useState<TroopConfig | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number>(1);
    const [quantity, setQuantity] = useState<number>(1);
    const [currentView, setCurrentView] = useState<'overview' | 'train' | 'queue'>('overview');

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const canAfford = (cost: Record<string, number>, qty: number): boolean => {
        return Object.entries(cost).every(([resource, amount]) => {
            const total = amount * qty;
            const available = resource === 'gold' ? mockResources.gold : mockResources[resource as keyof typeof mockResources] || 0;
            return available >= total;
        });
    };

    const getTotalCost = (cost: Record<string, number>, qty: number): Record<string, number> => {
        const total: Record<string, number> = {};
        Object.entries(cost).forEach(([resource, amount]) => {
            total[resource] = amount * qty;
        });
        return total;
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">⚔️ Troop Training Center</h1>
                    <p className="text-red-200">Train mighty armies to defend your realm and conquer your enemies</p>
                </div>

                {/* Resources Bar */}
                <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap justify-center gap-6">
                        {Object.entries(mockResources).map(([resource, amount]) => (
                            <div key={resource} className="flex items-center gap-2">
                                <span className="text-2xl">{getResourceIcon(resource)}</span>
                                <span className="text-white font-bold text-lg">{amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-2 flex gap-2">
                        <button
                            onClick={() => setCurrentView('overview')}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                currentView === 'overview'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-red-200 hover:text-white hover:bg-red-700/30'
                            }`}
                        >
                            📋 Troop Overview
                        </button>
                        <button
                            onClick={() => setCurrentView('train')}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                currentView === 'train'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-red-200 hover:text-white hover:bg-red-700/30'
                            }`}
                        >
                            🎯 Train Troops
                        </button>
                        <button
                            onClick={() => setCurrentView('queue')}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                currentView === 'queue'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-red-200 hover:text-white hover:bg-red-700/30'
                            }`}
                        >
                            ⏱️ Training Queue ({mockTrainingQueue.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                {currentView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockTroopConfigs.map((troop) => {
                            const level1Stats = troop.levels[0];
                            const icon = TROOP_ICONS[troop.type] || '⚔️';
                            const buildingIcon = BUILDING_ICONS[troop.buildingRequired] || '🏗️';

                            return (
                                <div
                                    key={troop.type}
                                    className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-red-500/30 hover:border-red-400/50 transition-all cursor-pointer"
                                    onClick={() => {
                                        setSelectedTroop(troop);
                                        setCurrentView('train');
                                    }}
                                >
                                    <div className="text-center mb-4">
                                        <div className="text-5xl mb-2">{icon}</div>
                                        <h3 className="text-xl font-bold text-white">{troop.name}</h3>
                                        <p className="text-red-200 text-sm">{troop.description}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-red-300">Required Building:</span>
                                            <span className="text-white flex items-center gap-1">
                                                {buildingIcon} {troop.buildingRequired.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="border-t border-red-500/30 pt-3">
                                            <div className="text-red-300 text-sm mb-2">Level 1 Stats:</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-white">⚔️ Attack: {level1Stats.stats.attack}</div>
                                                <div className="text-white">🛡️ Defense: {level1Stats.stats.defense}</div>
                                                <div className="text-white">❤️ Health: {level1Stats.stats.health}</div>
                                                <div className="text-white">⚡ Speed: {level1Stats.stats.speed}</div>
                                            </div>
                                        </div>

                                        <div className="border-t border-red-500/30 pt-3">
                                            <div className="text-red-300 text-sm mb-2">Training Cost:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(level1Stats.trainingCost).map(([resource, amount]) => (
                                                    <span key={resource} className="text-xs bg-red-600/30 px-2 py-1 rounded">
                                                        {getResourceIcon(resource)} {amount}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-xs text-red-300 mt-1">
                                                ⏱️ Time: {formatTime(level1Stats.trainingTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {currentView === 'train' && selectedTroop && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8">
                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4">{TROOP_ICONS[selectedTroop.type]}</div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedTroop.name}</h2>
                                <p className="text-red-200">{selectedTroop.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Training Form */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-red-300 text-sm mb-2">Training Level:</label>
                                        <select
                                            value={selectedLevel}
                                            onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                                            className="w-full bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                                        >
                                            {selectedTroop.levels.map((level) => (
                                                <option key={level.level} value={level.level}>
                                                    Level {level.level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-red-300 text-sm mb-2">Quantity:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="w-full bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                                        />
                                    </div>

                                    {/* Cost Preview */}
                                    <div className="bg-red-900/40 rounded-lg p-4">
                                        <h3 className="text-red-300 text-sm mb-3">Total Training Cost:</h3>
                                        <div className="space-y-2">
                                            {Object.entries(getTotalCost(selectedTroop.levels[selectedLevel - 1].trainingCost, quantity)).map(([resource, amount]) => {
                                                const available = resource === 'gold' ? mockResources.gold : mockResources[resource as keyof typeof mockResources] || 0;
                                                const sufficient = available >= amount;

                                                return (
                                                    <div key={resource} className="flex justify-between items-center">
                                                        <span className="text-white flex items-center gap-2">
                                                            {getResourceIcon(resource)} {resource}
                                                        </span>
                                                        <span className={`font-bold ${sufficient ? 'text-green-400' : 'text-red-400'}`}>
                                                            {amount.toLocaleString()} / {available.toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        disabled={!canAfford(selectedTroop.levels[selectedLevel - 1].trainingCost, quantity)}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        🎯 Start Training {quantity}x {selectedTroop.name}
                                    </button>
                                </div>

                                {/* Troop Stats */}
                                <div className="space-y-4">
                                    <h3 className="text-red-300 text-lg mb-4">Level {selectedLevel} Stats:</h3>
                                    <div className="bg-red-900/40 rounded-lg p-4 space-y-3">
                                        {Object.entries(selectedTroop.levels[selectedLevel - 1].stats).map(([stat, value]) => (
                                            <div key={stat} className="flex justify-between">
                                                <span className="text-red-300 capitalize">{stat}:</span>
                                                <span className="text-white font-bold">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-red-900/40 rounded-lg p-4">
                                        <div className="text-red-300 mb-2">Training Info:</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-red-300">Time per unit:</span>
                                                <span className="text-white">{formatTime(selectedTroop.levels[selectedLevel - 1].trainingTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-300">Total time:</span>
                                                <span className="text-white">{formatTime(selectedTroop.levels[selectedLevel - 1].trainingTime * quantity)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-300">Population cost:</span>
                                                <span className="text-white">{selectedTroop.levels[selectedLevel - 1].populationCost * quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'queue' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">Training Queue</h2>

                            {mockTrainingQueue.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">⏱️</div>
                                    <p className="text-red-200 text-lg">No troops currently in training</p>
                                    <button
                                        onClick={() => setCurrentView('train')}
                                        className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
                                    >
                                        Start Training Troops
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mockTrainingQueue.map((training, index) => {
                                        const endTime = new Date(training.endTime).getTime();
                                        const now = Date.now();
                                        const remaining = Math.max(0, endTime - now);
                                        const progress = 1 - (remaining / (endTime - new Date(training.startTime).getTime()));

                                        return (
                                            <div key={training._id} className="bg-red-900/40 rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-3xl">{TROOP_ICONS[training.troopType]}</div>
                                                        <div>
                                                            <h3 className="text-white font-bold text-lg">
                                                                {training.quantity}x {training.troopType} (Level {training.level})
                                                            </h3>
                                                            <p className="text-red-300 text-sm">
                                                                Building: ({training.buildingX}, {training.buildingY})
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-yellow-400 font-mono">
                                                            {remaining > 0 ? formatTime(Math.ceil(remaining / 1000)) : 'Complete!'}
                                                        </div>
                                                        <div className="text-red-300 text-sm">
                                                            Position #{index + 1}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="bg-red-800/50 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                                                            style={{ width: `${Math.round(progress * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-center text-red-300 text-sm mt-1">
                                                        {Math.round(progress * 100)}% Complete
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-all">
                                                        💎 Speed Up (5 gems)
                                                    </button>
                                                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all">
                                                        ❌ Cancel (50% refund)
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TroopTrainingCenter;
