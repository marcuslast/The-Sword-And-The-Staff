
import React from 'react';

interface AnimatedDiceProps {
    value: number | null;
    rolling: boolean;
    onRoll: () => void;
    disabled: boolean;
}

const AnimatedDice: React.FC<AnimatedDiceProps> = ({ value, rolling, onRoll, disabled }) => {
    // Dice face patterns using dots
    const getDiceFace = (num: number | null) => {
        if (num === null) return null;

        const dotPatterns = {
            1: [false, false, false, false, true, false, false, false, false],
            2: [true, false, false, false, false, false, false, false, true],
            3: [true, false, false, false, true, false, false, false, true],
            4: [true, false, true, false, false, false, true, false, true],
            5: [true, false, true, false, true, false, true, false, true],
            6: [true, false, true, true, false, true, true, false, true]
        };

        const pattern = dotPatterns[num as keyof typeof dotPatterns] || dotPatterns[1];

        return (
            <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
                {pattern.map((hasDot, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                            hasDot ? 'bg-gray-800' : 'bg-transparent'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <button
                onClick={onRoll}
                disabled={disabled || rolling}
                className={`relative w-24 h-24 bg-white border-4 border-gray-800 rounded-xl shadow-xl 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'} 
                    ${rolling ? 'animate-bounce' : ''}
                    transition-all duration-200 flex items-center justify-center`}
            >
                {rolling ? (
                    <div className="animate-spin text-4xl">🎲</div>
                ) : (
                    getDiceFace(value)
                )}
            </button>

            {/* Display dice value clearly */}
            <div className="text-center">
                {rolling ? (
                    <div className="text-lg font-bold text-blue-600 animate-pulse">Rolling...</div>
                ) : value !== null ? (
                    <div className="text-2xl font-bold text-green-600">
                        Rolled: {value}
                    </div>
                ) : (
                    <div className="text-lg text-gray-600">Click to roll</div>
                )}
            </div>
        </div>
    );
};

export default AnimatedDice;
