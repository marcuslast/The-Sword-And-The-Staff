import medusaImg from '../assets/images/medusa.jpg';
import darkKnightImg from '../assets/images/dark_knight.jpg';
import infernoImpImg from '../assets/images/inferno_imp.jpg';
import stoneGolemImg from '../assets/images/stone_golem.jpg';
import dragonWhelpImg from '../assets/images/dragon_whelp.jpg';
import frostWraithImg from '../assets/images/frost_wraith.jpg';
import goblinScoutImg from '../assets/images/goblin_scout.jpg';
import shadowStalkerImg from '../assets/images/shadow_stalker.jpg';
import cursedRevenantImg from '../assets/images/cursed_revenant.jpg';
import venomfangSerpentImg from '../assets/images/venomfang_serpent.jpg';

// Enemy image mapping
export const ENEMY_IMAGES = {
    'medusa': medusaImg,
    'dark_knight': darkKnightImg,
    'inferno_imp': infernoImpImg,
    'stone_golem': stoneGolemImg,
    'dragon_whelp': dragonWhelpImg,
    'frost_wraith': frostWraithImg,
    'goblin_scout': goblinScoutImg,
    'shadow_stalker': shadowStalkerImg,
    'cursed_revenant': cursedRevenantImg,
    'venomfang_serpent': venomfangSerpentImg
};


// Enemy data with images
export const ENEMIES = [
    {
        id: 'goblin_scout',
        name: 'Goblin Scout',
        health: 25,
        power: 15,
        image: ENEMY_IMAGES['goblin_scout']
    },
    {
        id: 'inferno_imp',
        name: 'Inferno Imp',
        health: 30,
        power: 20,
        image: ENEMY_IMAGES['inferno_imp']
    },
    {
        id: 'frost_wraith',
        name: 'Frost Wraith',
        health: 35,
        power: 25,
        image: ENEMY_IMAGES['frost_wraith']
    },
    {
        id: 'shadow_stalker',
        name: 'Shadow Stalker',
        health: 40,
        power: 30,
        image: ENEMY_IMAGES['shadow_stalker']
    },
    {
        id: 'stone_golem',
        name: 'Stone Golem',
        health: 60,
        power: 35,
        image: ENEMY_IMAGES['stone_golem']
    },
    {
        id: 'venomfang_serpent',
        name: 'Venomfang Serpent',
        health: 45,
        power: 40,
        image: ENEMY_IMAGES['venomfang_serpent']
    },
    {
        id: 'cursed_revenant',
        name: 'Cursed Revenant',
        health: 55,
        power: 45,
        image: ENEMY_IMAGES['cursed_revenant']
    },
    {
        id: 'dragon_whelp',
        name: 'Dragon Whelp',
        health: 70,
        power: 50,
        image: ENEMY_IMAGES['dragon_whelp']
    },
    {
        id: 'dark_knight',
        name: 'Dark Knight',
        health: 80,
        power: 55,
        image: ENEMY_IMAGES['dark_knight']
    },
    {
        id: 'medusa',
        name: 'Medusa',
        health: 90,
        power: 65,
        image: ENEMY_IMAGES['medusa']
    }
];

// Helper function to get random enemy
export const getRandomEnemy = (): typeof ENEMIES[0] => {
    return ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
};
