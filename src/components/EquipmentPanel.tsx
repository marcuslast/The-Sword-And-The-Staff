import React, { useState } from 'react';
import { Item, Player, EquipmentSlots, ItemSlot } from '../types/game.types';
import { Sword, Shield, HardHat, ShirtIcon, Footprints, Hand, Gem, Plus, UsersRound, Minus, Heart, Zap } from 'lucide-react';
import { getItemSlot, compareItems, getStatBreakdowns } from '../utils/equipmentLogic';
import { RARITIES } from '../utils/gameData';
import ItemIcon from './ItemIcon';

interface EquipmentPanelProps {
    player: Player;
    onEquipItem: (item: Item) => void;
    onUnequipItem: (slot: ItemSlot) => void;
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ player, onEquipItem, onUnequipItem }) => {
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<ItemSlot | null>(null);

    if (!player) return null;

    const statBreakdowns = getStatBreakdowns(player);

    const slotIcons: Record<ItemSlot, React.ReactNode> = {
        weapon: <Sword size={24} />,
        armor: <ShirtIcon size={24} />,
        helmet: <HardHat size={24} />,
        shield: <Shield size={24} />,
        gloves: <Hand size={24} />,
        boots: <Footprints size={24} />,
        cloak: <UsersRound size={24} />,
        accessory: <Gem size={24} />
    };

    const renderSlot = (slot: ItemSlot) => {
        const equippedItem = player.equipped[slot];

        return (
            <div
                key={slot}
                className={`relative w-20 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all
                    ${equippedItem ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => equippedItem && onUnequipItem(slot)}
                onMouseEnter={() => equippedItem && setHoveredItem(equippedItem)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                {equippedItem ? (
                    <div className="relative">
                        <ItemIcon icon={equippedItem.icon} size={32} />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${RARITIES[equippedItem.rarity].bgColor}`} />
                    </div>
                ) : (
                    <div className="text-gray-400">
                        {slotIcons[slot]}
                    </div>
                )}
                <div className="absolute -top-2 left-0 text-xs text-gray-600 capitalize bg-white px-1 rounded">
                    {slot}
                </div>
            </div>
        );
    };

    const renderStatComparison = () => {
        if (!hoveredItem || !hoveredSlot) return null;

        const currentItem = player.equipped[hoveredSlot];
        const comparison = compareItems(currentItem, hoveredItem);

        return (
            <div className="absolute z-50 bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200 w-72 max-w-sm">
                <div className="font-bold mb-3 text-lg">{hoveredItem.name}</div>
                <div className="mb-3">
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${RARITIES[hoveredItem.rarity].bgColor} ${RARITIES[hoveredItem.rarity].color}`}>
                        {hoveredItem.rarity} {hoveredItem.type}
                    </span>
                </div>

                <div className="text-sm space-y-2">
                    <div className="font-semibold text-gray-700 mb-2">Stat Changes:</div>

                    {comparison.health !== 0 && (
                        <div className={`flex items-center justify-between p-2 rounded ${comparison.health > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="flex items-center">
                                <span className="mr-2">❤️</span>
                                Health:
                            </span>
                            <span className="font-semibold flex items-center">
                                {comparison.health > 0 ? <Plus size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
                                {Math.abs(comparison.health)}
                            </span>
                        </div>
                    )}

                    {comparison.attack !== 0 && (
                        <div className={`flex items-center justify-between p-2 rounded ${comparison.attack > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="flex items-center">
                                <span className="mr-2">⚔️</span>
                                Attack:
                            </span>
                            <span className="font-semibold flex items-center">
                                {comparison.attack > 0 ? <Plus size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
                                {Math.abs(comparison.attack)}
                            </span>
                        </div>
                    )}

                    {comparison.defense !== 0 && (
                        <div className={`flex items-center justify-between p-2 rounded ${comparison.defense > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="flex items-center">
                                <span className="mr-2">🛡️</span>
                                Defense:
                            </span>
                            <span className="font-semibold flex items-center">
                                {comparison.defense > 0 ? <Plus size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
                                {Math.abs(comparison.defense)}
                            </span>
                        </div>
                    )}

                    {comparison.speed !== 0 && (
                        <div className={`flex items-center justify-between p-2 rounded ${comparison.speed > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="flex items-center">
                                <span className="mr-2">👟</span>
                                Speed:
                            </span>
                            <span className="font-semibold flex items-center">
                                {comparison.speed > 0 ? <Plus size={14} className="mr-1" /> : <Minus size={14} className="mr-1" />}
                                {Math.abs(comparison.speed)}
                            </span>
                        </div>
                    )}

                    {comparison.attack === 0 && comparison.defense === 0 && comparison.health === 0 && comparison.speed === 0 && (
                        <div className="text-gray-500 italic text-center py-2">
                            No stat changes
                        </div>
                    )}
                </div>

                {hoveredItem.effect && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="font-semibold text-sm text-gray-700 mb-1">Special Effect:</div>
                        <div className="text-sm text-purple-600 capitalize">
                            {hoveredItem.effect.replace(/_/g, ' ')}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="font-bold text-lg mb-4">Equipment & Stats</h3>

            {/* Stats Display - Self-contained */}
            <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-3 text-gray-700">Current Stats</h4>

                    {/* Health */}
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                                <Heart size={16} className="text-red-500" />
                                <span className="text-sm font-medium text-gray-700">Health</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span className="text-sm font-bold text-gray-900">
                                    {player.health}
                                </span>
                                <span className="text-xs text-gray-400">/</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {statBreakdowns.health.base}
                                </span>
                                {statBreakdowns.health.bonus > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        +{statBreakdowns.health.bonus}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                                style={{ width: `${(player.health / statBreakdowns.health.total) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Other Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Attack */}
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                            <Sword size={14} className="text-orange-500 mx-auto mb-1" />
                            <div className="text-sm font-bold text-gray-900">{statBreakdowns.attack.total}</div>
                            {statBreakdowns.attack.bonus > 0 && (
                                <div className="text-xs text-green-600 font-medium">+{statBreakdowns.attack.bonus}</div>
                            )}
                            <div className="text-xs text-gray-500">ATK</div>
                        </div>

                        {/* Defense */}
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <Shield size={14} className="text-blue-500 mx-auto mb-1" />
                            <div className="text-sm font-bold text-gray-900">{statBreakdowns.defense.total}</div>
                            {statBreakdowns.defense.bonus > 0 && (
                                <div className="text-xs text-green-600 font-medium">+{statBreakdowns.defense.bonus}</div>
                            )}
                            <div className="text-xs text-gray-500">DEF</div>
                        </div>

                        {/* Speed */}
                        <div className="bg-yellow-50 rounded-lg p-2 text-center">
                            <Zap size={14} className="text-yellow-500 mx-auto mb-1" />
                            <div className="text-sm font-bold text-gray-900">{statBreakdowns.speed.total}</div>
                            {statBreakdowns.speed.bonus > 0 && (
                                <div className="text-xs text-green-600 font-medium">+{statBreakdowns.speed.bonus}</div>
                            )}
                            <div className="text-xs text-gray-500">SPD</div>
                        </div>
                    </div>

                    {/* Equipment bonus summary */}
                    {(statBreakdowns.attack.bonus > 0 || statBreakdowns.defense.bonus > 0 ||
                        statBreakdowns.health.bonus > 0 || statBreakdowns.speed.bonus > 0) && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-xs mb-2 text-green-800">Equipment Bonuses:</h5>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {statBreakdowns.health.bonus > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>❤️ Health:</span>
                                        <span className="font-bold">+{statBreakdowns.health.bonus}</span>
                                    </div>
                                )}
                                {statBreakdowns.attack.bonus > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>⚔️ Attack:</span>
                                        <span className="font-bold">+{statBreakdowns.attack.bonus}</span>
                                    </div>
                                )}
                                {statBreakdowns.defense.bonus > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>🛡️ Defense:</span>
                                        <span className="font-bold">+{statBreakdowns.defense.bonus}</span>
                                    </div>
                                )}
                                {statBreakdowns.speed.bonus > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>👟 Speed:</span>
                                        <span className="font-bold">+{statBreakdowns.speed.bonus}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Equipment Slots */}
            <div className="mb-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Equipment Slots</h4>
                <div className="grid grid-cols-4 gap-2">
                    {(['weapon', 'armor', 'helmet', 'shield', 'gloves', 'boots', 'cloak', 'accessory'] as ItemSlot[]).map(slot =>
                        renderSlot(slot)
                    )}
                </div>
            </div>

            {/* Inventory */}
            <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-2">Inventory (Click to equip)</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {player.inventory.filter(item => getItemSlot(item) !== null).map(item => {
                        const slot = getItemSlot(item);
                        const isEquipped = slot && player.equipped[slot]?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`p-2 rounded cursor-pointer transition-all relative border-2
                                    ${isEquipped
                                    ? 'bg-blue-100 border-blue-300'
                                    : `hover:bg-gray-100 ${RARITIES[item.rarity].bgColor} border-transparent hover:border-gray-200`
                                }`}
                                onClick={() => !isEquipped && onEquipItem(item)}
                                onMouseEnter={() => {
                                    setHoveredItem(item);
                                    setHoveredSlot(slot);
                                }}
                                onMouseLeave={() => {
                                    setHoveredItem(null);
                                    setHoveredSlot(null);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <ItemIcon icon={item.icon} size={20} />
                                    <div className="flex-1">
                                        <span className={`text-sm font-medium ${RARITIES[item.rarity].color}`}>
                                            {item.name}
                                        </span>
                                        <div className="text-xs text-gray-600 flex items-center space-x-2">
                                            <span className="capitalize">{item.rarity} {item.type}</span>
                                            <span>•</span>
                                            <span className="font-medium">+{item.stats}</span>
                                        </div>
                                    </div>
                                    {isEquipped && (
                                        <span className="text-xs text-blue-600 font-semibold bg-blue-200 px-2 py-1 rounded">
                                            Equipped
                                        </span>
                                    )}
                                </div>
                                {hoveredItem?.id === item.id && renderStatComparison()}
                            </div>
                        );
                    })}

                    {player.inventory.filter(item => getItemSlot(item) !== null).length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <Shield size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No equipment in inventory</p>
                            <p className="text-sm mt-1">Find items by exploring!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentPanel;
