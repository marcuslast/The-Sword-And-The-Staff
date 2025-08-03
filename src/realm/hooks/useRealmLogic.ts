import { useState, useEffect } from 'react';
import { orbAPI, Orb, UserInventory, OrbOpenResponse, OrbRarity, OrbContents, OrbItem } from '../services/orbApi';

export type RealmMode = 'home' | 'inventory' | 'map' | 'orbs';

export interface RecentOpening {
    rarity: string;
    contents: OrbContents;
    timestamp: number;
    id: string;
}

export interface GameReward {
    rarity: OrbRarity;
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

    // Load inventory and orbs with fallback
    const loadInventory = async (showLoading: boolean = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            console.log('🔮 Loading realm inventory...');

            // Try to load from API
            const data = await orbAPI.getOrbs(false);
            console.log('✅ Successfully loaded inventory from API:', data);

            setOrbs(data.orbs);
            setInventory(data.summary);

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

                return mockData;
            } else {
                // Other errors (auth, network, etc.)
                setError(`Failed to load inventory: ${errorMessage}`);

                // Still provide fallback data
                setOrbs([]);
                setInventory(getMockInventory());

                throw error;
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

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
            }

            // Refresh orbs list to show new orbs (with proper error handling)
            try {
                await loadInventory(false);
            } catch (loadError) {
                console.warn('Failed to refresh orbs after game completion:', loadError);
                // Don't fail the whole operation if refresh fails
            }

            // Store the rewards for display
            setLastGameRewards(result);

            return result;

        } catch (error) {
            console.error('❌ Failed to complete game:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete game';

            // If API is down, simulate rewards locally
            if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
                console.log('🔧 Simulating game completion rewards locally');

                const mockRewards = {
                    gold: gameData.goldCollected,
                    orbs: [
                        { rarity: 'common' as OrbRarity },
                        { rarity: (Math.random() > 0.7 ? 'uncommon' : 'common') as OrbRarity }
                    ] as GameReward[]
                };

                // Update local inventory
                if (inventory) {
                    const newInventory = {
                        ...inventory,
                        gold: inventory.gold + mockRewards.gold
                    };
                    setInventory(newInventory);
                }

                const result: GameCompletionResult = {
                    success: true,
                    rewards: mockRewards,
                    newTotals: inventory || getMockInventory()
                };

                setLastGameRewards(result);
                setError('⚠️ Rewards simulated locally - backend not available');

                return result;
            }

            const result: GameCompletionResult = {
                success: false,
                error: errorMessage
            };

            setLastGameRewards(result);
            setError(errorMessage);

            return result;
        } finally {
            setCompletingGame(false);
        }
    };

    // Open a single orb with fallback
    const openOrb = async (orbId: string, rarity: string): Promise<boolean> => {
        if (openingOrbs.has(orbId)) return false;

        try {
            setOpeningOrbs(prev => new Set(prev).add(orbId));
            setError(null);

            // Validate rarity type
            if (!isValidRarity(rarity)) {
                throw new Error(`Invalid rarity: ${rarity}`);
            }

            const response = await orbAPI.openOrb(orbId);

            // Update inventory
            setInventory(response.newTotals);

            // Remove opened orb from list
            setOrbs(prev => prev.filter(orb => orb.id !== orbId));

            // Add to recent openings
            if (response.orb) {
                const newOpening: RecentOpening = {
                    rarity: response.orb.rarity,
                    contents: response.orb.contents,
                    timestamp: Date.now(),
                    id: `${orbId}-${Date.now()}`
                };

                setRecentOpenings(prev => [
                    newOpening,
                    ...prev.slice(0, 4) // Keep only last 5
                ]);
            }

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
                }

                // Remove orb from list
                setOrbs(prev => prev.filter(orb => orb.id !== orbId));

                // Add to recent openings
                const newOpening: RecentOpening = {
                    rarity,
                    contents,
                    timestamp: Date.now(),
                    id: `${orbId}-${Date.now()}`
                };

                setRecentOpenings(prev => [
                    newOpening,
                    ...prev.slice(0, 4)
                ]);

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

            // Remove opened orbs from list
            setOrbs(prev => {
                const remainingOrbs = prev.filter(orb => orb.rarity !== rarity || orb.isOpened);
                const unopenedOfRarity = prev.filter(orb => orb.rarity === rarity && !orb.isOpened);
                const keptOrbs = unopenedOfRarity.slice(count);
                return [...remainingOrbs, ...keptOrbs];
            });

            // Add to recent openings
            if (response.results) {
                const newOpenings: RecentOpening[] = response.results.map((result, index) => ({
                    rarity: result.rarity,
                    contents: result.contents,
                    timestamp: Date.now() + index, // Slight offset for unique timestamps
                    id: `multi-${rarity}-${Date.now()}-${index}`
                }));

                setRecentOpenings(prev => [
                    ...newOpenings,
                    ...prev.slice(0, 5 - newOpenings.length)
                ]);
            }

            return true;

        } catch (error) {
            console.error('Failed to open multiple orbs:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to open multiple orbs';
            setError(errorMessage);
            return false;
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
    }, []);

    // Clean up old recent openings (older than 10 minutes)
    useEffect(() => {
        const cleanup = setInterval(() => {
            const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
            setRecentOpenings(prev =>
                prev.filter(opening => opening.timestamp > tenMinutesAgo)
            );
        }, 60000); // Check every minute

        return () => clearInterval(cleanup);
    }, []);

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

        // Computed values
        isLoading: loading || completingGame,
        hasOrbs: orbs.length > 0,
        hasError: !!error,
    };
};

export default useRealmLogic;
