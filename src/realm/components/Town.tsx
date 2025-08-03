import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/Auth/AuthButton';
import useTownLogic from '../hooks/useTownLogic';
import useRealmLogic from '../hooks/useRealmLogic';

interface TownProps {
    onBack: () => void;
}

interface BuildingCellProps {
    building: {
        type: string;
        level: number;
        id: string;
    };
    x: number;
    y: number;
    isSelected: boolean;
    onClick: (x: number, y: number) => void;
    buildingConfig?: {
        type: string;
        name: string;
        emoji: string;
        category: 'resource' | 'military' | 'residential' | 'special';
        production?: Array<{
            level: number;
            resources: Record<string, number>;
            time: number;
        }>;
    };
}

// Building cell component
const BuildingCell: React.FC<BuildingCellProps> = ({ building, x, y, isSelected, onClick, buildingConfig }) => {
    const cellClass = `
        aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200
        flex flex-col items-center justify-center relative overflow-hidden
        ${isSelected
        ? 'border-yellow-400 bg-yellow-400/20 scale-105'
        : 'border-white/30 bg-white/10 hover:bg-white/20 hover:scale-102'
    }
    `;

    return (
        <div className={cellClass} onClick={() => onClick(x, y)}>
            {/* Background for empty land */}
            {building.type === 'empty' && (
                <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-green-800 to-green-900 rounded-lg"></div>
            )}

            {/* Building emoji */}
            <div className="text-3xl filter drop-shadow-lg">
                {buildingConfig?.emoji || (building.type === 'empty' ? '🟫' : '🏗️')}
            </div>

            {/* Building level indicator */}
            {building.level > 0 && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                    {building.level}
                </div>
            )}

            {/* Production indicator */}
            {buildingConfig?.production && building.level > 0 && (
                <div className="absolute top-1 left-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    +
                </div>
            )}

            {/* Building category indicator */}
            {building.type !== 'empty' && buildingConfig && (
                <div className={`absolute bottom-1 left-1 w-2 h-2 rounded-full ${
                    buildingConfig.category === 'resource' ? 'bg-green-500' :
                        buildingConfig.category === 'military' ? 'bg-red-500' :
                            buildingConfig.category === 'residential' ? 'bg-blue-500' :
                                'bg-yellow-500'
                }`}></div>
            )}
        </div>
    );
};

