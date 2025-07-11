import React from 'react';
import { Dices } from 'lucide-react';

interface DiceProps {
    value: number | null;
    rolling: boolean;
    onRoll: () => void;
    disabled: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, rolling, onRoll, disabled }) => {
    return (
        <button
            onClick={onRoll}
            disabled={disabled || rolling}
            className={`relative w-20 h-20 bg-white border-4 border-gray-800 rounded-lg shadow-lg 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'} 
        transition-transform`}
        >
            {rolling ? (
                <div className="animate-spin">
                    <Dices size={40} className="m-auto" />
                </div>
            ) : value !== null ? (
                <div className="text-3xl font-bold">{value}</div>
            ) : (
                <Dices size={40} className="m-auto" />
            )}
        </button>
    );
};

export default Dice;
