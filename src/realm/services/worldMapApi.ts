export interface Tile {
    q: number;
    r: number;
    terrain: string;
    owner?: {
        id: string;
        name: string;
        color: string;
    };
    resources?: string[];
    buildings?: string[];
}

export interface WorldMapData {
    tiles: Tile[];
    mapSize: number;
    version: number;
}

class WorldMapAPI {
    private baseUrl = '/api/worldmap';

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

    // Get the entire world map or a viewport
    async getWorldMap(viewport?: { minQ: number; maxQ: number; minR: number; maxR: number }): Promise<WorldMapData> {
        const params = viewport ? new URLSearchParams(viewport as any).toString() : '';
        return this.request(`${params ? `?${params}` : ''}`);
    }

    // Get tiles around a specific position
    async getTilesAround(q: number, r: number, radius: number): Promise<{ tiles: Tile[] }> {
        return this.request(`/tiles/${q}/${r}/${radius}`);
    }

    // Update a single tile (admin only)
    async updateTile(q: number, r: number, terrain: string): Promise<{ tile: Tile }> {
        return this.request('/tile', {
            method: 'PUT',
            body: JSON.stringify({ q, r, terrain })
        });
    }

    // Save the entire map (admin only)
    async saveMap(tiles: Tile[], mapSize: number): Promise<{ version: number }> {
        return this.request('/save', {
            method: 'POST',
            body: JSON.stringify({ tiles, mapSize })
        });
    }

    // Generate a new map (admin only)
    async generateMap(mapSize: number): Promise<WorldMapData> {
        const response = await this.request<{ worldMap: WorldMapData }>('/generate', {
            method: 'POST',
            body: JSON.stringify({ mapSize })
        });
        return response.worldMap;
    }
}

export const worldMapApi = new WorldMapAPI();
