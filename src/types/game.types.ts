export interface Question {
    id: string;
    category: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: number;
}

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'trap' | 'consumable' | 'potion' | 'mythic';
    rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
    stats: number;
    icon: string;
    effect?: string;
    value: number;
}

export interface Trap {
    id: string;
    type: 'creature' | 'damage' | 'item_loss';
    power: number;
    ownerId: string;
    ownerName: string;
}

export interface Enemy {
    id: string;
    name: string;
    health: number;
    power: number;
    reward: Item;
    image: string;
    goldReward: number;
}

export interface Tile {
    hoardItems: any[];
    id: number;
    type: 'normal' | 'battle' | 'trap' | 'bonus' | 'castle' | 'start' | 'hoard' | 'shop';
    x: number;
    y: number;
    enemy?: Enemy;
    trap?: Trap;
    isPath: boolean;
    // Add these new properties:
    connections?: number[];
    pathIndex?: number;
}

export interface GameState {
    players: Player[];
    currentPlayerId: string;
    board: Tile[];
    phase: 'rolling' | 'moving' | 'battle' | 'trap' | 'reward' | 'game_over' | 'selecting_tile' | 'finishing';
    diceValue: number | null;
    currentBattle: BattleState | null;
    activeTrap: Trap | null;
    winner: Player | null;
}

export interface EquipmentSlots {
    weapon?: Item;
    armor?: Item;
    helmet?: Item;
    shield?: Item;
    gloves?: Item;
    boots?: Item;
    cloak?: Item;
    accessory?: Item;
}

export interface PlayerStats {
    attack: number;
    defense: number;
    health: number;
    speed: number;
}

export interface DiceRoll {
    type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
    value: number;
    modifier: number;
    total: number;
    isCritical?: boolean;
    isCriticalFail?: boolean;
}

export interface BattleRound {
    playerRoll: DiceRoll;
    enemyRoll: DiceRoll;
    damage?: number;
    isPlayerTurn: boolean;
    description: string;
}

export interface BattleState {
    enemy: Enemy;
    playerHealth: number;
    playerMaxHealth: number;
    enemyHealth: number;
    enemyMaxHealth: number;
    rounds: BattleRound[];
    currentRound: number;
    isPlayerTurn: boolean;
    phase: 'initiative' | 'player_attack' | 'enemy_attack' | 'victory' | 'defeat';
    playerStats: PlayerStats;
    playerEffects: BattleEffect[];
    enemyEffects: BattleEffect[];
}

export interface BattleEffect {
    type: 'weapon_coating' | 'stat_boost' | 'damage_over_time' | 'shield' | 'special';
    name: string;
    duration: number; // rounds remaining
    value: number;
    description: string;
}

export interface Player {
    id: string;
    username: string;
    position: number;
    health: number;
    maxHealth: number;
    inventory: Item[];
    equipped: EquipmentSlots;
    baseStats: PlayerStats;
    stats: {
        battlesWon: number;
        tilesMovedTotal: number;
        goldCollected: number;
    };
    color: string;
    isActive: boolean;
    isAI: boolean;
    gold: number;
    lastGoldWin: number | null;
}

export type ItemSlot = 'weapon' | 'armor' | 'helmet' | 'shield' | 'gloves' | 'boots' | 'cloak' | 'accessory';
