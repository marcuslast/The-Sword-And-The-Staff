import React, { useState } from 'react';
import {
    X, ShoppingCart, Coins, Package, Plus, Minus, ArrowLeft,
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull
} from 'lucide-react';
import { Item, Player } from '../types/game.types';
import { ITEM_POOL, RARITIES } from '../utils/gameData';
import { getItemSlot } from '../utils/equipmentLogic';

// Item Icon Component
const ItemIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 24 }) => {
    const icons: { [key: string]: React.ReactNode } = {
        'sword': <Sword size={size} />,
        'shield': <Shield size={size} />,
        'crown': <Crown size={size} />,
        'gem': <Gem size={size} />,
        'wand': <Star size={size} />,
        'trap': <AlertTriangle size={size} />,
        'creature': <Skull size={size} />,
        'package': <Package size={size} />
    };
    return <>{icons[icon] || <Sword size={size} />}</>;
};

interface MobileShopProps {
    player: Player;
    onBuyItem: (item: Item) => void;
    onSellItem: (item: Item) => void;
    onClose: () => void;
}

const MobileShop: React.FC<MobileShopProps> = ({
                                                   player,
                                                   onBuyItem,
                                                   onSellItem,
                                                   onClose
                                               }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'consumable'>('all');

    // Generate shop inventory (items available for purchase)
    const shopInventory = React.useMemo(() => {
        const weapons = ITEM_POOL.filter(item => item.type === 'weapon').slice(0, 8);
        const armor = ITEM_POOL.filter(item => item.type === 'armor').slice(0, 6);
        const potions = ITEM_POOL.filter(item => item.type === 'potion' || item.type === 'consumable').slice(0, 12);

        return [...weapons, ...armor, ...potions].map(item => ({
            ...item,
            id: `shop-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
            value: Math.floor(item.value * 1.2)
        }));
    }, []);

    // Filter shop items by category
    const filteredShopItems = shopInventory.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'potion') return item.type === 'potion' || item.type === 'consumable';
        return item.type === selectedCategory;
    });

    // Filter player items for selling
    const sellableItems = player.inventory.filter(item => item.value > 0);

    const canAfford = (item: Item) => player.gold >= item.value;
    const getSellPrice = (item: Item) => Math.floor(item.value * 0.6);
    const isEquipped = (item: Item) => {
        const slot = getItemSlot(item);
        return slot && player.equipped[slot]?.id === item.id;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center space-x-2">
                            <ShoppingCart size={20} />
                            <h2 className="text-lg font-bold">Shop</h2>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        <Coins size={16} />
                        <span className="font-bold">{player.gold}</span>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'buy'
                                ? 'border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50'
                                : 'text-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <ShoppingCart size={18} />
                            <span>Buy</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'sell'
                                ? 'border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50'
                                : 'text-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Coins size={18} />
                            <span>Sell</span>
                            {sellableItems.length > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {sellableItems.length}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'buy' ? (
                    <div className="h-full flex flex-col">
                        {/* Category Filter */}
                        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'weapon', 'armor', 'potion'] as const).map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                                            selectedCategory === category
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Buy Items List - Mobile Optimized with Proper Scrolling */}
                        <div className="flex-1 overflow-y-auto p-4 pb-20">
                            <div className="space-y-3">
                                {filteredShopItems.map(item => {
                                    const rarityConfig = RARITIES[item.rarity];
                                    const affordable = canAfford(item);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-white border-2 rounded-xl p-4 transition-all duration-200 ${
                                                affordable
                                                    ? `shadow-md ${rarityConfig.color.replace('text-', 'border-')}`
                                                    : 'border-gray-300 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                                                    <ItemIcon icon={item.icon} size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-bold ${rarityConfig.color}`}>
                                                        {item.name}
                                                    </h3>
                                                    <div className="text-sm text-gray-600 capitalize">
                                                        {item.rarity} {item.type}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-1">
                                                        <Coins size={16} className="text-yellow-500" />
                                                        <span className="font-bold text-yellow-600">{item.value}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-gray-600">Stats: +{item.stats}</span>
                                                {item.effect && (
                                                    <span className="text-xs text-purple-600 capitalize">
                                                        {item.effect.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => affordable && onBuyItem(item)}
                                                disabled={!affordable}
                                                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                                                    affordable
                                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {affordable ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Plus size={16} />
                                                        <span>Buy</span>
                                                    </div>
                                                ) : (
                                                    <span>Can't Afford</span>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* Sell Items List - Mobile Optimized with Proper Scrolling */}
                        <div className="flex-1 overflow-y-auto p-4 pb-20">
                            {sellableItems.length > 0 ? (
                                <div className="space-y-3">
                                    {sellableItems.map(item => {
                                        const rarityConfig = RARITIES[item.rarity];
                                        const sellPrice = getSellPrice(item);
                                        const equipped = isEquipped(item);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`bg-white border-2 rounded-xl p-4 transition-all duration-200 shadow-md ${
                                                    equipped ? 'border-blue-400 bg-blue-50' : rarityConfig.color.replace('text-', 'border-')
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                                                        <ItemIcon icon={item.icon} size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold ${rarityConfig.color}`}>
                                                            {item.name}
                                                        </h3>
                                                        <div className="text-sm text-gray-600 capitalize">
                                                            {item.rarity} {item.type}
                                                        </div>
                                                        {equipped && (
                                                            <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
                                                                Equipped
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center space-x-1">
                                                            <Coins size={16} className="text-yellow-500" />
                                                            <span className="font-bold text-yellow-600">{sellPrice}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-gray-600">Stats: +{item.stats}</span>
                                                    {item.effect && (
                                                        <span className="text-xs text-purple-600 capitalize">
                                                            {item.effect.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => onSellItem(item)}
                                                    className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white"
                                                >
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Minus size={16} />
                                                        <span>Sell</span>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-bold text-gray-600 mb-2">No Items to Sell</h3>
                                    <p className="text-gray-500">
                                        You don't have any sellable items in your inventory.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileShop;
