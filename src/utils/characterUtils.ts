import { CHARACTER_IMAGES } from './characterImage';
import { CharacterType } from '../types/game.types';

export function getCharacterImage(character: CharacterType): string {
    return CHARACTER_IMAGES[character];
}