const Town: React.FC<TownProps> = ({ onBack }) => {
    const { user } = useAuth();
    const townLogic = useTownLogic();
    const realmLogic = useRealmLogic(); // Access to resources

    // Show loading state
    if (townLogic.loading && !townLogic.town) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">Loading your town...</div>
                    <div className="text-green-200 text-sm">Please wait while we build your settlement</div>
                </div>
            </div>
        );
    }

    const canAffordBuilding = (buildingType: string): boolean => {
        const config = townLogic.getBuildingConfig(buildingType);
        if (!config?.buildCost?.[0]) return false;

        const cost = config.buildCost[0].resources;
        const resources = realmLogic.inventory?.resources;
        if (!resources) return false;

        return Object.entries(cost).every(([resource, amount]) => {
            const resourceKey = resource as keyof typeof resources;
            const available = resources[resourceKey] || 0;
            return available >= amount;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 p-4">
            {/* Authentication Button in top right */}
            <div className="absolute top-6 right-6 z-10">
                <AuthButton />
            </div>

            {/* Back button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={onBack}
                    className="bg-white/20 backdrop-blur-lg text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                >
                    <span>←</span>
                    <span>Back</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">🏰 Your Town</h1>
                    <p className="text-green-200 text-lg">Build and manage your settlement!</p>

                    {user && townLogic.town && (
                        <div className="mt-4 p-4 bg-white/20 backdrop-blur rounded-lg inline-block">
                            <p className="text-yellow-300 font-bold text-lg">Welcome to {townLogic.town.name}!</p>
                            {realmLogic.inventory && realmLogic.inventory.resources && (
                                <div className="grid grid-cols-5 gap-4 mt-3 text-white">
                                    <div className="text-center">
                                        <div className="text-yellow-400">💰</div>
                                        <div className="font-bold">{realmLogic.inventory.gold.toLocaleString()}</div>
                                        <div className="text-xs text-white/80">Gold</div>
                                    </div>
                                    {Object.entries(realmLogic.inventory.resources).map(([resource, amount]) => (
                                        <div key={resource} className="text-center">
                                            <div>{
                                                resource === 'wood' ? '🪵' :
                                                    resource === 'stone' ? '🗿' :
                                                        resource === 'iron' ? '⚒️' :
                                                            resource === 'food' ? '🌾' :
                                                                resource === 'gems' ? '💎' : '📦'
                                            }</div>
                                            <div className="font-bold">{amount}</div>
                                            <div className="text-xs text-white/80 capitalize">{resource}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {townLogic.hasError && (
                    <div className="mb-6 max-w-2xl mx-auto">
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                            <p className="text-red-200">{townLogic.error}</p>
                            <button
                                onClick={townLogic.clearError}
                                className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Pending Resources Alert */}
                {townLogic.hasPendingResources && (
                    <div className="mb-6 max-w-2xl mx-auto">
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                            <p className="text-green-200 mb-2">🌾 Resources ready for collection!</p>
                            <div className="text-sm text-green-300 mb-3">
                                {Object.entries(townLogic.pendingResources)
                                    .filter(([_, amount]) => amount > 0)
                                    .map(([resource, amount]) => `+${amount} ${resource}`)
                                    .join(', ')}
                            </div>
                            <button
                                onClick={townLogic.collectResources}
                                disabled={townLogic.collectingResources}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {townLogic.collectingResources ? 'Collecting...' : 'Collect Resources'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Town Management Controls */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Town Management</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={townLogic.collectResources}
                                disabled={townLogic.collectingResources || !townLogic.hasPendingResources}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                🌾 Collect Resources
                            </button>
                            <button
                                onClick={() => townLogic.setBuildMode(townLogic.buildMode ? null : 'house')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    townLogic.buildMode
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {townLogic.buildMode ? '❌ Cancel Build' : '🏗️ Build Mode'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Town Map */}
                {townLogic.town && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">Town Layout</h3>
                        <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
                            {townLogic.town.layout.map((row: any[], y: number) =>
                                row.map((cell: any, x: number) => {
                                    const buildingConfig = townLogic.getBuildingConfig(cell.type);
                                    const isSelected = townLogic.selectedBuilding?.x === x && townLogic.selectedBuilding?.y === y;

                                    return (
                                        <BuildingCell
                                            key={cell.id}
                                            building={cell}
                                            x={x}
                                            y={y}
                                            isSelected={isSelected}
                                            onClick={townLogic.handleCellClick}
                                            buildingConfig={buildingConfig}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Build Menu */}
                {townLogic.showBuildMenu && townLogic.selectedBuilding && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
                        <h3 className="text-white font-bold text-xl mb-4">🏗️ Construction Options</h3>

                        {['resource', 'residential', 'military', 'special'].map(category => {
                            const buildings = townLogic.getBuildingsByCategory(category);
                            if (buildings.length === 0) return null;

                            return (
                                <div key={category} className="mb-6">
                                    <h4 className="text-white/80 font-semibold mb-3 capitalize">
                                        {category === 'resource' ? '🌾 Resource Buildings' :
                                            category === 'residential' ? '🏠 Residential' :
                                                category === 'military' ? '⚔️ Military' : '🏛️ Special'}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {buildings.map((building) => {
                                            const canAfford = canAffordBuilding(building.type);
                                            const cost = building.buildCost[0]?.resources || {};

                                            return (
                                                <button
                                                    key={building.type}
                                                    onClick={() => townLogic.buildBuilding(
                                                        townLogic.selectedBuilding!.x,
                                                        townLogic.selectedBuilding!.y,
                                                        building.type
                                                    )}
                                                    disabled={!canAfford}
                                                    className={`p-4 rounded-lg text-center transition-all border ${
                                                        canAfford
                                                            ? 'bg-white/20 hover:bg-white/30 text-white border-white/20 hover:border-white/40'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
                                                    }`}
                                                >
                                                    <div className="text-3xl mb-2">{building.emoji}</div>
                                                    <div className="text-sm font-semibold mb-1">{building.name}</div>
                                                    <div className="text-xs text-white/70 mb-2">{building.description}</div>
                                                    <div className="text-xs">
                                                        {Object.entries(cost).map(([resource, amount]) => {
                                                            const resources = realmLogic.inventory?.resources;
                                                            const available = resources?.[resource as keyof typeof resources] || 0;
                                                            return (
                                                                <div key={resource} className={available >= amount ? 'text-green-300' : 'text-red-300'}>
                                                                    {amount} {resource}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Selected Building Info */}
                {townLogic.selectedBuilding && townLogic.town &&
                    townLogic.town.layout[townLogic.selectedBuilding.y][townLogic.selectedBuilding.x].type !== 'empty' && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {(() => {
                                        const building = townLogic.town.layout[townLogic.selectedBuilding.y][townLogic.selectedBuilding.x];
                                        const config = townLogic.getBuildingConfig(building.type);

                                        return (
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-4xl">{config?.emoji || '🏗️'}</span>
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
                                                    <div className="text-green-300 text-sm">
                                                        📈 Produces: {Object.entries(config.production[0]?.resources || {})
                                                        .map(([resource, amount]) => `${amount * building.level} ${resource}/hour`)
                                                        .join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <button
                                    onClick={() => townLogic.upgradeBuilding(
                                        townLogic.selectedBuilding!.x,
                                        townLogic.selectedBuilding!.y
                                    )}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all font-semibold"
                                >
                                    ⬆️ Upgrade
                                </button>
                            </div>
                        </div>
                    )}

                {/* Instructions */}
                <div className="mt-8 text-center">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto">
                        <h3 className="font-bold text-white mb-3">Building Guide</h3>
                        <ul className="space-y-2 text-green-200 text-sm">
                            <li>🏗️ Click empty slots to build new structures</li>
                            <li>⬆️ Upgrade buildings to increase their efficiency</li>
                            <li>🌾 Resource buildings generate materials over time</li>
                            <li>🏠 Residential buildings house more population</li>
                            <li>⚔️ Military buildings train and equip your forces</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Town;
