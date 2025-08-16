export type OrbRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';

export interface OrbItem {
    name: string;
    type: string;
    rarity: string;
    stats: number;
    value: number;
}

export interface OrbContents {
    gold: number;
    items: OrbItem[];
}

export interface Orb {
    id: string;
    rarity: OrbRarity;
    isOpened: boolean;
    openedAt?: string;
    contents?: OrbContents;
    createdAt: string;
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
    resources?: {
        food: number;
        wood: number;
        stone: number;
        iron: number;
        gems: number;
    };
}

export interface OrbsResponse {
    orbs: Orb[];
    summary: UserInventory;
}

export interface OrbOpenResponse {
    message: string;
    orb: {
        id: string;
        rarity: OrbRarity;
        contents: OrbContents;
        openedAt: string;
    };
    newTotals: UserInventory;
}

export interface MultipleOrbOpenResponse {
    message: string;
    results: Array<{
        id: string;
        rarity: OrbRarity;
        contents: OrbContents;
    }>;
    totalGold: number;
    newTotals: UserInventory;
}

export interface GameCompletionRequest {
    goldCollected: number;
    orbsToAward: number;
}

export interface GameCompletionResponse {
    message: string;
    rewards: {
        gold: number;
        orbs: Array<{ rarity: OrbRarity }>;
    };
    newTotals: UserInventory;
}

class OrbAPI {
    private baseUrl = '/api/orbs';

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || errorData.details || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return response.json();
    }

    // Get user's orbs
    async getOrbs(includeOpened: boolean = false): Promise<OrbsResponse> {
        const queryParam = includeOpened ? '' : '?opened=false';
        return this.request<OrbsResponse>(`${queryParam}`);
    }

    // Open a single orb
    async openOrb(orbId: string): Promise<OrbOpenResponse> {
        return this.request<OrbOpenResponse>(`/${orbId}/open`, {
            method: 'POST',
        });
    }

    // Open multiple orbs of the same rarity
    async openMultipleOrbs(rarity: OrbRarity, count: number): Promise<MultipleOrbOpenResponse> {
        return this.request<MultipleOrbOpenResponse>('/open-multiple', {
            method: 'POST',
            body: JSON.stringify({ rarity, count }),
        });
    }

    // Complete a game and get rewards
    async completeGame(gameData: GameCompletionRequest): Promise<GameCompletionResponse> {
        return this.request<GameCompletionResponse>('/complete-game', {
            method: 'POST',
            body: JSON.stringify(gameData),
        });
    }

    async getRecentlyOpenedOrbs(limit: number = 5): Promise<OrbsResponse> {
        const queryParam = limit ? '' : '?limit=5';
        return this.request<OrbsResponse>(`${queryParam}`);
    }

    // Get orb statistics (optional - for future use)
    async getStats(): Promise<{
        totalOpened: number;
        totalGoldFromOrbs: number;
        rarest: OrbRarity | null;
    }> {
        return this.request<{
            totalOpened: number;
            totalGoldFromOrbs: number;
            rarest: OrbRarity | null;
        }>('/stats');
    }
}

export const orbAPI = new OrbAPI();
