import React, { useState } from 'react';
import {
    X, ShoppingCart, Coins, Package, Sword, Shield, Crown, Gem, Star,
    AlertTriangle, Skull, Plus, Minus, Check, ArrowLeftRight
} from 'lucide-react';
import { Item, Player } from '../types/game.types';
import { ITEM_POOL, RARITIES } from '../utils/gameData';
import { getItemSlot } from '../utils/equipmentLogic';
import ItemIcon from './ItemIcon';

interface ShopProps {
    isOpen: boolean;
    onClose: () => void;
    player: Player;
    onBuyItem: (item: Item) => void;
    onSellItem: (item: Item) => void;
}

const Shop: React.FC<ShopProps> = ({
                                       isOpen,
                                       onClose,
                                       player,
                                       onBuyItem,
                                       onSellItem
                                   }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'consumable'>('all');

    // Generate shop inventory (items available for purchase)
    const shopInventory = React.useMemo(() => {
        // Get a variety of items for the shop
        const weapons = ITEM_POOL.filter(item => item.type === 'weapon').slice(0, 8);
        const armor = ITEM_POOL.filter(item => item.type === 'armor').slice(0, 6);
        const potions = ITEM_POOL.filter(item => item.type === 'potion' || item.type === 'consumable').slice(0, 12);

        return [...weapons, ...armor, ...potions].map(item => ({
            ...item,
            id: `shop-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
            value: Math.floor(item.value * 1.2) // Shop markup
        }));
    }, []);

    // ✅ All hooks are now called before any conditional returns
    if (!isOpen) return null;

    // Filter shop items by category
    const filteredShopItems = shopInventory.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'potion') return item.type === 'potion' || item.type === 'consumable';
        return item.type === selectedCategory;
    });

    // Filter player items for selling
    const sellableItems = player.inventory.filter(item => item.value > 0);

    const canAfford = (item: Item) => player.gold >= item.value;

    const getSellPrice = (item: Item) => Math.floor(item.value * 0.6); // 60% of purchase price

    const isEquipped = (item: Item) => {
        const slot = getItemSlot(item);
        return slot && player.equipped[slot]?.id === item.id;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <ShoppingCart size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Merchant's Shop</h2>
                                <p className="text-yellow-100">Buy and sell equipment & items</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                                <Coins size={20} />
                                <span className="font-bold text-xl">{player.gold}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('buy')}
                            className={`flex-1 py-4 px-6 font-medium transition-colors ${
                                activeTab === 'buy'
                                    ? 'border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <ShoppingCart size={20} />
                                <span>Buy Items</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('sell')}
                            className={`flex-1 py-4 px-6 font-medium transition-colors ${
                                activeTab === 'sell'
                                    ? 'border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <Coins size={20} />
                                <span>Sell Items</span>
                                {sellableItems.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {sellableItems.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    {activeTab === 'buy' ? (
                        <div className="h-full flex flex-col">
                            {/* Category Filter */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {(['all', 'weapon', 'armor', 'potion'] as const).map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                selectedCategory === category
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                            <span className="ml-2 text-sm opacity-75">
                                                ({category === 'all' ? filteredShopItems.length :
                                                category === 'potion' ?
                                                    shopInventory.filter(i => i.type === 'potion' || i.type === 'consumable').length :
                                                    shopInventory.filter(i => i.type === category).length})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buy Items Grid */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredShopItems.map(item => {
                                        const rarityConfig = RARITIES[item.rarity];
                                        const affordable = canAfford(item);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`bg-white border-2 rounded-xl p-4 transition-all duration-200 ${
                                                    affordable
                                                        ? `hover:shadow-lg cursor-pointer ${rarityConfig.color.replace('text-', 'border-')}`
                                                        : 'border-gray-300 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                                                            <ItemIcon icon={item.icon} size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className={`font-bold ${rarityConfig.color}`}>
                                                                {item.name}
                                                            </h3>
                                                            <div className="text-sm text-gray-600 capitalize">
                                                                {item.rarity} {item.type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Stats:</span>
                                                        <span className="font-bold text-green-600">+{item.stats}</span>
                                                    </div>
                                                    {item.effect && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Effect:</span>
                                                            <span className="font-medium text-purple-600 capitalize">
                                                                {item.effect.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-2 border-t">
                                                        <span className="text-gray-600 font-medium">Price:</span>
                                                        <div className="flex items-center space-x-1">
                                                            <Coins size={16} className="text-yellow-500" />
                                                            <span className="font-bold text-yellow-600">{item.value}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => affordable && onBuyItem(item)}
                                                    disabled={!affordable}
                                                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                                                        affordable
                                                            ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
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
                            {/* Sell Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {sellableItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sellableItems.map(item => {
                                            const rarityConfig = RARITIES[item.rarity];
                                            const sellPrice = getSellPrice(item);
                                            const equipped = isEquipped(item);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`bg-white border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                                                        equipped ? 'border-blue-400 bg-blue-50' : rarityConfig.color.replace('text-', 'border-')
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`p-2 rounded-lg ${rarityConfig.bgColor}`}>
                                                                <ItemIcon icon={item.icon} size={24} />
                                                            </div>
                                                            <div>
                                                                <h3 className={`font-bold ${rarityConfig.color}`}>
                                                                    {item.name}
                                                                </h3>
                                                                <div className="text-sm text-gray-600 capitalize">
                                                                    {item.rarity} {item.type}
                                                                </div>
                                                                {equipped && (
                                                                    <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full mt-1">
                                                                        Equipped
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Stats:</span>
                                                            <span className="font-bold text-green-600">+{item.stats}</span>
                                                        </div>
                                                        {item.effect && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Effect:</span>
                                                                <span className="font-medium text-purple-600 capitalize">
                                                                    {item.effect.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <span className="text-gray-600 font-medium">Sell for:</span>
                                                            <div className="flex items-center space-x-1">
                                                                <Coins size={16} className="text-yellow-500" />
                                                                <span className="font-bold text-yellow-600">{sellPrice}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => onSellItem(item)}
                                                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105"
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
                                        <Package size={64} className="mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-bold text-gray-600 mb-2">No Items to Sell</h3>
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
        </div>
    );
};

export default Shop;
