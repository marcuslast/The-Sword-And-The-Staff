import React, { useState } from 'react';
import { Item, Player, EquipmentSlots, ItemSlot } from '../types/game.types';
import { Sword, Shield, HardHat, ShirtIcon, Footprints, Hand, Gem, Plus, UsersRound, Minus } from 'lucide-react';
import { getItemSlot, calculateTotalStats, compareItems } from '../utils/equipmentLogic';
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

    const totalStats = calculateTotalStats(player);

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
            <div className="absolute z-50 bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200 w-64">
                <div className="font-bold mb-2">{hoveredItem.name}</div>
                <div className="text-sm space-y-1">
                    {comparison.attack !== 0 && (
                        <div className={`flex items-center ${comparison.attack > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Attack: </span>
                            <span className="ml-auto">
                                {comparison.attack > 0 ? <Plus size={14} className="inline" /> : <Minus size={14} className="inline" />}
                                {Math.abs(comparison.attack)}
                            </span>
                        </div>
                    )}
                    {comparison.defense !== 0 && (
                        <div className={`flex items-center ${comparison.defense > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Defense: </span>
                            <span className="ml-auto">
                                {comparison.defense > 0 ? <Plus size={14} className="inline" /> : <Minus size={14} className="inline" />}
                                {Math.abs(comparison.defense)}
                            </span>
                        </div>
                    )}
                    {comparison.health !== 0 && (
                        <div className={`flex items-center ${comparison.health > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Health: </span>
                            <span className="ml-auto">
                                {comparison.health > 0 ? <Plus size={14} className="inline" /> : <Minus size={14} className="inline" />}
                                {Math.abs(comparison.health)}
                            </span>
                        </div>
                    )}
                    {comparison.speed !== 0 && (
                        <div className={`flex items-center ${comparison.speed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Speed: </span>
                            <span className="ml-auto">
                                {comparison.speed > 0 ? <Plus size={14} className="inline" /> : <Minus size={14} className="inline" />}
                                {Math.abs(comparison.speed)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold text-lg mb-4">Equipment & Stats</h3>

            {/* Stats Display */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Total Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">⚔️ Attack:</span>
                        <span className="font-bold">{totalStats.attack}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">🛡️ Defense:</span>
                        <span className="font-bold">{totalStats.defense}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">❤️ Health:</span>
                        <span className="font-bold">{totalStats.health}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">👟 Speed:</span>
                        <span className="font-bold">{totalStats.speed}</span>
                    </div>
                </div>
            </div>

            {/* Equipment Slots */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {(['weapon', 'armor', 'helmet', 'shield', 'gloves', 'boots', 'cloak', 'accessory'] as ItemSlot[]).map(slot =>
                    renderSlot(slot)
                )}
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
                                className={`p-2 rounded cursor-pointer transition-all relative
                                    ${isEquipped ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}
                                    ${RARITIES[item.rarity].bgColor}`}
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
                                <div className="flex items-center gap-2">
                                    <ItemIcon icon={item.icon} size={20} />
                                    <span className={`text-sm font-medium ${RARITIES[item.rarity].color}`}>
                                        {item.name}
                                    </span>
                                    {isEquipped && <span className="ml-auto text-xs text-blue-600">Equipped</span>}
                                </div>
                                {hoveredItem?.id === item.id && renderStatComparison()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EquipmentPanel;
