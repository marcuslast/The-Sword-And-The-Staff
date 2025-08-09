// Type definitions
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

// Rate limit error with optional retry-after
export class RateLimitError extends Error {
    retryAfterMs?: number;
    constructor(message: string, retryAfterMs?: number) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfterMs = retryAfterMs;
    }
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
            if (response.status === 429) {
                const retryAfterHeader = response.headers.get('Retry-After');
                let retryAfterMs: number | undefined;
                if (retryAfterHeader) {
                    const asNumber = Number(retryAfterHeader);
                    if (!Number.isNaN(asNumber)) {
                        retryAfterMs = asNumber * 1000;
                    } else {
                        const when = Date.parse(retryAfterHeader);
                        if (!Number.isNaN(when)) {
                            retryAfterMs = when - Date.now();
                        }
                    }
                }
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.message || 'Request failed with status 429';
                throw new RateLimitError(msg, retryAfterMs && retryAfterMs > 0 ? retryAfterMs : undefined);
            }

            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData.message || errorData.details || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return response.json();
    }

    // Accept AbortSignal so callers can cancel
    async getTown(signal?: AbortSignal): Promise<TownResponse> {
        return this.request<TownResponse>('', { signal });
    }

    async collectResources(signal?: AbortSignal): Promise<CollectResourcesResponse> {
        return this.request<CollectResourcesResponse>('/collect', {
            method: 'POST',
            signal,
        });
    }

    async buildBuilding(data: BuildBuildingRequest, signal?: AbortSignal): Promise<BuildBuildingResponse> {
        return this.request<BuildBuildingResponse>('/build', {
            method: 'POST',
            body: JSON.stringify(data),
            signal,
        });
    }

    async upgradeBuilding(data: UpgradeBuildingRequest, signal?: AbortSignal): Promise<UpgradeBuildingResponse> {
        return this.request<UpgradeBuildingResponse>('/upgrade', {
            method: 'POST',
            body: JSON.stringify(data),
            signal,
        });
    }

    async speedUpBuilding(data: SpeedUpBuildingRequest, signal?: AbortSignal): Promise<SpeedUpBuildingResponse> {
        return this.request<SpeedUpBuildingResponse>('/speedup', {
            method: 'POST',
            body: JSON.stringify(data),
            signal,
        });
    }
}

export const townAPI = new TownAPI();
