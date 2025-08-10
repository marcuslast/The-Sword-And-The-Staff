// src/realm/hooks/useRealmLogic.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { orbAPI, OrbRarity, Orb, UserInventory, OrbContents } from '../services/orbApi';

export type RealmMode = 'home' | 'orbs' | 'town' | 'missions' | 'inventory' | 'settings';

export interface RecentOpening {
    id: string;
    rarity: OrbRarity;
    contents: OrbContents;
    timestamp: number;
}

export interface GameCompletionData {
    goldCollected: number;
    orbsToAward?: number;
}

export interface GameReward {
    rarity: OrbRarity;
}

export interface GameCompletionResult {
    success: boolean;
    rewards?: {
        gold: number;
        orbs: GameReward[];
    };
    newTotals?: {
        gold: number;
        orbsCount: UserInventory['orbsCount'];
    };
    error?: string;
}

const useRealmLogic = () => {
    // Realm navigation state
    const [realmMode, setRealmMode] = useState<RealmMode>('home');

    // Inventory and orbs state
    const [inventory, setInventory] = useState<UserInventory | null>(null);
    const [orbs, setOrbs] = useState<Orb[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Orb opening state
    const [openingOrbs, setOpeningOrbs] = useState<Set<string>>(new Set());
    const [recentOpenings, setRecentOpenings] = useState<RecentOpening[]>([]);

    // Game completion state
    const [completingGame, setCompletingGame] = useState(false);
    const [lastGameRewards, setLastGameRewards] = useState<GameCompletionResult | null>(null);

    // Request deduplication
    const loadingPromiseRef = useRef<Promise<any> | null>(null);
    const dataLoadedRef = useRef<boolean>(false);
    const lastLoadTimeRef = useRef<number>(0);

    // Cache duration in milliseconds (30 seconds)
    const CACHE_DURATION = 30 * 1000;

    // Helper function to validate rarity
    const isValidRarity = (rarity: string): rarity is OrbRarity => {
        return ['common', 'uncommon', 'rare', 'very rare', 'legendary'].includes(rarity);
    };

    // Mock data fallback
    const getMockInventory = (): UserInventory => ({
        gold: 100,
        orbsCount: {
            common: 0,
            uncommon: 0,
            rare: 0,
            veryRare: 0,
            legendary: 0
        }
    });

    // Load inventory and orbs with fallback and request deduplication
    const loadInventory = useCallback(async (showLoading: boolean = true, forceRefresh: boolean = false) => {
        // Check if data is cached and still fresh
        const now = Date.now();
        const isCacheFresh = (now - lastLoadTimeRef.current) < CACHE_DURATION;

        if (!forceRefresh && dataLoadedRef.current && isCacheFresh && inventory) {
            console.log('🔮 Using cached inventory data');
            return { orbs, summary: inventory };
        }

        // If there's already a loading request in progress, wait for it
        if (loadingPromiseRef.current) {
            console.log('🔮 Waiting for existing inventory request...');
            try {
                return await loadingPromiseRef.current;
            } catch (error) {
                // If the existing request failed, we'll make a new one below
                loadingPromiseRef.current = null;
            }
        }

        // Create new loading promise
        const loadingPromise = (async () => {
            try {
                if (showLoading) setLoading(true);
                setError(null);

                console.log('🔮 Loading realm inventory...');

                // Try to load from API
                const data = await orbAPI.getOrbs(false);
                console.log('✅ Successfully loaded inventory from API:', data);

                setOrbs(data.orbs);
                setInventory(data.summary);
                dataLoadedRef.current = true;
                lastLoadTimeRef.current = now;

                // Load recent openings
                try {
                    await getRecentOpenings();
                } catch (recentError) {
                    console.warn('Failed to load recent openings:', recentError);
                    // Don't fail the whole operation for this
                }

                return data;

            } catch (error) {
                console.error('❌ Failed to load inventory from API:', error);

                // Check if it's the HTML error (API endpoint issue)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const isHTMLError = errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token');

                if (isHTMLError) {
                    setError('⚠️ Backend API not available. Using mock data for testing. Please check your server setup.');
                    console.log('🔧 Using mock data due to API issues');

                    // Use mock data for testing UI
                    const mockData: { orbs: Orb[]; summary: UserInventory } = {
                        orbs: [],
                        summary: getMockInventory()
                    };

                    setOrbs(mockData.orbs);
                    setInventory(mockData.summary);
                    dataLoadedRef.current = true;
                    lastLoadTimeRef.current = now;

                    return mockData;
                } else {
                    // Other errors (auth, network, etc.)
                    setError(`Failed to load inventory: ${errorMessage}`);

                    // Still provide fallback data
                    setOrbs([]);
                    setInventory(getMockInventory());
                    dataLoadedRef.current = true;
                    lastLoadTimeRef.current = now;

                    throw error;
                }
            } finally {
                if (showLoading) setLoading(false);
                loadingPromiseRef.current = null;
            }
        })();

        loadingPromiseRef.current = loadingPromise;
        return loadingPromise;
    }, [inventory, orbs]);

    // Complete game and award rewards with fallback
    const completeGame = async (gameData: GameCompletionData): Promise<GameCompletionResult> => {
        try {
            setCompletingGame(true);
            setError(null);

            console.log('🎮 Completing game with data:', gameData);

            const response = await orbAPI.completeGame({
                goldCollected: gameData.goldCollected,
                orbsToAward: gameData.orbsToAward || 2
            });

            const result: GameCompletionResult = {
                success: true,
                rewards: response.rewards,
                newTotals: response.newTotals
            };

            // Update local state with new totals
            if (response.newTotals) {
                setInventory(response.newTotals);
                lastLoadTimeRef.current = Date.now(); // Update cache timestamp
            }

            // Refresh orbs list to show new orbs (with proper error handling)
            try {
                await loadInventory(false, true); // Force refresh
            } catch (loadError) {
                console.warn('Failed to refresh orbs after game completion:', loadError);
                // Don't fail the whole operation if refresh fails
            }

            // Store the rewards for display
            setLastGameRewards(result);

            return result;

        } catch (error) {
            console.error('❌ Failed to complete game:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // If API is down, simulate game completion
            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating game completion locally');

                const mockRewards = {
                    gold: gameData.goldCollected,
                    orbs: Array.from({ length: gameData.orbsToAward || 2 }, () => ({ rarity: 'common' as OrbRarity }))
                };

                // Update inventory
                if (inventory) {
                    setInventory({
                        ...inventory,
                        gold: inventory.gold + mockRewards.gold
                    });
                }

                const result: GameCompletionResult = {
                    success: true,
                    rewards: mockRewards,
                    newTotals: inventory || getMockInventory()
                };

                setLastGameRewards(result);
                setError('⚠️ Game completed locally - backend not available');
                return result;
            }

            const result: GameCompletionResult = {
                success: false,
                error: errorMessage
            };

            setLastGameRewards(result);
            return result;

        } finally {
            setCompletingGame(false);
        }
    };

    // Open a single orb with fallback
    const openOrb = async (orbId: string, rarity: string): Promise<boolean> => {
        if (openingOrbs.has(orbId)) {
            console.log('Orb already being opened:', orbId);
            return false;
        }

        setOpeningOrbs(prev => new Set(prev).add(orbId));

        try {
            setError(null);

            // Validate rarity type
            if (!isValidRarity(rarity)) {
                throw new Error(`Invalid rarity: ${rarity}`);
            }

            const response = await orbAPI.openOrb(orbId);

            // Update inventory
            setInventory(response.newTotals);
            lastLoadTimeRef.current = Date.now(); // Update cache timestamp

            // Remove orb from list
            setOrbs(prev => prev.filter(orb => orb.id !== orbId));

            // Add to recent openings
            const newOpening: RecentOpening = {
                id: response.orb.id,
                rarity: response.orb.rarity,
                contents: response.orb.contents,
                timestamp: Date.now()
            };

            setRecentOpenings(prev => [newOpening, ...prev.slice(0, 4)]);

            return true;

        } catch (error) {
            console.error('Failed to open orb:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to open orb';

            // If API is down, simulate orb opening
            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating orb opening locally');

                // Mock orb contents based on rarity
                const mockContents: Record<string, OrbContents> = {
                    common: { gold: 75, items: [] },
                    uncommon: { gold: 150, items: [] },
                    rare: { gold: 300, items: [] },
                    'very rare': { gold: 600, items: [] },
                    legendary: { gold: 1200, items: [] }
                };

                const contents = mockContents[rarity as keyof typeof mockContents] || mockContents.common;

                // Update inventory
                if (inventory) {
                    setInventory({
                        ...inventory,
                        gold: inventory.gold + contents.gold
                    });
                    lastLoadTimeRef.current = Date.now(); // Update cache timestamp
                }

                // Remove orb from list
                setOrbs(prev => prev.filter(orb => orb.id !== orbId));

                setError('⚠️ Orb opened locally - backend not available');
                return true;
            }

            setError(errorMessage);
            return false;
        } finally {
            setOpeningOrbs(prev => {
                const newSet = new Set(prev);
                newSet.delete(orbId);
                return newSet;
            });
        }
    };

    // Open multiple orbs of the same rarity
    const openMultipleOrbs = async (rarity: string, count: number): Promise<boolean> => {
        try {
            setError(null);

            // Validate rarity type
            if (!isValidRarity(rarity)) {
                throw new Error(`Invalid rarity: ${rarity}`);
            }

            const response = await orbAPI.openMultipleOrbs(rarity, count);

            // Update inventory
            setInventory(response.newTotals);
            lastLoadTimeRef.current = Date.now(); // Update cache timestamp

            // Remove opened orbs from list
            setOrbs(prev => {
                const remainingOrbs = prev.filter(orb => orb.rarity !== rarity || orb.isOpened);
                const unopenedOfRarity = prev.filter(orb => orb.rarity === rarity && !orb.isOpened);
                const keptOrbs = unopenedOfRarity.slice(count);
                return [...remainingOrbs, ...keptOrbs];
            });

            return true;

        } catch (error) {
            console.error('Failed to open multiple orbs:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to open multiple orbs';
            setError(errorMessage);
            return false;
        }
    };

    const getRecentOpenings = async () => {
        try {
            const data = await orbAPI.getRecentlyOpenedOrbs();

            // Transform the Orb[] into RecentOpening[]
            const transformedOpenings = data.orbs
                .filter(orb => orb.isOpened && orb.openedAt && orb.contents) // Only include opened orbs with required data
                .map(orb => ({
                    id: orb.id,
                    rarity: orb.rarity,
                    contents: orb.contents!,
                    timestamp: new Date(orb.openedAt!).getTime()
                }));

            setRecentOpenings(transformedOpenings);
        } catch (error) {
            console.error('Failed to load recent openings:', error);
            // Don't set error state for this non-critical operation
        }
    };

    // Get orbs filtered by rarity
    const getOrbsByRarity = (rarity: string): Orb[] => {
        return orbs.filter(orb => orb.rarity === rarity && !orb.isOpened);
    };

    // Get total number of unopened orbs
    const getTotalOrbs = (): number => {
        return orbs.filter(orb => !orb.isOpened).length;
    };

    // Clear recent openings
    const clearRecentOpenings = () => {
        setRecentOpenings([]);
    };

    // Clear last game rewards
    const clearLastGameRewards = () => {
        setLastGameRewards(null);
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Force refresh inventory (ignores cache)
    const refreshInventory = useCallback(async () => {
        return loadInventory(true, true);
    }, [loadInventory]);

    // Auto-load inventory on mount with proper error handling
    useEffect(() => {
        const initializeRealm = async () => {
            try {
                await loadInventory();
            } catch (error) {
                console.error('Failed to initialize realm:', error);
                // Error is already handled in loadInventory, just log here
            }
        };

        initializeRealm();
    }, [loadInventory]);

    return {
        // State
        realmMode,
        inventory,
        orbs,
        loading,
        error,
        openingOrbs,
        recentOpenings,
        completingGame,
        lastGameRewards,

        // Navigation
        setRealmMode,

        // Data loading
        loadInventory,
        refreshInventory,

        // Game completion
        completeGame,

        // Orb operations
        openOrb,
        openMultipleOrbs,
        getOrbsByRarity,
        getTotalOrbs,

        // Utility functions
        clearRecentOpenings,
        clearLastGameRewards,
        clearError,
        getRecentOpenings,

        // Computed values
        isLoading: loading || completingGame,
        hasOrbs: orbs.length > 0,
        hasError: !!error,
        isDataLoaded: dataLoadedRef.current,
    };
};

export default useRealmLogic;
