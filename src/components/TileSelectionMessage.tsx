import React from 'react';

interface TileSelectionMessageProps {
    isSelectingTile: boolean;
    diceValue: number | null;
}

const TileSelectionMessage: React.FC<TileSelectionMessageProps> = ({ isSelectingTile, diceValue }) => {
    if (!isSelectingTile) return null;

    return (
        <div className="bg-green-100 border-2 border-green-500 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-green-800 mb-2">Choose Your Move!</h3>
            <p className="text-green-700">
                Correct answer! Click on any flashing green tile to move there.
                You can move up to {diceValue} spaces forward.
            </p>
        </div>
    );
};

export default TileSelectionMessage;
