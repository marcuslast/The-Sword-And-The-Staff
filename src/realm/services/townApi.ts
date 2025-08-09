export interface BuildingPosition {
    x: number;
    y: number;
    type: string;
    level: number;
    lastCollected?: string;

    // construction (build) timers/flags
    buildStartTime?: string;
    buildEndTime?: string;
    isBuilding?: boolean;

    // upgrade timers/flags
    upgradeStartTime?: string;
    upgradeEndTime?: string;
    isUpgrading?: boolean;
}


export interface BuildingConfig {
    type: string;
    name: string;
    description: string;
    category: 'resource' | 'military' | 'residential' | 'special';
    maxLevel: number;
    buildCost: Array<{
        level: number;
        resources: Record<string, number>;
        time: number;
    }>;
    production?: Array<{
        level: number;
        resources: Record<string, number>;
        time: number;
    }>;
    unlockRequirements?: {
        townLevel?: number;
        buildings?: Array<{ type: string; level: number }>;
    };
    imageUrl?: string;
    emoji: string; // Fallback for missing images
}

export interface Town {
    id: string;
    name: string;
    level: number;
    mapSize: {
        width: number;
        height: number;
    };
    buildings: BuildingPosition[];
    layout: any[][];
    pendingProduction?: Record<string, number>;
    lastCollected: string;
}

export interface TownResponse {
    town: Town;
    buildingConfigs: BuildingConfig[];
}

export interface CollectResourcesResponse {
    message: string;
    collected: Record<string, number>;
    newResources: Record<string, number>;
}

export interface BuildBuildingRequest {
    x: number;
    y: number;
    type: string;
}

export interface BuildBuildingResponse {
    message: string;
    building: BuildingPosition;
    newResources: Record<string, number>;
}

export interface UpgradeBuildingRequest {
    x: number;
    y: number;
}

export interface UpgradeBuildingResponse {
    message: string;
    building: BuildingPosition;
    newResources: Record<string, number>;
}

export interface SpeedUpBuildingRequest {
    x: number;
    y: number;
}

export interface SpeedUpBuildingResponse {
    message: string;
    building: BuildingPosition;
    newResources: Record<string, number>;
}

class TownAPI {
    private baseUrl = '/api/town';

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

    async getTown(): Promise<TownResponse> {
        return this.request<TownResponse>('');
    }

    async collectResources(): Promise<CollectResourcesResponse> {
        return this.request<CollectResourcesResponse>('/collect', {
            method: 'POST',
        });
    }

    async buildBuilding(data: BuildBuildingRequest): Promise<BuildBuildingResponse> {
        return this.request<BuildBuildingResponse>('/build', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async upgradeBuilding(data: UpgradeBuildingRequest): Promise<UpgradeBuildingResponse> {
        return this.request<UpgradeBuildingResponse>('/upgrade', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async speedUpBuilding(data: SpeedUpBuildingRequest): Promise<SpeedUpBuildingResponse> {
        return this.request<SpeedUpBuildingResponse>('/speedup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const townAPI = new TownAPI();
