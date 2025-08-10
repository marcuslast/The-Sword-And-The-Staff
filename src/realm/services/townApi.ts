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

// Troop related interfaces
export interface TroopStats {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    carryCapacity: number;
}

export interface TroopLevelConfig {
    level: number;
    stats: TroopStats;
    trainingCost: Record<string, number>;
    trainingTime: number;
    populationCost: number;
}

export interface TroopConfig {
    type: string;
    name: string;
    description: string;
    buildingRequired: string;
    imageUrl: string;
    levels: TroopLevelConfig[];
}

export interface TrainingQueueItem {
    _id?: string;
    troopType: string;
    level: number;
    quantity: number;
    startTime: string;
    endTime: string;
    buildingX: number;
    buildingY: number;
}

export interface Army {
    archers: Record<number, number>;
    ballistas: Record<number, number>;
    berserkers: Record<number, number>;
    horsemen: Record<number, number>;
    lancers: Record<number, number>;
    spies: Record<number, number>;
    swordsmen: Record<number, number>;
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
    troopConfigs?: TroopConfig[];
    army?: Army;
    trainingQueue?: TrainingQueueItem[];
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

// Training related request/response interfaces
export interface TrainTroopsRequest {
    x: number;
    y: number;
    troopType: string;
    quantity: number;
}

export interface TrainTroopsResponse {
    message: string;
    training: TrainingQueueItem;
    newResources: Record<string, number>;
    trainingQueue: TrainingQueueItem[];
}

export interface SpeedUpTrainingRequest {
    trainingId: string;
}

export interface SpeedUpTrainingResponse {
    message: string;
    army: Army;
    newResources: Record<string, number>;
    trainingQueue: TrainingQueueItem[];
}

export interface CancelTrainingResponse {
    message: string;
    refund: Record<string, number>;
    newResources: Record<string, number>;
    trainingQueue: TrainingQueueItem[];
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

    // Replace your request method in townApi.ts with this enhanced version:

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

        console.log(`🌐 ${options.method || 'GET'} ${this.baseUrl}${endpoint}`);
        console.log('📤 Request body:', options.body);
        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            // Get the detailed error response
            let errorData;
            try {
                errorData = await response.json();
                console.error('❌ Error response:', errorData);
            } catch (parseError) {
                console.error('❌ Failed to parse error response');
                errorData = {};
            }

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
                const msg = errorData.message || 'Request failed with status 429';
                throw new RateLimitError(msg, retryAfterMs && retryAfterMs > 0 ? retryAfterMs : undefined);
            }

            // Enhanced error message with validation details
            let errorMessage = `Request failed with status ${response.status}`;
            if (errorData.message) {
                errorMessage = errorData.message;
            }
            if (errorData.details) {
                errorMessage += ` - ${errorData.details}`;
            }

            console.error('❌ Full error details:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                url: `${this.baseUrl}${endpoint}`,
                method: options.method || 'GET'
            });

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Success response:', result);
        return result;
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

    // NEW TRAINING METHODS
    async trainTroops(data: TrainTroopsRequest, signal?: AbortSignal): Promise<TrainTroopsResponse> {
        return this.request<TrainTroopsResponse>('/train', {
            method: 'POST',
            body: JSON.stringify(data),
            signal,
        });
    }

    async speedUpTraining(data: SpeedUpTrainingRequest, signal?: AbortSignal): Promise<SpeedUpTrainingResponse> {
        return this.request<SpeedUpTrainingResponse>('/speedup-training', {
            method: 'POST',
            body: JSON.stringify(data),
            signal,
        });
    }

    async cancelTraining(trainingId: string, signal?: AbortSignal): Promise<CancelTrainingResponse> {
        return this.request<CancelTrainingResponse>(`/training/${trainingId}`, {
            method: 'DELETE',
            signal,
        });
    }
}

export const townAPI = new TownAPI();
