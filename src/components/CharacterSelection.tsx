import React, { useState } from 'react';
import { CharacterType } from '../types/game.types';
import { CHARACTER_IMAGES } from '../utils/characterImage';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/CharacterSelection.css';

interface CharacterSelectionProps {
    selectedCharacter: CharacterType;
    onSelect: (character: CharacterType) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
                                                                   selectedCharacter,
                                                                   onSelect
                                                               }) => {
    const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');

    const characters: Record<'male' | 'female', CharacterType[]> = {
        male: [
            'male-archer', 'male-dwarf', 'male-general',
            'male-knight', 'male-sorcerer', 'male-wizard'
        ],
        female: [
            'female-general', 'female-knight', 'female-sorceress',
            'female-summoner', 'female-thief', 'female-witch'
        ]
    };

    const getCharacterClass = (type: string) => {
        return type.split('-')[1].replace(/([A-Z])/g, ' $1').trim();
    };

    return (
        <div className="character-selection-container">
            <div className="selection-header">
                <h2>Choose Your Champion</h2>
                <p>Select a character to begin your adventure</p>
            </div>

            <div className="gender-tabs">
                <button
                    className={`gender-tab ${activeGender === 'male' ? 'active' : ''}`}
                    onClick={() => setActiveGender('male')}
                >
                    ♂ Male
                </button>
                <button
                    className={`gender-tab ${activeGender === 'female' ? 'active' : ''}`}
                    onClick={() => setActiveGender('female')}
                >
                    ♀ Female
                </button>
            </div>

            <div className="character-grid">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGender}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid-content"
                    >
                        {characters[activeGender].map((character) => (
                            <motion.div
                                key={character}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`character-card ${selectedCharacter === character ? 'selected' : ''}`}
                                onClick={() => onSelect(character)}
                            >
                                <div className="character-image-container">
                                    <img
                                        src={CHARACTER_IMAGES[character]}
                                        alt={character}
                                        className="character-image"
                                    />
                                    {selectedCharacter === character && (
                                        <div className="selection-badge">
                                            ✓
                                        </div>
                                    )}
                                </div>
                                <div className="character-info">
                                    <h3>{getCharacterClass(character)}</h3>
                                    <div className="character-stats">
                                        <span>⚔️ 8-12</span>
                                        <span>❤️ 80-120</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CharacterSelection;
