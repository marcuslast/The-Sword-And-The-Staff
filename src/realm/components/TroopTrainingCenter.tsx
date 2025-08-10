import React, { useState, useEffect } from 'react';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';

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

// Timer component for training queue
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
        if (done && onComplete) {
            onComplete();
        }
    }, [done, onComplete]);

    const format = (ms: number): string => {
        const totalSec = Math.ceil(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    if (done) return <span className="text-green-400 font-semibold">Complete!</span>;
    return <span className="text-yellow-400 font-mono">{format(remainingMs)}</span>;
};

const TroopTrainingCenter: React.FC = () => {
    const townLogic = useTownLogic();
    const realmLogic = useRealmLogic();

    const [selectedTroop, setSelectedTroop] = useState<TroopConfig | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number>(1);
    const [quantity, setQuantity] = useState<number>(1);
    const [currentView, setCurrentView] = useState<'overview' | 'train' | 'queue'>('overview');
    const [selectedBuilding, setSelectedBuilding] = useState<{ x: number; y: number } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                await realmLogic.loadInventory(false);
            } catch (error) {
                console.error('Failed to load inventory:', error);
            }
        };
        loadData();
    }, []);

    const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const canAfford = (cost: Record<string, number>, qty: number): boolean => {
        if (!realmLogic.inventory) return false;

        return Object.entries(cost).every(([resource, amount]) => {
            const total = amount * qty;
            const available = resource === 'gold'
                ? realmLogic.inventory!.gold
                : (realmLogic.inventory!.resources as any)?.[resource] || 0;
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

    const getAvailableBuildings = (troopType: string) => {
        if (!townLogic.town) return [];

        const troopConfig = townLogic.getTroopConfig(troopType);
        if (!troopConfig) return [];

        return townLogic.town.buildings.filter(building =>
            building.type === troopConfig.buildingRequired &&
            building.level > 0 &&
            !building.isBuilding &&
            !building.isUpgrading
        );
    };

    const validateTrainingRequest = (building: { x: number; y: number }, troopType: string, qty: number): string | null => {
        // Check coordinates
        if (building.x < 0 || building.x > 19) {
            return `Invalid X coordinate: ${building.x} (must be 0-19)`;
        }
        if (building.y < 0 || building.y > 15) {
            return `Invalid Y coordinate: ${building.y} (must be 0-15)`;
        }

        // Check troop type
        const validTroopTypes = ['swordsmen', 'archers', 'ballistas', 'berserkers', 'horsemen', 'lancers', 'spies'];
        if (!validTroopTypes.includes(troopType)) {
            return `Invalid troop type: ${troopType} (must be one of: ${validTroopTypes.join(', ')})`;
        }

        // Check quantity
        if (qty < 1 || qty > 100) {
            return `Invalid quantity: ${qty} (must be 1-100)`;
        }

        return null; // Valid
    };

    const handleTrainTroops = async () => {
        if (!selectedBuilding || !selectedTroop || quantity < 1) {
            showNotification('Please select a building and configure training', 'error');
            return;
        }

        // Validate the request before sending
        const validationError = validateTrainingRequest(selectedBuilding, selectedTroop.type, quantity);
        if (validationError) {
            showNotification(validationError, 'error');
            console.error('❌ Validation failed:', validationError);
            return;
        }

        // Ensure data types are correct
        const requestData = {
            x: Number(selectedBuilding.x),
            y: Number(selectedBuilding.y),
            troopType: String(selectedTroop.type),
            quantity: Number(quantity)
        };

        console.log('🎯 Validated Training Request:', requestData);

        try {
            const success = await townLogic.trainTroops(
                requestData.x,
                requestData.y,
                requestData.troopType,
                requestData.quantity
            );

            if (success) {
                showNotification(`Training ${quantity} ${selectedTroop.name} started!`, 'success');
                setSelectedTroop(null);
                setSelectedBuilding(null);
                setQuantity(1);
                realmLogic.loadInventory(false);
            } else if (townLogic.error) {
                showNotification(townLogic.error, 'error');
            }
        } catch (error) {
            console.error('🎯 Training Error:', error);
            showNotification('Training failed: ' + (error as Error).message, 'error');
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

    if (townLogic.loading && !townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⚔️</div>
                    <div className="text-white text-xl">Loading training center...</div>
                </div>
            </div>
        );
    }

    if (!townLogic.town || !realmLogic.inventory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center">
                <div className="text-white text-xl">Failed to load training center data</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
            <div className="training-center"></div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">⚔️ Troop Training Center</h1>
                    <p className="text-red-200">Train mighty armies to defend your realm and conquer your enemies</p>
                </div>

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

                {/* Resources Bar */}
                <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <span className="text-white font-bold text-lg">{realmLogic.inventory.gold.toLocaleString()}</span>
                        </div>
                        {realmLogic.inventory.resources && Object.entries(realmLogic.inventory.resources).map(([resource, amount]) => (
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
                            ⏱️ Training Queue ({townLogic.activeTraining.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                {currentView === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {townLogic.troopConfigs.map((troop) => {
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

                {currentView === 'train' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8">
                            {!selectedTroop ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <p className="text-red-200 text-lg mb-4">Select a troop type to train</p>
                                    <button
                                        onClick={() => setCurrentView('overview')}
                                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
                                    >
                                        View Troop Types
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="text-6xl mb-4">{TROOP_ICONS[selectedTroop.type]}</div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{selectedTroop.name}</h2>
                                        <p className="text-red-200">{selectedTroop.description}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Training Form */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-red-300 text-sm mb-2">Select Building:</label>
                                                <select
                                                    value={selectedBuilding ? `${selectedBuilding.x},${selectedBuilding.y}` : ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            const [x, y] = e.target.value.split(',').map(Number);
                                                            setSelectedBuilding({ x, y });
                                                            // Set level based on building level
                                                            const building = townLogic.town!.buildings.find(b => b.x === x && b.y === y);
                                                            if (building) {
                                                                setSelectedLevel(building.level || 1);
                                                            }
                                                        } else {
                                                            setSelectedBuilding(null);
                                                        }
                                                    }}
                                                    className="w-full bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                                                >
                                                    <option value="">Choose a building...</option>
                                                    {getAvailableBuildings(selectedTroop.type).map((building) => (
                                                        <option key={`${building.x}-${building.y}`} value={`${building.x},${building.y}`}>
                                                            {selectedTroop.buildingRequired.replace('_', ' ')} at ({building.x}, {building.y}) - Level {building.level}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-red-300 text-sm mb-2">Training Level: {selectedLevel}</label>
                                                <div className="text-red-200 text-sm">Troops are trained at building level</div>
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
                                            {selectedTroop.levels[selectedLevel - 1] && (
                                                <div className="bg-red-900/40 rounded-lg p-4">
                                                    <h3 className="text-red-300 text-sm mb-3">Total Training Cost:</h3>
                                                    <div className="space-y-2">
                                                        {Object.entries(getTotalCost(selectedTroop.levels[selectedLevel - 1].trainingCost, quantity)).map(([resource, amount]) => {
                                                            const available = resource === 'gold'
                                                                ? realmLogic.inventory!.gold
                                                                : (realmLogic.inventory!.resources as any)?.[resource] || 0;
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
                                            )}

                                            <button
                                                onClick={handleTrainTroops}
                                                disabled={
                                                    !selectedBuilding ||
                                                    !selectedTroop.levels[selectedLevel - 1] ||
                                                    !canAfford(selectedTroop.levels[selectedLevel - 1].trainingCost, quantity) ||
                                                    townLogic.training
                                                }
                                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {townLogic.training ? 'Starting Training...' : `🎯 Start Training ${quantity}x ${selectedTroop.name}`}
                                            </button>
                                        </div>

                                        {/* Troop Stats */}
                                        {selectedTroop.levels[selectedLevel - 1] && (
                                            <div className="space-y-4">
                                                <h3 className="text-red-300 text-lg mb-4">Level {selectedLevel} Stats:</h3>
                                                <div className="bg-red-900/40 rounded-lg p-4 space-y-3">
                                                    {Object.entries(selectedTroop.levels[selectedLevel - 1].stats).map(([stat, value]) => (
                                                        <div key={stat} className="flex justify-between">
                                                            <span className="text-red-300 capitalize">{stat.replace(/([A-Z])/g, ' $1')}:</span>
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
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'queue' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">Training Queue</h2>

                            {townLogic.activeTraining.length === 0 ? (
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
                                    {townLogic.activeTraining.map((training, index) => {
                                        const endTime = new Date(training.endTime).getTime();
                                        const startTime = new Date(training.startTime).getTime();
                                        const now = Date.now();
                                        const remaining = Math.max(0, endTime - now);
                                        const total = endTime - startTime;
                                        const progress = total > 0 ? Math.min(1, (total - remaining) / total) : 1;
                                        const gemCost = townLogic.calculateSpeedupCost(training.endTime);

                                        const troopConfig = townLogic.getTroopConfig(training.troopType);
                                        const icon = TROOP_ICONS[training.troopType] || '⚔️';

                                        return (
                                            <div key={training._id} className="bg-red-900/40 rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-3xl">{icon}</div>
                                                        <div>
                                                            <h3 className="text-white font-bold text-lg">
                                                                {training.quantity}x {troopConfig?.name || training.troopType} (Level {training.level})
                                                            </h3>
                                                            <p className="text-red-300 text-sm">
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
                                                    <button
                                                        onClick={() => handleSpeedUpTraining(training._id!)}
                                                        disabled={townLogic.speedingUpTraining}
                                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-all disabled:opacity-50"
                                                    >
                                                        💎 Speed Up ({gemCost} gems)
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelTraining(training._id!)}
                                                        disabled={townLogic.cancellingTraining}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all disabled:opacity-50"
                                                    >
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
