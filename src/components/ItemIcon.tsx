import React from 'react';
import {
    Sword, Shield, Crown, Gem, Star, AlertTriangle, Skull, Package,
    Shirt, HardHat, Hand, Footprints, UsersRound, CircleDot, FlaskRound
} from 'lucide-react';

interface ItemIconProps {
    icon: string;
    size?: number;
}

const ItemIcon: React.FC<ItemIconProps> = ({ icon, size = 24 }) => {
    const icons: { [key: string]: React.ReactNode } = {
        // Weapons
        'sword': <Sword size={size} />,
        'dagger': <Sword size={size} className="rotate-45" />,
        'bow': <CircleDot size={size} />,
        'staff': <Star size={size} />,
        'wand': <Star size={size} />,
        'mace': <CircleDot size={size} />,
        'hammer': <CircleDot size={size} />,
        'axe': <CircleDot size={size} />,
        'spear': <CircleDot size={size} />,
        'greatsword': <Sword size={size} className="scale-125" />,

        // Armor
        'armor': <Shirt size={size} />,
        'shield': <Shield size={size} />,
        'helmet': <HardHat size={size} />,
        'crown': <Crown size={size} />,
        'gloves': <Hand size={size} />,
        'boots': <Footprints size={size} />,
        'cloak': <UsersRound size={size} />,
        'robe': <Shirt size={size} />,

        // Other
        'gem': <Gem size={size} />,
        'trap': <AlertTriangle size={size} />,
        'creature': <Skull size={size} />,
        'package': <Package size={size} />,
        'potion': <FlaskRound size={size} />,

        // Default fallback icons
        'bracers': <CircleDot size={size} />,
        'belt': <CircleDot size={size} />,
        'pauldrons': <CircleDot size={size} />,
        'greaves': <CircleDot size={size} />,
        'mask': <CircleDot size={size} />,
    };

    return <>{icons[icon] || <CircleDot size={size} />}</>;
};

export default ItemIcon;
