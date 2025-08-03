export type RealmView = 'orbs' | 'town';

export interface UserResources {
    food: number;
    wood: number;
    stone: number;
    iron: number;
    gems: number;
}

export interface UserInventory {
    gold: number;
    orbsCount: {
        common: number;
        uncommon: number;
        rare: number;
        veryRare: number;
        legendary: number;
    };
    resources?: UserResources;
}

export interface BuildingCellProps {
    building: {
        type: string;
        level: number;
        id: string;
    };
    x: number;
    y: number;
    isSelected: boolean;
    onClick: (x: number, y: number) => void;
    buildingConfig?: {
        type: string;
        name: string;
        emoji: string;
        category: 'resource' | 'military' | 'residential' | 'special';
        production?: Array<{
            level: number;
            resources: Record<string, number>;
            time: number;
        }>;
    };
}
