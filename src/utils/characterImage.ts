import maleArcher from '../assets/images/characters/male-archer-character.jpg';
import maleDwarf from '../assets/images/characters/male-dwarf-character.jpg';
import maleGeneral from '../assets/images/characters/male-general-character.jpg';
import maleKnight from '../assets/images/characters/male-knight-character.jpg';
import maleSorcerer from '../assets/images/characters/male-sorcerer-character.jpg';
import maleWizard from '../assets/images/characters/male-wizard-character.jpg';
import femaleGeneral from '../assets/images/characters/female-general-character.jpg';
import femaleKnight from '../assets/images/characters/female-knight-character.jpg';
import femaleSorceress from '../assets/images/characters/female-sorceress-character.jpg';
import femaleSummoner from '../assets/images/characters/female-summoner-character.jpg';
import femaleThief from '../assets/images/characters/female-thief-character.jpg';
import femaleWitch from '../assets/images/characters/female-witch-character.jpg';
import {CharacterType} from "../types/game.types";

export const CHARACTER_IMAGES: Record<CharacterType, string> = {
    'male-archer': maleArcher,
    'male-dwarf': maleDwarf,
    'male-general': maleGeneral,
    'male-knight': maleKnight,
    'male-sorcerer': maleSorcerer,
    'male-wizard': maleWizard,
    'female-general': femaleGeneral,
    'female-knight': femaleKnight,
    'female-sorceress': femaleSorceress,
    'female-summoner': femaleSummoner,
    'female-thief': femaleThief,
    'female-witch': femaleWitch
};
